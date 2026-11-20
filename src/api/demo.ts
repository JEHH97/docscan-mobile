import {
  scanResponseSchema,
  type PickedImage,
  type ScanClient,
  type ScanResponse,
} from "./schema";

const box = (
  text: string,
  x: number,
  y: number,
  width: number,
  confidence = 96,
) => ({ text, confidence, x, y, width, height: 28 });

const sampleResult = {
  text: "FIELD NOTES\nProject outline\nDraft review · Thursday\n\nPrepare the first draft. Collect the notes, sort the sections, and leave room for a final review.",
  mean_confidence: 96.4,
  word_boxes: [
    box("FIELD", 184, 176, 90, 99),
    box("NOTES", 290, 176, 102, 98),
    box("Project", 184, 250, 132, 97),
    box("outline", 326, 250, 142, 95),
    box("Draft", 184, 300, 75),
    box("review", 265, 300, 88),
    box("Thursday", 359, 300, 120),
    box("Prepare", 184, 420, 94),
    box("the", 286, 420, 40),
    box("first", 334, 420, 58),
    box("draft", 400, 420, 68),
    box("Collect", 184, 474, 82),
    box("the", 274, 474, 40),
    box("notes", 322, 474, 66),
    box("sort", 396, 474, 48),
    box("the", 452, 474, 40),
    box("sections", 500, 474, 98),
    box("and", 184, 526, 48),
    box("leave", 240, 526, 60),
    box("room", 308, 526, 66),
    box("for", 382, 526, 36),
    box("a", 426, 526, 18),
    box("final", 452, 526, 58),
    box("review", 518, 526, 76),
  ],
  page_corners: [
    { x: 0, y: 0 },
    { x: 900, y: 0 },
    { x: 900, y: 1200 },
    { x: 0, y: 1200 },
  ],
  timings_ms: { cleanup: 380, ocr: 920, total: 1300 },
};

const sharedJobs = new Map<string, { started: number; imageUri: string }>();

export function createDemoClient(
  now: () => number = Date.now,
  jobs = sharedJobs,
): ScanClient {
  return {
    async submitScan(image: PickedImage) {
      const id = `sample-${now().toString(36)}`;
      jobs.set(id, { started: now(), imageUri: image.uri });
      return scanResponseSchema.parse({
        id,
        status: "queued",
        created_at: new Date(now()).toISOString(),
        status_url: `/v1/scans/${id}`,
        image_url: `/v1/scans/${id}/image`,
      });
    },
    async getScan(id: string) {
      const job = jobs.get(id);
      if (!job) throw new Error("Sample scan not found.");
      const elapsed = now() - job.started;
      const status =
        elapsed < 700 ? "queued" : elapsed < 1800 ? "processing" : "done";
      return scanResponseSchema.parse({
        id,
        status,
        result: status === "done" ? sampleResult : null,
        error: null,
        created_at: new Date(job.started).toISOString(),
        status_url: `/v1/scans/${id}`,
        image_url: `/v1/scans/${id}/image`,
      });
    },
    getImageUrl(scan: ScanResponse) {
      return jobs.get(scan.id)?.imageUri ?? null;
    },
  };
}

export const demoClient = createDemoClient();
