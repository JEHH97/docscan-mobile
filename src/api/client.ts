import {
  scanResponseSchema,
  type PickedImage,
  type ScanClient,
  type ScanResponse,
} from "./schema";
import { Platform } from "react-native";

export type ApiErrorKind =
  | "network"
  | "too-large"
  | "unsupported"
  | "validation"
  | "server"
  | "invalid-response";

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchLike = typeof fetch;
type ClientOptions = {
  baseUrl: string;
  apiKey?: string;
  fetcher?: FetchLike;
  retries?: number;
  isWeb?: boolean;
};

export function createApiClient({
  baseUrl,
  apiKey,
  fetcher = fetch,
  retries = 2,
  isWeb = Platform.OS === "web",
}: ClientOptions): ScanClient {
  const root = baseUrl.replace(/\/+$/, "");
  const headers: Record<string, string> = {};
  if (apiKey) headers["x-api-key"] = apiKey;

  async function request(url: string, init?: RequestInit): Promise<Response> {
    let attempt = 0;
    while (true) {
      try {
        const response = await fetcher(url, {
          ...init,
          headers: {
            ...headers,
            ...(init?.headers as Record<string, string> | undefined),
          },
        });
        if (response.ok) return response;
        const kind: ApiErrorKind =
          response.status === 413
            ? "too-large"
            : response.status === 415
              ? "unsupported"
              : response.status === 422
                ? "validation"
                : "server";
        const message =
          kind === "too-large"
            ? "This image is too large. Choose a smaller image."
            : kind === "unsupported"
              ? "Choose a JPEG, PNG, or WebP image."
              : kind === "validation"
                ? "The image could not be validated."
                : `The scan service returned an error (${response.status}).`;
        if (response.status >= 500 && attempt < retries) {
          await delay(250 * 2 ** attempt, init?.signal ?? undefined);
          attempt += 1;
          continue;
        }
        throw new ApiError(kind, message, response.status);
      } catch (error) {
        if (error instanceof ApiError) throw error;
        if (init?.signal?.aborted) throw error;
        if (attempt < retries) {
          await delay(250 * 2 ** attempt, init?.signal ?? undefined);
          attempt += 1;
          continue;
        }
        throw new ApiError(
          "network",
          "Could not reach the scan service. Check your connection and API URL.",
        );
      }
    }
  }

  async function parseScan(response: Response): Promise<ScanResponse> {
    try {
      return scanResponseSchema.parse(await response.json());
    } catch {
      throw new ApiError(
        "invalid-response",
        "The scan service returned an unexpected response.",
      );
    }
  }

  return {
    async submitScan(image: PickedImage, signal?: AbortSignal) {
      const body = new FormData();
      if (isWeb) {
        let imageResponse: Response;
        try {
          imageResponse = await fetcher(image.uri);
        } catch {
          throw new ApiError("network", "Could not read the selected image.");
        }
        if (!imageResponse.ok)
          throw new ApiError("network", "Could not read the selected image.");
        body.append("file", await imageResponse.blob(), image.name);
      } else {
        body.append("file", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as unknown as Blob);
      }
      const response = await request(`${root}/v1/scans`, {
        method: "POST",
        body,
        signal,
      });
      return parseScan(response);
    },
    async getScan(id: string, signal?: AbortSignal) {
      const response = await request(
        `${root}/v1/scans/${encodeURIComponent(id)}`,
        { signal },
      );
      return parseScan(response);
    },
    getImageUrl(scan: ScanResponse) {
      return scan.image_url
        ? new URL(scan.image_url, `${root}/`).toString()
        : null;
    },
  };
}

function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
