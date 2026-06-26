// Local Brenton English Septuagint (LXXE, 1851) lookup. Resolves a reference
// given in HEBREW (Masoretic) versification — e.g. "Psalm 40:6", "Deuteronomy
// 32:43" — to the verbatim Brenton text, applying the Hebrew→LXX chapter map for
// Psalms (and Jeremiah's reordering). Returns null when the mapping is uncertain,
// so we never display a wrong verse. Source: bolls.life LXXE dump.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const rows = JSON.parse(readFileSync(join(here, "lxxe.json"), "utf8"));
const books = JSON.parse(readFileSync(join(here, "lxxe-books.json"), "utf8"));

const NAME2ID = {};
for (const b of books) NAME2ID[b.name] = b.bookid;
// our canonical names -> LXXE book names where they differ
const ALIAS = {
  Psalm: "Psalms",
  "Song of Solomon": "Song of Songs",
  "Song of Songs": "Song of Songs",
};
function bookId(name) {
  const n = ALIAS[name] || name;
  return NAME2ID[n] ?? NAME2ID[name];
}

// book# -> chapter -> verse -> text (HTML stripped)
const IDX = {};
for (const r of rows) {
  ((IDX[r.book] ||= {})[r.chapter] ||= {})[r.verse] =
    r.text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// Hebrew Psalm chapter -> LXX Psalm chapter. Reliable on the long -1 stretches;
// the join/split psalms (9/10, 114/115, 116, 147) are returned as null (skip).
function psalmLxxChapter(h) {
  if (h >= 1 && h <= 8) return h;
  if (h >= 11 && h <= 113) return h - 1;
  if (h >= 117 && h <= 146) return h - 1;
  if (h >= 148 && h <= 150) return h;
  return null; // 9,10,114,115,116,147 — versification splits, skip rather than risk
}

// Jeremiah Hebrew->LXX chapter map (LXX reorders chs 25–51). Conservative: only
// the well-known oracle-against-Babylon block we actually cite; else 1:1 fails → null.
const JER = { 50: 27, 51: 28, 25: 32, 46: 26, 49: 30 };

export function resolveLXX(ref) {
  if (!ref) return null;
  const s = ref.replace(/–/g, "-").replace(/\s*,.*$/, "").trim();
  const m = s.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/);
  if (!m) return null;
  const name = m[1].trim();
  const id = bookId(name);
  if (!id || !IDX[id]) return null;

  let chap = +m[2];
  const isPsalm = name === "Psalm" || name === "Psalms";
  if (isPsalm) {
    const lc = psalmLxxChapter(chap);
    if (lc === null) return null;
    chap = lc;
  } else if (name === "Jeremiah") {
    if (JER[chap] === undefined) return null;
    chap = JER[chap];
  }

  const v1 = m[3] ? +m[3] : null;
  const idx = IDX[id];
  if (!idx[chap]) return null;

  if (v1 === null) {
    const vv = idx[chap];
    return Object.keys(vv).map(Number).sort((a, b) => a - b).map((n) => vv[n]).join(" ") || null;
  }
  let endChap = chap, endV = v1;
  if (m[4] !== undefined) {
    if (m[5] !== undefined) { endChap = +m[4]; endV = +m[5]; } else endV = +m[4];
  }
  const out = [];
  for (let c = chap; c <= endChap; c++) {
    const vv = idx[c];
    if (!vv) break;
    const lo = c === chap ? v1 : 1;
    const hi = c === endChap ? endV : Math.max(...Object.keys(vv).map(Number));
    for (let v = lo; v <= hi; v++) if (vv[v]) out.push(vv[v]);
  }
  return out.join(" ").trim() || null;
}
