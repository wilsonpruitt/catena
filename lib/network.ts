// Network analysis over the echo graph — not "where does the New Testament use
// the Old," but "which Old Testament texts does it use TOGETHER." Co-citation:
// for every New Testament passage, the set of sources it braids in one breath.
// The recurring pairs are the empirical testimonia; the components those pairs
// form are constellations. Derived at build time; server-only.
import { BOOKS } from "@/data/books";
import type { Book } from "./types";
import { toOsis } from "./osis";
import { sourceBook, canonicalBook } from "./echoes";

const NT = new Set(BOOKS.map((b) => b.name));

type Where = { slug: string; ref: string; id: string; book: string };
export type Node = { refKey: string; refDisplay: string };
export type Pair = { a: Node; b: Node; count: number; where: Where[] };
export type BookPair = { a: string; b: string; count: number };
export type Cluster = { members: Node[]; pairs: { a: string; b: string; count: number }[]; weight: number };
export type Hub = { slug: string; ref: string; book: string; sources: number };
export type Matrix = { labels: string[]; keys: string[]; cells: number[][]; max: number };
export type Network = {
  pairs: Pair[];
  bookPairs: BookPair[];
  clusters: Cluster[];
  hubs: Hub[];
  matrix: Matrix;
  combiningPassages: number; // NT passages citing >= 2 distinct sources
  totalPassages: number;
};

const CLUSTER_FLOOR = 4; // a pair this strong or stronger seeds a constellation

let _cache: Network | null = null;

export function buildNetwork(): Network {
  const pairMap = new Map<string, Pair>();
  const bookPairMap = new Map<string, BookPair>();
  const disp = new Map<string, string>(); // refKey -> refDisplay
  const srcPassages = new Map<string, number>(); // refKey -> # passages citing it
  const hubs: Hub[] = [];
  let combiningPassages = 0;
  let totalPassages = 0;

  for (const b of BOOKS as Book[]) {
    for (const p of b.pericopes) {
      totalPassages++;
      const nodes = new Map<string, string>(); // refKey -> refDisplay (distinct sources here)
      const books = new Set<string>();
      for (const e of p.echoes) {
        const ob = canonicalBook(sourceBook(e.source));
        if (NT.has(ob)) continue;
        const o = toOsis(e.source);
        const key = o.refKey || o.refDisplay;
        nodes.set(key, o.refDisplay);
        disp.set(key, o.refDisplay);
        books.add(ob);
      }
      const keys = [...nodes.keys()].sort();
      hubs.push({ slug: b.slug, ref: `${b.name} ${p.ref}`, book: b.name, sources: keys.length });
      if (keys.length >= 2) combiningPassages++;
      for (const k of keys) srcPassages.set(k, (srcPassages.get(k) ?? 0) + 1);

      for (let i = 0; i < keys.length; i++)
        for (let j = i + 1; j < keys.length; j++) {
          const id = `${keys[i]}|${keys[j]}`;
          let pr = pairMap.get(id);
          if (!pr) {
            pr = { a: { refKey: keys[i], refDisplay: nodes.get(keys[i])! }, b: { refKey: keys[j], refDisplay: nodes.get(keys[j])! }, count: 0, where: [] };
            pairMap.set(id, pr);
          }
          pr.count++;
          pr.where.push({ slug: b.slug, ref: `${b.name} ${p.ref}`, id: p.id, book: b.name });
        }
      const ba = [...books].sort();
      for (let i = 0; i < ba.length; i++)
        for (let j = i + 1; j < ba.length; j++) {
          const id = `${ba[i]}|${ba[j]}`;
          let bp = bookPairMap.get(id);
          if (!bp) { bp = { a: ba[i], b: ba[j], count: 0 }; bookPairMap.set(id, bp); }
          bp.count++;
        }
    }
  }

  const allPairs = [...pairMap.values()].sort((x, y) => y.count - x.count || x.a.refKey.localeCompare(y.a.refKey));
  const pairs = allPairs.slice(0, 30);
  const bookPairs = [...bookPairMap.values()].sort((x, y) => y.count - x.count).slice(0, 14);

  // Constellations: connected components of the graph kept above CLUSTER_FLOOR.
  const adj = new Map<string, Set<string>>();
  const strong = allPairs.filter((p) => p.count >= CLUSTER_FLOOR);
  for (const p of strong) {
    if (!adj.has(p.a.refKey)) adj.set(p.a.refKey, new Set());
    if (!adj.has(p.b.refKey)) adj.set(p.b.refKey, new Set());
    adj.get(p.a.refKey)!.add(p.b.refKey);
    adj.get(p.b.refKey)!.add(p.a.refKey);
  }
  const seen = new Set<string>();
  const clusters: Cluster[] = [];
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const comp: string[] = [];
    const stack = [start];
    while (stack.length) {
      const n = stack.pop()!;
      if (seen.has(n)) continue;
      seen.add(n);
      comp.push(n);
      for (const m of adj.get(n) ?? []) if (!seen.has(m)) stack.push(m);
    }
    if (comp.length < 3) continue; // pairs are already in `pairs`; clusters are >=3
    const compSet = new Set(comp);
    const inner = strong
      .filter((p) => compSet.has(p.a.refKey) && compSet.has(p.b.refKey))
      .map((p) => ({ a: p.a.refDisplay, b: p.b.refDisplay, count: p.count }))
      .sort((x, y) => y.count - x.count);
    clusters.push({
      members: comp.map((k) => ({ refKey: k, refDisplay: disp.get(k)! })).sort((x, y) => (srcPassages.get(y.refKey) ?? 0) - (srcPassages.get(x.refKey) ?? 0)),
      pairs: inner,
      weight: inner.reduce((n, p) => n + p.count, 0),
    });
  }
  clusters.sort((a, b) => b.weight - a.weight);

  // Co-citation matrix for the top sources (by # passages that cite them).
  const topKeys = [...srcPassages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k]) => k);
  const idx = new Map(topKeys.map((k, i) => [k, i]));
  const cells = topKeys.map(() => topKeys.map(() => 0));
  let max = 0;
  for (const p of allPairs) {
    const i = idx.get(p.a.refKey), j = idx.get(p.b.refKey);
    if (i === undefined || j === undefined) continue;
    cells[i][j] = cells[j][i] = p.count;
    if (p.count > max) max = p.count;
  }
  const matrix: Matrix = { labels: topKeys.map((k) => disp.get(k)!), keys: topKeys, cells, max };

  hubs.sort((a, b) => b.sources - a.sources);
  _cache = { pairs, bookPairs, clusters, hubs: hubs.slice(0, 12), matrix, combiningPassages, totalPassages };
  return _cache;
}

export function getNetwork(): Network {
  return _cache ?? buildNetwork();
}
