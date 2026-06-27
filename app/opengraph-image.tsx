import { ImageResponse } from "next/og";

// Social-share card for Catena. Mirrors the landing header: ink ground, oxblood
// rose accents, the chain motif (drawn as interlocking links — the ⛓ glyph
// renders as tofu in satori), CATENA in Cormorant Garamond, the house tagline.
export const runtime = "nodejs";
export const alt = "Catena — Scripture quoting Scripture · Wroot Press";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#2c2418";
const CREAM = "#f5f0e8";
const OXBLOOD = "#8c3b2f";
const ROSE = "#cf7b6e";
const MUTE = "#a08c78";

// Subset Cormorant Garamond to just the glyphs the card uses.
async function cormorant(text: string, weight: 600 | 700) {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,${weight};1,${weight}&text=${encodeURIComponent(
        text
      )}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    )
  ).text();
  const url = css.match(/src: url\((.+?)\) format\(['"]?(opentype|truetype)['"]?\)/);
  if (!url) throw new Error("font url not found");
  return (await fetch(url[1])).arrayBuffer();
}

// One chain link: an oval ring.
function Link({ rotate }: { rotate: number }) {
  return (
    <div
      style={{
        width: 58,
        height: 34,
        borderRadius: 17,
        border: `4px solid ${ROSE}`,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

export default async function Image() {
  const wordmark = "CATENA";
  const tagline = "Scripture quoting Scripture";
  const press = "WROOT PRESS";
  let fonts;
  try {
    const [bold, italic] = await Promise.all([
      cormorant(wordmark + press, 700),
      cormorant(tagline, 600),
    ]);
    fonts = [
      { name: "Cormorant", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "Cormorant", data: italic, weight: 600 as const, style: "italic" as const },
    ];
  } catch {
    fonts = undefined; // fall back to satori's default serif metrics
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
          fontFamily: "Cormorant, Georgia, serif",
        }}
      >
        {/* inset printed-frame border */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            right: 36,
            bottom: 36,
            border: `1px solid ${OXBLOOD}`,
          }}
        />

        {/* chain motif */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          <Link rotate={-18} />
          <div style={{ width: 58, height: 34, borderRadius: 17, border: `4px solid ${ROSE}`, marginLeft: -14 }} />
          <Link rotate={18} />
        </div>

        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            letterSpacing: 30,
            color: CREAM,
            // shift to optically center the letterspacing
            paddingLeft: 30,
            lineHeight: 1,
          }}
        >
          {wordmark}
        </div>

        <div style={{ width: 96, height: 1, background: ROSE, margin: "30px 0" }} />

        <div
          style={{
            fontSize: 42,
            fontStyle: "italic",
            fontWeight: 600,
            letterSpacing: 3,
            color: ROSE,
          }}
        >
          {tagline}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 70,
            fontSize: 24,
            letterSpacing: 14,
            color: MUTE,
            paddingLeft: 14,
          }}
        >
          {press}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
