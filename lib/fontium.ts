// Index Fontium — the derived, canon-wide reverse index: every Old Testament
// source, and every place across the indexed New Testament editions that echoes
// it. Computed at build time from the book data (which stays the source of truth).
import { BOOKS } from "@/data/books";
import type { Book } from "./types";
import { canonicalBook } from "./echoes";
import { sourceSlug } from "./slug";
// Chapter-slug availability, read directly (not via ./trajectory, which imports
// this module — importing it back would create a circular dependency).
import webChapters from "@/data/ot-chapters.json";
import deuteroChapters from "@/data/ot-chapters-deutero.json";

export const NT_ABBR: Record<string, string> = {
  Matthew: "Matt", Mark: "Mark", Luke: "Luke", John: "John", Acts: "Acts",
  Romans: "Rom", "1 Corinthians": "1 Cor", "2 Corinthians": "2 Cor",
  Galatians: "Gal", Ephesians: "Eph", Philippians: "Phil", Colossians: "Col",
  "1 Thessalonians": "1 Thess", "2 Thessalonians": "2 Thess", "1 Timothy": "1 Tim",
  "2 Timothy": "2 Tim", Titus: "Titus", Philemon: "Phlm", Hebrews: "Heb",
  James: "Jas", "1 Peter": "1 Pet", "2 Peter": "2 Pet", "1 John": "1 John",
  "2 John": "2 John", "3 John": "3 John", Jude: "Jude", Revelation: "Rev",
};

export type FOcc = {
  slug: string; abbr: string; pref: string; id: string;
  type: string; confidence: string;
};
export type FSource = {
  ref: string; chapter: number; verse: number;
  count: number; score: number; occ: FOcc[];
  // Slug of this source's chapter in the centrifugal trajectory reader
  // (/fontium/read/[slug]), when the chapter has full resolvable text.
  readerSlug?: string;
};
export type FBook = { name: string; count: number; score: number; sources: FSource[] };
export type Fontium = { books: FBook[]; total: number; indexed: string[] };

// Confidence weights for the significance score. A source's significance is its
// summed confidence weight times the number of *distinct* New Testament books
// that reach for it — operationalizing Hays' recurrence criterion, so a verse
// quoted across eight books outranks one hit eight times in a single book.
export const CONF_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 };

export function scoreOcc(occ: FOcc[]): number {
  let weight = 0;
  const books = new Set<string>();
  for (const o of occ) {
    weight += CONF_WEIGHT[o.confidence] ?? 1;
    books.add(o.slug);
  }
  return weight * books.size;
}

export function parse(ref: string) {
  const m = ref.replace(/–/g, "-").match(/^(.+?)\s+(\d+)(?::(\d+))?/);
  return m
    ? { book: m[1].trim(), chapter: +m[2], verse: m[3] ? +m[3] : 0 }
    : { book: ref, chapter: 0, verse: 0 };
}

const READER_SLUGS = new Set([...Object.keys(webChapters), ...Object.keys(deuteroChapters)]);

export function buildIndex(): Fontium {
  const map = new Map<string, Map<string, FSource>>(); // book -> sourceRef -> FSource
  let total = 0;
  for (const b of BOOKS as Book[]) {
    const abbr = NT_ABBR[b.name] || b.name.slice(0, 3);
    for (const p of b.pericopes)
      for (const e of p.echoes) {
        total++;
        const { book, chapter, verse } = parse(e.source);
        if (!map.has(book)) map.set(book, new Map());
        const sm = map.get(book)!;
        if (!sm.has(e.source)) {
          const readerSlug = chapter
            ? sourceSlug(`${canonicalBook(book)} ${chapter}`)
            : undefined;
          sm.set(e.source, {
            ref: e.source, chapter, verse, count: 0, score: 0, occ: [],
            readerSlug: readerSlug && READER_SLUGS.has(readerSlug) ? readerSlug : undefined,
          });
        }
        const s = sm.get(e.source)!;
        if (!s.occ.some((o) => o.slug === b.slug && o.id === p.id))
          s.occ.push({ slug: b.slug, abbr, pref: p.ref, id: p.id, type: e.type, confidence: e.confidence });
      }
  }
  const books: FBook[] = [];
  for (const [name, sm] of map) {
    const sources = [...sm.values()].map((s) => ({
      ...s,
      count: s.occ.length,
      score: scoreOcc(s.occ),
    }));
    // Canonical reading order within a book; the client re-sorts by the chosen mode.
    sources.sort((a, b) => a.chapter - b.chapter || a.verse - b.verse || a.ref.localeCompare(b.ref));
    const count = sources.reduce((n, s) => n + s.count, 0);
    const score = sources.reduce((n, s) => n + s.score, 0);
    books.push({ name, count, score, sources });
  }
  books.sort((a, b) => b.score - a.score || b.count - a.count || a.name.localeCompare(b.name));
  return { books, total, indexed: (BOOKS as Book[]).map((b) => b.name) };
}
