// Builds src/data/stacking.json — per-effect stacking behavior researched from:
//   [1] relics.pro compendium data (per game effect ID: `stackable` = stacks with
//       itself, `stackOther` = behavior across tiers/variants:
//       withAll | no | first | highest | notExisting | custom | tbd)
//   [2] COOKIE LIPS "Nightreign Holy Bible" sheet (Relic Effects tab, Stackable? column)
//   [3] the Useful Info sheet via effect-notes.json (s: Yes/No)
// relics.pro is primary (ID-exact, has cross-tier data); the sheets cross-check it
// and any disagreement is printed for manual adjudication.
//
//   node scripts/build-stacking.mjs <relicspro-effects.json> <cookie-lips.csv>
import { readFile, writeFile } from "node:fs/promises";

const [, , rpPath, clPath] = process.argv;
if (!rpPath || !clPath) {
  console.error("usage: node scripts/build-stacking.mjs <relicspro-effects.json> <cookie-lips.csv>");
  process.exit(1);
}

const raw = JSON.parse(await readFile(new URL("../src/data/game-data.json", import.meta.url), "utf8"));
const notes = JSON.parse(await readFile(new URL("../src/data/effect-notes.json", import.meta.url), "utf8"));
const rp = JSON.parse(await readFile(rpPath, "utf8"));

// relics.pro entries by game id, duplicateOf resolved
const rpById = new Map(rp.map((e) => [e.id, e]));
const resolve = (e) => {
  let cur = e, hops = 0;
  while (cur?.duplicateOf && hops++ < 5) cur = rpById.get(Number(cur.duplicateOf));
  return cur ?? e;
};

// COOKIE LIPS rows by normalized name (current + previous names)
const clText = await readFile(clPath, "utf8");
const clRows = [];
{
  let row = [], field = "", inQ = false;
  for (let i = 0; i < clText.length; i++) {
    const c = clText[i];
    if (inQ) {
      if (c === '"') { if (clText[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); clRows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); clRows.push(row); }
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9+]/g, "");
const clByName = new Map();
for (const r of clRows.slice(1)) {
  const verdict = r[3]?.toUpperCase();
  if (!r[1] || !verdict || verdict === "TBA") continue;
  clByName.set(norm(r[1]), verdict === "YES");
  const prev = r[4]?.match(/Previously called:\s*(.+)/i);
  if (prev) clByName.set(norm(prev[1]), verdict === "YES");
}

// Adjudicated cross-source conflicts (2026-10). Where two sources outvote the
// third we follow the majority; a 1–1 split goes to the reading that prevents
// a wrong sell (treat as stacking). Majority-for-stacking cases (Max HP/FP/
// Stamina, Continuous HP Recovery: relics.pro + Useful Info vs COOKIE LIPS)
// need no override since relics.pro is already primary.
const OVERRIDES = {
  madnessContinuallyRecoversFP: { self: false }, // both sheets say no; relics.pro alone says yes
  hpRestoredWhenUsingMedicinalBolusesEtcPlus1: { self: false, other: "withAll" }, // sheet note: "+0 stacks with +1", not with itself
  continuousFpRecovery: { self: true }, // relics.pro no vs Useful Info yes — sell-safe reading
};

const effects = Object.values(raw.effects);
const byKey = new Map(effects.map((e) => [e.key, e]));
const keyToIds = new Map();
for (const [id, key] of Object.entries(raw.effectIdToKey)) {
  if (!keyToIds.has(key)) keyToIds.set(Number(key), []);
  keyToIds.get(Number(key)).push(Number(id));
}

const out = {};
const conflicts = [];
let fromRp = 0, fromSheets = 0, engineOnly = 0;
for (const e of effects) {
  const ids = keyToIds.get(e.key) ?? [];
  const rpEntry = ids.map((id) => rpById.get(id)).filter((x) => x && x.type !== "talisman").map(resolve)[0];
  const cl = clByName.get(norm(e.name));
  const sheet = notes[e.key]?.s;
  const sheetSelf = sheet === "Yes" ? true : sheet === "No" ? false : undefined;

  let self, other, src;
  if (rpEntry?.stackable !== undefined) {
    self = rpEntry.stackable;
    other = rpEntry.stackOther;
    src = "relics.pro";
    fromRp++;
  } else if (cl !== undefined || sheetSelf !== undefined) {
    self = cl ?? sheetSelf;
    src = "sheets";
    fromSheets++;
  } else {
    self = e.stacks === true;
    src = "engine";
    engineOnly++;
  }
  for (const [name, v] of [["cookie-lips", cl], ["useful-info", sheetSelf]]) {
    if (v !== undefined && rpEntry?.stackable !== undefined && v !== rpEntry.stackable) {
      conflicts.push(`${e.slug}: relics.pro=${rpEntry.stackable} ${name}=${v}`);
    }
  }
  const entry = { self };
  if (other) entry.other = other;
  out[e.key] = OVERRIDES[e.slug] ? { ...entry, ...OVERRIDES[e.slug] } : entry;
}

await writeFile(
  new URL("../src/data/stacking.json", import.meta.url),
  JSON.stringify({
    source: "relics.pro compendium (per-ID stackable/stackOther), cross-checked vs COOKIE LIPS Nightreign Holy Bible + Useful Info sheets (2026-10)",
    effects: out,
  }) + "\n",
);
console.log(`wrote ${Object.keys(out).length} entries (relics.pro ${fromRp}, sheets ${fromSheets}, engine fallback ${engineOnly})`);
console.log(`cross-source conflicts: ${conflicts.length}`);
for (const c of conflicts) console.log("  ", c);
