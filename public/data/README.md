# Catena — open data

*The New Testament's use of the Old, as a typed, confidence-scored citation graph.*

Generated from the [Catena](https://catena.wrootpress.com) editions on 2026-06-30 (commit `5c184f9`).
**License: CC BY-SA 4.0** — Wilson Pruitt / Wroot Press. See `LICENSE.txt`.

## Files
- **`catena-echoes.jsonl`** — 9,250 edges, one JSON object per line. Each is a single intertextual link from a New Testament passage back to an earlier source.
- **`catena-fontium.json`** — the inverted *forward* index: every source keyed to the New Testament places that reach for it (4,531 sources). This is the centrifugal "reading-backwards" view, resolver-ready.
- **`catena-lxx-divergences.json`** — 81 curated cases where the New Testament follows the Greek (Septuagint) against the Hebrew, with both readings.

## The reference keys (dual, per the Wroot data-repository standard)
Every reference carries two forms:
- **`refKey`** — machine key, **OSIS** osisRef. Single verse `Ps.110.1`; ranges fully qualified at both ends `Isa.53.1-Isa.53.12`, across chapters too `Exod.2.8-Exod.3.3`; whole chapter `Ps.110`. Use this for joins, overlap queries, and sorting.
- **`refDisplay`** — human string, e.g. `Psalm 110:1` (en-dash ranges).

**Versification:** KJV/WEB, matching the underlying public-domain World English Bible text.

**OSIS extensions:** the ~32 echoes pointing at pseudepigrapha (1 Enoch, Jubilees, 2 Baruch, etc.) fall outside the OSIS core; they carry `"extended": true` and a non-standard but stable code (`1En`, `Jub`, …). Filter on `extended` if you need canon/deuterocanon only.

## Edge record
```json
{
  "citing":  { "refKey": "Heb.1.5", "refDisplay": "Hebrews 1:5", "book": "Hebrews", "slug": "hebrews", "pericopeId": "1-5-14" },
  "source":  { "refKey": "Ps.2.7",  "refDisplay": "Psalm 2:7", "code": "Ps", "extended": false },
  "type": "quotation",          // quotation | allusion | echo | figural (Hays' gradient)
  "confidence": "high",         // high | medium | low
  "contested": false,           // disputed identification
  "note": "…",                  // editorial adjudication
  "sourceText": "…",            // verbatim WEB precursor text
  "lxxText": null,              // Brenton Septuagint reading where the Greek differs
  "provenance": "https://catena.wrootpress.com/hebrews#p-1-5-14"
}
```

## Method
Echo types follow Richard Hays' quotation / allusion / echo gradient, extended with *figural* (typological) reuse that carries no verbal borrowing. Confidence is scored on Hays' auditable tests — volume, recurrence, thematic coherence. Identifications are editorial; `provenance` links each to its published place in the reader so attributions stay checkable.
