# Catena

A Wroot Press reading-lens. **Catena** organizes Scripture by *how it connects* —
the chains of quotation, allusion, echo, and figural reuse that bind a later text
to an earlier one. Sibling to **Topographia Sacra** (organizes by *where*) and
**Loci** (organizes by *what*).

## The model

Each pericope of the alluding book carries a set of `echoes` pointing back to
earlier Scripture. Following Richard Hays' *Echoes of Scripture*:

| Kind | Chip | Meaning |
|---|---|---|
| Quotation | solid border | formal citation, high verbal volume |
| Allusion | dashed border | deliberate verbal borrowing, no formula |
| Echo | dotted border | faint, low-volume reuse |
| Figural | ◇ glyph | typological pattern, no words borrowed |

The chip's **border style** encodes the kind; its **ink** encodes confidence
(high / medium / low). A trailing **?** marks a contested identification.

Confidence is scored on Hays' three auditable tests — **volume, recurrence,
thematic coherence**. His other three (historical plausibility, history of
interpretation, satisfaction) live in each echo's editorial `note`.

## Two reading postures

- **Centripetal** (built): a book → the sources it reaches back to. The author's
  own allusion, diachronic.
- **Centrifugal** (planned v2): an Old Testament source → its later reuses. The
  retrospective, figural "reading backwards" of Hays' *Gospels* volume. Same edge
  data, rendered the other direction.

## Editions

- **Hebrews** — *An Argument Made of Scripture*. Launch seed: chapter 1, the
  classic catena of seven OT citations strung against the angels.

## Adding a book

1. Drop `data/<slug>.json` — `slug`, `name`, `subtitle`, `translation`,
   `pericopes` (each with an `echoes` array), optional `howToRead`,
   `chapterSections`.
2. Append it to `data/books.ts`.
3. `/[book]` and `generateStaticParams` pick it up automatically.

## Shared lectionary spine (WS3) — lives in `reception-corpus`

The lectionary-preaching workstream (WS3) does **not** keep its own RCL table. The
Revised Common Lectionary spine is shared open data in the sibling repo:

- **Spine:** `~/reception-corpus/data/rcl.json` — Years A/B/C, 228 occasions / 1,188
  readings, Vanderbilt-sourced + validated. Every reading carries an OSIS `refKey`
  (KJV/WEB) — the **same key this repo's `public/data/catena-echoes.jsonl` and
  `catena-fontium.json` use**, so a Sunday reading joins straight to its echoes.
- **Loader/resolver:** `~/reception-corpus/src/rcl.py` (also resolves each reading to
  the reception store). OSIS handling mirrors this repo's `lib/osis.ts`.
- Conforms to the Wroot **data-repository standard**; build/validate with
  `reception-corpus/src/build_rcl.py` + `validate_rcl.py`.

When WS3 ships a lectionary view here, consume `rcl.json` by `refKey` — do not
re-source the calendar.

## Stack

Next.js 16 (Turbopack) · React 19 · TypeScript · inline styles · static export.
Scripture: World English Bible (public domain). Forked from the Loci shell.

## Dev

```sh
pnpm install
pnpm dev
```
