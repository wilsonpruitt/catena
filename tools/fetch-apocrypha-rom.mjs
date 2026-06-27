// One-time: fetch the deuterocanonical source texts Romans cites (WEB Apocrypha
// via bible-api.com) and merge into web-apocrypha.json keyed by the exact source
// string our data uses. "4 Ezra" is queried as "2 Esdras" (same apocalypse, the
// bible-api name) but keyed under the original. Sequential + delayed.
import { readFileSync, writeFileSync } from "node:fs";

const list = JSON.parse(readFileSync("/tmp/apoc-list-rom.json", "utf8"));
const APOC_PATH = "./tools/web-apocrypha.json";
const apoc = JSON.parse(readFileSync(APOC_PATH, "utf8"));
const clean = (t) => t.replace(/[⌃⌄]/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// our source string -> the reference to query at bible-api (when they differ)
const queryRef = (ref) => ref.replace(/^4 Ezra\b/, "2 Esdras");

let ok = 0, fail = [];
for (const ref of list) {
  if (apoc[ref]) { ok++; continue; }
  const q = encodeURIComponent(queryRef(ref));
  try {
    const res = await fetch(`https://bible-api.com/${q}?translation=web`);
    const j = await res.json();
    if (j && j.text && !j.error) {
      apoc[ref] = clean(j.text);
      ok++;
      console.log("ok  ", ref, "::", apoc[ref].slice(0, 56));
    } else {
      fail.push(ref);
      console.log("FAIL", ref, j && j.error ? j.error : "(no text)");
    }
  } catch (e) {
    fail.push(ref);
    console.log("ERR ", ref, e.message);
  }
  await sleep(2500);
}

const sorted = {};
for (const k of Object.keys(apoc).sort()) sorted[k] = apoc[k];
writeFileSync(APOC_PATH, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nresolved ${ok}/${list.length}; failures: ${fail.length}`, fail.join(", "));
