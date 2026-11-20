import { Tabs } from "expo-router";
import { Text } from "react-native";
import { usePalette } from "../../src/hooks/useSettings";

const symbols: Record<string, string> = {
  scan: "⌗",
  history: "◷",
  settings: "⚙",
};

export default function TabLayout() {
  const colors = usePalette();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 76,
          paddingTop: 8,
          paddingBottom: 16,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 21 }}>
            {symbols[route.name] ?? "•"}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="scan" options={{ title: "Scan" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
