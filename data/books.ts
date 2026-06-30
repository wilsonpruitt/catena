import type { Book } from "@/lib/types";
import hebrews from "./hebrews.json";
import revelation from "./revelation.json";
import matthew from "./matthew.json";
import mark from "./mark.json";
import luke from "./luke.json";
import john from "./john.json";
import acts from "./acts.json";
import romans from "./romans.json";
import firstCorinthians from "./1-corinthians.json";
import secondCorinthians from "./2-corinthians.json";
import galatians from "./galatians.json";
import onePeter from "./1-peter.json";

export const BOOKS: Book[] = [
  matthew as Book,
  mark as Book,
  luke as Book,
  john as Book,
  acts as Book,
  romans as Book,
  firstCorinthians as Book,
  secondCorinthians as Book,
  galatians as Book,
  hebrews as Book,
  onePeter as Book,
  revelation as Book,
];

export function getBook(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}
