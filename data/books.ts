import type { Book } from "@/lib/types";
import hebrews from "./hebrews.json";

export const BOOKS: Book[] = [hebrews as Book];

export function getBook(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}
