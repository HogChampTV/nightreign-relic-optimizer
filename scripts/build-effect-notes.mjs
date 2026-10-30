// Generates src/data/effect-notes.json: our effect key -> { v: numeric/mechanic text,
// s: stacking ("Yes"/"No"/...), n: community notes } from the "Nightreign Useful Info"
// community sheet as distilled by tijmen/nightreign-relic-optimizer (MIT,
// reference/effect_ref.json). Usage:
//   node scripts/build-effect-notes.mjs <path-to-effect_ref.json>
import { readFile, writeFile } from "node:fs/promises";

const refPath = process.argv[2];
if (!refPath) {
  console.error("usage: node scripts/build-effect-notes.mjs <path-to-effect_ref.json>");
  process.exit(1);
}
const ref = JSON.parse(await readFile(refPath, "utf8"));
const gd = JSON.parse(await readFile(new URL("../src/data/game-data.json", import.meta.url), "utf8"));

const out = {};
let matched = 0, unmatched = 0;
for (const table of [ref.effects ?? {}, ref.curses ?? {}]) {
  for (const [id, entry] of Object.entries(table)) {
    const key = gd.effectIdToKey[id];
    if (key === undefined) {
      unmatched++;
      continue;
    }
    matched++;
    if (out[key]) continue; // alias ids share one entry
    const rec = { v: entry.effect?.trim() || undefined, s: entry.stack || undefined, n: entry.notes?.trim() || undefined };
    if (rec.v || rec.n) out[key] = rec;
  }
}
await writeFile(
  new URL("../src/data/effect-notes.json", import.meta.url),
  JSON.stringify(out),
  "utf8",
);
console.log(`effect-notes.json written: ${Object.keys(out).length} keys (${matched} ref ids matched, ${unmatched} unmatched)`);
