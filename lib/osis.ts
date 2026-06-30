// OSIS reference normalizer — turns Catena's human references ("Psalm 110:1",
// "Exodus 2:8-3:3", "Wisdom of Solomon 7:25-26") into the dual key the Wroot
// data-repository standard requires: a machine `refKey` in OSIS osisRef form
// (e.g. "Ps.110.1", ranges fully qualified at both ends "Isa.53.1-Isa.53.12")
// and the human `refDisplay`. This is the reconciliation that lets Lectern and
// the reception corpus join to Catena's 9,250 echoes by verse range.
// Versification: KJV/WEB (matches our public-domain texts).

// Book name (as Catena writes it, including its own variants) -> OSIS code.
// Canon + deuterocanon use official OSIS codes. Pseudepigrapha fall outside the
// OSIS core; they get a stable code and are flagged `extended` (see EXTENDED).
const OSIS: Record<string, string> = {
  // Torah / history
  Genesis: "Gen", Exodus: "Exod", Leviticus: "Lev", Numbers: "Num", Deuteronomy: "Deut",
  Joshua: "Josh", Judges: "Judg", Ruth: "Ruth",
  "1 Samuel": "1Sam", "2 Samuel": "2Sam", "1 Kings": "1Kgs", "2 Kings": "2Kgs",
  "1 Chronicles": "1Chr", "2 Chronicles": "2Chr", Ezra: "Ezra", Nehemiah: "Neh", Esther: "Esth",
  // Wisdom / poetry
  Job: "Job", Psalm: "Ps", Psalms: "Ps", Proverbs: "Prov", Ecclesiastes: "Eccl",
  "Song of Songs": "Song", "Song of Solomon": "Song",
  // Prophets
  Isaiah: "Isa", Jeremiah: "Jer", Lamentations: "Lam", Ezekiel: "Ezek", Daniel: "Dan",
  Hosea: "Hos", Joel: "Joel", Amos: "Amos", Obadiah: "Obad", Jonah: "Jonah", Micah: "Mic",
  Nahum: "Nah", Habakkuk: "Hab", Zephaniah: "Zeph", Haggai: "Hag", Zechariah: "Zech", Malachi: "Mal",
  // Deuterocanon
  Tobit: "Tob", Judith: "Jdt", "Wisdom of Solomon": "Wis", Wisdom: "Wis", Sirach: "Sir",
  "Sirach Prologue": "Sir", Baruch: "Bar", Susanna: "Sus",
  "1 Maccabees": "1Macc", "2 Maccabees": "2Macc", "3 Maccabees": "3Macc", "4 Maccabees": "4Macc",
  "2 Esdras": "2Esd",
  // Pseudepigrapha — outside OSIS core, flagged extended
  "1 Enoch": "1En", "1 Enoch /": "1En", "2 Baruch": "2Bar", "4 Ezra": "4Ezra",
  "Testament of Job": "TJob", "Testament of Levi": "TLevi", Jubilees: "Jub",
  "Jannes and Jambres": "JanJam", "Martyrdom of Isaiah": "MartIsa",
  "Assumption of Moses": "AsMos", "Life of Adam and Eve": "LAE",
  // New Testament
  Matthew: "Matt", Mark: "Mark", Luke: "Luke", John: "John", Acts: "Acts", Romans: "Rom",
  "1 Corinthians": "1Cor", "2 Corinthians": "2Cor", Galatians: "Gal", Ephesians: "Eph",
  Philippians: "Phil", Colossians: "Col", "1 Thessalonians": "1Thess", "2 Thessalonians": "2Thess",
  "1 Timothy": "1Tim", "2 Timothy": "2Tim", Titus: "Titus", Philemon: "Phlm", Hebrews: "Heb",
  James: "Jas", "1 Peter": "1Pet", "2 Peter": "2Pet", "1 John": "1John", "2 John": "2John",
  "3 John": "3John", Jude: "Jude", Revelation: "Rev",
};

// Codes that are NOT part of the OSIS canonical/deuterocanonical set — emitted so
// the data still joins, but flagged so consumers can treat them as non-standard.
const EXTENDED = new Set(["1En", "2Bar", "4Ezra", "TJob", "TLevi", "Jub", "JanJam", "MartIsa", "AsMos", "LAE"]);

export type OsisRef = {
  refKey: string | null; // OSIS osisRef; null if the book is unknown
  refDisplay: string; // human string (en-dash ranges)
  code: string | null; // OSIS book code
  extended: boolean; // true if the book is outside core OSIS
  multi: boolean; // true if the reference listed several spans (only the first is keyed)
};

function display(ref: string): string {
  // House display form: hyphen between numbers becomes an en-dash.
  return ref.replace(/(\d)\s*-\s*(\d)/g, "$1–$2").replace(/\s+/g, " ").trim();
}

export function toOsis(ref: string): OsisRef {
  const refDisplay = display(ref);
  // Key only the first span of a list (comma/semicolon) or alternative (slash),
  // e.g. "Genesis 25; 27" or "1 Enoch / 2 Baruch".
  const multi = /[;,/]/.test(ref.replace(/^\s*\d\s+/, "")); // ignore a leading "1 "/"2 " in book names
  const first = ref.split(/[;,/]/)[0].replace(/[–—]/g, "-").trim();

  const m = first.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/);
  if (!m) {
    // No chapter/verse (e.g. a bare "Sirach Prologue" or an unparseable string).
    const code = OSIS[first] ?? null;
    return { refKey: code, refDisplay, code, extended: code ? EXTENDED.has(code) : false, multi };
  }
  const [, book, c1s, v1s, e1s, e2s] = m;
  const code = OSIS[book.trim()] ?? null;
  if (!code) return { refKey: null, refDisplay, code: null, extended: false, multi };

  const c1 = +c1s;
  const v1 = v1s ? +v1s : null;
  let refKey: string;
  if (e1s === undefined) {
    refKey = v1 === null ? `${code}.${c1}` : `${code}.${c1}.${v1}`;
  } else if (e2s !== undefined) {
    // cross-chapter verse range: "Exodus 2:8-3:3"
    refKey = `${code}.${c1}.${v1 ?? 1}-${code}.${+e1s}.${+e2s}`;
  } else if (v1 !== null) {
    // same-chapter verse range: "Psalm 45:6-7"
    refKey = `${code}.${c1}.${v1}-${code}.${c1}.${+e1s}`;
  } else {
    // chapter range: "Exodus 12-14"
    refKey = `${code}.${c1}-${code}.${+e1s}`;
  }
  return { refKey, refDisplay, code, extended: EXTENDED.has(code), multi };
}

// The OSIS book code for a bare book name (no chapter), or null.
export function osisBook(name: string): string | null {
  return OSIS[name.trim()] ?? null;
}

export function isExtended(code: string): boolean {
  return EXTENDED.has(code);
}
