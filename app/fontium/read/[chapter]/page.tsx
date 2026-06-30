import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allChapterSlugs, getTrajectory, type TOcc } from "@/lib/trajectory";
import { TYPE_META, CONFIDENCE_INK, CONFIDENCE_LABEL, ACCENT } from "@/lib/echoes";
import type { EchoType, Confidence } from "@/lib/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500&display=swap";

export const dynamicParams = false;

export function generateStaticParams() {
  return allChapterSlugs().map((chapter) => ({ chapter }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const t = getTrajectory(chapter);
  if (!t) return { title: "Chapter · Catena" };
  return {
    title: `${t.ref}, read forward · Catena`,
    description: `${t.ref} and its New Testament afterlife — ${t.total} places across ${t.books} books that quote, allude to, or echo it.`,
  };
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const t = getTrajectory(chapter);
  if (!t) notFound();

  return (
    <div style={S.root}>
      <link rel="stylesheet" href={FONT_URL} />
      <style>{`
        .traj-home:hover { color: #f5f0e8 !important; }
        .traj-chip:hover { background: rgba(140,59,47,0.12); }
        .traj-vnum:hover { color: ${ACCENT} !important; }
        .traj-nav:hover { color: ${ACCENT} !important; }
        @media (max-width: 680px) { .traj-verse { grid-template-columns: 28px 1fr !important; } .traj-gutter { grid-column: 2 !important; } }
      `}</style>

      <header style={S.header}>
        <Link href="/fontium" className="traj-home" style={S.homeLink}>← INDEX FONTIUM</Link>
        <div style={S.ornament}>⛓</div>
        <p style={S.kicker}>Reading forward</p>
        <h1 style={S.title}>{t.ref}</h1>
        <div style={S.rule} />
        <p style={S.subtitle}>and its New Testament afterlife</p>
        <p style={S.credit}>
          {t.total} {t.total === 1 ? "place" : "places"} · {t.books}{" "}
          {t.books === 1 ? "book" : "books"}
        </p>
      </header>

      <main style={S.main}>
        <p style={S.lede}>
          The chapter as it stands, read forward into the canon it would help write.
          Beside each verse, the New Testament places that quote, allude to, or echo
          it — follow any to read it in its own argument. The verse number opens its
          full reception dossier.
        </p>

        {t.whole.length > 0 && (
          <section style={S.wholeBand}>
            <div style={S.wholeLabel}>The chapter as a whole</div>
            <div style={S.gutterChips}>
              {t.whole.map((o, i) => (
                <Chip key={`${o.ntSlug}-${o.id}-${i}`} o={o} />
              ))}
            </div>
          </section>
        )}

        <div style={S.verses}>
          {t.verses.map((v) => (
            <div key={v.v} className="traj-verse" style={S.verse}>
              {v.dossier ? (
                <Link href={`/fontium/${v.dossier}`} className="traj-vnum" style={{ ...S.vnum, ...S.vnumLink }} title="Reception dossier">
                  {v.v}
                </Link>
              ) : (
                <span style={S.vnum}>{v.v}</span>
              )}
              <p style={S.vtext}>{v.text}</p>
              {v.echoes.length > 0 && (
                <div className="traj-gutter" style={S.gutter}>
                  <div style={S.gutterChips}>
                    {v.echoes.map((o, i) => (
                      <Chip key={`${o.ntSlug}-${o.id}-${i}`} o={o} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <nav style={S.nav}>
          {t.prev ? (
            <Link href={`/fontium/read/${t.prev.slug}`} className="traj-nav" style={S.navLink}>
              ← {t.prev.ref}
            </Link>
          ) : (
            <span />
          )}
          {t.next ? (
            <Link href={`/fontium/read/${t.next.slug}`} className="traj-nav" style={{ ...S.navLink, textAlign: "right" }}>
              {t.next.ref} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>

      <footer style={S.footer}>Index Fontium · the centrifugal reader · Wroot Press</footer>
    </div>
  );
}

function Chip({ o }: { o: TOcc }) {
  const meta = TYPE_META[o.type as EchoType];
  const ink = CONFIDENCE_INK[o.confidence as Confidence];
  const title = `${meta?.label ?? o.type} · ${CONFIDENCE_LABEL[o.confidence as Confidence]}${
    o.sourceRef ? ` · on ${o.sourceRef}` : ""
  }${o.note ? `\n${o.note}` : ""}`;
  return (
    <Link
      href={`/${o.ntSlug}#p-${o.id}`}
      className="traj-chip"
      title={title}
      style={{ ...S.chip, color: ink, border: `1px ${meta?.borderStyle ?? "solid"} ${ink}` }}
    >
      {meta?.glyph ? meta.glyph + " " : ""}
      {o.abbr} {o.pref}
      {o.contested ? " ?" : ""}
    </Link>
  );
}

const S: Record<string, CSSProperties> = {
  root: { fontFamily: "'Crimson Pro', Georgia, serif", background: "#f5f0e8", minHeight: "100vh", color: "#2c2418" },
  header: { background: "#2c2418", padding: "40px 24px 30px", textAlign: "center", position: "relative" },
  homeLink: { position: "absolute", top: 20, left: 24, color: "#cf7b6e", textDecoration: "none", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, letterSpacing: 3, transition: "color 0.15s" },
  ornament: { color: "#cf7b6e", fontSize: 15, letterSpacing: 10, marginBottom: 10 },
  kicker: { fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#9a8c7e", letterSpacing: 4, textTransform: "uppercase", margin: "0 0 6px" },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 700, color: "#f5f0e8", margin: 0, letterSpacing: 2 },
  rule: { width: 80, height: 1, backgroundColor: "#cf7b6e", margin: "14px auto" },
  subtitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#cf7b6e", margin: 0, fontStyle: "italic", letterSpacing: 1 },
  credit: { fontSize: 11.5, color: "#9a8c7e", margin: "12px 0 0", letterSpacing: 1 },
  main: { maxWidth: 820, margin: "0 auto", padding: "34px 24px 70px" },
  lede: { fontSize: 15.5, lineHeight: 1.7, color: "#4a3d30", marginBottom: 28 },
  wholeBand: { background: "#efe8da", borderLeft: `3px solid ${ACCENT}`, borderRadius: 4, padding: "14px 18px", marginBottom: 26 },
  wholeLabel: { fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a7a6a", marginBottom: 10 },
  verses: { display: "flex", flexDirection: "column", gap: 4 },
  verse: { display: "grid", gridTemplateColumns: "34px minmax(0, 1fr) 230px", columnGap: 14, padding: "8px 0", borderBottom: "1px solid #ece4d4", alignItems: "baseline" },
  vnum: { fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontWeight: 600, color: "#a89a86", textAlign: "right", paddingTop: 2 },
  vnumLink: { textDecoration: "none", transition: "color 0.15s" },
  vtext: { fontSize: 16.5, lineHeight: 1.65, color: "#2c2418", margin: 0 },
  gutter: { display: "flex" },
  gutterChips: { display: "flex", flexWrap: "wrap", gap: 6, alignContent: "flex-start" },
  chip: { display: "inline-block", padding: "1px 8px", borderRadius: 11, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 12, fontWeight: 600, letterSpacing: 0.2, textDecoration: "none", whiteSpace: "nowrap", transition: "background 0.15s" },
  nav: { display: "flex", justifyContent: "space-between", gap: 16, marginTop: 38, paddingTop: 20, borderTop: "1px solid #d4c9b5" },
  navLink: { color: "#5c4033", textDecoration: "none", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 16, fontWeight: 600, letterSpacing: 0.5, transition: "color 0.15s", flex: 1 },
  footer: { textAlign: "center", padding: 20, borderTop: "1px solid #d4c9b5", fontSize: 11, color: "#a09080", letterSpacing: 0.5, background: "#eee9df" },
};
