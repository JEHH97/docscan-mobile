import { z } from "zod";

export const jobStateSchema = z.enum([
  "queued",
  "processing",
  "done",
  "failed",
]);
export const pointSchema = z.object({ x: z.number(), y: z.number() });
export const wordBoxSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(100),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
});
export const scanResultSchema = z.object({
  text: z.string(),
  mean_confidence: z.number().min(0).max(100),
  word_boxes: z.array(wordBoxSchema),
  page_corners: z.array(pointSchema).length(4),
  timings_ms: z.record(z.string(), z.number()),
});
export const scanResponseSchema = z.object({
  id: z.string(),
  status: jobStateSchema,
  result: scanResultSchema.nullish(),
  error: z.string().nullish(),
  created_at: z.string(),
  status_url: z.string(),
  image_url: z.string().nullish(),
});

export type JobState = z.infer<typeof jobStateSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
export type ScanResponse = z.infer<typeof scanResponseSchema>;
export type PickedImage = { uri: string; name: string; type: string };

export interface ScanClient {
  submitScan(image: PickedImage, signal?: AbortSignal): Promise<ScanResponse>;
  getScan(id: string, signal?: AbortSignal): Promise<ScanResponse>;
  getImageUrl(scan: ScanResponse): string | null;
}
