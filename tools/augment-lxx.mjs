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
];
const stripParen = (s) => s.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
const isCurated = (src) => CURATED.some((c) => src.startsWith(c));
const cap = (t) => (t.length <= 480 ? t : t.slice(0, 480).replace(/\s+\S*$/, "") + " […]");

let attached = 0;
const log = [];
for (const f of ["hebrews", "revelation"]) {
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
