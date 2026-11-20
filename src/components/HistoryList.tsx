import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  deleteHistoryEntry,
  readHistory,
  type HistoryEntry,
} from "../storage/history";
import { usePalette } from "../hooks/useSettings";
import { Button, Card, Header, Page } from "./ui";

export function HistoryList() {
  const colors = usePalette();
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const refresh = useCallback(() => {
    void readHistory().then(setEntries);
  }, []);
  useFocusEffect(refresh);
  useEffect(refresh, [refresh]);

  async function remove(id: string) {
    const updated = await deleteHistoryEntry(id);
    setEntries(updated);
    setConfirmId(null);
  }

  return (
    <Page>
      <Header
        eyebrow="YOUR LIBRARY"
        title="Scan history"
        subtitle="Your completed pages stay on this device and work offline."
      />
      {entries.length === 0 ? (
        <Card>
          <View
            style={[styles.emptyMark, { backgroundColor: colors.surfaceAlt }]}
          >
            <Text style={{ color: colors.accent, fontSize: 26 }}>◷</Text>
          </View>
          <Text style={[styles.itemTitle, { color: colors.text }]}>
            A little quiet for now
          </Text>
          <Text style={[styles.itemBody, { color: colors.muted }]}>
            Your scans will appear here once they’re ready. History is stored
            locally on your device.
          </Text>
          <Button
            label="Start a scan"
            onPress={() => router.navigate("/(tabs)/scan")}
            variant="secondary"
          />
        </Card>
      ) : (
        entries.map((entry) => (
          <Card key={entry.scan.id} style={styles.entry}>
            <Pressable
              onPress={() =>
                router.push(`/result/${encodeURIComponent(entry.scan.id)}`)
              }
              accessibilityRole="button"
              accessibilityLabel={`Open scan from ${new Date(entry.savedAt).toLocaleDateString()}`}
              style={{ flex: 1 }}
            >
              <Text style={[styles.date, { color: colors.accent }]}>
                {new Date(entry.savedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.itemTitle, { color: colors.text }]}
              >
                {entry.scan.result?.text.split("\n")[0] || "Scanned page"}
              </Text>
              <Text style={[styles.itemBody, { color: colors.muted }]}>
                {entry.scan.result?.mean_confidence.toFixed(1)}% confidence ·{" "}
                {entry.scan.result?.word_boxes.length ?? 0} words
              </Text>
            </Pressable>
            {confirmId === entry.scan.id ? (
              <View style={styles.confirmActions}>
                <Pressable
                  onPress={() => void remove(entry.scan.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm delete scan"
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.danger },
                  ]}
                >
                  <Text style={styles.confirmText}>Remove</Text>
                </Pressable>
                <Pressable
                  onPress={() => setConfirmId(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Keep scan"
                  style={styles.confirmButton}
                >
                  <Text style={{ color: colors.text, fontWeight: "700" }}>
                    Keep
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setConfirmId(entry.scan.id)}
                accessibilityRole="button"
                accessibilityLabel="Delete scan"
                style={styles.delete}
              >
                <Text style={{ color: colors.danger, fontWeight: "700" }}>
                  Delete
                </Text>
              </Pressable>
            )}
          </Card>
        ))
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  emptyMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  itemTitle: { fontSize: 17, fontWeight: "700", marginBottom: 7 },
  itemBody: { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  entry: { flexDirection: "row", alignItems: "center", gap: 12 },
  date: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  delete: { minHeight: 44, justifyContent: "center", paddingHorizontal: 10 },
  confirmActions: { alignItems: "center", gap: 5 },
  confirmButton: {
    minHeight: 36,
    minWidth: 62,
    paddingHorizontal: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { color: "white", fontWeight: "700" },
});
