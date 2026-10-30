// Stacking-aware sell audit, grounded in researched per-effect stacking data
// (src/data/stacking.json: relics.pro compendium cross-checked against two
// community sheets — see scripts/build-stacking.mjs).
//
// "Another relic covers this one" is NOT enough to call a relic trash, because
// up to three same-color relics fit in one vessel half (mono-color grails exist)
// and many effects stack — with themselves, or across tiers.
//
// A relic is only a safe sell when selling it provably loses nothing:
//  - surplus copy: identical relics beyond the most same-color slots any vessel
//    half offers (or beyond 1 copy when nothing on it self-stacks) — among
//    identical copies the ones with the mildest curses are kept;
//  - dead weight: every effect is proven to add nothing next to the covering
//    relic — it doesn't self-stack and is covered at the exact same key, or its
//    family is researched as "only one tier counts".
// Everything else flagged by coverage goes to `stackKeep` with the reason.
import { Color } from "../engine/game-data.js";
import { curseTier } from "./curse-tiers.js";
import { selfStacks, tierCoveredIsDead, stackingLabel } from "./stacking.js";

const TIER_BADNESS = { free: 0, unknown: 1, painful: 2, never: 3 };

/** Most slots any vessel half (normal or deep) offers for relics of this color. */
export function maxEquippable(gd, color, isDeep) {
  let best = 0;
  const vessels = [...gd.anyoneVessels, ...gd.nightfarers.flatMap((nf) => nf.vessels)];
  for (const v of vessels) {
    const half = isDeep ? v.slots.slice(3) : v.slots.slice(0, 3);
    const n = half.filter((s) => s === Color.Any || s === color).length;
    if (n > best) best = n;
  }
  return best;
}

/** Worst curse tier on the relic: -1 none, 0 free … 3 run-killer. */
export function curseBadness(relic) {
  let worst = -1;
  for (const e of relic.effects.flat()) {
    if (e.type === 1) worst = Math.max(worst, TIER_BADNESS[curseTier(e)?.tier] ?? 1);
  }
  return worst;
}

const signature = (r) => `${r.isDeep}:${r.color}:${r.effects.map(([e]) => e.key).sort((a, b) => a - b).join(",")}`;

/**
 * Returns { safe, stackKeep }:
 *  safe: [{ relic, kind: "surplus"|"covered", keeper, copies?, keep? }]
 *  stackKeep: [{ relic, keeper, why }] — covered relics that still add value.
 */
export function auditSellables(gd, relics) {
  const safe = [];
  const stackKeep = [];
  const handled = new Set();

  // 1) Identical-copy groups: keep the equippable number, mildest curses first.
  const groups = new Map();
  for (const r of relics) {
    if (!r.sellable) continue;
    const sig = signature(r);
    if (!groups.has(sig)) groups.set(sig, []);
    groups.get(sig).push(r);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const anyStacks = group[0].effects.some(([e]) => selfStacks(e));
    const cap = anyStacks ? maxEquippable(gd, group[0].color, group[0].isDeep) : 1;
    for (const r of group) handled.add(r); // identical copies are decided here, not by coverage
    if (group.length <= cap) continue;
    const sorted = [...group].sort((a, b) => curseBadness(a) - curseBadness(b));
    for (const r of sorted.slice(cap)) {
      safe.push({ relic: r, kind: "surplus", keeper: sorted[0], copies: group.length, keep: cap });
    }
  }

  // 2) Relics covered by a different, better relic. Dead weight only when every
  //    effect provably adds nothing next to the keeper, per researched stacking.
  for (const r of relics) {
    if (!r.sellable || !r.redundant || handled.has(r)) continue;
    const better = r.redundant.relic;
    let blocker;
    for (const [e] of r.effects) {
      if (selfStacks(e)) {
        blocker = `“${e.name}” ${stackingLabel(e)} — a second copy still adds`;
        break;
      }
      const exact = better.effects.some(([be]) => be === e);
      if (!exact && !tierCoveredIsDead(e)) {
        blocker = `“${e.name}” ${stackingLabel(e)}`;
        break;
      }
    }
    if (!blocker) {
      safe.push({ relic: r, kind: "covered", keeper: better });
    } else {
      stackKeep.push({ relic: r, keeper: better, why: blocker });
    }
  }

  return { safe, stackKeep };
}
