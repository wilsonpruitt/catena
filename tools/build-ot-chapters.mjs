// One-time (re-runnable) extractor: pull the full verse-by-verse World English
// Bible text of every Old Testament chapter the New Testament echoes, into a
// committed data file the trajectory reader renders from. tools/web.json is
// gitignored (absent on Vercel), so the *output* must live in data/.
//   node --import tsx tools/build-ot-chapters.mjs   (or: npx tsx tools/...)
import { readFileSync, writeFileSync } from "node:fs";
import { BOOKS } from "../data/books.ts";
import { sourceBook, canonicalBook } from "../lib/echoes.ts";
import { sourceSlug } from "../lib/slug.ts";

const web = JSON.parse(readFileSync("tools/web.json", "utf8"));
const ALIAS = { Psalm: "Psalms", "Song of Solomon": "Song of Songs", Canticles: "Song of Songs", Qoheleth: "Ecclesiastes" };
const IDX = {};
for (const b of web.books) {
  const ch = (IDX[b.name] = {});
  for (const c of b.chapters) {
    const vv = (ch[c.chapter] = {});
    for (const v of c.verses) vv[v.verse] = v.text.replace(/\s+/g, " ").trim();
  }
}
const NTNAMES = new Set(BOOKS.map((b) => b.name));

// Which (source book, chapter) pairs does the NT echo?
const wanted = new Set();
for (const b of BOOKS)
  for (const p of b.pericopes)
    for (const e of p.echoes) {
      const ob = canonicalBook(sourceBook(e.source));
      if (NTNAMES.has(ob)) continue;
      const m = e.source.replace(/–/g, "-").match(/^(.+?)\s+(\d+)/);
      if (!m) continue;
      wanted.add(`${ob}|${+m[2]}`);
    }

const out = {};
let skipped = [];
for (const key of wanted) {
  const [ob, chapStr] = key.split("|");
  const chap = +chapStr;
  const wb = ALIAS[ob] || ob;
  const vv = IDX[wb]?.[chap];
  if (!vv) {
    skipped.push(`${ob} ${chap}`);
    continue;
  }
  const verses = Object.keys(vv)
    .map(Number)
    .sort((a, b) => a - b)
    .map((n) => [n, vv[n]]);
  out[sourceSlug(`${ob} ${chap}`)] = { book: ob, chapter: chap, ref: `${ob} ${chap}`, verses };
}

writeFileSync("data/ot-chapters.json", JSON.stringify(out));
const bytes = readFileSync("data/ot-chapters.json").length;
console.log(`wrote data/ot-chapters.json — ${Object.keys(out).length} chapters, ${Math.round(bytes / 1024)} KB`);
console.log(`skipped (no full WEB text — deuterocanon/pseudepigrapha): ${skipped.length} chapters across ${new Set(skipped.map((s) => s.replace(/ \d+$/, ""))).size} books`);
