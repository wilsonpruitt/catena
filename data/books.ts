import type { Book } from "@/lib/types";
import matthew from "./matthew.json";
import mark from "./mark.json";
import luke from "./luke.json";
import john from "./john.json";
import acts from "./acts.json";
import romans from "./romans.json";
import firstCorinthians from "./1-corinthians.json";
import secondCorinthians from "./2-corinthians.json";
import galatians from "./galatians.json";
import ephesians from "./ephesians.json";
import philippians from "./philippians.json";
import colossians from "./colossians.json";
import firstThessalonians from "./1-thessalonians.json";
import secondThessalonians from "./2-thessalonians.json";
import firstTimothy from "./1-timothy.json";
import secondTimothy from "./2-timothy.json";
import titus from "./titus.json";
import philemon from "./philemon.json";
import hebrews from "./hebrews.json";
import james from "./james.json";
import onePeter from "./1-peter.json";
import twoPeter from "./2-peter.json";
import firstJohn from "./1-john.json";
import secondJohn from "./2-john.json";
import thirdJohn from "./3-john.json";
import jude from "./jude.json";
import revelation from "./revelation.json";

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
  ephesians as Book,
  philippians as Book,
  colossians as Book,
  firstThessalonians as Book,
  secondThessalonians as Book,
  firstTimothy as Book,
  secondTimothy as Book,
  titus as Book,
  philemon as Book,
  hebrews as Book,
  james as Book,
  onePeter as Book,
  twoPeter as Book,
  firstJohn as Book,
  secondJohn as Book,
  thirdJohn as Book,
  jude as Book,
  revelation as Book,
];

export function getBook(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}
