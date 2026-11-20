import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useCancelScan,
  useScanClient,
  useScanStatus,
} from "../../src/hooks/useScan";
import { usePalette } from "../../src/hooks/useSettings";
import { scanProgress } from "../../src/logic/polling";
import { saveHistoryEntry } from "../../src/storage/history";
import { Button, Card, Header, Page } from "../../src/components/ui";

export default function ProcessingScreen() {
  const { id: rawId, imageUri: rawImageUri } = useLocalSearchParams<{
    id: string;
    imageUri?: string;
  }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const imageUri = Array.isArray(rawImageUri)
    ? rawImageUri[0]
    : (rawImageUri ?? null);
  const router = useRouter();
  const colors = usePalette();
  const client = useScanClient();
  const cancel = useCancelScan();
  const query = useScanStatus(id);
  const saved = useRef(false);
  const scan = query.data;

  useEffect(() => {
    if (scan?.status === "done" && scan.result && !saved.current) {
      saved.current = true;
      void saveHistoryEntry({
        scan,
        imageUri: imageUri ?? client.getImageUrl(scan),
        savedAt: new Date().toISOString(),
      }).then(() => {
        router.replace(`/result/${encodeURIComponent(scan.id)}`);
      });
    }
  }, [client, imageUri, router, scan]);

  const progress = scanProgress(scan?.status);
  const heading =
    scan?.status === "processing"
      ? "Finding the words"
      : "Cleaning up your page";
  return (
    <Page>
      <Header
        eyebrow="SCAN IN PROGRESS"
        title={
          scan?.status === "processing" ? "Almost there." : "A moment, please."
        }
        subtitle="We’re correcting the page and reading the text. You can leave this screen at any time."
      />
      <Card style={styles.card}>
        <View style={[styles.orbit, { borderColor: colors.border }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <View style={[styles.orbitDot, { backgroundColor: colors.accent }]} />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {query.isError ? "Waiting for connection" : heading}
        </Text>
        <Text style={[styles.stepBody, { color: colors.muted }]}>
          {query.isError
            ? "We’ll retry the status check automatically."
            : scan?.status === "queued"
              ? "Your page is safely in the queue."
              : "Enhancing contrast and extracting clear text."}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.accent,
                width: `${Math.max(14, progress * 100)}%`,
              },
            ]}
          />
        </View>
        <View style={styles.labels}>
          <Text style={[styles.label, { color: colors.muted }]}>
            STRAIGHTEN
          </Text>
          <Text style={[styles.label, { color: colors.muted }]}>READ TEXT</Text>
          <Text style={[styles.label, { color: colors.muted }]}>READY</Text>
        </View>
        {query.error ? (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.danger, marginTop: 16 }}
          >
            {query.error.message}
          </Text>
        ) : null}
      </Card>
      <Button
        label="Cancel scan"
        variant="quiet"
        onPress={() => {
          void cancel(id);
          router.replace("/(tabs)/scan");
        }}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", paddingVertical: 32 },
  orbit: {
    width: 108,
    height: 108,
    borderWidth: 1,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  orbitDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    top: 5,
    right: 12,
  },
  stepTitle: { fontSize: 19, fontWeight: "700", marginBottom: 8 },
  stepBody: { fontSize: 14, lineHeight: 21, textAlign: "center" },
  track: {
    height: 7,
    borderRadius: 8,
    alignSelf: "stretch",
    overflow: "hidden",
    marginTop: 28,
  },
  fill: { height: "100%", borderRadius: 8 },
  labels: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  label: { fontSize: 9, letterSpacing: 1, fontWeight: "700" },
});
