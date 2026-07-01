import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { allBooksChapters } from "@/lib/trajectory";
import { ACCENT } from "@/lib/echoes";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500&display=swap";

export const metadata: Metadata = {
  title: "Reading Forward · Index Fontium · Catena",
  description:
    "The centrifugal reader — an Old Testament chapter, read forward through its whole New Testament afterlife, verse by verse.",
};

export default function ReadIndexPage() {
  const groups = allBooksChapters();
  const totalChapters = groups.reduce((n, g) => n + g.chapters.length, 0);

  return (
    <div style={S.root}>
      <link rel="stylesheet" href={FONT_URL} />
      <style>{`
        .read-home:hover { color: #f5f0e8 !important; }
        .read-chip:hover { background: ${ACCENT} !important; color: #f5f0e8 !important; }
      `}</style>

      <header style={S.header}>
        <Link href="/fontium" className="read-home" style={S.homeLink}>← INDEX FONTIUM</Link>
        <div style={S.ornament}>⛓ ⛓ ⛓</div>
        <h1 style={S.title}>READING FORWARD</h1>
        <div style={S.rule} />
        <p style={S.subtitle}>Hays&rsquo; other direction — an Old Testament chapter and its whole afterlife</p>
        <p style={S.credit}>{totalChapters} chapters, {groups.length} books</p>
      </header>

      <main style={S.main}>
        <p style={S.lede}>
          The editions read forward &mdash; a New Testament passage back to its
          sources. This runs the other way: a whole Old Testament chapter, read
          the direction it was written, with the places it surfaces later hung in
          the gutter of the verse that produced them. Pick a chapter.
        </p>

        <div style={S.groups}>
          {groups.map((g) => (
            <div key={g.book} style={S.group}>
              <h2 style={S.bookName}>{g.book}</h2>
              <div style={S.chips}>
                {g.chapters.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/fontium/read/${c.slug}`}
                    className="read-chip"
                    title={`${c.total} places across ${c.books} book${c.books === 1 ? "" : "s"}`}
                    style={S.chip}
                  >
                    {c.chapter}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  root: { fontFamily: "'Crimson Pro', Georgia, serif", background: "#f5f0e8", minHeight: "100vh", color: "#2c2418" },
  header: { background: "#2c2418", padding: "44px 24px 32px", textAlign: "center", position: "relative" },
  homeLink: { position: "absolute", top: 20, left: 24, color: "#cf7b6e", textDecoration: "none", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, letterSpacing: 3, transition: "color 0.15s" },
  ornament: { color: "#cf7b6e", fontSize: 13, letterSpacing: 10, marginBottom: 14 },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: "#f5f0e8", margin: 0, letterSpacing: 6 },
  rule: { width: 80, height: 1, backgroundColor: "#cf7b6e", margin: "14px auto" },
  subtitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#cf7b6e", margin: 0, fontStyle: "italic", letterSpacing: 1 },
  credit: { fontSize: 11.5, color: "#9a8c7e", margin: "12px 0 0", letterSpacing: 1 },
  main: { maxWidth: 820, margin: "0 auto", padding: "36px 24px 80px" },
  lede: { fontSize: 17, lineHeight: 1.75, color: "#3a2f24", margin: "0 0 32px" },
  groups: { display: "flex", flexDirection: "column", gap: 22 },
  group: { borderBottom: "1px solid #e6ddcc", paddingBottom: 18 },
  bookName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: ACCENT, letterSpacing: 1, margin: "0 0 10px" },
  chips: { display: "flex", flexWrap: "wrap", gap: 7 },
  chip: { display: "inline-block", minWidth: 30, textAlign: "center", padding: "4px 9px", borderRadius: 5, border: "1px solid #ddd1bb", background: "#faf6ee", color: "#5c4033", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13.5, fontWeight: 600, textDecoration: "none", transition: "all 0.12s" },
};
