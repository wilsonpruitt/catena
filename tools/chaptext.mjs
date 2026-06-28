// Print a chapter of the local WEB as verse-numbered lines, e.g.
//   node tools/chaptext.mjs "Acts 7"
// Used to feed Catena discovery agents verbatim, verse-numbered chapter text
// with no network. Source of truth is tools/web.json (same as weblookup.mjs).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const web = JSON.parse(readFileSync(join(here, "web.json"), "utf8"));

const ref = process.argv[2];
if (!ref) { console.error('usage: node chaptext.mjs "Acts 7"'); process.exit(1); }
const m = ref.trim().match(/^(.+?)\s+(\d+)$/);
if (!m) { console.error("give a whole chapter, e.g. \"Acts 7\""); process.exit(1); }
const book = m[1].trim(), chap = +m[2];

const b = web.books.find((x) => x.name === book);
if (!b) { console.error("book not found:", book); process.exit(1); }
const c = b.chapters.find((x) => x.chapter === chap);
if (!c) { console.error("chapter not found:", book, chap); process.exit(1); }

for (const v of c.verses) console.log(`${v.verse}  ${v.text.replace(/\s+/g, " ").trim()}`);
