// Fetch full deuterocanonical chapter text the trajectory reader needs but the
// Protestant WEB (tools/web.json) lacks — from bible-api.com's WEB Apocrypha —
// into data/ot-chapters-deutero.json (same shape as data/ot-chapters.json, so
// lib/trajectory.ts merges the two). True pseudepigrapha (1 Enoch, Jubilees,
// etc.) have no machine-readable source and are skipped — they stay reader-less,
// covered by the verse dossiers. Idempotent + rate-limited; re-run safely:
//   npx tsx tools/fetch-deutero-chapters.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { BOOKS } from "../data/books.ts";
import { sourceBook, canonicalBook } from "../lib/echoes.ts";
import { sourceSlug } from "../lib/slug.ts";

const OUT = "data/ot-chapters-deutero.json";
const webSlugs = new Set(Object.keys(JSON.parse(readFileSync("data/ot-chapters.json", "utf8"))));
const NTNAMES = new Set(BOOKS.map((b) => b.name));

// Books with no machine-readable full-chapter text anywhere — skip, don't fetch.
const PSEUDEPIGRAPHA = new Set([
  "1 Enoch", "2 Baruch", "4 Ezra", "Testament of Job", "Testament of Levi",
  "Life of Adam and Eve", "Jubilees", "Martyrdom of Isaiah", "Assumption of Moses",
  "Jannes and Jambres",
]);

// Collect the (canonical book, chapter) pairs that still need a chapter.
const need = new Map(); // "Book|chap" -> {book, chap}
const skippedBooks = new Set();
for (const b of BOOKS)
  for (const p of b.pericopes)
    for (const e of p.echoes) {
      const ob = canonicalBook(sourceBook(e.source));
      if (NTNAMES.has(ob)) continue;
      const m = e.source.replace(/–/g, "-").match(/^(.+?)\s+(\d+)/);
      if (!m) continue;
      const chap = +m[2];
      const slug = sourceSlug(`${ob} ${chap}`);
      if (webSlugs.has(slug)) continue; // already have WEB text
      if (PSEUDEPIGRAPHA.has(ob)) { skippedBooks.add(ob); continue; }
      need.set(`${ob}|${chap}`, { book: ob, chap, slug });
    }

const out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchChapter(book, chap) {
  const q = encodeURIComponent(`${book} ${chap}`);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://bible-api.com/${q}?translation=web`);
      if (res.status === 200) return await res.json();
      if (res.status === 404) return null;
    } catch {}
    await sleep(1500);
  }
  return null;
}

let fetched = 0, failed = [];
const todo = [...need.values()].filter((n) => !out[n.slug]);
console.log(`${need.size} deuterocanon chapters needed; ${todo.length} to fetch; skipping pseudepigrapha: ${[...skippedBooks].sort().join(", ")}`);

for (const { book, chap, slug } of todo) {
  const data = await fetchChapter(book, chap);
  await sleep(900);
  const verses = (data?.verses ?? [])
    .filter((v) => +v.chapter === chap)
    .map((v) => [+v.verse, v.text.replace(/\s+/g, " ").trim()]);
  if (!verses.length) { failed.push(`${book} ${chap}`); continue; }
  out[slug] = { book, chapter: chap, ref: `${book} ${chap}`, verses };
  fetched++;
  if (fetched % 15 === 0) writeFileSync(OUT, JSON.stringify(out)); // checkpoint
}

writeFileSync(OUT, JSON.stringify(out));
const bytes = readFileSync(OUT).length;
console.log(`wrote ${OUT} — ${Object.keys(out).length} chapters, ${Math.round(bytes / 1024)} KB (fetched ${fetched} this run)`);
if (failed.length) console.log(`FAILED (${failed.length}): ${failed.join(" | ")}`);
