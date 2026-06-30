import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { buildSpine, MIN_RIBBON, type LeaderRow } from "@/lib/spine";
import { ACCENT } from "@/lib/echoes";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500&display=swap";

export const metadata: Metadata = {
  title: "The Spine · Index Fontium · Catena",
  description:
    "The whole canon's intertextual flow drawn at once — every Old Testament source book and the New Testament books that reach for it, with the load-bearing texts ranked by significance.",
};

const TYPE_COLOR: Record<string, string> = {
  quotation: "#8c3b2f",
  allusion: "#a8675c",
  echo: "#c2998f",
  figural: "#6f4d38",
};
const TYPE_ORDER = ["quotation", "allusion", "echo", "figural"] as const;

export default function SpinePage() {
  const s = buildSpine();
  const half = s.size / 2;

  return (
    <div style={S.root}>
      <link rel="stylesheet" href={FONT_URL} />
      <style>{`
        .ribbon { transition: stroke-opacity 0.15s; }
        .chord:hover .ribbon { stroke-opacity: 0.07; }
        .chord .ribbon:hover { stroke-opacity: 0.9 !important; }
        .spine-home:hover { color: #f5f0e8 !important; }
        .lead-row:hover { background: rgba(140,59,47,0.06); }
      `}</style>

      <header style={S.header}>
        <Link href="/fontium" className="spine-home" style={S.homeLink}>← INDEX FONTIUM</Link>
        <div style={S.ornament}>⛓ ⛓ ⛓</div>
        <h1 style={S.title}>THE SPINE</h1>
        <div style={S.rule} />
        <p style={S.subtitle}>What the New Testament is made of</p>
        <p style={S.credit}>
          {s.otShown} sources · {s.ntShown} New Testament books · {s.totalFlow.toLocaleString()} weighted links
        </p>
      </header>

      <main style={S.main}>
        <p style={S.lede}>
          Every Old Testament source book around the upper arc, every New Testament
          book around the lower — each ribbon a current of quotation, allusion, and
          echo running between them, weighted by confidence. The diagram draws the
          spine no one wrote down: Isaiah, the Psalms, and Daniel swelling into bands
          that feed the whole New Testament. Hover a ribbon to follow it.
        </p>

        <figure style={S.figure}>
          <svg
            viewBox={`${-half} ${-half} ${s.size} ${s.size}`}
            style={S.svg}
            role="img"
            aria-label="Chord diagram of Old Testament sources flowing into the New Testament"
          >
            <g className="chord">
              <g>
                {s.ribbons.map((r, i) => (
                  <path
                    key={i}
                    className="ribbon"
                    d={r.d}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={r.width}
                    strokeOpacity={0.32}
                    strokeLinecap="round"
                  >
                    <title>{`${r.ot} → ${r.nt} · ${r.value}`}</title>
                  </path>
                ))}
              </g>
              {s.arcs.map((a) => (
                <path key={a.name} d={a.d} fill={a.color}>
                  <title>{`${a.name} · ${a.value}`}</title>
                </path>
              ))}
              {s.arcs.map((a) => (
                <text
                  key={a.name}
                  x={a.lx}
                  y={a.ly}
                  transform={`rotate(${a.rot} ${a.lx} ${a.ly})`}
                  textAnchor={a.anchor}
                  dominantBaseline="middle"
                  style={{ ...S.arcLabel, fill: a.group === "ot" ? "#4a3527" : "#5c5142" }}
                >
                  {a.name}
                </text>
              ))}
            </g>
          </svg>
          <figcaption style={S.figcap}>
            Arc width is a book&rsquo;s total weighted involvement; ribbons show links
            of weight {MIN_RIBBON} or more. Fainter links live in the index and the
            leaderboard below.
          </figcaption>
        </figure>

        <section style={S.board}>
          <h2 style={S.boardHead}>The load-bearing texts</h2>
          <p style={S.boardLede}>
            The twenty-five sources the New Testament leans on hardest, by significance —
            confidence weighted by how many books reach for each. The colored bar reads
            the mix of <span style={{ color: TYPE_COLOR.quotation }}>quotation</span>,{" "}
            <span style={{ color: TYPE_COLOR.allusion }}>allusion</span>,{" "}
            <span style={{ color: TYPE_COLOR.echo }}>echo</span>, and{" "}
            <span style={{ color: TYPE_COLOR.figural }}>figural</span> reuse. Follow any
            to its reception dossier.
          </p>
          <ol style={S.list}>
            {s.leaders.map((row, i) => (
              <LeaderRowView key={row.slug} row={row} rank={i + 1} max={s.leaders[0].score} />
            ))}
          </ol>
        </section>
      </main>

      <footer style={S.footer}>Index Fontium · a derived view · Wroot Press</footer>
    </div>
  );
}

function LeaderRowView({ row, rank, max }: { row: LeaderRow; rank: number; max: number }) {
  const total = TYPE_ORDER.reduce((n, t) => n + row.types[t], 0) || 1;
  return (
    <li style={S.row}>
      <Link href={`/fontium/${row.slug}`} className="lead-row" style={S.rowLink}>
        <span style={S.rank}>{rank}</span>
        <span style={S.ref}>{row.ref}</span>
        <span style={S.meta}>
          {row.count} places · {row.books} books
        </span>
        <span style={S.barWrap}>
          <span style={{ ...S.bar, width: `${(row.score / max) * 100}%` }}>
            {TYPE_ORDER.map((t) =>
              row.types[t] ? (
                <span
                  key={t}
                  style={{ width: `${(row.types[t] / total) * 100}%`, background: TYPE_COLOR[t], height: "100%", display: "block" }}
                />
              ) : null
            )}
          </span>
        </span>
        <span style={S.score}>{row.score}</span>
      </Link>
    </li>
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
  main: { maxWidth: 880, margin: "0 auto", padding: "36px 24px 80px" },
  lede: { fontSize: 16, lineHeight: 1.7, color: "#4a3d30", marginBottom: 26 },
  figure: { margin: "0 0 48px", textAlign: "center" },
  svg: { width: "100%", height: "auto", maxWidth: 720, display: "block", margin: "0 auto" },
  arcLabel: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 12, fontWeight: 600, letterSpacing: 0.3 },
  figcap: { fontSize: 12.5, lineHeight: 1.55, color: "#8a7a6a", fontStyle: "italic", maxWidth: 560, margin: "14px auto 0" },
  board: { marginTop: 8 },
  boardHead: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#2c2418", letterSpacing: 1, margin: "0 0 8px" },
  boardLede: { fontSize: 15, lineHeight: 1.65, color: "#4a3d30", margin: "0 0 20px" },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" },
  row: { borderBottom: "1px solid #e2dac9" },
  rowLink: { display: "grid", gridTemplateColumns: "26px 150px 1fr 90px 40px", alignItems: "center", gap: 12, padding: "9px 8px", textDecoration: "none", color: "inherit", borderRadius: 4 },
  rank: { fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#a89a86", textAlign: "right" },
  ref: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 16, fontWeight: 600, color: "#5c4033" },
  meta: { fontSize: 12.5, color: "#8a7a6a", letterSpacing: 0.2 },
  barWrap: { display: "flex", alignItems: "center" },
  bar: { display: "flex", height: 9, borderRadius: 5, overflow: "hidden", minWidth: 2 },
  score: { fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: 600, color: ACCENT, textAlign: "right" },
  footer: { textAlign: "center", padding: 20, borderTop: "1px solid #d4c9b5", fontSize: 11, color: "#a09080", letterSpacing: 0.5, background: "#eee9df" },
};
