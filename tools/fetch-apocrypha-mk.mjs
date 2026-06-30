// One-time: fetch the deuterocanonical source texts Acts cites (WEB Apocrypha
// via bible-api.com) and merge them into web-apocrypha.json keyed by the exact
// reference string our data uses. Sequential + delayed to respect rate limits.
import { readFileSync, writeFileSync } from "node:fs";

const list = JSON.parse(readFileSync("/tmp/apoc-list.json", "utf8"))
  .filter((r) => !r.startsWith("Psalm")); // canonical, handled separately

const APOC_PATH = "./tools/web-apocrypha.json";
const apoc = JSON.parse(readFileSync(APOC_PATH, "utf8"));

const clean = (t) =>
  t.replace(/[⌃⌄]/g, "").replace(/\s+/g, " ").trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ok = 0, fail = [];
for (const ref of list) {
  if (apoc[ref]) { ok++; continue; }
  const q = encodeURIComponent(ref);
  try {
    const res = await fetch(`https://bible-api.com/${q}?translation=web`);
    const j = await res.json();
    if (j && j.text && !j.error) {
      apoc[ref] = clean(j.text);
      ok++;
      console.log("ok  ", ref, "::", apoc[ref].slice(0, 60));
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

// Sort keys for a stable, readable file.
const sorted = {};
for (const k of Object.keys(apoc).sort()) sorted[k] = apoc[k];
writeFileSync(APOC_PATH, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nresolved ${ok}/${list.length}; failures: ${fail.length}`, fail.join(", "));
