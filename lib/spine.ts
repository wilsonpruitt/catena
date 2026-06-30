// The spine, drawn. A build-time aggregation of the whole corpus into the flow
// between each Old Testament source book and each New Testament book, laid out
// as a circular chord diagram (hand-rolled SVG geometry — no D3, no client JS),
// plus a significance leaderboard of the load-bearing source texts. Pure derived
// view over the book data; nothing here ships to the browser as script.
import { BOOKS } from "@/data/books";
import type { Book } from "./types";
import { CONF_WEIGHT, NT_ABBR } from "./fontium";
import { sourceBook } from "./echoes";
import { sourceSlug } from "./slug";

const NT_NAMES = new Set(Object.keys(NT_ABBR));

// Tunables.
export const TOP_OT = 20; // Old Testament source books drawn as their own arc; the rest fold into "Other".
export const MIN_RIBBON = 4; // a flow this weighty or more gets a ribbon; lighter links live only in the leaderboard.

// Warm earth palette for the source arcs — oxblood deepening to clay and amber,
// ranked so the heaviest source reads in the house oxblood. "Other" is the last.
const OT_COLORS = [
  "#8c3b2f", "#a8493a", "#b9603f", "#c17a4e", "#c89a5e", "#9c6b3f", "#7d5a3c", "#a86e54",
  "#b5785f", "#94553f", "#856044", "#a07c4c", "#6f4d38", "#b08a5a", "#8a6b4a", "#9e6048",
  "#7a4536", "#c2a36a", "#8f6440", "#a55a48",
];
const OTHER_COLOR = "#bdae95";
const NT_COLOR = "#5c5142";

const R = 300; // arc radius
const ARC = 13; // arc band thickness
const NODE_PAD = 0.007; // radians between adjacent arcs
const GROUP_GAP = 0.07; // radians between the OT block and the NT block (×2)

// Angle convention: 0 at the top, increasing clockwise.
function pt(angle: number, radius: number) {
  return { x: radius * Math.sin(angle), y: -radius * Math.cos(angle) };
}
function f(n: number) {
  return Math.round(n * 100) / 100;
}

export type SpineArc = {
  name: string;
  group: "ot" | "nt";
  value: number;
  color: string;
  a0: number;
  a1: number;
  mid: number;
  d: string; // band path
  lx: number;
  ly: number;
  rot: number;
  anchor: "start" | "end";
};
export type SpineRibbon = {
  ot: string;
  nt: string;
  value: number;
  color: string;
  width: number;
  d: string;
};
export type LeaderRow = {
  ref: string;
  slug: string;
  book: string;
  score: number;
  count: number;
  books: number; // distinct NT books
  types: { quotation: number; allusion: number; echo: number; figural: number };
};
export type Spine = {
  size: number;
  radius: number;
  arcs: SpineArc[];
  ribbons: SpineRibbon[];
  leaders: LeaderRow[];
  totalFlow: number;
  otShown: number;
  ntShown: number;
};

function bandPath(a0: number, a1: number): string {
  const ro = R + ARC / 2;
  const ri = R - ARC / 2;
  const o0 = pt(a0, ro), o1 = pt(a1, ro), i1 = pt(a1, ri), i0 = pt(a0, ri);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  // outer arc clockwise, inner arc back counter-clockwise
  return [
    `M ${f(o0.x)} ${f(o0.y)}`,
    `A ${ro} ${ro} 0 ${large} 1 ${f(o1.x)} ${f(o1.y)}`,
    `L ${f(i1.x)} ${f(i1.y)}`,
    `A ${ri} ${ri} 0 ${large} 0 ${f(i0.x)} ${f(i0.y)}`,
    "Z",
  ].join(" ");
}

export function buildSpine(): Spine {
  // 1. Accumulate OT-book → NT-book flow, weighted by confidence.
  const flow = new Map<string, Map<string, number>>();
  const otTotal = new Map<string, number>();
  for (const b of BOOKS as Book[]) {
    const nt = b.name;
    for (const p of b.pericopes)
      for (const e of p.echoes) {
        const ot = sourceBook(e.source);
        if (NT_NAMES.has(ot)) continue; // keep the picture OT→NT
        const w = CONF_WEIGHT[e.confidence] ?? 1;
        if (!flow.has(ot)) flow.set(ot, new Map());
        const m = flow.get(ot)!;
        m.set(nt, (m.get(nt) ?? 0) + w);
        otTotal.set(ot, (otTotal.get(ot) ?? 0) + w);
      }
  }

  // 2. Rank OT books; keep the top, fold the tail into "Other sources".
  const ranked = [...otTotal.entries()].sort((a, b) => b[1] - a[1]);
  const keep = new Set(ranked.slice(0, TOP_OT).map(([n]) => n));
  const otOrder: string[] = ranked.filter(([n]) => keep.has(n)).map(([n]) => n);
  const folded = ranked.length > keep.size;
  if (folded) otOrder.push("Other sources");

  const otColor = new Map<string, string>();
  otOrder.forEach((n, i) => otColor.set(n, n === "Other sources" ? OTHER_COLOR : OT_COLORS[i] ?? OTHER_COLOR));

  // Re-key flows onto the kept set (+ Other), and total per NT book.
  const merged = new Map<string, Map<string, number>>(); // ot -> nt -> w
  const ntTotal = new Map<string, number>();
  for (const [ot, m] of flow) {
    const key = keep.has(ot) ? ot : "Other sources";
    if (!merged.has(key)) merged.set(key, new Map());
    const mm = merged.get(key)!;
    for (const [nt, w] of m) {
      mm.set(nt, (mm.get(nt) ?? 0) + w);
      ntTotal.set(nt, (ntTotal.get(nt) ?? 0) + w);
    }
  }
  const ntOrder = (BOOKS as Book[]).map((b) => b.name).filter((n) => ntTotal.has(n));

  // 3. Lay out arcs. Every flow is counted on both an OT arc and an NT arc, so
  // the two blocks carry equal total weight and fill half the ring each.
  const nodes = [
    ...otOrder.map((n) => ({ name: n, group: "ot" as const, value: otTotal2(merged, n) })),
    ...ntOrder.map((n) => ({ name: n, group: "nt" as const, value: ntTotal.get(n)! })),
  ];
  const totalValue = nodes.reduce((s, n) => s + n.value, 0);
  const usable = 2 * Math.PI - nodes.length * NODE_PAD - 2 * GROUP_GAP;

  const arcs: SpineArc[] = [];
  const span = new Map<string, { a0: number; a1: number }>();
  let ang = GROUP_GAP / 2;
  let prevGroup = nodes[0].group;
  for (const n of nodes) {
    if (n.group !== prevGroup) {
      ang += GROUP_GAP;
      prevGroup = n.group;
    }
    const a0 = ang;
    const a1 = ang + (n.value / totalValue) * usable;
    const mid = (a0 + a1) / 2;
    span.set(n.name, { a0, a1 });
    const left = Math.sin(mid) < 0;
    const lp = pt(mid, R + ARC / 2 + 9);
    arcs.push({
      name: n.name,
      group: n.group,
      value: n.value,
      color: n.group === "ot" ? otColor.get(n.name)! : NT_COLOR,
      a0, a1, mid,
      d: bandPath(a0, a1),
      lx: f(lp.x),
      ly: f(lp.y),
      rot: f((mid * 180) / Math.PI + (left ? 90 : -90)),
      anchor: left ? "end" : "start",
    });
    ang = a1 + NODE_PAD;
  }

  // 4. Sub-arc midpoints: partition each arc by its flows so ribbons fan out
  // instead of crowding a single point.
  const otSub = new Map<string, number>(); // `${ot}|${nt}` -> angle
  for (const ot of otOrder) {
    const s = span.get(ot)!;
    const m = merged.get(ot);
    if (!m) continue;
    const width = s.a1 - s.a0;
    const tot = [...m.values()].reduce((a, b) => a + b, 0) || 1;
    let cur = s.a0;
    for (const nt of ntOrder) {
      const w = m.get(nt);
      if (!w) continue;
      const seg = (w / tot) * width;
      otSub.set(`${ot}|${nt}`, cur + seg / 2);
      cur += seg;
    }
  }
  const ntSub = new Map<string, number>();
  for (const nt of ntOrder) {
    const s = span.get(nt)!;
    const width = s.a1 - s.a0;
    const incoming = otOrder.map((ot) => [ot, merged.get(ot)?.get(nt) ?? 0] as const).filter(([, w]) => w);
    const tot = incoming.reduce((a, [, w]) => a + w, 0) || 1;
    let cur = s.a0;
    for (const [ot, w] of incoming) {
      const seg = (w / tot) * width;
      ntSub.set(`${ot}|${nt}`, cur + seg / 2);
      cur += seg;
    }
  }

  // 5. Ribbons (quadratic bezier through the centre), heaviest drawn last.
  const ri = R - ARC / 2;
  const maxW = Math.max(...[...merged.values()].flatMap((m) => [...m.values()]));
  const ribbons: SpineRibbon[] = [];
  for (const ot of otOrder)
    for (const nt of ntOrder) {
      const w = merged.get(ot)?.get(nt) ?? 0;
      if (w < MIN_RIBBON) continue;
      const pa = pt(otSub.get(`${ot}|${nt}`)!, ri);
      const pb = pt(ntSub.get(`${ot}|${nt}`)!, ri);
      ribbons.push({
        ot, nt, value: w,
        color: otColor.get(ot)!,
        width: f(1 + (Math.sqrt(w) / Math.sqrt(maxW)) * 13),
        d: `M ${f(pa.x)} ${f(pa.y)} Q 0 0 ${f(pb.x)} ${f(pb.y)}`,
      });
    }
  ribbons.sort((a, b) => a.value - b.value);

  return {
    size: 2 * (R + ARC + 70),
    radius: R,
    arcs,
    ribbons,
    leaders: leaderboard(),
    totalFlow: [...otTotal.values()].reduce((a, b) => a + b, 0),
    otShown: otOrder.length,
    ntShown: ntOrder.length,
  };
}

function otTotal2(merged: Map<string, Map<string, number>>, name: string): number {
  const m = merged.get(name);
  return m ? [...m.values()].reduce((a, b) => a + b, 0) : 0;
}

// The load-bearing source texts, ranked by significance (confidence weight ×
// distinct NT books), with their echo-type composition — links to each dossier.
function leaderboard(): LeaderRow[] {
  const acc = new Map<
    string,
    { count: number; weight: number; books: Set<string>; types: LeaderRow["types"] }
  >();
  for (const b of BOOKS as Book[])
    for (const p of b.pericopes)
      for (const e of p.echoes) {
        let a = acc.get(e.source);
        if (!a) {
          a = { count: 0, weight: 0, books: new Set(), types: { quotation: 0, allusion: 0, echo: 0, figural: 0 } };
          acc.set(e.source, a);
        }
        a.count++;
        a.weight += CONF_WEIGHT[e.confidence] ?? 1;
        a.books.add(b.slug);
        a.types[e.type] = (a.types[e.type] ?? 0) + 1;
      }
  return [...acc.entries()]
    .map(([ref, a]) => ({
      ref,
      slug: sourceSlug(ref),
      book: sourceBook(ref),
      score: a.weight * a.books.size,
      count: a.count,
      books: a.books.size,
      types: a.types,
    }))
    .sort((x, y) => y.score - x.score || y.count - x.count)
    .slice(0, 25);
}
