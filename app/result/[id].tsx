import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ResultView } from "../../src/components/ResultView";
import { usePalette } from "../../src/hooks/useSettings";
import { readHistory, type HistoryEntry } from "../../src/storage/history";
import { Page } from "../../src/components/ui";

export default function ResultScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [ready, setReady] = useState(false);
  const colors = usePalette();
  useEffect(() => {
    void readHistory()
      .then((items) =>
        setEntry(items.find((item) => item.scan.id === id) ?? null),
      )
      .finally(() => setReady(true));
  }, [id]);
  if (!ready)
    return (
      <Page>
        <ActivityIndicator color={colors.accent} />
      </Page>
    );
  return entry ? (
    <ResultView entry={entry} />
  ) : (
    <Page>
      <Text style={{ color: colors.text }}>
        This result is no longer available.
      </Text>
    </Page>
  );
}
