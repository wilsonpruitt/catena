// One-time download of the inflected, accented GREEK Septuagint (Rahlfs 1935),
// reconstructed from eliranwong/LXX-Rahlfs-1935 (token list + versification map),
// for verifying where the NT follows the Greek of the LXX against the Hebrew.
// Writes tools/lxxg.json — { "Book Chap:Verse": "ἡ Ἑλληνικὴ …" } in LXX
// versification, full canonical book names. Run: node tools/download-lxxg.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const RAW = "https://raw.githubusercontent.com/eliranwong/LXX-Rahlfs-1935/master";

// SBL-ish abbreviation -> our canonical name. For the doublet traditions we keep
// the text the church/NT received: Daniel = Theodotion, Joshua/Judges = B text,
// Tobit = BA, Susanna/Bel = Theodotion.
const NAME = {
  Gen: "Genesis", Exod: "Exodus", Lev: "Leviticus", Num: "Numbers", Deut: "Deuteronomy",
  JoshB: "Joshua", JudgB: "Judges", Ruth: "Ruth",
  "1Sam": "1 Samuel", "2Sam": "2 Samuel", "1Kgs": "1 Kings", "2Kgs": "2 Kings",
  "1Chr": "1 Chronicles", "2Chr": "2 Chronicles",
  "1Esdr": "1 Esdras", "2Esdr": "Ezra-Nehemiah",
  Esth: "Esther", Jdt: "Judith", TobBA: "Tobit",
  "1Macc": "1 Maccabees", "2Macc": "2 Maccabees", "3Macc": "3 Maccabees", "4Macc": "4 Maccabees",
  Ps: "Psalms", PsSol: "Psalms of Solomon", Odes: "Odes",
  Prov: "Proverbs", Eccl: "Ecclesiastes", Song: "Song of Songs",
  Job: "Job", Wis: "Wisdom of Solomon", Sir: "Sirach",
  Hos: "Hosea", Amos: "Amos", Mic: "Micah", Joel: "Joel", Obad: "Obadiah",
  Jonah: "Jonah", Nah: "Nahum", Hab: "Habakkuk", Zeph: "Zephaniah", Hag: "Haggai",
  Zech: "Zechariah", Mal: "Malachi",
  Isa: "Isaiah", Jer: "Jeremiah", Bar: "Baruch", Lam: "Lamentations",
  EpJer: "Letter of Jeremiah", Ezek: "Ezekiel",
  DanTh: "Daniel", SusTh: "Susanna", BelTh: "Bel and the Dragon",
};

console.log("fetching token list (accented) …");
const tsv = await (await fetch(`${RAW}/01_wordlist_unicode/text_accented.csv`)).text();
const word = []; // wordID -> greek
for (const line of tsv.split("\n")) {
  if (!line) continue;
  const tab = line.indexOf("\t");
  const id = +line.slice(0, tab);
  const rest = line.slice(tab + 1);
  const w = rest.slice(rest.indexOf("\t") + 1).trim();
  if (id) word[id] = w;
}
console.log(`  ${word.length - 1} word tokens`);

console.log("fetching versification map …");
const vmap = await (await fetch(`${RAW}/08_versification/001_verse_c_modified_KEEP.csv`)).text();
const verses = []; // { book, chap, verse, start }
for (const line of vmap.split("\n")) {
  if (!line) continue;
  const [ref, start] = line.split("\t");
  const m = ref.match(/^(.+)\.(\d+)\.(\d+)$/);
  if (!m) continue;
  verses.push({ abbr: m[1], chap: +m[2], verse: +m[3], start: +start });
}

const OUT = {};
let kept = 0, skipped = new Set();
for (let i = 0; i < verses.length; i++) {
  const v = verses[i];
  const name = NAME[v.abbr];
  if (!name) { skipped.add(v.abbr); continue; }
  const end = i + 1 < verses.length ? verses[i + 1].start - 1 : word.length - 1;
  const words = [];
  for (let w = v.start; w <= end; w++) if (word[w]) words.push(word[w]);
  const text = words.join(" ").replace(/\s+/g, " ").trim();
  if (text) { OUT[`${name} ${v.chap}:${v.verse}`] = text; kept++; }
}

writeFileSync(join(here, "lxxg.json"), JSON.stringify(OUT) + "\n");
writeFileSync(
  join(here, "lxxg-books.json"),
  JSON.stringify([...new Set(Object.values(NAME))], null, 2) + "\n"
);
console.log(`saved tools/lxxg.json (${kept} verses) + lxxg-books.json`);
if (skipped.size) console.log("skipped doublet/extra traditions:", [...skipped].join(", "));
