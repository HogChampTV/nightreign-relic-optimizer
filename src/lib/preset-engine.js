// Turns a preset into optimizer goals against a specific inventory, reporting
// what the player is missing and which fallbacks were chosen instead.

import { relicEffectCount } from "../engine/game-data.js";

const bySlug = (gd) => {
  if (!gd._slugIndex) {
    const m = new Map();
    for (const e of gd.effectsByKey) if (e?.slug) m.set(e.slug, e);
    gd._slugIndex = m;
  }
  return gd._slugIndex;
};

/** Total stacks of `effect` the player owns across the relics usable in this mode. */
export function ownedStacks(effect, relics, deepRelics, mode) {
  const pools = mode === "deep" ? [relics, deepRelics] : [relics];
  let n = 0;
  for (const pool of pools) for (const r of pool) n += relicEffectCount(r, effect);
  return n;
}

/**
 * Resolves a preset against an inventory.
 * Returns { entries, report } where `entries` feed buildSearch's selectedEntries
 * (plus `effect` objects for selectedEffects) and `report` is per-goal:
 *   { goal, effect, status: "ok" | "swapped" | "missing" | "excluded",
 *     owned, replacedBy?, alternativesOwned? }
 */
export function resolvePreset(preset, gd, relics, deepRelics, mode, nightfarerId) {
  const slugs = bySlug(gd);
  const entries = [];
  const report = [];
  const goals = [...preset.goals, ...(preset.characterGoals?.[nightfarerId] ?? [])];

  for (const goal of goals) {
    const effect = slugs.get(goal.slug);
    if (!effect) {
      report.push({ goal, effect: null, status: "missing", owned: 0, note: "Unknown effect (game data version mismatch)" });
      continue;
    }
    // A hard exclusion (max 0) is applied regardless of inventory.
    if (goal.max === 0) {
      entries.push({ effect, minStacks: 0, maxStacks: 0, priority: goal.priority });
      report.push({ goal, effect, status: "excluded", owned: 0 });
      continue;
    }

    const owned = ownedStacks(effect, relics, deepRelics, mode);
    if (owned >= Math.max(goal.min, 1)) {
      entries.push({ effect, minStacks: goal.min, maxStacks: goal.max, priority: goal.priority });
      report.push({ goal, effect, status: "ok", owned });
      continue;
    }

    // Primary not owned (or below min): walk the fallback chain.
    let swapped = null;
    const alternativesOwned = [];
    for (const altSlug of goal.alternatives ?? []) {
      const alt = slugs.get(altSlug);
      if (!alt) continue;
      const altOwned = ownedStacks(alt, relics, deepRelics, mode);
      if (altOwned > 0) {
        alternativesOwned.push({ effect: alt, owned: altOwned });
        if (!swapped) swapped = { effect: alt, owned: altOwned };
      }
    }

    if (swapped) {
      entries.push({
        effect: swapped.effect,
        minStacks: Math.min(goal.min, swapped.owned),
        maxStacks: goal.max,
        priority: goal.priority,
      });
      report.push({ goal, effect, status: "swapped", owned, replacedBy: swapped.effect, alternativesOwned });
    } else if (owned > 0) {
      // Below min but partially owned: keep it, relaxed.
      entries.push({ effect, minStacks: Math.min(goal.min, owned), maxStacks: goal.max, priority: goal.priority });
      report.push({ goal, effect, status: "ok", owned, note: `Only ${owned} stack${owned === 1 ? "" : "s"} owned; requirement relaxed` });
    } else {
      report.push({ goal, effect, status: "missing", owned: 0 });
    }
  }

  return { entries, report };
}

/** How well a loadout (list of relics) satisfies each resolved entry. */
export function goalSatisfaction(entries, comboRelics) {
  return entries
    .filter((e) => e.maxStacks !== 0)
    .map((e) => {
      let stacks = 0;
      for (const r of comboRelics) if (r) stacks += relicEffectCount(r, e.effect);
      return { effect: e.effect, stacks, min: e.minStacks, met: stacks >= Math.max(e.minStacks, 1) };
    });
}
