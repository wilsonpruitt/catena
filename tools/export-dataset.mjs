// Open-data export (Workstream 4). Emits Catena's echo graph in the form the
// Wroot data-repository standard requires — every record carrying BOTH an OSIS
// refKey (machine join) and a human refDisplay — so Lectern and the reception
// corpus can join to it by verse range. Derived from the book editions (the
// source of truth); regenerate after any edition change:
//   npx tsx tools/export-dataset.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { BOOKS } from "../data/books.ts";
import { toOsis, isExtended } from "../lib/osis.ts";
import { allBooksChapters } from "../lib/trajectory.ts";

const OUT = "public/data";
mkdirSync(OUT, { recursive: true });

let commit = "unknown";
try { commit = execFileSync("git", ["rev-parse", "--short", "HEAD"]).toString().trim(); } catch {}
const generated = new Date().toISOString().slice(0, 10);
const BASE = "https://catena.wrootpress.com";

const edges = [];
const forward = new Map(); // source refKey -> { refDisplay, code, extended, occurrences:[] }
const lxx = [];
let extendedCount = 0;

for (const b of BOOKS) {
  for (const p of b.pericopes) {
    const citing = toOsis(`${b.name} ${p.ref}`);
    const citingRec = {
      refKey: citing.refKey,
      refDisplay: citing.refDisplay, // toOsis already includes the book name
      book: b.name,
      slug: b.slug,
      pericopeId: p.id,
    };
    for (const e of p.echoes) {
      const src = toOsis(e.source);
      if (src.extended) extendedCount++;
      const edge = {
        citing: citingRec,
        source: {
          refKey: src.refKey,
          refDisplay: src.refDisplay,
          code: src.code,
          extended: src.extended,
        },
        type: e.type,
        confidence: e.confidence,
        contested: e.contested ?? false,
        note: e.note ?? null,
        sourceText: e.text ?? null,
        lxxText: e.lxxText ?? null,
        provenance: `${BASE}/${b.slug}#p-${p.id}`,
      };
      edges.push(edge);

      // Forward (centrifugal) index: OT source -> NT places. Keyed by OSIS
      // refKey when available, else the human refDisplay (pseudepigrapha alt-refs).
      const key = src.refKey ?? src.refDisplay;
      if (!forward.has(key))
        forward.set(key, { refKey: src.refKey, refDisplay: src.refDisplay, code: src.code, extended: src.extended, occurrences: [] });
      forward.get(key).occurrences.push({
        refKey: citingRec.refKey,
        refDisplay: citingRec.refDisplay,
        book: b.name,
        slug: b.slug,
        pericopeId: p.id,
        type: e.type,
        confidence: e.confidence,
      });

      if (e.lxxText)
        lxx.push({
          source: { refKey: src.refKey, refDisplay: src.refDisplay },
          citing: { refKey: citingRec.refKey, refDisplay: citingRec.refDisplay },
          hebrewText: e.text ?? null,
          lxxText: e.lxxText,
          note: e.note ?? null,
          provenance: edge.provenance,
        });
    }
  }
}

// catena-echoes.jsonl — one edge per line (stream-friendly, git-diffable).
writeFileSync(`${OUT}/catena-echoes.jsonl`, edges.map((e) => JSON.stringify(e)).join("\n") + "\n");

// catena-fontium.json — the OT->NT forward index (the resolver feed). Sorted by
// OSIS book then chapter/verse via a light numeric parse of the refKey.
const forwardArr = [...forward.values()].sort((a, b) => b.occurrences.length - a.occurrences.length);
writeFileSync(`${OUT}/catena-fontium.json`, JSON.stringify({ meta: metaBlock("forward-index"), sources: forwardArr }, null, 0));

// catena-lxx-divergences.json — the curated Septuagint subset.
writeFileSync(`${OUT}/catena-lxx-divergences.json`, JSON.stringify({ meta: metaBlock("lxx-divergences"), divergences: lxx }, null, 2));

// catena-readers.json — every chapter with a centrifugal trajectory reader
// (/fontium/read/[slug]), keyed by chapter-level OSIS refKey. This is the join
// Lectern (and any family member) needs to link an OT reading straight to its
// reader instead of the Index Fontium landing page.
const readers = [];
for (const { book, chapters } of allBooksChapters()) {
  for (const c of chapters) {
    const src = toOsis(`${book} ${c.chapter}`);
    readers.push({
      refKey: src.refKey,
      refDisplay: src.refDisplay,
      slug: c.slug,
      totalEchoes: c.total,
      ntBooks: c.books,
      url: `${BASE}/fontium/read/${c.slug}`,
    });
  }
}
writeFileSync(`${OUT}/catena-readers.json`, JSON.stringify({ meta: metaBlock("readers"), readers }, null, 0));

writeFileSync(`${OUT}/LICENSE.txt`, licenseText());
writeFileSync(`${OUT}/README.md`, readme());

import { statSync } from "node:fs";
const size = (f) => statSync(`${OUT}/${f}`).size;
const manifest = {
  ...metaBlock("manifest"),
  extendedEchoes: extendedCount,
  files: [
    { name: "catena-echoes.jsonl", count: edges.length, bytes: size("catena-echoes.jsonl"), desc: "Every echo as a typed, scored edge — one JSON object per line." },
    { name: "catena-fontium.json", count: forwardArr.length, bytes: size("catena-fontium.json"), desc: "The inverted forward index: each source keyed to the New Testament places that reach for it." },
    { name: "catena-lxx-divergences.json", count: lxx.length, bytes: size("catena-lxx-divergences.json"), desc: "Curated cases where the New Testament follows the Greek against the Hebrew." },
    { name: "catena-readers.json", count: readers.length, bytes: size("catena-readers.json"), desc: "Every chapter with a centrifugal trajectory reader (/fontium/read/[slug]), keyed by chapter-level refKey — the join for linking straight to a reader." },
    { name: "README.md", count: null, bytes: size("README.md"), desc: "Field reference, the dual-key scheme, and method." },
    { name: "LICENSE.txt", count: null, bytes: size("LICENSE.txt"), desc: "CC BY-SA 4.0." },
  ],
};
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));

function metaBlock(kind) {
  return {
    dataset: "Catena — the New Testament's use of the Old",
    kind,
    license: "CC BY-SA 4.0",
    attribution: "Wilson Pruitt / Wroot Press — catena.wrootpress.com",
    versification: "KJV/WEB",
    refKeyScheme: "OSIS osisRef",
    sourceCommit: commit,
    generated,
  };
}

function readme() {
  return `# Catena — open data

*The New Testament's use of the Old, as a typed, confidence-scored citation graph.*

Generated from the [Catena](${BASE}) editions on ${generated} (commit \`${commit}\`).
**License: CC BY-SA 4.0** — Wilson Pruitt / Wroot Press. See \`LICENSE.txt\`.

## Files
- **\`catena-echoes.jsonl\`** — ${edges.length.toLocaleString()} edges, one JSON object per line. Each is a single intertextual link from a New Testament passage back to an earlier source.
- **\`catena-fontium.json\`** — the inverted *forward* index: every source keyed to the New Testament places that reach for it (${forwardArr.length.toLocaleString()} sources). This is the centrifugal "reading-backwards" view, resolver-ready.
- **\`catena-lxx-divergences.json\`** — ${lxx.length} curated cases where the New Testament follows the Greek (Septuagint) against the Hebrew, with both readings.
- **\`catena-readers.json\`** — ${readers.length.toLocaleString()} chapters with a centrifugal trajectory reader at \`/fontium/read/[slug]\`, keyed by chapter-level refKey (e.g. \`Gen.1\`) — resolve any OT chapter reference straight to its reader.

## The reference keys (dual, per the Wroot data-repository standard)
Every reference carries two forms:
- **\`refKey\`** — machine key, **OSIS** osisRef. Single verse \`Ps.110.1\`; ranges fully qualified at both ends \`Isa.53.1-Isa.53.12\`, across chapters too \`Exod.2.8-Exod.3.3\`; whole chapter \`Ps.110\`. Use this for joins, overlap queries, and sorting.
- **\`refDisplay\`** — human string, e.g. \`Psalm 110:1\` (en-dash ranges).

**Versification:** KJV/WEB, matching the underlying public-domain World English Bible text.

**OSIS extensions:** the ~${extendedCount} echoes pointing at pseudepigrapha (1 Enoch, Jubilees, 2 Baruch, etc.) fall outside the OSIS core; they carry \`"extended": true\` and a non-standard but stable code (\`1En\`, \`Jub\`, …). Filter on \`extended\` if you need canon/deuterocanon only.

## Edge record
\`\`\`json
{
  "citing":  { "refKey": "Heb.1.5", "refDisplay": "Hebrews 1:5", "book": "Hebrews", "slug": "hebrews", "pericopeId": "1-5-14" },
  "source":  { "refKey": "Ps.2.7",  "refDisplay": "Psalm 2:7", "code": "Ps", "extended": false },
  "type": "quotation",          // quotation | allusion | echo | figural (Hays' gradient)
  "confidence": "high",         // high | medium | low
  "contested": false,           // disputed identification
  "note": "…",                  // editorial adjudication
  "sourceText": "…",            // verbatim WEB precursor text
  "lxxText": null,              // Brenton Septuagint reading where the Greek differs
  "provenance": "${BASE}/hebrews#p-1-5-14"
}
\`\`\`

## Method
Echo types follow Richard Hays' quotation / allusion / echo gradient, extended with *figural* (typological) reuse that carries no verbal borrowing. Confidence is scored on Hays' auditable tests — volume, recurrence, thematic coherence. Identifications are editorial; \`provenance\` links each to its published place in the reader so attributions stay checkable.
`;
}

console.log(`wrote ${OUT}/:`);
console.log(`  catena-echoes.jsonl         ${edges.length} edges`);
console.log(`  catena-fontium.json         ${forwardArr.length} sources`);
console.log(`  catena-lxx-divergences.json ${lxx.length} divergences`);
console.log(`  catena-readers.json         ${readers.length} readers`);
console.log(`  extended (pseudepigrapha) echoes: ${extendedCount}`);

function licenseText() {
  return `Catena — open data
Copyright (c) ${new Date().getFullYear()} Wilson Pruitt / Wroot Press

This dataset (the typed, confidence-scored echo identifications, editorial notes,
and the inverted index) is licensed under the Creative Commons
Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0).

You are free to share and adapt the material for any purpose, even commercially,
under these terms:
  - Attribution — credit "Wilson Pruitt / Wroot Press (catena.wrootpress.com)",
    link the license, and indicate if changes were made.
  - ShareAlike — if you remix or build upon the material, distribute your
    contributions under the same license.

Full legal code: https://creativecommons.org/licenses/by-sa/4.0/legalcode
SPDX-License-Identifier: CC-BY-SA-4.0

The underlying biblical text is the World English Bible (public domain).
`;
}
