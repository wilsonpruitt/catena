import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://catena.wrootpress.com"),
  title: "Catena · Wroot Press",
  description:
    "Scripture quoting Scripture. A reader's lens on the chains of citation, allusion, and echo that bind the canon together.",
  openGraph: {
    title: "Catena · Wroot Press",
    description:
      "Scripture quoting Scripture. A reader's lens on the chains of citation, allusion, and echo that bind the canon together.",
    siteName: "Catena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catena · Wroot Press",
    description: "Scripture quoting Scripture — a Wroot Press reading lens.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script defer src="/_vercel/insights/script.js"></script>
      </head>
      <body style={{ margin: 0, background: "#f5f0e8" }}>{children}</body>
    </html>
  );
}
