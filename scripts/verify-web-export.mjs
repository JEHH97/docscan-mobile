import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const vercel = JSON.parse(
  await readFile(path.join(root, "vercel.json"), "utf8"),
);
assert.equal(vercel.buildCommand, "npm run export:web");
assert.equal(vercel.outputDirectory, "dist");
assert.ok(
  vercel.rewrites.some(
    (rule) => rule.source === "/(.*)" && rule.destination === "/index.html",
  ),
  "Vercel must rewrite deep paths to the Expo app shell",
);
const indexPath = path.join(dist, "index.html");
await stat(indexPath);

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const requestedPath = path.resolve(dist, `.${decodeURIComponent(pathname)}`);
  const insideDist =
    requestedPath === dist || requestedPath.startsWith(`${dist}${path.sep}`);
  let filePath = insideDist ? requestedPath : indexPath;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = path.join(filePath, "index.html");
    await stat(filePath);
  } catch {
    filePath = indexPath;
  }
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(await readFile(filePath));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const address = server.address();
  assert.ok(address && typeof address === "object");
  for (const route of [
    "/",
    "/history",
    "/processing/sample-check",
    "/result/sample-check",
  ]) {
    const response = await fetch(`http://127.0.0.1:${address.port}${route}`);
    assert.equal(response.status, 200, `${route} should load the app shell`);
    assert.match(
      await response.text(),
      /<html|<!doctype html/i,
      `${route} should serve HTML`,
    );
  }
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve(undefined))),
  );
}

process.stdout.write(
  "Verified static export and SPA fallback for root and deep routes.\n",
);
