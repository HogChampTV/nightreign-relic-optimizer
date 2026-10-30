// Audit preset effects against reality: which effects are actually seen on relics
// (in a real save + the community Useful Info sheet + upstream's recommended list),
// and which preset goals/alternatives reference effects nobody has ever rolled.
//
//   node scripts/audit-effects.mjs <path-to-save.sl2> [--write]
//
// --write regenerates src/data/obtainable-effects.json (the whitelist the app
// uses to hide never-rolls effects). Read-only on the save: it is never written.
import { readFile, writeFile } from "node:fs/promises";
import { parseSave } from "../src/engine/save-parser.js";
import { createGameData } from "../src/engine/game-data.js";
import { buildCharacter } from "../src/engine/model.js";
import { PRESETS } from "../src/lib/presets.js";

const savePath = process.argv[2];
if (!savePath) {
  console.error("usage: node scripts/audit-effects.mjs <path-to-save.sl2>");
  process.exit(1);
}

const gd = createGameData(
  JSON.parse(await readFile(new URL("../src/data/game-data.json", import.meta.url), "utf8")),
);
const notes = JSON.parse(
  await readFile(new URL("../src/data/effect-notes.json", import.meta.url), "utf8"),
);
const raw = JSON.parse(await readFile(new URL("../src/data/game-data.json", import.meta.url), "utf8"));

// 1) Effects seen in the save (all slots, every relic effect + curse, interned
//    through the same path the app uses)
const save = await parseSave(await readFile(savePath));
const inInventory = new Set();
for (const slot of save.slots) {
  const character = buildCharacter(slot, gd);
  for (const relic of character.relics) {
    for (const effect of relic.effects.flat()) {
      if (!effect.unknown) inInventory.add(effect.key);
    }
  }
}

// 2) Community sheet coverage; 3) upstream per-nightfarer recommended lists (effect keys)
const inNotes = new Set(Object.keys(notes).map(Number));
const recommended = new Set(Object.values(raw.recommendedEffects ?? {}).flat());

const seen = (key) => inInventory.has(key) || inNotes.has(key) || recommended.has(key);
const bySlug = new Map(gd.effectsByKey.filter(Boolean).map((e) => [e.slug, e]));

let suspects = 0;
for (const preset of PRESETS) {
  const rows = [];
  const check = (slug, where) => {
    const e = bySlug.get(slug);
    if (!e) return rows.push(`  !! ${slug} (${where}): NOT IN GAME DATA`);
    if (!seen(e.key)) {
      rows.push(
        `  ?? ${slug} (${where}): never seen — inventory:no sheet:no recommended:no  "${e.name}"`,
      );
      suspects++;
    }
  };
  const goals = [...preset.goals, ...Object.values(preset.characterGoals ?? {}).flat()];
  for (const g of goals) {
    if (g.max === 0) continue; // exclusions don't need to be obtainable
    check(g.slug, "goal");
    for (const a of g.alternatives ?? []) check(a, "alt");
  }
  if (rows.length) console.log(`${preset.id}\n${rows.join("\n")}`);
}

const totalKnown = gd.effectsByKey.filter((e) => e && !e.mmv && !e.unknown).length;
const everSeen = gd.effectsByKey.filter((e) => e && !e.mmv && !e.unknown && seen(e.key)).length;
console.log(`\n--- summary ---`);
console.log(`effects in tables: ${totalKnown}`);
console.log(`seen in the wild (inventory ∪ sheet ∪ recommended): ${everSeen}`);
console.log(`  in this save: ${inInventory.size}  in sheet: ${inNotes.size}  recommended: ${recommended.size}`);
console.log(`preset references to never-seen effects: ${suspects}`);

if (process.argv.includes("--write")) {
  const keys = gd.effectsByKey
    .filter((e) => e && !e.mmv && !e.unknown && seen(e.key))
    .map((e) => e.key)
    .sort((a, b) => a - b);
  const out = new URL("../src/data/obtainable-effects.json", import.meta.url);
  await writeFile(out, JSON.stringify({
    source: "effects seen on real relics: a 1,668-relic inventory ∪ community Useful Info sheet ∪ upstream recommended lists (2026-10)",
    keys,
  }) + "\n");
  console.log(`wrote ${keys.length} keys to src/data/obtainable-effects.json`);
}
