import { readFile, writeFile } from "node:fs/promises";

const indexPath = new URL("../dist/index.html", import.meta.url);
const html = await readFile(indexPath, "utf8");
if (!html.includes("</head>")) {
  throw new Error("Expo web export index.html has no closing head tag");
}
if (!html.includes('src="/config.js"')) {
  await writeFile(
    indexPath,
    html.replace("</head>", '<script src="/config.js"></script></head>'),
  );
}
