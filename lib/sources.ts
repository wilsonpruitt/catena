// Per-source dossiers — the reception history of a single Old Testament source:
// the precursor text up top, then every New Testament place that reaches for it,
// grouped by kind of echo. Derived at build time from the book data (the source
// of truth), memoized per build process. Only sources reused at least
// MIN_OCC_FOR_DOSSIER times get a page; a one-time source is just a deep-link.
import { BOOKS } from "@/data/books";
import type { Book } from "./types";
import { NT_ABBR, parse, scoreOcc, CONF_WEIGHT, type FOcc } from "./fontium";
import { sourceBook } from "./echoes";
import { sourceSlug } from "./slug";

export const MIN_OCC_FOR_DOSSIER = 2;

export type DossOcc = FOcc & { note?: string; contested?: boolean };
export type Sibling = { ref: string; slug: string; count: number };
export type Dossier = {
  slug: string;
  ref: string; // the representative (most-cited) reference for this slug
  refs: string[]; // every reference collapsing to this slug (usually one)
  book: string; // e.g. "Psalm"
  chapter: number;
  verse: number;
  text: string; // the precursor passage (public-domain WEB)
  lxxText?: string; // Septuagint reading, where the Greek the NT follows differs
  count: number;
  score: number;
  occ: DossOcc[]; // sorted strongest-first
  siblings: Sibling[]; // other indexed verses of the same book+chapter
};

const TYPE_RANK: Record<string, number> = { quotation: 4, allusion: 3, echo: 2, figural: 1 };

type Raw = {
  slug: string;
  refs: Set<string>;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  lxxText?: string;
  occ: DossOcc[];
};

let _cache: Map<string, Dossier> | null = null;

function build(): Map<string, Dossier> {
  const raw = new Map<string, Raw>();

  for (const b of BOOKS as Book[]) {
    const abbr = NT_ABBR[b.name] || b.name.slice(0, 3);
    for (const p of b.pericopes)
      for (const e of p.echoes) {
        const slug = sourceSlug(e.source);
        const { chapter, verse } = parse(e.source);
        let r = raw.get(slug);
        if (!r) {
          r = {
            slug,
            refs: new Set(),
            book: sourceBook(e.source),
            chapter,
            verse,
            text: "",
            occ: [],
          };
          raw.set(slug, r);
        }
        r.refs.add(e.source);
        if (!r.text && e.text) r.text = e.text;
        if (!r.lxxText && e.lxxText) r.lxxText = e.lxxText;
        // One occurrence per (edition, pericope) — a pericope echoing the same
        // source twice still reads as one place in the dossier.
        if (!r.occ.some((o) => o.slug === b.slug && o.id === p.id))
          r.occ.push({
            slug: b.slug,
            abbr,
            pref: p.ref,
            id: p.id,
            type: e.type,
            confidence: e.confidence,
            note: e.note,
            contested: e.contested,
          });
      }
  }

  // Promote the raw entries that clear the reuse floor into full dossiers.
  const dossiers = new Map<string, Dossier>();
  for (const r of raw.values()) {
    if (r.occ.length < MIN_OCC_FOR_DOSSIER) continue;
    r.occ.sort(
      (a, b) =>
        (CONF_WEIGHT[b.confidence] ?? 1) - (CONF_WEIGHT[a.confidence] ?? 1) ||
        (TYPE_RANK[b.type] ?? 0) - (TYPE_RANK[a.type] ?? 0) ||
        a.slug.localeCompare(b.slug)
    );
    const refs = [...r.refs].sort();
    dossiers.set(r.slug, {
      slug: r.slug,
      ref: refs[0],
      refs,
      book: r.book,
      chapter: r.chapter,
      verse: r.verse,
      text: r.text,
      lxxText: r.lxxText,
      count: r.occ.length,
      score: scoreOcc(r.occ),
      occ: r.occ,
      siblings: [],
    });
  }

  // Wire siblings: other indexed verses sharing the same book + chapter, so a
  // dossier for Psalm 110:1 points to Psalm 110:4 — a foretaste of the
  // chapter-level trajectory reader.
  for (const d of dossiers.values()) {
    d.siblings = [...dossiers.values()]
      .filter((o) => o.slug !== d.slug && o.book === d.book && o.chapter === d.chapter)
      .sort((a, b) => a.verse - b.verse)
      .map((o) => ({ ref: o.ref, slug: o.slug, count: o.count }));
  }

  return dossiers;
}

function dossierMap(): Map<string, Dossier> {
  if (!_cache) _cache = build();
  return _cache;
}

export function allDossierSlugs(): string[] {
  return [...dossierMap().keys()];
}

export function getDossier(slug: string): Dossier | undefined {
  return dossierMap().get(slug);
}
