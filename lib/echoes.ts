import type { EchoType, Confidence, Echo } from "./types";

// House palette — Wroot Press cream + ink, with Catena's oxblood accent (the
// red of rubrics and cross-reference chains), sibling to Loci's gold and
// Topographia's map-blue.
export const ACCENT = "#8c3b2f";

// The chip's visual grammar encodes the *kind* of link; its ink encodes
// *confidence*. Border style is the type's signature: solid quotation, dashed
// allusion, dotted echo. Figural reuse (no verbal borrowing) is marked by the
// ◇ glyph rather than a border style.
export const TYPE_META: Record<
  EchoType,
  { label: string; glyph: string; borderStyle: "solid" | "dashed" | "dotted"; desc: string }
> = {
  quotation: {
    label: "Quotation",
    glyph: "",
    borderStyle: "solid",
    desc: "A formal citation — high verbal volume, often introduced by a saying-formula.",
  },
  allusion: {
    label: "Allusion",
    glyph: "",
    borderStyle: "dashed",
    desc: "A deliberate verbal borrowing without a citation formula.",
  },
  echo: {
    label: "Echo",
    glyph: "",
    borderStyle: "dotted",
    desc: "A fainter, low-volume reuse, carried by recurrence or thematic coherence.",
  },
  figural: {
    label: "Figural",
    glyph: "◇",
    borderStyle: "solid",
    desc: "A typological pattern re-read in a later text — no verbal quotation, high figural coherence.",
  },
};

export const ORDER: EchoType[] = ["quotation", "allusion", "echo", "figural"];

// Confidence drives the ink weight of the chip's border and glyph.
export const CONFIDENCE_INK: Record<Confidence, string> = {
  high: "#8c3b2f",
  medium: "#a8675c",
  low: "#c2998f",
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

// Reduce a source reference to its book name, for the "books echoed" filter.
// "2 Samuel 7:14" -> "2 Samuel"; "Psalm 45:6-7" -> "Psalm"; "Leviticus 16" -> "Leviticus".
export function sourceBook(source: string): string {
  return source.replace(/\s+\d+(:\d+(–|-|\d)*)?\s*$/u, "").trim() || source;
}

export function chipLabel(e: Echo): string {
  const g = TYPE_META[e.type].glyph;
  return `${g ? g + " " : ""}${e.source}${e.contested ? " ?" : ""}`;
}
