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

## Stack

Next.js 16 (Turbopack) · React 19 · TypeScript · inline styles · static export.
Scripture: World English Bible (public domain). Forked from the Loci shell.

## Dev

```sh
pnpm install
pnpm dev
```
