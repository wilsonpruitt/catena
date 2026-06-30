// Attach the Brenton-LXX reading (lxxText) to the CURATED set of echoes where the
// Septuagint materially differs from the Hebrew (and the WEB shows that difference).
// Automated overlap detection failed — Brenton's 1851 English diverges in style even
// when the reading is identical (e.g. Ps 110:4) — so this is a verified hand list.
// Each entry: a cleaned-source PREFIX. For matches we re-resolve the WEB (Hebrew)
// text clean and add the Brenton (Greek) reading, giving a true Hebrew/Greek pair.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve as resolveWEB } from "./weblookup.mjs";
import { resolveLXX } from "./lxxlookup.mjs";

const WRITE = process.argv.includes("--write");

// Material divergences the NT follows. Verified against the resolver.
const CURATED = [
  "Deuteronomy 32:43", // Heb 1:6 — LXX adds "let all the angels of God worship him"
  "Psalm 40:6",        // Heb 10:5 — LXX "a body you prepared" vs Hebrew "ears"
  "Psalm 2:9",         // Rev 2:27;12:5;19:15 — LXX "rule (shepherd)" vs Hebrew "break"
  "Psalm 97:7",        // Heb 1:6 — LXX "angels" vs Hebrew "gods"
  "Psalm 104:4",       // Heb 1:7 — LXX "his angels spirits" vs Hebrew "messengers winds"
  "Proverbs 3:11",     // Heb 12:5-6 — LXX "scourges every son"
  "Habakkuk 2:3",      // Heb 10:37-38 — LXX adds "if he shrinks back"
  "Zechariah 12:10",   // Rev 1:7 — LXX "they mocked/insulted" vs Hebrew "pierced"
  "Psalm 8:2",         // Matt 21:16 — LXX "praise" (αἶνον) vs Hebrew "strength"
  "Isaiah 29:13",      // Matt 15:8-9 — LXX "in vain… teaching commandments of men" vs Hebrew "fear taught by men"
  "Psalm 51:4",        // Rom 3:4 — LXX "prevail when you are judged" (passive νικήσῃς ἐν τῷ κρίνεσθαι) vs Hebrew "blameless when you judge"
  "Proverbs 11:31",    // 1 Pet 4:18 — LXX "if the righteous is scarcely saved" (μόλις σῴζεται) vs Hebrew "repaid on the earth"
  "Proverbs 3:34",     // 1 Pet 5:5 (also James 4:6) — LXX "God opposes the proud" (ὑπερηφάνοις ἀντιτάσσεται) vs Hebrew "he mocks the mockers"
  "Amos 9:11",         // Acts 15:16-17 — LXX "that the rest of mankind may seek the Lord" vs Hebrew "possess the remnant of Edom" (James's whole ruling)
  "Habakkuk 1:5",      // Acts 13:41 — LXX "behold, you despisers" (καταφρονηταί) vs Hebrew "look among the nations"
  "Amos 5:25",         // Acts 7:42-43 — LXX "Moloch… the star Rephan… beyond Babylon" vs Hebrew "Sikkuth… Kaiwan… beyond Damascus"
  "Isaiah 40:3-5",     // Luke 3:4-6 — LXX "all flesh shall see the salvation of God" vs Hebrew "the glory… shall see it together"
  "Isaiah 61:1",       // Luke 4:18 — LXX "recovery of sight to the blind" (ἀνάβλεψιν τυφλοῖς) vs Hebrew "opening of the prison to the bound"
];
const stripParen = (s) => s.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
// Prefix match, but the prefix must end on a verse boundary — not in the middle
// of a verse number — so "Isaiah 61:1" matches "Isaiah 61:1-2" but not "Isaiah 61:10".
const isCurated = (src) =>
  CURATED.some((c) => src.startsWith(c) && !/\d/.test(src.charAt(c.length)));
const cap = (t) => (t.length <= 480 ? t : t.slice(0, 480).replace(/\s+\S*$/, "") + " […]");

let attached = 0;
const log = [];
for (const f of ["hebrews", "revelation", "matthew", "mark", "luke", "john", "romans", "1-peter", "acts"]) {
  const d = JSON.parse(readFileSync(`/Users/wilsonpruitt/catena/data/${f}.json`, "utf8"));
  for (const p of d.pericopes) for (const e of p.echoes) {
    if (e.lxxText) delete e.lxxText; // idempotent
    const src = stripParen(e.source);
    if (!isCurated(src)) continue;
    const lxx = resolveLXX(src);
    const web = resolveWEB(src);
    if (!lxx) continue;
    if (web) e.text = cap(web); // ensure the WEB side is the clean Hebrew reading
    e.lxxText = cap(lxx);
    attached++;
    if (log.length < 40) log.push(`${f} ${p.ref} · ${src}\n   HEB: ${(web||e.text).slice(0,80)}\n   LXX: ${lxx.slice(0,80)}`);
  }
  if (WRITE) writeFileSync(`/Users/wilsonpruitt/catena/data/${f}.json`, JSON.stringify(d, null, 2) + "\n");
}
console.log(`${WRITE ? "WROTE" : "DRY"} | lxxText attached: ${attached}\n`);
console.log(log.join("\n"));
