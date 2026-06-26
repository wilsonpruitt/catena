import type { Book } from "@/lib/types";
import hebrews from "./hebrews.json";
import revelation from "./revelation.json";

export const BOOKS: Book[] = [revelation as Book, hebrews as Book];

export function getBook(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}
