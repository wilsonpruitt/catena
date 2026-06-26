import type { Metadata } from "next";
import { buildIndex } from "@/lib/fontium";
import IndexFontium from "@/components/IndexFontium";

export const metadata: Metadata = {
  title: "Index Fontium · Catena",
  description:
    "The Old Testament in the New — every source and every place across the Catena editions that echoes it.",
};

export default function IndexPage() {
  return <IndexFontium data={buildIndex()} />;
}
