import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { SettingsProvider, usePalette, useSettings } from "./useSettings";
import { useScanClient, useScanStatus, useSubmitScan } from "./useScan";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
    mutations: { gcTime: 0 },
  },
});

function wrapper({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>{children}</SettingsProvider>
    </QueryClientProvider>
  );
}

describe("application hooks", () => {
  afterEach(() => queryClient.clear());

  it("loads settings, persists changes, and exposes the theme palette", async () => {
    const { result } = await renderHook(
      () => ({ settings: useSettings(), palette: usePalette() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.settings.ready).toBe(true));
    expect(result.current.settings.settings.demoMode).toBe(true);
    await act(async () => {
      await result.current.settings.update({
        ...result.current.settings.settings,
        darkMode: true,
      });
    });
    await waitFor(() => expect(result.current.palette.dark).toBe(true));
    await act(async () => result.current.settings.reset());
    await waitFor(() =>
      expect(result.current.settings.settings.darkMode).toBe(false),
    );
  });

  it("submits and polls a scan via the sample client", async () => {
    const submit = await renderHook(() => useSubmitScan(), { wrapper });
    await waitFor(() => expect(submit.result.current).toBeDefined());
    const scan = await submit.result.current.mutateAsync({
      uri: "file:///sample.jpg",
      name: "sample.jpg",
      type: "image/jpeg",
    });
    expect(scan.status).toBe("queued");
    const client = await renderHook(() => useScanClient(), { wrapper });
    const status = await renderHook(() => useScanStatus(scan.id), { wrapper });
    await waitFor(() => expect(status.result.current.data?.id).toBe(scan.id));
    expect(client.result.current.getImageUrl(scan)).toContain(
      "file:///sample.jpg",
    );
    status.unmount();
    submit.unmount();
    client.unmount();
    queryClient.clear();
  });
});
