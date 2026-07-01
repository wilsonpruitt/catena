// The centrifugal reader — Hays' "reading backwards." Where the editions and the
// dossiers read a New Testament passage back to its sources, the trajectory reader
// runs the other way: it takes a whole Old Testament chapter and reads it forward
// through its afterlife, hanging on each verse the New Testament places that erupt
// from it. Full chapter text comes from the committed data/ot-chapters.json; the
// echoes are derived from the book data at build time. Server-only (pulls BOOKS
// and the 2.6 MB chapter text — never import into a client component).
import { BOOKS } from "@/data/books";
import type { Book } from "./types";
import { NT_ABBR, parse } from "./fontium";
import { sourceBook, canonicalBook } from "./echoes";
import { sourceSlug } from "./slug";
import { allDossierSlugs } from "./sources";
import webChapters from "@/data/ot-chapters.json";
import deuteroChapters from "@/data/ot-chapters-deutero.json";

type RawChapter = { book: string; chapter: number; ref: string; verses: [number, string][] };
// Protestant WEB chapters + the deuterocanon fetched from the WEB Apocrypha.
const CHAPTERS = { ...webChapters, ...deuteroChapters } as unknown as Record<string, RawChapter>;

export type TOcc = {
  ntSlug: string;
  abbr: string;
  pref: string;
  id: string;
  type: string;
  confidence: string;
  note?: string;
  contested?: boolean;
  sourceRef: string; // the exact echo reference, e.g. "Psalm 110:1" or "Exodus 12–14"
  whole: boolean; // echoes the chapter as a whole / across chapters (no single verse)
};
export type TVerse = {
  v: number;
  text: string;
  dossier?: string; // slug of this verse's reception dossier, when one exists
  echoes: TOcc[];
};
export type ChapterRef = { slug: string; ref: string; chapter: number };
export type Trajectory = {
  slug: string;
  ref: string;
  book: string;
  chapter: number;
  verses: TVerse[];
  whole: TOcc[];
  total: number;
  books: number;
  prev?: ChapterRef;
  next?: ChapterRef;
};

const CONF_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };
const TYPE_RANK: Record<string, number> = { quotation: 4, allusion: 3, echo: 2, figural: 1 };
function strongest(a: TOcc, b: TOcc) {
  return (
    (CONF_RANK[b.confidence] ?? 1) - (CONF_RANK[a.confidence] ?? 1) ||
    (TYPE_RANK[b.type] ?? 0) - (TYPE_RANK[a.type] ?? 0) ||
    a.ntSlug.localeCompare(b.ntSlug)
  );
}

type ChapAcc = { byVerse: Map<number, TOcc[]>; whole: TOcc[]; books: Set<string>; total: number };
let _echoes: Map<string, ChapAcc> | null = null;
let _nav: Map<string, ChapterRef[]> | null = null; // book name -> ordered chapters present

function build() {
  const echoes = new Map<string, ChapAcc>();
  for (const b of BOOKS as Book[]) {
    const abbr = NT_ABBR[b.name] || b.name.slice(0, 3);
    for (const p of b.pericopes)
      for (const e of p.echoes) {
        const ob = canonicalBook(sourceBook(e.source));
        const { chapter, verse } = parse(e.source);
        if (!chapter) continue;
        const slug = sourceSlug(`${ob} ${chapter}`);
        if (!CHAPTERS[slug]) continue; // no full text (deuterocanon) — covered by dossiers
        let acc = echoes.get(slug);
        if (!acc) {
          acc = { byVerse: new Map(), whole: [], books: new Set(), total: 0 };
          echoes.set(slug, acc);
        }
        const occ: TOcc = {
          ntSlug: b.slug,
          abbr,
          pref: p.ref,
          id: p.id,
          type: e.type,
          confidence: e.confidence,
          note: e.note,
          contested: e.contested,
          sourceRef: e.source,
          whole: verse === 0,
        };
        // De-dupe per (verse-or-whole, NT pericope).
        const bucket = verse === 0 ? acc.whole : acc.byVerse.get(verse) ?? [];
        if (bucket.some((o) => o.ntSlug === occ.ntSlug && o.id === occ.id)) continue;
        bucket.push(occ);
        if (verse === 0) acc.whole = bucket;
        else acc.byVerse.set(verse, bucket);
        acc.books.add(b.slug);
        acc.total++;
      }
  }
  for (const acc of echoes.values()) {
    acc.whole.sort(strongest);
    for (const list of acc.byVerse.values()) list.sort(strongest);
  }

  // Per-book ordered chapter list, for prev/next navigation.
  const nav = new Map<string, ChapterRef[]>();
  for (const [slug, c] of Object.entries(CHAPTERS)) {
    if (!nav.has(c.book)) nav.set(c.book, []);
    nav.get(c.book)!.push({ slug, ref: c.ref, chapter: c.chapter });
  }
  for (const list of nav.values()) list.sort((a, b) => a.chapter - b.chapter);

  _echoes = echoes;
  _nav = nav;
}

function ensure() {
  if (!_echoes || !_nav) build();
  return { echoes: _echoes!, nav: _nav! };
}

export function allChapterSlugs(): string[] {
  return Object.keys(CHAPTERS);
}

export type ChapterSummary = ChapterRef & { total: number; books: number };

// Every readable chapter, grouped by book, for the trajectory reader's browse
// page — sorted by book name, chapters within a book already in canonical order.
export function allBooksChapters(): { book: string; chapters: ChapterSummary[] }[] {
  const { echoes, nav } = ensure();
  const out: { book: string; chapters: ChapterSummary[] }[] = [];
  for (const [book, list] of nav) {
    const chapters = list.map((c) => {
      const acc = echoes.get(c.slug);
      return { ...c, total: acc?.total ?? 0, books: acc?.books.size ?? 0 };
    });
    out.push({ book, chapters });
  }
  out.sort((a, b) => a.book.localeCompare(b.book));
  return out;
}

export function getTrajectory(slug: string): Trajectory | undefined {
  const chap = CHAPTERS[slug];
  if (!chap) return undefined;
  const { echoes, nav } = ensure();
  const acc = echoes.get(slug) ?? { byVerse: new Map(), whole: [], books: new Set(), total: 0 };
  const dossiers = new Set(allDossierSlugs());

  const verses: TVerse[] = chap.verses.map(([v, text]) => {
    const dslug = sourceSlug(`${chap.book} ${chap.chapter}:${v}`);
    return {
      v,
      text,
      dossier: dossiers.has(dslug) ? dslug : undefined,
      echoes: acc.byVerse.get(v) ?? [],
    };
  });

  const siblings = nav.get(chap.book) ?? [];
  const i = siblings.findIndex((s) => s.slug === slug);
  return {
    slug,
    ref: chap.ref,
    book: chap.book,
    chapter: chap.chapter,
    verses,
    whole: acc.whole,
    total: acc.total,
    books: acc.books.size,
    prev: i > 0 ? siblings[i - 1] : undefined,
    next: i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : undefined,
  };
}
