import { createDemoClient } from "./demo";

describe("sample scan client", () => {
  it("simulates progress and finishes with a realistic validated result", async () => {
    let time = 1000;
    const client = createDemoClient(() => time, new Map());
    const created = await client.submitScan({
      uri: "file:///sample.png",
      name: "sample.png",
      type: "image/png",
    });
    expect(created.status).toBe("queued");
    time += 900;
    expect((await client.getScan(created.id)).status).toBe("processing");
    time += 1100;
    const done = await client.getScan(created.id);
    expect(done.result?.mean_confidence).toBeGreaterThan(90);
    expect(done.result?.word_boxes.length).toBeGreaterThan(0);
    if (!done.result)
      throw new Error("Completed sample scan should include a result.");
    const wordCount =
      done.result.text.match(/\b[\p{L}\p{N}]+\b/gu)?.length ?? 0;
    expect(done.result.word_boxes).toHaveLength(wordCount);
    expect(client.getImageUrl(done)).toBe("file:///sample.png");
  });

  it("rejects unknown job IDs", async () => {
    const client = createDemoClient(Date.now, new Map());
    await expect(client.getScan("unknown")).rejects.toThrow("not found");
  });
});
