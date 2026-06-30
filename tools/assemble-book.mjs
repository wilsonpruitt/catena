// Generic Catena assembler for the final 12 NT books. Usage:
//   node tools/assemble-book.mjs <slug>
// Reads data/resweep-<slug>/ch-N.json (chapter discovery), resolves every
// source from the local WEB, drops NT->NT, writes data/<slug>.json.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "./weblookup.mjs";

const NT = new Set(["Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"]);
const bookOf = (s) => s.replace(/\s+\d.*$/u, "").trim();
const stripParen = (s) => s.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
function cap(t) {
  if (t.length <= 460) return t;
  const s = t.slice(0, 460);
  const i = s.lastIndexOf(" ");
  return s.slice(0, i > 300 ? i : 460).trim() + " […]";
}

const META = {
  "1-thessalonians": { name: "1 Thessalonians", chapters: 5, subtitle: "A Hope Made of Scripture",
    howToRead: "Paul’s earliest letter is steadied by hope. To a young church grieving its dead and waiting for the Lord, he writes of the God who chose them, the wrath to come and the rescue from it, and above all the coming of the Lord — the archangel’s call and the trumpet of God, the dead in Christ rising first, the day that arrives like a thief in the night. The language is the prophets’ day of the Lord and the apocalyptic descent of God in glory, turned into comfort: encourage one another with these words. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "2-thessalonians": { name: "2 Thessalonians", chapters: 3, subtitle: "A Reckoning Made of Scripture",
    howToRead: "Where the first letter comforted the grieving, the second steadies the alarmed: the day of the Lord has not already come. Paul sets the scene from the prophets — the Lord Jesus revealed from heaven in flaming fire, inflicting vengeance on those who do not know God, the man of lawlessness exalting himself in the temple of God as Daniel and Isaiah foretold, until the Lord destroys him with the breath of his mouth. It is a letter of judgment held back and judgment sure, and of standing firm until then. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "1-timothy": { name: "1 Timothy", chapters: 6, subtitle: "An Order Made of Scripture",
    howToRead: "Written to order the household of God, this letter measures the church against Scripture — the law laid down not for the righteous but the lawless, the one God and the one mediator, the overseer above reproach, the elders worthy of double honor on the principle that you shall not muzzle the ox. Its instructions on prayer, money, widows, and sound teaching rest on the wisdom and the law of Israel, and its confession of godliness reads like a hymn. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "2-timothy": { name: "2 Timothy", chapters: 4, subtitle: "A Charge Made of Scripture",
    howToRead: "Paul’s last letter is a charge: guard the deposit, endure suffering, preach the word in season and out of season. He arms Timothy from Scripture — the Lord knows those who are his, and let everyone who names his name depart from iniquity; the Lord’s servant must not quarrel; God will repay each according to his deeds — and crowns it with the conviction that all Scripture is breathed out by God and profitable, the very ground on which the charge stands. He has finished the race; the crown of righteousness waits. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "titus": { name: "Titus", chapters: 3, subtitle: "A Grace Made of Scripture",
    howToRead: "To a church being set in order on Crete, Titus answers bad teaching with sound doctrine and good works — and grounds both in grace. The grace of God has appeared, training us to renounce ungodliness and to await the blessed hope, the appearing of the glory of our great God and Savior, who gave himself to redeem us and purify a people of his own possession — the language of Israel’s redemption and the people set apart. Elders must be above reproach, the saved washed in the water of rebirth, the people zealous for good works. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "philemon": { name: "Philemon", chapters: 1, subtitle: "A Welcome Made of Scripture",
    howToRead: "Paul’s shortest letter asks one thing: welcome back Onesimus, a runaway slave, no longer as a slave but as a beloved brother. Beneath the gracious appeal runs the deep grammar of Scripture — the brother received, the debt charged to another’s account, the providence that turns a wrong into good as it did with Joseph and his brothers. It is a small letter in which the gospel quietly undoes a hierarchy. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "james": { name: "James", chapters: 5, subtitle: "A Mirror Made of Scripture",
    howToRead: "James holds the word up like a mirror: be doers of the word and not hearers only, who look at their face and forget what they saw. The letter is the New Testament’s book of wisdom, woven from Proverbs and Sirach and the prophets — the rich and the poor, the bridled tongue, the royal law to love your neighbor as yourself, Abraham and Rahab justified by works, the patience of Job and the prayer of Elijah, the harvest of righteousness sown in peace. To look in and walk away unchanged is to miss it. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "2-peter": { name: "2 Peter", chapters: 3, subtitle: "A Warning Made of Scripture",
    howToRead: "Against teachers who scoff at the promise of his coming, 2 Peter marshals Scripture as warning. The examples are a catalog of judgment and rescue — the angels who sinned, the flood that spared only Noah, the ash of Sodom and the rescue of Lot, the madness of Balaam rebuked by his donkey — and the promise stands: the day of the Lord will come like a thief, the heavens dissolved, and new heavens and a new earth in which righteousness dwells. Remember the words of the prophets; the prophetic word is no cleverly devised myth. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "1-john": { name: "1 John", chapters: 5, subtitle: "A Love Made of Scripture",
    howToRead: "John writes so that joy may be complete and so that those who believe may know they have eternal life. The letter circles a few great words — light and darkness, truth and lie, life and death, and above all love, for God is love — and reads them against the beginning: the word of life heard and seen and touched, Cain who was of the evil one and murdered his brother, the commandment old and new to love one another. To abide in love is to abide in God. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "2-john": { name: "2 John", chapters: 1, subtitle: "A Truth Made of Scripture",
    howToRead: "A short letter to a chosen lady and her children, 2 John walks the line between truth and deception. Love is walking according to the commandments; the commandment, from the beginning, is to love one another — but the love that abides in truth must also refuse the deceivers who do not confess Christ, not even receiving them into the house. Truth and love are not rivals here; they keep each other honest. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "3-john": { name: "3 John", chapters: 1, subtitle: "A Friendship Made of Scripture",
    howToRead: "The most personal letter in the New Testament commends Gaius for walking in the truth and welcoming traveling brothers, rebukes Diotrephes who loves to be first and turns them away, and bears witness to Demetrius. Its closing is unique in the canon — the friends greet you; greet the friends by name. Beneath the small drama of hospitality lies the old scriptural law of welcoming the stranger and imitating good rather than evil. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
  "jude": { name: "Jude", chapters: 1, subtitle: "A Defense Made of Scripture",
    howToRead: "Jude means to write of salvation and instead must urge his readers to contend for the faith once delivered, for ungodly intruders have slipped in. He answers them with a torrent of scriptural examples — the unbelieving wilderness generation destroyed, the angels who left their place kept in chains, Sodom and Gomorrah as an example of eternal fire, the way of Cain and the error of Balaam and the rebellion of Korah, the autumn trees twice dead — and even Enoch’s ancient prophecy that the Lord comes with his myriads to execute judgment. It is a short, fierce defense of the faith. The chips beside each passage name the Scripture underneath it — solid for a formal quotation, dashed for an allusion, dotted for a fainter echo, ◇ for a figural pattern that borrows no words. A lighter chip and a trailing ? mark an echo that is faint or contested. Where the writer follows the Greek of the Septuagint against the Hebrew, both readings are shown." },
};

const slug = process.argv[2];
const meta = META[slug];
if (!meta) { console.error("unknown slug:", slug, "\nknown:", Object.keys(META).join(", ")); process.exit(1); }
const dir = `/Users/wilsonpruitt/catena/data/resweep-${slug}`;

const out = { slug, name: meta.name, subtitle: meta.subtitle, translation: "World English Bible", howToRead: meta.howToRead, pericopes: [] };

let dropped = 0, placeheld = [], echoCount = 0, noText = [];
for (let ch = 1; ch <= meta.chapters; ch++) {
  const arr = JSON.parse(readFileSync(`${dir}/ch-${ch}.json`, "utf8"));
  for (const p of arr) {
    const text = resolve(meta.name + " " + p.ref) || p.text || "";
    if (!resolve(meta.name + " " + p.ref)) noText.push(p.ref);
    const echoes = [];
    const TYPES = new Set(["quotation", "allusion", "echo", "figural"]);
    for (const e of p.echoes) {
      const src = stripParen(e.source);
      if (NT.has(bookOf(src))) { dropped++; continue; }
      const raw = resolve(src);
      const type = TYPES.has(e.type) ? e.type : (e.type === "typological" ? "figural" : "echo");
      const echo = {
        source: src,
        type,
        confidence: raw ? e.confidence : "low",
        text: raw ? cap(raw) : "[source text not in the World English Bible]",
        note: e.note,
      };
      if (e.contested || !raw) echo.contested = true;
      if (e.altSource) echo.altSource = e.altSource;
      if (!raw) placeheld.push(`${p.ref} → ${src}`);
      echoes.push(echo);
      echoCount++;
    }
    out.pericopes.push({ id: p.id, ch: p.ch, ref: p.ref, text, echoes });
  }
}

writeFileSync(`/Users/wilsonpruitt/catena/data/${slug}.json`, JSON.stringify(out, null, 2) + "\n");

const t = {}, s = {};
for (const p of out.pericopes) for (const e of p.echoes) {
  t[e.type] = (t[e.type] || 0) + 1;
  const b = bookOf(e.source); s[b] = (s[b] || 0) + 1;
}
console.log(`[${slug}] pericopes:`, out.pericopes.length, "| echoes:", echoCount, "| by type:", JSON.stringify(t), "| books:", Object.keys(s).length);
console.log("  NT dropped:", dropped, "| no-text:", noText.length, noText.join(", "));
console.log("  placeholders:", placeheld.length, placeheld.join("; "));
console.log("  top:", Object.entries(s).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>`${k} ${v}`).join(", "));
