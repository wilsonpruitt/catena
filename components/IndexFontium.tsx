"use client";

import { useState, useMemo, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import type { Fontium, FOcc } from "@/lib/fontium";
import { TYPE_META, CONFIDENCE_INK, ACCENT } from "@/lib/echoes";
import { sourceSlug } from "@/lib/slug";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500&display=swap";

const RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };
// A source's significance = summed confidence weight × distinct books that echo
// it (mirrors lib/fontium.scoreOcc; reimplemented to keep BOOKS out of the
// client bundle). Recomputed here because the confidence filter changes it.
function scoreOf(occ: FOcc[]): number {
  let w = 0;
  const books = new Set<string>();
  for (const o of occ) {
    w += RANK[o.confidence] ?? 1;
    books.add(o.slug);
  }
  return w * books.size;
}
// Mirror of lib/sources.MIN_OCC_FOR_DOSSIER — a source gets a dossier page once
// it is reused this many times across the editions.
const DOSSIER_FLOOR = 2;

const FLOORS = [
  { key: "all", label: "All", v: 1 },
  { key: "medium", label: "Medium +", v: 2 },
  { key: "high", label: "High only", v: 3 },
] as const;

const SORTS = [
  { key: "score", label: "Significance" },
  { key: "count", label: "Most cited" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

export default function IndexFontium({ data }: { data: Fontium }) {
  const [floor, setFloor] = useState(1);
  const [sort, setSort] = useState<SortKey>("score");
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!document.getElementById("catena-fonts")) {
      const l = document.createElement("link");
      l.id = "catena-fonts";
      l.rel = "stylesheet";
      l.href = FONT_URL;
      document.head.appendChild(l);
    }
  }, []);

  const books = useMemo(() => {
    const cmp = (a: { score: number; count: number }, b: { score: number; count: number }) =>
      sort === "score" ? b.score - a.score || b.count - a.count : b.count - a.count || b.score - a.score;
    return data.books
      .map((b) => {
        const sources = b.sources
          .map((s) => {
            const occ = s.occ.filter((o) => RANK[o.confidence] >= floor);
            // s.count is the unfiltered occurrence total — what governs whether a
            // dossier page exists, regardless of the active confidence filter.
            return { ...s, occ, count: occ.length, score: scoreOf(occ), full: s.count };
          })
          .filter((s) => s.occ.length > 0)
          .sort((x, y) => cmp(x, y) || x.chapter - y.chapter || x.verse - y.verse);
        const count = sources.reduce((n, s) => n + s.count, 0);
        const score = sources.reduce((n, s) => n + s.score, 0);
        return { ...b, sources, count, score };
      })
      .filter((b) => b.count > 0)
      .sort(cmp);
  }, [data, floor, sort]);

  const shown = books.reduce((n, b) => n + b.count, 0);
  const toggle = (n: string) =>
    setOpen((p) => {
      const s = new Set(p);
      s.has(n) ? s.delete(n) : s.add(n);
      return s;
    });

  return (
    <div style={S.root}>
      <style>{`
        .fontium-book:hover { background: rgba(140,59,47,0.06) !important; }
        .fontium-occ:hover { background: rgba(140,59,47,0.12) !important; }
        .fontium-home:hover { color: #f5f0e8 !important; }
        .fontium-reflink:hover { color: ${ACCENT} !important; }
        @media (max-width: 720px) { .fontium-srcrow { flex-direction: column !important; gap: 4px !important; } .fontium-ref { width: auto !important; } }
      `}</style>

      <header style={S.header}>
        <Link href="/" className="fontium-home" style={S.homeLink}>← CATENA</Link>
        <div style={S.ornament}>⛓ ⛓ ⛓</div>
        <h1 style={S.title}>INDEX FONTIUM</h1>
        <div style={S.rule} />
        <p style={S.subtitle}>The Old Testament in the New</p>
        <p style={S.credit}>
          {data.books.length} sources · {data.total} echoes · indexing {data.indexed.join(" & ")}
        </p>
        <div style={S.headLinks}>
          <Link href="/fontium/map" className="fontium-home" style={S.spineLink}>
            ⛓ View the spine →
          </Link>
          <Link href="/fontium/data" className="fontium-home" style={S.spineLink}>
            Open data →
          </Link>
        </div>
      </header>

      <main style={S.main}>
        <p style={S.lede}>
          Every place a source in the older Scripture surfaces in the editions we&rsquo;ve
          built. Ranked by <em>significance</em> — confidence weighted by how many books
          reach for it — so the load-bearing texts rise on their own; switch to{" "}
          <em>most cited</em> for raw frequency. A reused source links to its reception
          dossier; each chip lands on the passage that echoes it. This index grows as
          more books are added.
        </p>

        <div style={S.filterRow}>
          <span style={S.filterLabel}>Confidence</span>
          {FLOORS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFloor(f.v)}
              style={{
                ...S.filterBtn,
                background: floor === f.v ? ACCENT : "transparent",
                color: floor === f.v ? "#f5f0e8" : "#6b5d4e",
                borderColor: floor === f.v ? ACCENT : "#c9b99a",
              }}
            >
              {f.label}
            </button>
          ))}
          <span style={S.filterLabel}>Sort</span>
          {SORTS.map((so) => (
            <button
              key={so.key}
              onClick={() => setSort(so.key)}
              style={{
                ...S.filterBtn,
                background: sort === so.key ? ACCENT : "transparent",
                color: sort === so.key ? "#f5f0e8" : "#6b5d4e",
                borderColor: sort === so.key ? ACCENT : "#c9b99a",
              }}
            >
              {so.label}
            </button>
          ))}
          <span style={S.shown}>{shown} shown</span>
        </div>

        <div style={S.bookList}>
          {books.map((b) => {
            const isOpen = open.has(b.name);
            return (
              <div key={b.name} style={S.bookBlock}>
                <button className="fontium-book" onClick={() => toggle(b.name)} style={S.bookRow}>
                  <span style={S.caret}>{isOpen ? "▾" : "▸"}</span>
                  <span style={S.bookName}>{b.name}</span>
                  <span style={S.bookCount}>{b.count}</span>
                </button>
                {isOpen && (
                  <div style={S.sources}>
                    {b.sources.map((s) => (
                      <div key={s.ref} className="fontium-srcrow" style={S.srcRow}>
                        {s.full >= DOSSIER_FLOOR ? (
                          <Link
                            href={`/fontium/${sourceSlug(s.ref)}`}
                            className="fontium-ref fontium-reflink"
                            style={{ ...S.srcRef, ...S.srcRefLink }}
                            title={`Reception of ${s.ref} — ${s.full} places`}
                          >
                            {s.ref}
                          </Link>
                        ) : (
                          <span className="fontium-ref" style={S.srcRef}>{s.ref}</span>
                        )}
                        <span style={S.occWrap}>
                          {s.occ.map((o, i) => {
                            const meta = TYPE_META[o.type as keyof typeof TYPE_META];
                            const ink = CONFIDENCE_INK[o.confidence as keyof typeof CONFIDENCE_INK];
                            return (
                              <Link
                                key={`${o.slug}-${o.id}-${i}`}
                                href={`/${o.slug}#p-${o.id}`}
                                className="fontium-occ"
                                title={`${meta?.label ?? o.type} · ${o.confidence} confidence`}
                                style={{
                                  ...S.occ,
                                  color: ink,
                                  border: `1px ${meta?.borderStyle ?? "solid"} ${ink}`,
                                }}
                              >
                                {meta?.glyph ? meta.glyph + " " : ""}
                                {o.abbr} {o.pref}
                              </Link>
                            );
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <footer style={S.footer}>
        Index Fontium · a derived view · Wroot Press
      </footer>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  root: { fontFamily: "'Crimson Pro', Georgia, serif", background: "#f5f0e8", minHeight: "100vh", color: "#2c2418" },
  header: { background: "#2c2418", padding: "44px 24px 32px", textAlign: "center", position: "relative" },
  homeLink: { position: "absolute", top: 20, left: 24, color: "#cf7b6e", textDecoration: "none", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, letterSpacing: 3, transition: "color 0.15s" },
  ornament: { color: "#cf7b6e", fontSize: 13, letterSpacing: 10, marginBottom: 14 },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 46, fontWeight: 700, color: "#f5f0e8", margin: 0, letterSpacing: 10 },
  rule: { width: 80, height: 1, backgroundColor: "#cf7b6e", margin: "14px auto" },
  subtitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#cf7b6e", margin: 0, fontStyle: "italic", letterSpacing: 1 },
  credit: { fontSize: 11.5, color: "#9a8c7e", margin: "12px 0 0", letterSpacing: 1 },
  headLinks: { display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap", marginTop: 14 },
  spineLink: { display: "inline-block", color: "#cf7b6e", textDecoration: "none", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 14, fontWeight: 600, letterSpacing: 1, transition: "color 0.15s" },
  main: { maxWidth: 880, margin: "0 auto", padding: "36px 24px 80px" },
  lede: { fontSize: 16, lineHeight: 1.7, color: "#4a3d30", marginBottom: 26 },
  filterRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 22, flexWrap: "wrap" },
  filterLabel: { fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a7a6a", marginRight: 4 },
  filterBtn: { padding: "4px 14px", borderRadius: 14, border: "1px solid #c9b99a", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontSize: 13, letterSpacing: 0.5, transition: "all 0.15s" },
  shown: { marginLeft: "auto", fontSize: 12, color: "#9a8c7e", letterSpacing: 0.5 },
  bookList: { display: "flex", flexDirection: "column", gap: 2 },
  bookBlock: { borderBottom: "1px solid #e2dac9" },
  bookRow: { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 8px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s", borderRadius: 4 },
  caret: { color: ACCENT, fontSize: 12, width: 12, flexShrink: 0 },
  bookName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, letterSpacing: 2, color: "#2c2418", flex: 1 },
  bookCount: { fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600, color: ACCENT },
  sources: { padding: "4px 8px 16px 32px", display: "flex", flexDirection: "column", gap: 9 },
  srcRow: { display: "flex", alignItems: "baseline", gap: 14 },
  srcRef: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 600, color: "#5c4033", width: 150, flexShrink: 0 },
  srcRefLink: { textDecoration: "none", borderBottom: `1px dotted ${ACCENT}`, transition: "color 0.15s" },
  occWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  occ: { display: "inline-block", padding: "1px 8px", borderRadius: 11, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 12.5, fontWeight: 600, letterSpacing: 0.3, textDecoration: "none", transition: "background 0.15s" },
  footer: { textAlign: "center", padding: 20, borderTop: "1px solid #d4c9b5", fontSize: 11, color: "#a09080", letterSpacing: 0.5, background: "#eee9df" },
};
