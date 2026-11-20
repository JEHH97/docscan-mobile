import type { JobState } from "../api/schema";

export function pollInterval(
  status: JobState | undefined,
  attempt: number,
): number | false {
  if (status === "done" || status === "failed") return false;
  const base = status === "processing" ? 1200 : 800;
  return Math.min(base * 2 ** Math.max(0, attempt), 5000);
}

export function scanProgress(status: JobState | undefined): number {
  if (status === "done") return 1;
  if (status === "processing") return 0.62;
  if (status === "failed") return 0;
  return 0.18;
}
