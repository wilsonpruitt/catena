import Link from "next/link";
import { BOOKS, getBook } from "@/data/books";
import LandingExample from "@/components/LandingExample";

export default function Home() {
  const hebrews = getBook("hebrews");
  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", color: "#2c2418" }}>
      <header
        style={{
          background: "#2c2418",
          color: "#f5f0e8",
          padding: "64px 24px 56px",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#cf7b6e", letterSpacing: 10, marginBottom: 16, fontSize: 14 }}>
          ⛓ ⛓ ⛓
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 72,
            fontWeight: 700,
            margin: 0,
            letterSpacing: 18,
          }}
        >
          CATENA
        </h1>
        <div style={{ width: 80, height: 1, background: "#cf7b6e", margin: "16px auto" }} />
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            color: "#cf7b6e",
            fontSize: 19,
            letterSpacing: 2,
            margin: 0,
          }}
        >
          Scripture quoting Scripture
        </p>
      </header>

      <main
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "48px 24px 80px",
          fontFamily: "'Crimson Pro', Georgia, serif",
        }}
      >
        <p style={{ fontSize: 17, lineHeight: 1.75, color: "#4a3d30" }}>
          A small Wroot Press project. <em>Catena</em> — Latin for a chain — is how
          the medieval scribes named a text built from links of older text. The
          Bible is full of them: a later writer reaches back, quotes, alludes,
          half-remembers. We mark those links so you can hear them. Each passage
          carries chips pointing to the Scripture beneath it; the kind of chip tells
          you whether the borrowing is a quotation, an allusion, a faint echo, or a
          figure with no words shared at all. The method follows Richard Hays&rsquo;{" "}
          <em>Echoes of Scripture</em> — including his honesty that some echoes are
          contested, which we mark rather than hide.
        </p>

        {hebrews && <LandingExample book={hebrews} pericopeId="1.2" />}

        <h2
          style={{
            marginTop: 48,
            marginBottom: 16,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#8a7a6a",
          }}
        >
          The Books
        </h2>

        <div style={{ display: "grid", gap: 16 }}>
          {BOOKS.map((b) => (
            <Link
              key={b.slug}
              href={`/${b.slug}`}
              style={{
                display: "block",
                padding: "20px 24px",
                background: "#eee9df",
                border: "1px solid #d4c9b5",
                borderRadius: 6,
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: 4,
                  color: "#2c2418",
                }}
              >
                {b.name.toUpperCase()}
              </div>
              {b.subtitle && (
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    color: "#8a7a6a",
                    fontSize: 15,
                    marginTop: 4,
                    letterSpacing: 1,
                  }}
                >
                  {b.subtitle}
                </div>
              )}
            </Link>
          ))}
        </div>

        <Link
          href="/fontium"
          style={{
            display: "block",
            marginTop: 28,
            padding: "18px 24px",
            background: "#2c2418",
            borderRadius: 6,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 4,
              color: "#f5f0e8",
            }}
          >
            INDEX FONTIUM
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "#cf7b6e",
              fontSize: 14,
              marginTop: 3,
              letterSpacing: 1,
            }}
          >
            The Old Testament in the New — every source, and where it surfaces
          </div>
        </Link>

        <p
          style={{
            marginTop: 48,
            fontSize: 12,
            color: "#8a7a6a",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          Scripture: World English Bible · Public Domain · Wroot Press
        </p>
      </main>
    </div>
  );
}
