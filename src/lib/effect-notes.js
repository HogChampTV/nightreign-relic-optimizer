// Numeric values and mechanical notes per effect, from the community
// "Nightreign Useful Info" sheet (via tijmen/nightreign-relic-optimizer, MIT).
import notes from "../data/effect-notes.json" with { type: "json" };
import { curseTier, TIER_LABELS } from "./curse-tiers.js";
import { stackingLabel } from "./stacking.js";

export const effectNote = (effect) => (effect ? notes[effect.key] : undefined);

/** One-line tooltip: "Increases physical damage by 1.04x — <community note> — Stacking: …". */
export function effectTooltip(effect) {
  const n = effectNote(effect);
  const tier = curseTier(effect);
  const parts = [n?.v, n?.n].filter(Boolean);
  if (tier) parts.push(`${TIER_LABELS[tier.tier]}: ${tier.note}`);
  parts.push(`Stacking: ${stackingLabel(effect)}`);
  return parts.join(" — ");
}
