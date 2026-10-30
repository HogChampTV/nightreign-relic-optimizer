// Builds public/demo-save.json: the richest character slot from the synthetic
// test save, in the same parsed-save shape the app stores after an import.
// Lets visitors browse the whole tool before importing their own save.
// Usage: node scripts/build-demo-save.mjs
import { readFile, writeFile } from "node:fs/promises";
import { parseSave } from "../src/engine/save-parser.js";

const save = await parseSave(await readFile(new URL("../test/fixtures-10slots.sl2", import.meta.url)));
const best = save.slots.reduce((a, b) => (b.relics.length > (a?.relics.length ?? -1) ? b : a), null);
if (!best) throw new Error("fixture has no slots with relics");

const demo = { demo: 1, slots: [{ ...best, index: 0, name: "Demo Nightfarer" }] };
const out = new URL("../public/demo-save.json", import.meta.url);
await writeFile(out, JSON.stringify(demo));
console.log(`wrote ${out.pathname} — ${best.relics.length} relics, ${JSON.stringify(demo).length} bytes`);
