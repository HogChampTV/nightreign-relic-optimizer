// Researched per-effect stacking behavior (see scripts/build-stacking.mjs):
//   self:  does a second copy of this exact effect do anything?
//   other: for non-self-stacking effects, behavior across tiers/variants —
//          "withAll" (stacks with other tiers), "no"/"first"/"highest" (only
//          one of the family counts), "notExisting" (no other tier exists),
//          "custom"/"tbd"/undefined (unverified).
import data from "../data/stacking.json" with { type: "json" };

const TABLE = data.effects;

export function stackingFor(effect) {
  return TABLE[effect.key] ?? { self: effect.stacks === true };
}

export const selfStacks = (effect) => stackingFor(effect).self === true;

/** True when equipping this effect alongside a HIGHER TIER of its family is proven worthless. */
export function tierCoveredIsDead(effect) {
  const { self, other } = stackingFor(effect);
  if (self) return false; // extra copies always add something
  return other === "no" || other === "first" || other === "highest";
}

/** Human-readable stacking summary, for tooltips/UI. */
export function stackingLabel(effect) {
  const { self, other } = stackingFor(effect);
  if (self) return "stacks with itself";
  switch (other) {
    case "withAll": return "doesn't stack with itself, but tiers stack with each other";
    case "no": return "doesn't stack at all — only one of this family counts";
    case "first": return "doesn't stack — only the first equipped counts";
    case "highest": return "doesn't stack — only the highest tier counts";
    case "notExisting": return "doesn't stack with itself";
    default: return "doesn't stack with itself (cross-tier behavior unverified)";
  }
}
