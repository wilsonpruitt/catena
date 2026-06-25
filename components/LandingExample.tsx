import type { CSSProperties } from "react";
import type { Book } from "@/lib/types";
import { TYPE_META, CONFIDENCE_INK, CONFIDENCE_LABEL, ACCENT } from "@/lib/echoes";

// A static, non-interactive rendering of one pericope with its echo gutter and
// the first source already expanded — the mechanic shown at a glance.
export default function LandingExample({
  book,
  pericopeId,
}: {
  book: Book;
  pericopeId: string;
}) {
  const p = book.pericopes.find((x) => x.id === pericopeId);
  if (!p) return null;

  return (
    <div style={S.wrap}>
      <div style={S.caption}>
        How it works · {book.name} {p.ref} speaks with two older voices at once
      </div>

      <div style={S.card}>
        <div style={S.refLine}>
          <span style={S.refText}>{p.ref}</span>
          <span style={{ flex: 1 }} />
          <span style={S.refCount}>
            {p.echoes.length} {p.echoes.length === 1 ? "echo" : "echoes"}
          </span>
        </div>
        <p style={S.scriptureText}>{p.text}</p>

        <div style={S.gutter}>
          {p.echoes.map((e, i) => {
            const meta = TYPE_META[e.type];
            const ink = CONFIDENCE_INK[e.confidence];
            return (
              <span
                key={i}
                style={{
                  ...S.chip,
                  border: `1.5px ${meta.borderStyle} ${ink}`,
                  color: ink,
                }}
              >
                {meta.glyph && <span style={{ marginRight: 5 }}>{meta.glyph}</span>}
                {e.source}
                {e.contested && <span> ?</span>}
              </span>
            );
          })}
        </div>

        {p.echoes[0] && (
          <div style={{ ...S.sourcePanel, borderLeftColor: CONFIDENCE_INK[p.echoes[0].confidence] }}>
            <div style={S.sourceHead}>
              <span style={{ ...S.sourceRef, color: CONFIDENCE_INK[p.echoes[0].confidence] }}>
                {p.echoes[0].source}
              </span>
              <span style={S.sourceKind}>
                {TYPE_META[p.echoes[0].type].label} ·{" "}
                {CONFIDENCE_LABEL[p.echoes[0].confidence]}
              </span>
            </div>
            <p style={S.sourceText}>{p.echoes[0].text}</p>
            {p.echoes[0].note && <p style={S.sourceNote}>{p.echoes[0].note}</p>}
          </div>
        )}
      </div>

      <div style={S.hint}>
        A solid chip is a quotation, dashed an allusion, dotted a faint echo, and
        ◇ a figural pattern with no words borrowed at all. The chip's color shows
        how confident the identification is; a trailing <strong>?</strong> marks a
        disputed one. Click any chip to read the source it reaches back to.
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: { marginTop: 40 },
  caption: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#8a7a6a",
    marginBottom: 14,
  },
  card: {
    background: "#eee9df",
    border: "1px solid #d4c9b5",
    borderRadius: 8,
    padding: "20px 24px 24px",
  },
  refLine: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  refText: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 13,
    fontWeight: 600,
    color: "#8a7a6a",
    letterSpacing: 1,
  },
  refCount: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#b09a86",
  },
  scriptureText: {
    fontSize: 17,
    lineHeight: 1.85,
    color: "#2c2418",
    margin: 0,
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontWeight: 300,
  },
  gutter: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 13,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.4,
  },
  sourcePanel: {
    marginTop: 16,
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
  },
  hint: {
    marginTop: 18,
    padding: "12px 16px",
    background: "rgba(140,59,47,0.08)",
    borderLeft: `3px solid ${ACCENT}`,
    borderRadius: 4,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#6b5d4e",
    fontFamily: "'Crimson Pro', Georgia, serif",
  },
};
