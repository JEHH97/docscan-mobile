import { pollInterval, scanProgress } from "./polling";

describe("polling behavior", () => {
  it("uses a bounded backoff while a job is active", () => {
    expect(pollInterval("queued", 0)).toBe(800);
    expect(pollInterval("processing", 1)).toBe(2400);
    expect(pollInterval("processing", 9)).toBe(5000);
  });
  it("stops polling terminal jobs and maps progress states", () => {
    expect(pollInterval("done", 0)).toBe(false);
    expect(pollInterval("failed", 0)).toBe(false);
    expect(scanProgress(undefined)).toBe(0.18);
    expect(scanProgress("processing")).toBe(0.62);
    expect(scanProgress("done")).toBe(1);
    expect(scanProgress("failed")).toBe(0);
  });
});
