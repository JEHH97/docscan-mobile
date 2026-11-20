import { useState } from "react";
import { Switch, Text, TextInput, View, StyleSheet } from "react-native";
import { usePalette, useSettings } from "../hooks/useSettings";
import { Card, Header, Label, Page } from "./ui";

export function SettingsPanel() {
  const { settings, update } = useSettings();
  const colors = usePalette();
  const [draft, setDraft] = useState<{ apiUrl: string; apiKey: string } | null>(
    null,
  );
  const [saved, setSaved] = useState(false);
  const apiUrl = draft?.apiUrl ?? settings.apiUrl;
  const apiKey = draft?.apiKey ?? settings.apiKey;
  const save = async () => {
    await update({
      ...settings,
      apiUrl: apiUrl.trim().replace(/\/+$/, ""),
      apiKey: apiKey.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  const change = (patch: Partial<typeof settings>) => {
    void update({ ...settings, ...patch });
  };

  return (
    <Page>
      <Header
        eyebrow="PREFERENCES"
        title="Settings"
        subtitle="Connect your own scan service, or explore with the built-in sample flow."
      />
      <Card>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heading, { color: colors.text }]}>
              Sample mode
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              Try the full experience without a server.
            </Text>
          </View>
          <Switch
            value={settings.demoMode}
            onValueChange={(demoMode) => change({ demoMode })}
            accessibilityLabel="Sample mode"
          />
        </View>
        <View style={styles.separator} />
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heading, { color: colors.text }]}>
              Dark appearance
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              Use a deeper, low-glare palette.
            </Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(darkMode) => change({ darkMode })}
            accessibilityLabel="Dark appearance"
          />
        </View>
      </Card>
      <Card style={styles.formCard}>
        <Label>API base URL</Label>
        <TextInput
          value={apiUrl}
          onChangeText={(value) => setDraft({ apiUrl: value, apiKey })}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.1.20:8000"
          accessibilityLabel="API base URL"
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surfaceAlt,
            },
          ]}
        />
        <Text style={[styles.description, { color: colors.muted }]}>
          Use your computer’s LAN address when testing on a phone.
        </Text>
        <View style={{ height: 18 }} />
        <Label>API key (optional)</Label>
        <TextInput
          value={apiKey}
          onChangeText={(value) => setDraft({ apiUrl, apiKey: value })}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          placeholder="Add a key if your service requires one"
          accessibilityLabel="API key"
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surfaceAlt,
            },
          ]}
        />
        <View style={{ height: 18 }} />
        <Text
          onPress={() => void save()}
          accessibilityRole="button"
          style={[styles.saveButton, { backgroundColor: colors.accent }]}
        >
          {saved ? "Saved" : "Save connection"}
        </Text>
      </Card>
      <Text style={[styles.note, { color: colors.muted }]}>
        Your connection settings are saved locally. Avoid using production
        credentials in a shared device.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heading: { fontSize: 15, fontWeight: "700", marginBottom: 5 },
  description: { fontSize: 13, lineHeight: 19, color: "#6e7c72" },
  separator: { height: 1, backgroundColor: "#e3e9e3", marginVertical: 11 },
  formCard: { gap: 5 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#dce4dc",
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#17221a",
    backgroundColor: "#fafcf9",
  },
  saveButton: {
    color: "white",
    textAlign: "center",
    overflow: "hidden",
    borderRadius: 14,
    paddingVertical: 15,
    fontWeight: "700",
  },
  note: { color: "#6e7c72", fontSize: 12, lineHeight: 18, textAlign: "center" },
});
