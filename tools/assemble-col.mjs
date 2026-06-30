import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "./weblookup.mjs";

const dir = "/Users/wilsonpruitt/catena/data/resweep-col";
const NT = new Set(["Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"]);
const bookOf = (s) => s.replace(/\s+\d.*$/u, "").trim();
const stripParen = (s) => s.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
function cap(t) {
  if (t.length <= 460) return t;
  const s = t.slice(0, 460);
  const i = s.lastIndexOf(" ");
  return s.slice(0, i > 300 ? i : 460).trim() + " […]";
}

const out = {
  slug: "colossians",
  name: "Colossians",
  subtitle: "A Fullness Made of Scripture",
  translation: "World English Bible",
  howToRead:
    "Against a religion of elemental spirits and empty philosophy, Colossians answers with the fullness of God dwelling bodily in Christ — and it sings that fullness in the language of Israel’s wisdom and creation traditions. The hymn at its center names Christ the image of the invisible God and the firstborn of all creation, the one in whom and through whom and for whom all things were made and in whom they hold together — the very role Proverbs and Wisdom gave to Wisdom at God’s side before the world. The letter reads circumcision as a thing of the heart made without hands, the feasts and new moons and sabbaths as a shadow whose substance is Christ, and the risen life as hidden with him who sits at God’s right hand. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where Paul follows the Greek of the Septuagint against the Hebrew, both readings are shown.",
  pericopes: [],
};

let dropped = 0, placeheld = [], echoCount = 0, noText = [];
for (let ch = 1; ch <= 4; ch++) {
  const arr = JSON.parse(readFileSync(`${dir}/ch-${ch}.json`, "utf8"));
  for (const p of arr) {
    const text = resolve("Colossians " + p.ref) || p.text || "";
    if (!resolve("Colossians " + p.ref)) noText.push(p.ref);
    const echoes = [];
    const TYPES = new Set(["quotation", "allusion", "echo", "figural"]);
    for (const e of p.echoes) {
      const src = stripParen(e.source);
      if (NT.has(bookOf(src))) { dropped++; continue; }
      const raw = resolve(src);
      const type = TYPES.has(e.type) ? e.type : (e.type === "typological" ? "figural" : "echo");
      const echo = {
        source: src,
        type,
        confidence: raw ? e.confidence : "low",
        text: raw ? cap(raw) : "[source text not in the World English Bible]",
        note: e.note,
      };
      if (e.contested || !raw) echo.contested = true;
      if (e.altSource) echo.altSource = e.altSource;
      if (!raw) placeheld.push(`${p.ref} → ${src}`);
      echoes.push(echo);
      echoCount++;
    }
    out.pericopes.push({ id: p.id, ch: p.ch, ref: p.ref, text, echoes });
  }
}

writeFileSync("/Users/wilsonpruitt/catena/data/colossians.json", JSON.stringify(out, null, 2) + "\n");

const t = {}, s = {};
for (const p of out.pericopes) for (const e of p.echoes) {
  t[e.type] = (t[e.type] || 0) + 1;
  const b = bookOf(e.source); s[b] = (s[b] || 0) + 1;
}
console.log("pericopes:", out.pericopes.length, "| echoes:", echoCount);
console.log("by type:", t);
console.log("books echoed:", Object.keys(s).length);
console.log("NT echoes dropped:", dropped);
console.log("pericopes w/o resolved text:", noText.length, noText.join(", "));
console.log("placeholder (off-canon) echoes:", placeheld.length);
console.log("  " + placeheld.join("; "));
console.log("top sources:", Object.entries(s).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>`${k} ${v}`).join(", "));
