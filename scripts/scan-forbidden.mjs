import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignored = new Set([
  "node_modules",
  ".expo",
  "dist",
  "coverage",
  ".git",
  "web-build",
]);
const forbidden = [
  ["Site", "Doc"].join(""),
  ["AT", "LAS"].join(""),
  ["SKY", "LINE"].join(""),
  ["L", "ENS"].join(""),
  ["Ops", "Center"].join(""),
  ["One", "Web"].join(""),
  ["Eute", "lsat"].join(""),
  ["B", "eam"].join(""),
  ["git.", "via", "sat.", "com"].join(""),
  ["@", "via", "sat.", "com"].join(""),
  ["c", "é", "dula"].join(""),
].map((term) => term.toLowerCase());
const phonePatterns = [
  /(?<!\d)\d{10}(?!\d)/,
  /(?:\+\d{1,3}[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}/,
];
const failures = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath);
    else {
      let text;
      try {
        text = await readFile(fullPath, "utf8");
      } catch {
        continue;
      }
      const lower = text.toLowerCase();
      for (const term of forbidden)
        if (lower.includes(term))
          failures.push(
            `${path.relative(root, fullPath)} contains a restricted term`,
          );
      for (const pattern of phonePatterns)
        if (pattern.test(text))
          failures.push(
            `${path.relative(root, fullPath)} contains a phone-number-like sequence`,
          );
    }
  }
}

await walk(root);
if (failures.length) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Repository content scan passed.\n");
}
