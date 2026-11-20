import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createApiClient } from "../api/client";
import { demoClient } from "../api/demo";
import type { PickedImage, ScanClient } from "../api/schema";
import { pollInterval } from "../logic/polling";
import { useSettings } from "./useSettings";

export function useScanClient(): ScanClient {
  const { settings } = useSettings();
  return useMemo(
    () =>
      settings.demoMode || !settings.apiUrl
        ? demoClient
        : createApiClient({
            baseUrl: settings.apiUrl,
            apiKey: settings.apiKey,
          }),
    [settings.apiKey, settings.apiUrl, settings.demoMode],
  );
}

export function useSubmitScan() {
  const client = useScanClient();
  return useMutation({
    mutationFn: (image: PickedImage) => client.submitScan(image),
  });
}

export function useScanStatus(id: string) {
  const client = useScanClient();
  return useQuery({
    queryKey: ["scan", id],
    queryFn: ({ signal }) => client.getScan(id, signal),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return pollInterval(status, query.state.fetchFailureCount);
    },
    retry: 2,
  });
}

export function useCancelScan() {
  const queryClient = useQueryClient();
  return (id: string) => queryClient.cancelQueries({ queryKey: ["scan", id] });
}
