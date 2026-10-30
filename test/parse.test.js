// Smoke tests: decrypt + parse the bundled fixture save and validate preset
// slugs against the game data tables.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseSave } from "../src/engine/save-parser.js";
import { createGameData } from "../src/engine/game-data.js";
import { buildCharacter } from "../src/engine/model.js";
import { resolvePreset } from "../src/lib/preset-engine.js";
import { PRESETS } from "../src/lib/presets.js";
import { CURSE_TIERS } from "../src/lib/curse-tiers.js";
import { auditSellables, maxEquippable } from "../src/lib/sell-audit.js";
import { selfStacks, stackingFor, tierCoveredIsDead } from "../src/lib/stacking.js";
import { Color } from "../src/engine/game-data.js";

const gd = createGameData(
  JSON.parse(await readFile(new URL("../src/data/game-data.json", import.meta.url), "utf8")),
);

test("fixture save parses into slots with relics", async () => {
  const buf = await readFile(new URL("./fixtures-10slots.sl2", import.meta.url));
  const save = await parseSave(buf);
  assert.ok(save.slots.length > 0, "at least one character slot");
  const withRelics = save.slots.filter((s) => s.relics.length > 0);
  assert.ok(withRelics.length > 0, "at least one slot has relics");
  for (const slot of withRelics) {
    const character = buildCharacter(slot, gd);
    for (const relic of character.relics) {
      assert.ok(relic.effects.length >= 1 && relic.effects.length <= 4);
      for (const [effect] of relic.effects) assert.ok(effect.name.length > 0);
    }
  }
});

test("every preset slug exists in the game data", () => {
  const slugs = new Set(gd.effectsByKey.filter(Boolean).map((e) => e.slug));
  for (const preset of PRESETS) {
    const allGoals = [...preset.goals, ...Object.values(preset.characterGoals ?? {}).flat()];
    for (const goal of allGoals) {
      assert.ok(slugs.has(goal.slug), `${preset.id}: unknown slug ${goal.slug}`);
      for (const alt of goal.alternatives ?? []) {
        assert.ok(slugs.has(alt), `${preset.id}: unknown alternative ${alt} for ${goal.slug}`);
      }
    }
    for (const [nfId, goals] of Object.entries(preset.characterGoals ?? {})) {
      for (const goal of goals) {
        const effect = gd.effectsByKey.find((e) => e?.slug === goal.slug);
        // A character goal is either that nightfarer's own effect or a generic one
        // they particularly want — never another character's effect.
        assert.ok(
          effect.nightfarer === undefined || effect.nightfarer === Number(nfId),
          `${preset.id}: ${goal.slug} belongs to a different Nightfarer than ${nfId}`,
        );
      }
    }
    if (preset.nightfarers) {
      for (const id of preset.nightfarers) assert.ok(id >= 0 && id <= 9, `${preset.id}: bad nightfarer id ${id}`);
    }
  }
});

test("every preset effect is obtainable (seen on real relics), not datamined-only", async () => {
  const obtainable = JSON.parse(
    await readFile(new URL("../src/data/obtainable-effects.json", import.meta.url), "utf8"),
  );
  const keys = new Set(obtainable.keys);
  const bySlug = new Map(gd.effectsByKey.filter(Boolean).map((e) => [e.slug, e]));
  for (const preset of PRESETS) {
    const goals = [...preset.goals, ...Object.values(preset.characterGoals ?? {}).flat()];
    for (const goal of goals) {
      if (goal.max === 0) continue; // exclusions ban curses; obtainability is moot
      for (const slug of [goal.slug, ...(goal.alternatives ?? [])]) {
        assert.ok(keys.has(bySlug.get(slug).key), `${preset.id}: ${slug} never rolls on relics`);
      }
    }
  }
});

test("every Nightlord counter goal exists and is obtainable", async () => {
  const { NIGHTLORDS } = await import("../src/lib/nightlords.js");
  const obtainable = JSON.parse(
    await readFile(new URL("../src/data/obtainable-effects.json", import.meta.url), "utf8"),
  );
  const keys = new Set(obtainable.keys);
  const bySlug = new Map(gd.effectsByKey.filter(Boolean).map((e) => [e.slug, e]));
  assert.equal(NIGHTLORDS.length, 8, "all eight Nightlords covered");
  for (const nl of NIGHTLORDS) {
    assert.ok(nl.goals.length > 0 && nl.warn && nl.research, `${nl.id} has goals, warning and research`);
    for (const goal of nl.goals) {
      for (const slug of [goal.slug, ...(goal.alternatives ?? [])]) {
        const effect = bySlug.get(slug);
        assert.ok(effect, `${nl.id}: unknown slug ${slug}`);
        assert.ok(keys.has(effect.key), `${nl.id}: ${slug} never rolls on relics`);
      }
    }
  }
});

test("sell audit respects researched stacking and equip caps", () => {
  const stacking = gd.effectsByKey.find((e) => e && selfStacks(e) && e.type !== 1);
  const nonStacking = gd.effectsByKey.find((e) => e && !selfStacks(e) && e.type !== 1 && e.level === undefined);
  const extra = gd.effectsByKey.find((e) => e && !selfStacks(e) && e.type !== 1 && e !== nonStacking && e.level === undefined);
  const mk = (effects, over = {}) => ({
    sellable: true,
    color: Color.Red,
    isDeep: false,
    effects: effects.map((e) => [e]),
    coordinatesByColor: [0, 0],
    ...over,
  });

  // Mono-color grails exist, so 3 same-color slots fit in a half.
  assert.equal(maxEquippable(gd, Color.Red, false), 3);
  assert.equal(maxEquippable(gd, Color.Red, true), 3);

  // 5 identical stacking relics: keep 3 (the cap), sell 2.
  const stackCopies = [1, 2, 3, 4, 5].map((i) => mk([stacking], { uid: `s${i}` }));
  let { safe, stackKeep } = auditSellables(gd, stackCopies);
  assert.equal(safe.length, 2);
  assert.ok(safe.every((s) => s.kind === "surplus" && s.keep === 3));

  // 3 identical non-stacking relics: only 1 is useful, sell 2.
  const dupes = [1, 2, 3].map((i) => mk([nonStacking], { uid: `d${i}` }));
  ({ safe } = auditSellables(gd, dupes));
  assert.equal(safe.length, 2);

  // Non-stacking relic exactly covered by a better one: dead weight, safe.
  const better = mk([nonStacking, extra], { uid: "b" });
  const worse = mk([nonStacking], { uid: "w", redundant: { relic: better, outclassed: true } });
  ({ safe, stackKeep } = auditSellables(gd, [better, worse]));
  assert.equal(safe.length, 1);
  assert.equal(safe[0].kind, "covered");

  // Stacking relic covered by a better one: equipping both still adds — keep.
  const betterS = mk([stacking, extra], { uid: "bs" });
  const worseS = mk([stacking], { uid: "ws", redundant: { relic: betterS, outclassed: true } });
  ({ safe, stackKeep } = auditSellables(gd, [betterS, worseS]));
  assert.equal(safe.length, 0);
  assert.equal(stackKeep.length, 1);

  // Lower tier of an "only one counts" family, covered by its higher tier: dead
  // weight. As of 2026-10 no tiered family has this behavior (no/first/highest
  // apply only to non-tiered variants), so this runs only if the data gains one.
  const deadLow = gd.effectsByKey.find(
    (e) => e && e.type !== 1 && e.group !== undefined && tierCoveredIsDead(e) &&
      gd.effectsByKey.some((h) => h && h.group === e.group && h.level > e.level),
  );
  if (deadLow) {
    const high = gd.effectsByKey.find((h) => h && h.group === deadLow.group && h.level > deadLow.level);
    const betterT = mk([high, extra], { uid: "bt" });
    const worseT = mk([deadLow], { uid: "wt", redundant: { relic: betterT, outclassed: true } });
    ({ safe, stackKeep } = auditSellables(gd, [betterT, worseT]));
    assert.equal(safe.length, 1);
    assert.equal(safe[0].kind, "covered");
  }

  // Lower tier of a "tiers stack with each other" family: kept.
  const withAllLow = gd.effectsByKey.find(
    (e) => e && e.type !== 1 && e.group !== undefined && !selfStacks(e) &&
      stackingFor(e).other === "withAll" &&
      gd.effectsByKey.some((h) => h && h.group === e.group && h.level > e.level),
  );
  assert.ok(withAllLow, "data has a tiers-stack family with multiple tiers");
  const high2 = gd.effectsByKey.find((h) => h && h.group === withAllLow.group && h.level > withAllLow.level);
  const betterW = mk([high2, extra], { uid: "bw" });
  const worseW = mk([withAllLow], { uid: "ww", redundant: { relic: betterW, outclassed: true } });
  ({ safe, stackKeep } = auditSellables(gd, [betterW, worseW]));
  assert.equal(safe.length, 0);
  assert.equal(stackKeep.length, 1);
});

test("weakness table rows are well-formed and consistent with nightlords", async () => {
  const { WEAKNESS_ROWS, DAMAGE_TYPES, STATUS_TYPES } = await import("../src/lib/guides-data.js");
  const { NIGHTLORDS } = await import("../src/lib/nightlords.js");
  const ids = new Set(NIGHTLORDS.map((n) => n.id));
  assert.equal(WEAKNESS_ROWS.length, 10, "8 bosses incl. two Gnoster forms and two Heolstor phases");
  for (const row of WEAKNESS_ROWS) {
    assert.equal(row.dmg.length, DAMAGE_TYPES.length, `${row.boss}: one modifier per damage type`);
    assert.equal(row.status.length, STATUS_TYPES.length, `${row.boss}: one threshold per status`);
    assert.ok(ids.has(row.nightlordId), `${row.boss}: links to a real Nightlord entry`);
    for (const v of row.status) assert.ok(v === null || [154, 252, 541].includes(v), `${row.boss}: known threshold`);
  }
  // Every Nightlord's counter research should agree with the table: its rows
  // must contain at least one positive (bonus-damage) modifier or a low status
  // threshold, except Adel whose counter is status-only.
  for (const nl of NIGHTLORDS) {
    const rows = WEAKNESS_ROWS.filter((r) => r.nightlordId === nl.id);
    assert.ok(rows.length > 0, `${nl.id} appears in the table`);
    assert.ok(
      rows.some((r) => r.dmg.some((v) => v > 0) || r.status.some((v) => v === 154)),
      `${nl.id} has an exploitable weakness in the table`,
    );
  }
});

test("stat totals parse the community value strings", async () => {
  const { loadoutTotals } = await import("../src/lib/stat-totals.js");
  const bySlug = new Map(gd.effectsByKey.filter(Boolean).map((e) => [e.slug, e]));
  const relic = (...slugs) => ({ effects: slugs.map((s) => [bySlug.get(s)]) });
  const out = loadoutTotals([
    relic("physicalAttackUp", "physicalAttackUpPlus1"), // 1.04 × 1.05 (self-stacks)
    relic("magicDamageNegationUp", "improvedCriticalHits"),
    relic("continuousHpRecovery"),
  ]);
  const chip = (label) => out.chips.find((c) => c.label === label);
  assert.ok(Math.abs(parseFloat(chip("Phys").value.slice(1)) - 1.04 * 1.05) < 1e-6, "phys multipliers multiply");
  assert.equal(chip("Elem neg").value, "10%", "equal elemental negations collapse into one chip");
  assert.equal(chip("HP regen").value, "2/s");
  assert.ok(out.counted >= 4 && out.total === 5, "counted/total tracked");
});

test("checklist share links round-trip", async () => {
  const { encodeChecklist, decodeChecklist, buildChecklistPayload } = await import("../src/lib/share.js");
  const payload = buildChecklistPayload({
    vesselName: "Wylder’s Chalice",
    score: "13.1",
    isDeep: true,
    relics: [
      {
        name: "Grand Scène Lumineuse ✦",
        color: 1,
        isDeep: false,
        coordinatesByColor: [25, 0],
        effects: [[{ name: "Physical Attack Up", type: 0 }, { name: "Reduced Vigor", type: 1 }]],
      },
      null,
    ],
  });
  const decoded = decodeChecklist(encodeChecklist(payload));
  assert.deepEqual(decoded, payload, "unicode-safe round trip");
  assert.equal(decoded.r[0].l[0], 26, "locations are 1-based");
  assert.ok(decoded.r[0].e[1].startsWith("✦"), "curses are marked");
  assert.equal(decodeChecklist("not-base64!!"), null, "garbage decodes to null, not a crash");

  // Pre-compression links (plain base64 JSON) must keep working.
  const legacy = Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  assert.deepEqual(decodeChecklist(legacy), payload, "legacy uncompressed links still decode");
  assert.ok(
    encodeChecklist(payload).length < legacy.length,
    "compressed links are shorter than legacy ones",
  );
});

test("build share links round-trip through slugs", async () => {
  const { buildSharePayload, encodeBuild, decodeBuild } = await import("../src/lib/share.js");
  const effects = gd.effectsByKey.filter((e) => e?.slug).slice(0, 3);
  const goals = effects.map((e, i) => ({ effectKey: e.key, min: i, max: 10, priority: "high" }));
  const payload = buildSharePayload({
    name: "Test build",
    nightfarer: 4,
    mode: "deep",
    cursePenalty: "strong",
    nightlordId: "caligo",
    goals,
    gd,
  });
  const decoded = decodeBuild(encodeBuild(payload));
  assert.equal(decoded.n, "Test build");
  assert.equal(decoded.f, 4);
  assert.equal(decoded.nl, "caligo");
  assert.equal(decoded.g.length, 3, "all goals carried");
  for (const [i, g] of decoded.g.entries()) {
    const e = gd.effectsByKey.find((x) => x?.slug === g.s);
    assert.ok(e, `slug ${g.s} resolves back to an effect`);
    assert.equal(e.key, goals[i].effectKey);
  }
  assert.equal(decodeBuild(encodeBuild({ t: "nope" })), null, "non-build payloads rejected");
});

test("shifting earth guide entries are complete", async () => {
  const { SHIFTING_EARTH } = await import("../src/lib/guides-data.js");
  assert.equal(SHIFTING_EARTH.length, 4, "all four events");
  for (const se of SHIFTING_EARTH) {
    for (const field of ["name", "where", "terrain", "boss", "reward", "hazard"]) {
      assert.ok(typeof se[field] === "string" && se[field].length > 5, `${se.name ?? "?"} has ${field}`);
    }
    assert.ok(Array.isArray(se.tips) && se.tips.length >= 2, `${se.name} has tips`);
  }
});

test("curse tiers cover every debuff effect, and only debuffs", () => {
  const debuffs = gd.effectsByKey.filter((e) => e?.type === 1);
  const tiered = new Set(Object.keys(CURSE_TIERS));
  for (const curse of debuffs) {
    assert.ok(tiered.has(curse.slug), `debuff ${curse.slug} has no tier`);
  }
  for (const slug of tiered) {
    const effect = gd.effectsByKey.find((e) => e?.slug === slug);
    assert.ok(effect, `tiered slug ${slug} does not exist`);
    assert.equal(effect.type, 1, `tiered slug ${slug} is not a debuff`);
  }
});

test("effect-notes keys all map to known effects", async () => {
  const notes = JSON.parse(await readFile(new URL("../src/data/effect-notes.json", import.meta.url), "utf8"));
  const keys = Object.keys(notes).map(Number);
  assert.ok(keys.length > 400, "notes cover a substantial effect set");
  for (const k of keys) {
    assert.ok(gd.effectByKey(k), `note key ${k} has no effect`);
  }
});

test("resolvePreset reports ok/swapped/missing against the fixture inventory", async () => {
  const buf = await readFile(new URL("./fixtures-10slots.sl2", import.meta.url));
  const save = await parseSave(buf);
  const slot = save.slots.reduce((a, b) => (b.relics.length > (a?.relics.length ?? -1) ? b : a), null);
  const character = buildCharacter(slot, gd);
  const relics = character.relics.filter((r) => !r.isDeep);
  const deep = character.relics.filter((r) => r.isDeep);
  for (const preset of PRESETS) {
    const { entries, report } = resolvePreset(preset, gd, relics, deep, "deep", 0);
    assert.equal(report.length, preset.goals.length + (preset.characterGoals?.[0]?.length ?? 0));
    for (const entry of entries) {
      assert.ok(entry.effect, "entry has an interned effect");
      assert.ok(entry.minStacks <= entry.maxStacks);
    }
    const statuses = new Set(report.map((r) => r.status));
    for (const s of statuses) assert.ok(["ok", "swapped", "missing", "excluded"].includes(s));
  }
});
