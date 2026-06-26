// Local World English Bible lookup — resolves a reference like "Daniel 7:13",
// "Ezekiel 1:26-28", "Ezekiel 2:8-3:3", "1 Kings 18:38", "Psalm 2:9", or a whole
// chapter "Daniel 7" to its verbatim WEB text, entirely from tools/web.json.
// No network. The go-forward source of scripture text for all Catena books.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const web = JSON.parse(readFileSync(join(here, "web.json"), "utf8"));

// Deuterocanonical supplement (refs the Protestant WEB omits): exact-match map.
let APOC = {};
try { APOC = JSON.parse(readFileSync(join(here, "web-apocrypha.json"), "utf8")); } catch {}

// book name -> { chapterNum -> { verseNum -> text } }
const IDX = {};
for (const b of web.books) {
  const ch = (IDX[b.name] = {});
  for (const c of b.chapters) {
    const vv = (ch[c.chapter] = {});
    for (const v of c.verses) vv[v.verse] = v.text.replace(/\s+/g, " ").trim();
  }
}

// Aliases: how our reference book-names map to getbible's WEB names.
const ALIAS = {
  Psalm: "Psalms",
  "Song of Solomon": "Song of Songs",
  Canticles: "Song of Songs",
  Qoheleth: "Ecclesiastes",
};

function canonBook(name) {
  name = name.trim();
  return ALIAS[name] || name;
}

// Resolve a reference to verbatim text, or null if not in this (Protestant) WEB.
export function resolve(ref) {
  if (!ref) return null;
  if (APOC[ref]) return APOC[ref]; // deuterocanonical exact match
  let s = ref.replace(/–/g, "-").replace(/\s*,.*$/, "").trim(); // drop comma-lists
  if (APOC[s]) return APOC[s];
  // Book Ch (whole chapter) | Book Ch:V | Book Ch:V-V | Book Ch:V-Ch:V
  const m = s.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/);
  if (!m) return null;
  const book = canonBook(m[1]);
  const chap = +m[2];
  const v1 = m[3] ? +m[3] : null;
  const idx = IDX[book];
  if (!idx || !idx[chap]) return null;

  // Whole chapter
  if (v1 === null) {
    const vv = idx[chap];
    const nums = Object.keys(vv).map(Number).sort((a, b) => a - b);
    return nums.map((n) => vv[n]).join(" ") || null;
  }

  let endChap = chap, endV = v1;
  if (m[4] !== undefined) {
    if (m[5] !== undefined) { endChap = +m[4]; endV = +m[5]; } // cross-chapter
    else endV = +m[4]; // same chapter range
  }

  const out = [];
  for (let c = chap; c <= endChap; c++) {
    const vv = idx[c];
    if (!vv) break;
    const lo = c === chap ? v1 : 1;
    const hi = c === endChap ? endV : Math.max(...Object.keys(vv).map(Number));
    for (let v = lo; v <= hi; v++) if (vv[v]) out.push(vv[v]);
  }
  const text = out.join(" ").trim();
  return text || null;
}

export const BOOKS = new Set(web.books.map((b) => b.name));
