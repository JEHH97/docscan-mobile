import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { SettingsProvider, usePalette } from "../src/hooks/useSettings";

function Navigator() {
  const colors = usePalette();
  return (
    <>
      <StatusBar style={colors.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="processing/[id]" />
        <Stack.Screen name="result/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, refetchOnWindowFocus: false },
        },
      }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Navigator />
      </SettingsProvider>
    </QueryClientProvider>
  );
}
