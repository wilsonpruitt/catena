import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allDossierSlugs, getDossier, type DossOcc } from "@/lib/sources";
import { TYPE_META, CONFIDENCE_INK, CONFIDENCE_LABEL, ORDER, ACCENT } from "@/lib/echoes";
import type { EchoType, Confidence } from "@/lib/types";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500&display=swap";

export const dynamicParams = false;

export function generateStaticParams() {
  return allDossierSlugs().map((source) => ({ source }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string }>;
}): Promise<Metadata> {
  const { source } = await params;
  const d = getDossier(source);
  if (!d) return { title: "Source · Catena" };
  return {
    title: `${d.ref} in the New Testament · Catena`,
    description: `Every place the New Testament quotes, alludes to, or echoes ${d.ref} — ${d.count} across the Catena editions.`,
  };
}

export default async function SourcePage({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source } = await params;
  const d = getDossier(source);
  if (!d) notFound();

  const groups = ORDER.map((t) => ({
    type: t,
    meta: TYPE_META[t],
    occ: d.occ.filter((o) => o.type === t),
  })).filter((g) => g.occ.length > 0);

  return (
    <div style={S.root}>
      <link rel="stylesheet" href={FONT_URL} />

      <header style={S.header}>
        <Link href="/fontium" style={S.homeLink}>← INDEX FONTIUM</Link>
        <div style={S.ornament}>⛓</div>
        <h1 style={S.title}>{d.ref}</h1>
        <div style={S.rule} />
        <p style={S.subtitle}>The New Testament&rsquo;s use of {d.book}</p>
        <p style={S.credit}>
          {d.count} {d.count === 1 ? "place" : "places"} · {groups.length}{" "}
          {groups.length === 1 ? "kind of echo" : "kinds of echo"}
          {d.refs.length > 1 ? ` · indexing ${d.refs.join(", ")}` : ""}
        </p>
      </header>

      <main style={S.main}>
        <section style={S.sourcePanel}>
          <div style={S.panelLabel}>The source</div>
          <p style={S.sourceText}>{d.text}</p>
          {d.lxxText && (
            <div style={S.lxxBlock}>
              <div style={S.lxxLabel}>The Greek the author follows</div>
              <p style={S.lxxText}>{d.lxxText}</p>
            </div>
          )}
        </section>

        <p style={S.lede}>
          Where this passage surfaces again, sorted by the strength of the link.
          Each kind of reuse — formal quotation, deliberate allusion, faint echo,
          figural pattern — carries its own mark. Follow any reference to read it
          in place.
        </p>

        {groups.map((g) => (
          <section key={g.type} style={S.group}>
            <h2 style={S.groupHead}>
              {g.meta.glyph ? g.meta.glyph + " " : ""}
              {g.meta.label}
              <span style={S.groupCount}>{g.occ.length}</span>
            </h2>
            <p style={S.groupDesc}>{g.meta.desc}</p>
            <div style={S.occList}>
              {g.occ.map((o, i) => (
                <Occurrence key={`${o.slug}-${o.id}-${i}`} o={o} type={g.type} />
              ))}
            </div>
          </section>
        ))}

        {d.siblings.length > 0 && (
          <section style={S.siblings}>
            <div style={S.panelLabel}>
              Elsewhere in {d.book} {d.chapter || ""}
            </div>
            <div style={S.sibWrap}>
              {d.siblings.map((s) => (
                <Link key={s.slug} href={`/fontium/${s.slug}`} style={S.sibLink}>
                  {s.ref} <span style={S.sibCount}>{s.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer style={S.footer}>Index Fontium · a derived view · Wroot Press</footer>
    </div>
  );
}

function Occurrence({ o, type }: { o: DossOcc; type: EchoType }) {
  const meta = TYPE_META[type];
  const ink = CONFIDENCE_INK[o.confidence as Confidence];
  return (
    <div style={S.occRow}>
      <Link
        href={`/${o.slug}#p-${o.id}`}
        style={{ ...S.chip, color: ink, border: `1px ${meta.borderStyle} ${ink}` }}
      >
        {meta.glyph ? meta.glyph + " " : ""}
        {o.abbr} {o.pref}
        {o.contested ? " ?" : ""}
      </Link>
      <div style={S.occBody}>
        {o.note && <p style={S.note}>{o.note}</p>}
        <span style={{ ...S.confTag, color: ink }}>
          {CONFIDENCE_LABEL[o.confidence as Confidence]}
        </span>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  root: { fontFamily: "'Crimson Pro', Georgia, serif", background: "#f5f0e8", minHeight: "100vh", color: "#2c2418" },
  header: { background: "#2c2418", padding: "44px 24px 32px", textAlign: "center", position: "relative" },
  homeLink: { position: "absolute", top: 20, left: 24, color: "#cf7b6e", textDecoration: "none", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, letterSpacing: 3 },
  ornament: { color: "#cf7b6e", fontSize: 15, letterSpacing: 10, marginBottom: 14 },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 700, color: "#f5f0e8", margin: 0, letterSpacing: 2 },
  rule: { width: 80, height: 1, backgroundColor: "#cf7b6e", margin: "14px auto" },
  subtitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#cf7b6e", margin: 0, fontStyle: "italic", letterSpacing: 1 },
  credit: { fontSize: 11.5, color: "#9a8c7e", margin: "12px 0 0", letterSpacing: 1 },
  main: { maxWidth: 760, margin: "0 auto", padding: "36px 24px 80px" },
  sourcePanel: { background: "#efe8da", borderLeft: `3px solid ${ACCENT}`, borderRadius: 4, padding: "18px 22px", marginBottom: 28 },
  panelLabel: { fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a7a6a", marginBottom: 8 },
  sourceText: { fontSize: 17, lineHeight: 1.7, color: "#3a2f24", margin: 0, fontStyle: "italic" },
  lxxBlock: { marginTop: 14, paddingTop: 12, borderTop: "1px dashed #c9b99a" },
  lxxLabel: { fontFamily: "'Cormorant Garamond', serif", fontSize: 11.5, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#a8675c", marginBottom: 6 },
  lxxText: { fontSize: 16, lineHeight: 1.65, color: "#4a3d30", margin: 0, fontStyle: "italic" },
  lede: { fontSize: 15.5, lineHeight: 1.7, color: "#4a3d30", marginBottom: 30 },
  group: { marginBottom: 30 },
  groupHead: { fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 600, color: "#2c2418", letterSpacing: 1, margin: "0 0 4px", display: "flex", alignItems: "baseline", gap: 10 },
  groupCount: { fontSize: 14, fontWeight: 600, color: ACCENT },
  groupDesc: { fontSize: 13.5, lineHeight: 1.55, color: "#7a6c5d", fontStyle: "italic", margin: "0 0 14px" },
  occList: { display: "flex", flexDirection: "column", gap: 14 },
  occRow: { display: "flex", gap: 14, alignItems: "baseline", flexWrap: "wrap" },
  chip: { display: "inline-block", padding: "2px 10px", borderRadius: 11, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.3, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 },
  occBody: { flex: 1, minWidth: 220 },
  note: { fontSize: 15, lineHeight: 1.65, color: "#3a2f24", margin: "0 0 4px" },
  confTag: { fontFamily: "'Cormorant Garamond', serif", fontSize: 11.5, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
  siblings: { marginTop: 40, paddingTop: 22, borderTop: "1px solid #d4c9b5" },
  sibWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  sibLink: { display: "inline-block", padding: "3px 11px", borderRadius: 12, border: "1px solid #c9b99a", background: "#efe8da", color: "#5c4033", textDecoration: "none", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.3 },
  sibCount: { color: ACCENT, fontSize: 11.5 },
  footer: { textAlign: "center", padding: 20, borderTop: "1px solid #d4c9b5", fontSize: 11, color: "#a09080", letterSpacing: 0.5, background: "#eee9df" },
};
