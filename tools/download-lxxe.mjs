// One-time download of the Brenton English Septuagint (LXXE, 1851), public domain,
// used as the Greek-OT source for divergence side-by-sides. Run: node tools/download-lxxe.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const text = await (await fetch("https://bolls.life/static/translations/LXXE.json")).text();
writeFileSync(join(here, "lxxe.json"), text);
const books = await (await fetch("https://bolls.life/get-books/LXXE/")).text();
writeFileSync(join(here, "lxxe-books.json"), books);
console.log(`saved tools/lxxe.json (${text.length} bytes) + lxxe-books.json`);
