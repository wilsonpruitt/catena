// Catena — the intertextual lens. A pericope of the alluding book carries a set
// of `echoes` pointing back to earlier Scripture. Type follows Richard Hays'
// quotation / allusion / echo gradient, extended with figural (typological)
// reuse that carries no verbal borrowing. Confidence is scored on Hays' three
// auditable tests — volume, recurrence, thematic coherence — while plausibility,
// history of interpretation, and satisfaction live in the editorial `note`.

export type EchoType = "quotation" | "allusion" | "echo" | "figural";
export type Confidence = "high" | "medium" | "low";

export type Echo = {
  source: string; // human reference of the precursor, e.g. "Psalm 2:7"
  type: EchoType;
  confidence: Confidence;
  text: string; // the precursor passage (public-domain translation)
  lxxText?: string; // Brenton Septuagint reading, shown where the Greek the NT
  // author follows materially differs from the Hebrew (text holds the Hebrew/WEB)
  note?: string; // editorial adjudication — why this echo, by Hays' criteria
  altSource?: string; // a parallel or alternative precursor, e.g. an LXX/Ps double
  contested?: boolean; // renders a trailing "?" — the identification is disputed
};

export type ChapterSection = { label: string; from: number; to: number };

export type Pericope = {
  id: string;
  ch: number;
  ref: string;
  text: string;
  echoes: Echo[];
  marker?: string;
};

export type Book = {
  slug: string;
  name: string;
  subtitle?: string;
  translation: string;
  pericopes: Pericope[];
  howToRead?: string;
  chapterSections?: ChapterSection[];
};
