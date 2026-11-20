import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteHistoryEntry, readHistory, saveHistoryEntry } from "./history";

const entry = (id: string) => ({
  scan: {
    id,
    status: "done" as const,
    created_at: "2026-04-04T10:00:00Z",
    result: null,
    status_url: `/v1/scans/${id}`,
  },
  imageUri: null,
  savedAt: "2026-04-04T10:00:00Z",
});

describe("offline history", () => {
  beforeEach(() => AsyncStorage.clear());
  it("reads empty storage, saves, replaces by ID, and removes entries", async () => {
    expect(await readHistory()).toEqual([]);
    await saveHistoryEntry(entry("a"));
    await saveHistoryEntry({ ...entry("a"), savedAt: "later" });
    await saveHistoryEntry(entry("b"));
    expect((await readHistory()).map((item) => item.scan.id)).toEqual([
      "b",
      "a",
    ]);
    expect((await deleteHistoryEntry("b")).map((item) => item.scan.id)).toEqual(
      ["a"],
    );
  });
  it("recovers from invalid stored JSON", async () => {
    await AsyncStorage.setItem("docscan-mobile.scan-history.v1", "{");
    expect(await readHistory()).toEqual([]);
  });
});
