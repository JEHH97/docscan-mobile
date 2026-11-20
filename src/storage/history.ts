import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ScanResponse } from "../api/schema";

const HISTORY_KEY = "docscan-mobile.scan-history.v1";

export type HistoryEntry = {
  scan: ScanResponse;
  imageUri: string | null;
  savedAt: string;
};

export async function readHistory(): Promise<HistoryEntry[]> {
  const value = await AsyncStorage.getItem(HISTORY_KEY);
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveHistoryEntry(
  entry: HistoryEntry,
): Promise<HistoryEntry[]> {
  const history = await readHistory();
  const updated = [
    entry,
    ...history.filter((item) => item.scan.id !== entry.scan.id),
  ].slice(0, 100);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteHistoryEntry(id: string): Promise<HistoryEntry[]> {
  const updated = (await readHistory()).filter((item) => item.scan.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}
