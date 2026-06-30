import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { getNetwork, type Pair, type Cluster } from "@/lib/network";
import { sourceSlug } from "@/lib/slug";
import { ACCENT } from "@/lib/echoes";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500&display=swap";

export const metadata: Metadata = {
  title: "Woven Together · Index Fontium · Catena",
  description:
    "Which Scriptures the New Testament cites in one breath — the recurring combined citations (testimonia) and the constellations they form, surfaced from the whole corpus.",
};

// Editorial names for well-attested combinations — labels for what's plainly
// visible in the texts, matched by the references present (not generated).
const PAIR_NAMES: { need: [string, string]; label: string }[] = [
  { need: ["Dan.12.2", "Isa.26.19"], label: "The resurrection of the dead" },
  { need: ["Isa.40.3", "Mal.3.1"], label: "The voice in the wilderness" },
  { need: ["Gen.22.2", "Ps.2.7"], label: "This is my beloved Son" },
  { need: ["Isa.42.1", "Ps.2.7"], label: "My Son, my chosen servant" },
  { need: ["Gen.22.2", "Isa.42.1"], label: "The beloved, the offered" },
  { need: ["Deut.6.5", "Lev.19.18"], label: "Love God and neighbor" },
  { need: ["Isa.53.12", "Isa.53.6"], label: "The suffering servant" },
  { need: ["Isa.29.18", "Isa.35.5"], label: "The eyes of the blind" },
  { need: ["Prov.19.17", "Tob.4.7-Tob.4.11"], label: "Lending to the Lord (almsgiving)" },
  { need: ["Deut.17.6", "Deut.19.15"], label: "Two or three witnesses" },
  { need: ["Hos.6.2", "Jonah.1.17"], label: "On the third day" },
];
const CLUSTER_NAMES: { need: [string, string]; label: string }[] = [
  { need: ["Ps.110.1", "Dan.7.13-Dan.7.14"], label: "The enthronement" },
  { need: ["Neh.9.6", "Ps.146.6"], label: "The Maker of heaven and earth" },
  { need: ["Deut.17.6", "Deut.19.15"], label: "Two or three witnesses" },
  { need: ["Deut.32.20", "Deut.32.5"], label: "The crooked generation" },
  { need: ["Exod.20.8-Exod.20.11", "Gen.2.2-Gen.2.3"], label: "The sabbath" },
  { need: ["Ps.107.23-Ps.107.30", "Ps.89.9"], label: "Who stills the sea" },
  { need: ["Gen.18.14", "Jer.32.17"], label: "Nothing too hard for God" },
  { need: ["Jer.7.11", "Mal.3.1-Mal.3.3"], label: "The Lord comes to his temple" },
  { need: ["Isa.51.17", "Ps.75.8"], label: "The cup of wrath" },
  { need: ["Dan.12.1", "Ps.69.28"], label: "The book of life" },
  { need: ["Isa.28.16", "Ps.118.22"], label: "The cornerstone" },
];
function pairLabel(p: Pair): string | null {
  const ks = new Set([p.a.refKey, p.b.refKey]);
  return PAIR_NAMES.find((n) => n.need.every((k) => ks.has(k)))?.label ?? null;
}
function clusterLabel(c: Cluster): string | null {
  const ks = new Set(c.members.map((m) => m.refKey));
  return CLUSTER_NAMES.find((n) => n.need.every((k) => ks.has(k)))?.label ?? null;
}

export default function ThreadsPage() {
  const n = getNetwork();
  const pct = Math.round((100 * n.combiningPassages) / n.totalPassages);
  const m = n.matrix;
  const cell = 22;
  const pad = 132;
  const dim = pad + m.labels.length * cell + 16;

  return (
    <div style={S.root}>
      <link rel="stylesheet" href={FONT_URL} />
      <style>{`
        .threads-home:hover { color: #f5f0e8 !important; }
        .thread-chip:hover { background: rgba(140,59,47,0.12); }
        .thread-link:hover { color: ${ACCENT} !important; }
        .hm-cell:hover { stroke: ${ACCENT}; stroke-width: 1.5; }
      `}</style>

      <header style={S.header}>
        <Link href="/fontium" className="threads-home" style={S.homeLink}>← INDEX FONTIUM</Link>
        <div style={S.ornament}>⛓ ⛓ ⛓</div>
        <h1 style={S.title}>WOVEN TOGETHER</h1>
        <div style={S.rule} />
        <p style={S.subtitle}>The Scriptures the New Testament cites in one breath</p>
        <p style={S.credit}>{n.combiningPassages} passages braid two or more sources · {pct}% of all that cite</p>
      </header>

      <main style={S.main}>
        <div style={S.essay}>
          <p style={S.lede}>
            Run the index the other way and a second pattern appears. The New Testament
            rarely reaches for a single Old Testament verse; it reaches for <em>handfuls</em>,
            braiding texts that were never adjacent into one argument. {pct}% of the passages
            that cite the older Scripture cite more than one source at once — and the same
            combinations keep recurring, across different authors, as if drawn from a shared
            stock. Scholars call those recurring weaves the <em>testimonia</em>: the church&rsquo;s
            working set of proof-texts, assembled before the Gospels were written.
          </p>
          <p style={S.p}>
            They surface here on their own, unprompted. Isaiah 40&rsquo;s voice in the wilderness
            fused to Malachi&rsquo;s messenger; the enthronement braid of Psalm 110, Daniel 7,
            Psalm 8, and Nathan&rsquo;s promise to David; the rejected stone of Psalm 118 set
            against Isaiah&rsquo;s cornerstone and Daniel&rsquo;s stone cut without hands. The two
            great resurrection texts — Daniel 12 and Isaiah 26 — travel together a dozen times.
            Love of God from Deuteronomy and love of neighbor from Leviticus arrive as one
            command. None of this was marked in the margins; it falls out of the data because
            it was already there.
          </p>
          <p style={S.p}>
            Below: the heatmap of which sources co-occur, the strongest pairs, and the
            constellations they form — three or more texts the New Testament treats as a set.
          </p>
        </div>

        <figure style={S.figure}>
          <figcaption style={S.figcap}>Co-citation among the twenty most-cited sources — darker means more often braided together.</figcaption>
          <svg viewBox={`0 0 ${dim} ${dim}`} style={S.svg} role="img" aria-label="Co-citation heatmap of the most-cited sources">
            {m.labels.map((lab, i) => (
              <text key={`t${i}`} x={pad + i * cell + cell / 2} y={pad - 6} transform={`rotate(-45 ${pad + i * cell + cell / 2} ${pad - 6})`} style={S.hmLabel} textAnchor="start">{lab}</text>
            ))}
            {m.labels.map((lab, i) => (
              <text key={`l${i}`} x={pad - 6} y={pad + i * cell + cell / 2} style={S.hmLabel} textAnchor="end" dominantBaseline="middle">{lab}</text>
            ))}
            {m.cells.map((row, i) =>
              row.map((v, j) => {
                if (i === j) return <rect key={`${i}-${j}`} x={pad + j * cell} y={pad + i * cell} width={cell - 1.5} height={cell - 1.5} fill="#e7ddca" />;
                const a = v === 0 ? 0.04 : 0.14 + 0.86 * (v / m.max);
                return (
                  <rect key={`${i}-${j}`} className="hm-cell" x={pad + j * cell} y={pad + i * cell} width={cell - 1.5} height={cell - 1.5} fill={`rgba(140,59,47,${a})`}>
                    {v > 0 && <title>{`${m.labels[i]} + ${m.labels[j]} · ${v}`}</title>}
                  </rect>
                );
              })
            )}
          </svg>
        </figure>

        <section style={S.sec}>
          <h2 style={S.h2}>The strongest pairs</h2>
          <ol style={S.list}>
            {n.pairs.slice(0, 16).map((p, i) => {
              const lab = pairLabel(p);
              const w = p.where[0];
              return (
                <li key={i} style={S.row}>
                  <span style={S.count}>{p.count}×</span>
                  <span style={S.pairRefs}>
                    <Link href={`/fontium/${sourceSlug(p.a.refDisplay)}`} className="thread-link" style={S.refLink}>{p.a.refDisplay}</Link>
                    <span style={S.plus}> + </span>
                    <Link href={`/fontium/${sourceSlug(p.b.refDisplay)}`} className="thread-link" style={S.refLink}>{p.b.refDisplay}</Link>
                    {lab && <span style={S.tag}>{lab}</span>}
                  </span>
                  {w && (
                    <Link href={`/${w.slug}#p-${w.id}`} className="thread-link" style={S.where}>{w.ref}</Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section style={S.sec}>
          <h2 style={S.h2}>The constellations</h2>
          <p style={S.note}>Three or more sources the New Testament braids as a set — connected components of the strongest pairs.</p>
          <div style={S.cards}>
            {n.clusters.map((c, i) => {
              const lab = clusterLabel(c);
              return (
                <div key={i} style={S.card}>
                  {lab && <div style={S.cardName}>{lab}</div>}
                  <div style={S.chips}>
                    {c.members.map((mb) => (
                      <Link key={mb.refKey} href={`/fontium/${sourceSlug(mb.refDisplay)}`} className="thread-chip" style={S.memberChip}>{mb.refDisplay}</Link>
                    ))}
                  </div>
                  <div style={S.cardPairs}>
                    {c.pairs.slice(0, 3).map((pr, k) => (
                      <span key={k} style={S.cardPair}>{pr.count}× {pr.a} + {pr.b}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={S.sec}>
          <h2 style={S.h2}>The densest passages</h2>
          <p style={S.note}>Where the most distinct sources converge in a single passage.</p>
          <ol style={S.list}>
            {n.hubs.map((h, i) => (
              <li key={i} style={S.hubRow}>
                <span style={S.count}>{h.sources}</span>
                <Link href={`/${h.slug}`} className="thread-link" style={S.refLink}>{h.ref}</Link>
              </li>
            ))}
          </ol>
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
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: "#f5f0e8", margin: 0, letterSpacing: 6 },
  rule: { width: 80, height: 1, backgroundColor: "#cf7b6e", margin: "14px auto" },
  subtitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#cf7b6e", margin: 0, fontStyle: "italic", letterSpacing: 1 },
  credit: { fontSize: 11.5, color: "#9a8c7e", margin: "12px 0 0", letterSpacing: 1 },
  main: { maxWidth: 820, margin: "0 auto", padding: "36px 24px 80px" },
  essay: { marginBottom: 36 },
  lede: { fontSize: 17, lineHeight: 1.75, color: "#3a2f24", margin: "0 0 16px" },
  p: { fontSize: 15.5, lineHeight: 1.75, color: "#4a3d30", margin: "0 0 14px" },
  figure: { margin: "0 0 44px", textAlign: "center" },
  figcap: { fontSize: 12.5, lineHeight: 1.5, color: "#8a7a6a", fontStyle: "italic", maxWidth: 560, margin: "0 auto 14px" },
  svg: { width: "100%", height: "auto", maxWidth: 640, display: "block", margin: "0 auto" },
  hmLabel: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 10.5, fontWeight: 600, fill: "#5c4033" },
  sec: { marginBottom: 40 },
  h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, color: "#2c2418", letterSpacing: 0.5, margin: "0 0 6px" },
  note: { fontSize: 14, lineHeight: 1.6, color: "#7a6c5d", fontStyle: "italic", margin: "0 0 16px" },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" },
  row: { display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 12, alignItems: "baseline", padding: "8px 4px", borderBottom: "1px solid #e6ddcc" },
  count: { fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700, color: ACCENT, textAlign: "right" },
  pairRefs: { fontSize: 15.5, lineHeight: 1.5, color: "#3a2f24" },
  refLink: { color: "#5c4033", textDecoration: "none", fontWeight: 600, transition: "color 0.15s" },
  plus: { color: "#a89a86" },
  tag: { display: "inline-block", marginLeft: 10, fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: "italic", color: ACCENT, letterSpacing: 0.3 },
  where: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, color: "#8a7a6a", textDecoration: "none", whiteSpace: "nowrap", transition: "color 0.15s" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 },
  card: { border: "1px solid #ddd1bb", borderRadius: 6, padding: "14px 16px", background: "#faf6ee" },
  cardName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: ACCENT, marginBottom: 10, letterSpacing: 0.3 },
  chips: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  memberChip: { display: "inline-block", padding: "2px 9px", borderRadius: 11, border: `1px solid ${ACCENT}`, color: ACCENT, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 12.5, fontWeight: 600, textDecoration: "none", transition: "background 0.15s" },
  cardPairs: { display: "flex", flexDirection: "column", gap: 3 },
  cardPair: { fontSize: 12.5, color: "#7a6c5d", letterSpacing: 0.2 },
  hubRow: { display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, alignItems: "baseline", padding: "7px 4px", borderBottom: "1px solid #e6ddcc" },
  footer: { textAlign: "center", padding: 20, borderTop: "1px solid #d4c9b5", fontSize: 11, color: "#a09080", letterSpacing: 0.5, background: "#eee9df" },
};
