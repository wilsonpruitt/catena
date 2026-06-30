// Stable URL slug for an Old Testament source reference. Kept in its own module
// (no data imports) so a client component can build dossier hrefs without
// pulling the whole corpus into the browser bundle.
//   "Psalm 110:1"            -> "psalm-110-1"
//   "Wisdom of Solomon 7:25" -> "wisdom-of-solomon-7-25"
//   "Exodus 12–14"           -> "exodus-12-14"
export function sourceSlug(ref: string): string {
  return ref
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
