// Dev utility: parse a Nightreign save (read-only) and print a summary.
// Usage: node scripts/inspect-save.mjs [path-to-NR0000.sl2]
import { readFile } from "node:fs/promises";
import { parseSave } from "../src/engine/save-parser.js";
import { createGameData } from "../src/engine/game-data.js";
import { buildCharacter } from "../src/engine/model.js";

const path = process.argv[2] ?? new URL("../test/fixtures-10slots.sl2", import.meta.url);
const gd = createGameData(
  JSON.parse(await readFile(new URL("../src/data/game-data.json", import.meta.url), "utf8")),
);

const save = await parseSave(await readFile(path));
console.log(`entries decrypted: ${save.entryCount}`);
for (const slot of save.slots) {
  const c = buildCharacter(slot, gd);
  const deep = c.relics.filter((r) => r.isDeep).length;
  const unknownE = new Set(c.relics.flatMap((r) => r.effects.flat()).filter((e) => e.unknown)).size;
  const unknownI = c.relics.filter((r) => r.item.unknown).length;
  console.log(
    `slot ${slot.index}: "${c.name}" — ${c.relics.length} relics (${deep} deep)` +
      (unknownE ? `, ${unknownE} unknown effects` : "") +
      (unknownI ? `, ${unknownI} unknown items` : "") +
      (slot.warning ? ` [warning: ${slot.warning}]` : ""),
  );
}
const best = save.slots
  .map((s) => buildCharacter(s, gd))
  .reduce((a, b) => (b.relics.length > (a?.relics.length ?? -1) ? b : a), null);
if (best) {
  console.log(`\nsample from "${best.name}":`);
  for (const r of best.relics.slice(0, 6)) {
    console.log(
      `  ${r.name} [${["?", "red", "blue", "yellow", "green"][r.color]}${r.isDeep ? ", deep" : ""}]`,
    );
    for (const [e, curse] of r.effects) {
      console.log(`    - ${e.name}${curse ? `  // curse: ${curse.name}` : ""}`);
    }
  }
}
