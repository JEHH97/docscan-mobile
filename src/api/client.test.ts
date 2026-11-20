import { ApiError, createApiClient } from "./client";

const validScan = {
  id: "scan-id",
  status: "queued",
  created_at: "2026-04-04T10:00:00Z",
  status_url: "/v1/scans/scan-id",
  image_url: "/v1/scans/scan-id/image",
};
function response(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("scan API client", () => {
  it("submits multipart images with the optional service key", async () => {
    const fetcher = jest.fn().mockResolvedValue(response(202, validScan));
    const client = createApiClient({
      baseUrl: "http://example.test/",
      apiKey: "sample-key",
      fetcher,
      isWeb: false,
    });
    await expect(
      client.submitScan({
        uri: "file:///page.jpg",
        name: "page.jpg",
        type: "image/jpeg",
      }),
    ).resolves.toMatchObject({ id: "scan-id" });
    expect(fetcher).toHaveBeenCalledWith(
      "http://example.test/v1/scans",
      expect.objectContaining({
        method: "POST",
        headers: { "x-api-key": "sample-key" },
      }),
    );
  });

  it("converts a browser-selected image to a multipart Blob", async () => {
    const imageBlob = new Blob(["sample image"], { type: "image/png" });
    const imageResponse = { ok: true, blob: async () => imageBlob } as Response;
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(imageResponse)
      .mockResolvedValueOnce(response(202, validScan));
    const client = createApiClient({
      baseUrl: "http://example.test",
      fetcher,
      isWeb: true,
    });
    await client.submitScan({
      uri: "/sample-page.png",
      name: "sample-page.png",
      type: "image/png",
    });
    expect(fetcher.mock.calls[0][0]).toBe("/sample-page.png");
    expect(fetcher.mock.calls[1][0]).toBe("http://example.test/v1/scans");
    expect(fetcher.mock.calls[1][1]?.body).toBeInstanceOf(FormData);
  });

  it("reads status and resolves a relative corrected image URL", async () => {
    const fetcher = jest.fn().mockResolvedValue(response(200, validScan));
    const client = createApiClient({
      baseUrl: "https://scan.example/api",
      fetcher,
    });
    await expect(client.getScan("scan / one")).resolves.toMatchObject({
      status: "queued",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://scan.example/api/v1/scans/scan%20%2F%20one",
      expect.anything(),
    );
    expect(client.getImageUrl(validScan as never)).toBe(
      "https://scan.example/v1/scans/scan-id/image",
    );
  });

  it.each([
    [413, "too-large"],
    [415, "unsupported"],
    [422, "validation"],
  ] as const)("maps service error %s", async (status, kind) => {
    const client = createApiClient({
      baseUrl: "http://example.test",
      fetcher: jest.fn().mockResolvedValue(response(status, {})),
      retries: 0,
    });
    await expect(client.getScan("id")).rejects.toMatchObject({ kind, status });
  });

  it("retries a transient server response", async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(response(503, {}))
      .mockResolvedValueOnce(response(200, validScan));
    const client = createApiClient({
      baseUrl: "http://example.test",
      fetcher,
      retries: 1,
    });
    await expect(client.getScan("id")).resolves.toMatchObject({
      id: "scan-id",
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("maps network and malformed response failures", async () => {
    const network = createApiClient({
      baseUrl: "http://example.test",
      fetcher: jest.fn().mockRejectedValue(new Error("offline")),
      retries: 0,
    });
    await expect(network.getScan("id")).rejects.toMatchObject({
      kind: "network",
    });
    const invalid = createApiClient({
      baseUrl: "http://example.test",
      fetcher: jest.fn().mockResolvedValue(response(200, { id: "bad" })),
    });
    await expect(invalid.getScan("id")).rejects.toBeInstanceOf(ApiError);
  });
});
