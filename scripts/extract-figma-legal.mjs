import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const AGENT_TOOLS =
  "C:/Users/HenryRoncal/.cursor/projects/c-computer-files-WEBSITES-fp-network-flashpoint-network/agent-tools";

const FILES = {
  terms: "6d6aad45-01fa-4dff-92a9-04543cfdf584.txt",
  privacy: "3fb9c31a-2b51-48ef-888d-3f4b87903310.txt",
  disclaimer: "ed77f8e7-cdd4-4b2b-b338-a8aa8bf59ee5.txt",
  copyright: "dcaec605-3da5-47c4-acd0-1b178ce7b0f7.txt",
};

function extractParagraphs(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const re = /\{`([^`]+)`\}/g;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    const s = m[1].replace(/\u2800/g, "").trim();
    if (s.length < 3) continue;
    if (s.includes("className") || s.includes("fontVariationSettings")) continue;
    out.push(s);
  }
  return out;
}

const outDir = path.join(ROOT, "lib/static-pages/generated");
fs.mkdirSync(outDir, { recursive: true });

for (const [key, file] of Object.entries(FILES)) {
  const full = path.join(AGENT_TOOLS, file);
  if (!fs.existsSync(full)) {
    console.warn("missing", full);
    continue;
  }
  const paragraphs = extractParagraphs(full);
  fs.writeFileSync(
    path.join(outDir, `${key}.json`),
    JSON.stringify(paragraphs, null, 2),
  );
  console.log(key, paragraphs.length);
}
