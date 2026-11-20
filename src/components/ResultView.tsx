import { useState } from "react";
import { Image, Share, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import type { HistoryEntry } from "../storage/history";
import { usePalette } from "../hooks/useSettings";
import { Button, Card, Header, Page } from "./ui";

export function ResultView({ entry }: { entry: HistoryEntry | null }) {
  const colors = usePalette();
  const [message, setMessage] = useState("");
  const currentEntry = entry;
  if (!currentEntry?.scan.result)
    return (
      <Page>
        <Header
          eyebrow="SCAN RESULT"
          title="Result unavailable"
          subtitle="This saved scan doesn’t contain a completed text result."
        />
      </Page>
    );
  const result = currentEntry.scan.result;
  const imageUri = currentEntry.imageUri;
  async function copyText() {
    await Clipboard.setStringAsync(result.text);
    setMessage("Text copied to clipboard.");
  }
  async function shareResult() {
    if (imageUri && (await Sharing.isAvailableAsync()))
      await Sharing.shareAsync(imageUri);
    else await Share.share({ message: result.text });
  }
  return (
    <Page>
      <Header
        eyebrow="SCAN COMPLETE"
        title="Your page, refined."
        subtitle={`Saved ${new Date(currentEntry.savedAt).toLocaleDateString()}`}
      />
      <View style={[styles.preview, { backgroundColor: colors.surfaceAlt }]}>
        {currentEntry.imageUri ? (
          <Image
            source={{ uri: currentEntry.imageUri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel="Corrected document page"
          />
        ) : (
          <View style={styles.previewFallback}>
            <Text style={{ color: colors.muted }}>Corrected page preview</Text>
          </View>
        )}
        <View style={[styles.confidence, { backgroundColor: colors.surface }]}>
          <Text style={[styles.confidenceValue, { color: colors.accent }]}>
            {result.mean_confidence.toFixed(1)}%
          </Text>
          <Text style={[styles.confidenceLabel, { color: colors.muted }]}>
            CONFIDENCE
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="Copy text" onPress={() => void copyText()} />
        <Button
          label="Share"
          variant="secondary"
          onPress={() => void shareResult()}
        />
      </View>
      {message ? (
        <Text accessibilityRole="status" style={{ color: colors.accent }}>
          {message}
        </Text>
      ) : null}
      <Card>
        <Text style={[styles.textTitle, { color: colors.text }]}>
          Extracted text
        </Text>
        <Text selectable style={[styles.text, { color: colors.text }]}>
          {result.text}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {result.word_boxes.length} detected words
          </Text>
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {result.timings_ms.total ?? 0} ms
          </Text>
        </View>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: 240,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  previewFallback: {
    width: "68%",
    height: "76%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#dce4dc",
  },
  confidence: {
    position: "absolute",
    right: 13,
    bottom: 13,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  confidenceValue: { fontWeight: "800", fontSize: 17, textAlign: "center" },
  confidenceLabel: { fontSize: 8, fontWeight: "700", letterSpacing: 1 },
  actions: { flexDirection: "row", gap: 12 },
  textTitle: { fontSize: 17, fontWeight: "700", marginBottom: 14 },
  text: { fontSize: 15, lineHeight: 24 },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#e3e9e3",
  },
  metaText: { fontSize: 12 },
});
