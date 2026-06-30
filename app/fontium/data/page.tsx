import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ACCENT } from "@/lib/echoes";
import manifest from "@/public/data/manifest.json";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500&display=swap";

export const metadata: Metadata = {
  title: "Open Data · Index Fontium · Catena",
  description:
    "Catena's New-Testament-use-of-the-Old echo graph as an open dataset — typed, confidence-scored, OSIS-keyed, CC BY-SA 4.0.",
};

function kb(bytes: number) {
  return bytes >= 1_000_000 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function DataPage() {
  return (
    <div style={S.root}>
      <link rel="stylesheet" href={FONT_URL} />
      <style>{`
        .data-home:hover { color: #f5f0e8 !important; }
        .data-file:hover { background: rgba(140,59,47,0.05); border-color: ${ACCENT} !important; }
      `}</style>

      <header style={S.header}>
        <Link href="/fontium" className="data-home" style={S.homeLink}>← INDEX FONTIUM</Link>
        <div style={S.ornament}>⛓ ⛓ ⛓</div>
        <h1 style={S.title}>OPEN DATA</h1>
        <div style={S.rule} />
        <p style={S.subtitle}>The graph, free to build on</p>
        <p style={S.credit}>
          {manifest.files[0].count?.toLocaleString()} echoes · OSIS-keyed · {manifest.license}
        </p>
      </header>

      <main style={S.main}>
        <p style={S.lede}>
          Everything behind these editions is one dataset: a typed, confidence-scored
          graph of where the New Testament quotes, alludes to, and echoes the Old.
          It&rsquo;s released openly so it can be joined, queried, and built on — by a
          lectionary tool, a study Bible, a research project, or you. Generated from the
          editions on {manifest.generated} (commit <code style={S.code}>{manifest.sourceCommit}</code>).
        </p>

        <section style={S.files}>
          {manifest.files.map((f) => (
            <a key={f.name} href={`/data/${f.name}`} className="data-file" style={S.file} download>
              <div style={S.fileTop}>
                <span style={S.fileName}>{f.name}</span>
                <span style={S.fileMeta}>
                  {f.count != null ? `${f.count.toLocaleString()} · ` : ""}
                  {kb(f.bytes)}
                </span>
              </div>
              <p style={S.fileDesc}>{f.desc}</p>
            </a>
          ))}
        </section>

        <section style={S.note}>
          <h2 style={S.h2}>Two keys on every reference</h2>
          <p style={S.p}>
            Each record carries an OSIS <code style={S.code}>refKey</code> for machine
            joins and a human <code style={S.code}>refDisplay</code> for reading. Ranges
            are fully qualified at both ends, so an interval query resolves cleanly:
          </p>
          <pre style={S.pre}>
{`"source": { "refKey": "Isa.53.1-Isa.53.12",
             "refDisplay": "Isaiah 53:1–12" }

// "what does the New Testament make of Isaiah 53?"
fontium.sources.filter(s =>
  s.refKey?.startsWith("Isa.53"))`}
          </pre>
          <p style={S.p}>
            Versification is KJV/WEB. The {manifest.extendedEchoes} echoes pointing at
            pseudepigrapha (1 Enoch, Jubilees, 2 Baruch&hellip;) sit outside the OSIS core
            and are flagged <code style={S.code}>extended</code>. Full field reference in{" "}
            <a href="/data/README.md" style={S.inlink}>README.md</a>.
          </p>
          <p style={S.pSmall}>
            Licensed <strong>{manifest.license}</strong> — free to share and adapt, including
            commercially, with attribution to {manifest.attribution} and the same license on
            anything you build from it.
          </p>
        </section>
      </main>

      <footer style={S.footer}>Index Fontium · a derived view · Wroot Press</footer>
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
  main: { maxWidth: 760, margin: "0 auto", padding: "36px 24px 80px" },
  lede: { fontSize: 16, lineHeight: 1.7, color: "#4a3d30", marginBottom: 28 },
  code: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: "0.86em", background: "#e8e0d2", padding: "1px 5px", borderRadius: 4, color: "#5c4033" },
  files: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 },
  file: { display: "block", textDecoration: "none", color: "inherit", border: "1px solid #d8ccb6", borderRadius: 6, padding: "14px 18px", background: "#faf6ee", transition: "all 0.15s" },
  fileTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  fileName: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: 15, fontWeight: 600, color: ACCENT },
  fileMeta: { fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#8a7a6a", whiteSpace: "nowrap" },
  fileDesc: { fontSize: 14.5, lineHeight: 1.55, color: "#4a3d30", margin: "6px 0 0" },
  note: { borderTop: "1px solid #d4c9b5", paddingTop: 26 },
  h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, color: "#2c2418", letterSpacing: 0.5, margin: "0 0 12px" },
  p: { fontSize: 15.5, lineHeight: 1.7, color: "#4a3d30", margin: "0 0 14px" },
  pSmall: { fontSize: 13.5, lineHeight: 1.6, color: "#6b5d4e", margin: "18px 0 0" },
  pre: { background: "#2c2418", color: "#e8ddca", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5, lineHeight: 1.6, padding: "16px 18px", borderRadius: 6, overflowX: "auto", margin: "0 0 16px" },
  inlink: { color: ACCENT, textDecoration: "underline" },
  footer: { textAlign: "center", padding: 20, borderTop: "1px solid #d4c9b5", fontSize: 11, color: "#a09080", letterSpacing: 0.5, background: "#eee9df" },
};
