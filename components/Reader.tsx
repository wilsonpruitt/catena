"use client";

import { useState, useMemo, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import type { Book, Echo, EchoType } from "@/lib/types";
import {
  TYPE_META,
  ORDER,
  CONFIDENCE_INK,
  CONFIDENCE_LABEL,
  sourceBook,
  ACCENT,
} from "@/lib/echoes";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap";

export default function Reader({ book }: { book: Book }) {
  const [activeTypes, setActiveTypes] = useState<Set<EchoType>>(new Set());
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [legendOpen, setLegendOpen] = useState(true);

  useEffect(() => {
    if (!document.getElementById("catena-fonts")) {
      const l = document.createElement("link");
      l.id = "catena-fonts";
      l.rel = "stylesheet";
      l.href = FONT_URL;
      document.head.appendChild(l);
    }
  }, []);

  const toggleType = (t: EchoType) =>
    setActiveTypes((prev) => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });

  const toggleExpand = (key: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const matchEcho = (e: Echo): boolean =>
    (activeTypes.size === 0 || activeTypes.has(e.type)) &&
    (activeSource === null || sourceBook(e.source) === activeSource);

  const filtersActive = activeTypes.size > 0 || activeSource !== null;

  // Counts for the type legend.
  const typeCounts = useMemo(() => {
    const c: Record<EchoType, number> = {
      quotation: 0,
      allusion: 0,
      echo: 0,
      figural: 0,
    };
    book.pericopes.forEach((p) => p.echoes.forEach((e) => (c[e.type] += 1)));
    return c;
  }, [book]);

  // Books echoed, by frequency.
  const sourceCounts = useMemo(() => {
    const map = new Map<string, number>();
    book.pericopes.forEach((p) =>
      p.echoes.forEach((e) => {
        const b = sourceBook(e.source);
        map.set(b, (map.get(b) ?? 0) + 1);
      })
    );
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [book]);

  const chapters = useMemo(
    () => [...new Set(book.pericopes.map((p) => p.ch))].sort((a, b) => a - b),
    [book]
  );

  // Chapters that contain a matching echo (for the sidebar grid tint).
  const matchingChapters = useMemo(() => {
    if (!filtersActive) return null;
    const set = new Set<number>();
    book.pericopes.forEach((p) => {
      if (p.echoes.some(matchEcho)) set.add(p.ch);
    });
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, activeTypes, activeSource]);

  const visiblePassages = useMemo(() => {
    let p = book.pericopes.filter((x) => x.text.length > 0);
    if (activeChapter !== null) p = p.filter((x) => x.ch === activeChapter);
    return p;
  }, [book, activeChapter]);

  const grouped = useMemo(() => {
    const map: Record<number, typeof book.pericopes> = {};
    visiblePassages.forEach((p) => {
      if (!map[p.ch]) map[p.ch] = [];
      map[p.ch].push(p);
    });
    return Object.entries(map).sort(([a], [b]) => +a - +b);
  }, [visiblePassages, book.pericopes]);

  const chapterHeading = (ref: string): string => {
    const prefix = ref.split(":")[0];
    return /^\d+$/.test(prefix) ? `Chapter ${prefix}` : prefix;
  };

  const clearFilters = () => {
    setActiveTypes(new Set());
    setActiveSource(null);
  };

  return (
    <div style={S.root}>
      <style>{`
        .catena-passage:hover { background: rgba(140,59,47,0.05) !important; }
        .catena-home-link:hover { color: #f5f0e8 !important; }
        .catena-type-btn:hover { transform: translateX(1px); }
        .catena-ch-btn:hover { background: rgba(140,59,47,0.10) !important; }
        .catena-chip:hover { background: rgba(140,59,47,0.10) !important; }
        @media (max-width: 800px) {
          .catena-layout { flex-direction: column !important; }
          .catena-sidebar { position: relative !important; width: 100% !important; max-height: none !important; border-right: none !important; border-bottom: 1px solid #d4c9b5 !important; }
          .catena-main { padding: 20px 16px !important; }
        }
      `}</style>

      <header style={S.header}>
        <Link href="/" className="catena-home-link" style={S.homeLink}>
          ← CATENA
        </Link>
        <div style={S.headerOrnament}>⛓ ⛓ ⛓</div>
        <h1 style={S.title}>{book.name.toUpperCase()}</h1>
        <div style={S.titleRule} />
        {book.subtitle && <p style={S.subtitle}>{book.subtitle}</p>}
        <p style={S.credit}>{book.translation}</p>
      </header>

      <div className="catena-layout" style={S.layout}>
        <aside className="catena-sidebar" style={S.sidebar}>
          <button onClick={() => setLegendOpen(!legendOpen)} style={S.legendToggle}>
            {legendOpen ? "▾" : "▸"} Kinds of Echo
          </button>

          {legendOpen && (
            <div style={S.typeList}>
              {ORDER.map((t) => {
                const meta = TYPE_META[t];
                const active = activeTypes.has(t);
                return (
                  <button
                    key={t}
                    className="catena-type-btn"
                    onClick={() => toggleType(t)}
                    style={{
                      ...S.typeBtn,
                      background: active ? "rgba(140,59,47,0.10)" : "transparent",
                      borderLeft: `4px solid ${active ? ACCENT : "transparent"}`,
                      fontWeight: active ? 600 : 400,
                    }}
                    title={meta.desc}
                  >
                    <span style={S.chipPreviewWrap}>
                      <span
                        style={{
                          ...S.chipPreview,
                          border: `1.5px ${meta.borderStyle} ${ACCENT}`,
                        }}
                      >
                        {meta.glyph || "Aa"}
                      </span>
                    </span>
                    <span style={{ flex: 1, color: active ? ACCENT : "#4a3d30" }}>
                      {meta.label}
                    </span>
                    <span style={S.typeCount}>{typeCounts[t]}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={S.sourceSection}>
            <div style={S.sectionLabel}>Books Echoed</div>
            <div style={S.sourceList}>
              {sourceCounts.map(([b, count]) => {
                const active = activeSource === b;
                return (
                  <button
                    key={b}
                    className="catena-type-btn"
                    onClick={() => setActiveSource(active ? null : b)}
                    style={{
                      ...S.sourceBtn,
                      background: active ? "rgba(140,59,47,0.10)" : "transparent",
                      borderLeft: `3px solid ${active ? ACCENT : "transparent"}`,
                      color: active ? ACCENT : "#4a3d30",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <span style={{ flex: 1 }}>{b}</span>
                    <span style={S.typeCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filtersActive && (
            <button onClick={clearFilters} style={S.clearBtn}>
              Clear filters
            </button>
          )}

          <div style={S.chapterNav}>
            <div style={S.sectionLabel}>Chapters</div>
            <div style={S.chapterGrid}>
              {chapters.map((ch) => {
                const isActive = activeChapter === ch;
                const matches = matchingChapters === null || matchingChapters.has(ch);
                const faded = matchingChapters !== null && !matches;
                let bg = "transparent";
                let color = "#4a3d30";
                let borderColor = "#c9b99a";
                if (isActive) {
                  bg = ACCENT;
                  color = "#f5f0e8";
                  borderColor = ACCENT;
                } else if (faded) {
                  color = "#c8bfae";
                  borderColor = "#e8e0d0";
                } else if (matchingChapters !== null && matches) {
                  bg = "rgba(140,59,47,0.10)";
                  color = ACCENT;
                  borderColor = ACCENT;
                }
                return (
                  <button
                    key={ch}
                    className="catena-ch-btn"
                    onClick={() => setActiveChapter(isActive ? null : ch)}
                    style={{
                      ...S.chBtn,
                      background: bg,
                      color,
                      borderColor,
                      opacity: faded ? 0.5 : 1,
                    }}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
            {activeChapter && (
              <button onClick={() => setActiveChapter(null)} style={S.clearBtn}>
                Show all chapters
              </button>
            )}
          </div>

          {book.howToRead && <div style={S.howTo}>{book.howToRead}</div>}
        </aside>

        <main className="catena-main" style={S.main}>
          {grouped.map(([ch, passages]) => (
            <div key={ch} style={S.chapterBlock}>
              <div style={S.chapterHead}>
                <span style={S.chapterNum}>{chapterHeading(passages[0].ref)}</span>
              </div>

              {passages.map((p) => {
                const passageMatches = !filtersActive || p.echoes.some(matchEcho);
                return (
                  <div
                    key={p.id}
                    className="catena-passage"
                    style={{
                      ...S.passage,
                      opacity: passageMatches ? 1 : 0.32,
                      transition: "opacity 0.3s",
                    }}
                  >
                    <div style={S.refLine}>
                      <span style={S.refText}>{p.ref}</span>
                      <span style={S.refSpacer} />
                      {p.echoes.length > 0 && (
                        <span style={S.refCount}>
                          {p.echoes.length}{" "}
                          {p.echoes.length === 1 ? "echo" : "echoes"}
                        </span>
                      )}
                    </div>

                    <p style={S.scriptureText}>{p.text}</p>

                    {p.echoes.length > 0 && (
                      <div style={S.gutter}>
                        {p.echoes.map((e, i) => {
                          const key = `${p.id}:${i}`;
                          const open = expanded.has(key);
                          const meta = TYPE_META[e.type];
                          const ink = CONFIDENCE_INK[e.confidence];
                          const dim = filtersActive && !matchEcho(e);
                          return (
                            <div key={key} style={S.chipWrap}>
                              <button
                                className="catena-chip"
                                onClick={() => toggleExpand(key)}
                                title={`${meta.label} · ${CONFIDENCE_LABEL[e.confidence]}`}
                                style={{
                                  ...S.chip,
                                  border: `1.5px ${meta.borderStyle} ${ink}`,
                                  color: ink,
                                  opacity: dim ? 0.3 : 1,
                                  background: open
                                    ? "rgba(140,59,47,0.10)"
                                    : "transparent",
                                }}
                              >
                                {meta.glyph && (
                                  <span style={{ marginRight: 5 }}>{meta.glyph}</span>
                                )}
                                {e.source}
                                {e.contested && <span style={S.contested}> ?</span>}
                              </button>
                              {open && (
                                <div style={{ ...S.sourcePanel, borderLeftColor: ink }}>
                                  <div style={S.sourceHead}>
                                    <span style={{ ...S.sourceRef, color: ink }}>
                                      {e.source}
                                      {e.altSource && (
                                        <span style={S.altSource}>
                                          {" "}· also {e.altSource}
                                        </span>
                                      )}
                                    </span>
                                    <span style={S.sourceKind}>
                                      {meta.glyph ? meta.glyph + " " : ""}
                                      {meta.label} · {CONFIDENCE_LABEL[e.confidence]}
                                    </span>
                                  </div>
                                  <p style={S.sourceText}>{e.text}</p>
                                  {e.note && <p style={S.sourceNote}>{e.note}</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {visiblePassages.length === 0 && (
            <div style={S.empty}>No passages to display.</div>
          )}
        </main>
      </div>

      <footer style={S.footer}>
        Scripture: {book.translation} · Intertextual annotations for study · Wroot Press
      </footer>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  root: {
    fontFamily: "'Crimson Pro', 'Georgia', serif",
    background: "#f5f0e8",
    minHeight: "100vh",
    color: "#2c2418",
  },
  header: {
    background: "#2c2418",
    padding: "44px 24px 36px",
    textAlign: "center",
    position: "relative",
  },
  homeLink: {
    position: "absolute",
    top: 20,
    left: 24,
    color: "#cf7b6e",
    textDecoration: "none",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 3,
    transition: "color 0.15s",
  },
  headerOrnament: {
    color: "#cf7b6e",
    fontSize: 13,
    letterSpacing: 10,
    marginBottom: 14,
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 52,
    fontWeight: 700,
    color: "#f5f0e8",
    margin: 0,
    letterSpacing: 14,
  },
  titleRule: { width: 80, height: 1, backgroundColor: "#cf7b6e", margin: "14px auto" },
  subtitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 19,
    color: "#cf7b6e",
    margin: 0,
    fontStyle: "italic",
    letterSpacing: 2,
  },
  credit: { fontSize: 11, color: "#7a6e60", margin: "10px 0 0", letterSpacing: 1.5 },
  layout: { display: "flex", maxWidth: 1100, margin: "0 auto" },
  sidebar: {
    width: 270,
    flexShrink: 0,
    padding: "20px 16px",
    borderRight: "1px solid #d4c9b5",
    background: "#eee9df",
    position: "sticky",
    top: 0,
    maxHeight: "100vh",
    overflowY: "auto",
  },
  legendToggle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 15,
    fontWeight: 600,
    color: "#4a3d30",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 0",
    letterSpacing: 1,
    textTransform: "uppercase",
    width: "100%",
    textAlign: "left",
    marginBottom: 10,
  },
  typeList: { display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 },
  typeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "'Crimson Pro', serif",
    fontSize: 13.5,
    transition: "all 0.15s ease",
    textAlign: "left",
  },
  chipPreviewWrap: { width: 30, flexShrink: 0, display: "flex", justifyContent: "center" },
  chipPreview: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 10,
    fontWeight: 600,
    color: ACCENT,
    borderRadius: 3,
    padding: "1px 4px",
    lineHeight: 1.3,
    minWidth: 16,
    textAlign: "center",
  },
  typeCount: { fontSize: 11, fontWeight: 600, opacity: 0.6, color: ACCENT },
  sourceSection: { borderTop: "1px solid #d4c9b5", paddingTop: 12, marginTop: 8 },
  sectionLabel: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 13,
    fontWeight: 600,
    color: "#4a3d30",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sourceList: { display: "flex", flexDirection: "column", gap: 1 },
  sourceBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 8px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "'Crimson Pro', serif",
    fontSize: 13,
    transition: "all 0.15s ease",
    textAlign: "left",
  },
  clearBtn: {
    marginTop: 10,
    padding: "5px 12px",
    border: "none",
    borderRadius: 4,
    background: "rgba(140,59,47,0.08)",
    cursor: "pointer",
    fontFamily: "'Crimson Pro', serif",
    fontSize: 12,
    color: "#8a5a4e",
    width: "100%",
    textAlign: "center",
  },
  chapterNav: { borderTop: "1px solid #d4c9b5", paddingTop: 14, marginTop: 14 },
  chapterGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 },
  chBtn: {
    padding: "4px 0",
    border: "1px solid #c9b99a",
    borderRadius: 3,
    cursor: "pointer",
    fontFamily: "'Crimson Pro', serif",
    fontSize: 12,
    fontWeight: 500,
    textAlign: "center",
    transition: "all 0.15s",
  },
  howTo: {
    marginTop: 16,
    padding: 12,
    background: "rgba(140,59,47,0.07)",
    borderRadius: 6,
    fontSize: 12,
    lineHeight: 1.6,
    color: "#6b5d4e",
    borderLeft: `3px solid ${ACCENT}`,
  },
  main: { flex: 1, padding: "32px 40px", minWidth: 0 },
  chapterBlock: { marginBottom: 40 },
  chapterHead: { marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid #d4c9b5" },
  chapterNum: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    fontWeight: 600,
    color: "#4a3d30",
    letterSpacing: 2,
  },
  passage: { marginBottom: 22, padding: "8px 12px", borderRadius: 6 },
  refLine: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  refText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 13,
    fontWeight: 600,
    color: "#8a7a6a",
    letterSpacing: 1,
    flexShrink: 0,
  },
  refSpacer: { flex: 1 },
  refCount: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#b09a86",
    flexShrink: 0,
  },
  scriptureText: {
    fontSize: 17,
    lineHeight: 1.85,
    color: "#2c2418",
    margin: 0,
    fontFamily: "'Crimson Pro', serif",
    fontWeight: 300,
  },
  gutter: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 },
  chipWrap: { display: "block", width: "100%" },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 13,
    cursor: "pointer",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.4,
    transition: "all 0.15s",
    marginRight: 7,
  },
  contested: { fontWeight: 700 },
  sourcePanel: {
    marginTop: 8,
    marginBottom: 4,
    padding: "12px 16px",
    background: "rgba(122,110,90,0.06)",
    borderLeft: "3px solid",
    borderRadius: "0 4px 4px 0",
  },
  sourceHead: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 8,
  },
  sourceRef: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  altSource: { fontSize: 12, fontWeight: 400, fontStyle: "italic", color: "#8a7a6a" },
  sourceKind: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#8a7a6a",
  },
  sourceText: {
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 15.5,
    lineHeight: 1.7,
    color: "#3a3024",
    fontStyle: "italic",
    fontWeight: 300,
    margin: 0,
  },
  sourceNote: {
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 13.5,
    lineHeight: 1.6,
    color: "#6b5d4e",
    margin: "10px 0 0",
    fontWeight: 400,
  },
  empty: {
    textAlign: "center",
    padding: "80px 24px",
    color: "#a09080",
    fontStyle: "italic",
    fontSize: 16,
  },
  footer: {
    textAlign: "center",
    padding: "20px",
    borderTop: "1px solid #d4c9b5",
    fontSize: 11,
    color: "#a09080",
    letterSpacing: 0.5,
    background: "#eee9df",
  },
};
