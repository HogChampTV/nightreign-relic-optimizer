// Aggregate numeric stat totals for a loadout, parsed from the community
// effect-value strings (effect-notes.json). Only unconditional, always-on
// values are folded into the totals; anything situational ("for 20 seconds",
// "when below max HP", …) is counted separately so the numbers stay honest.
import { effectNote } from "./effect-notes.js";
import { selfStacks } from "./stacking.js";

const CONDITIONAL =
  /\bfor \d+|\bwhen\b|\bwhile\b|\bafter\b|\bupon\b|\bif\b|\bduring\b|\bat (?:the )?start|\beach\b|\bper\b|\bbelow\b|\babove\b|\bnear\b|\bfollowing\b|\buntil\b|\bvs\.?\b|\bagainst\b/i;
const REDUCING = /^(?:decreases?|reduces?|lowers?)/i;

const DMG_LABELS = {
  "": "Dmg",
  physical: "Phys",
  magic: "Magic",
  fire: "Fire",
  lightning: "Ltng",
  holy: "Holy",
  "critical hit": "Crit",
};

/**
 * @param relics array of relic objects (null entries allowed)
 * @returns { chips: [{label, value, title}], counted, situational, total }
 */
export function loadoutTotals(relics) {
  const dmgMult = {}; // typeKey -> multiplier product
  const negPct = {}; // typeKey -> stacked negation fraction
  const resMult = {}; // HP/FP/stamina -> multiplier product
  const attrs = {}; // vigor/mind/... -> flat sum
  const regen = {}; // HP/FP -> per-second sum
  let counted = 0;
  let situational = 0;
  let total = 0;
  const seen = new Set(); // non-stacking effects only apply once in-game

  for (const relic of relics) {
    if (!relic) continue;
    for (const pair of relic.effects) {
      for (const effect of pair) {
        if (!effect) continue;
        total += 1;
        if (seen.has(effect.key) && !selfStacks(effect)) continue; // wasted duplicate
        seen.add(effect.key);
        const v = effectNote(effect)?.v;
        if (!v) continue;
        if (CONDITIONAL.test(v)) {
          situational += 1;
          continue;
        }
        let used = false;
        const sign = REDUCING.test(v.trim()) ? -1 : 1;

        // "Increases physical damage by 1.04x", "Increases damage by 1.1x",
        // "Increases critical hit damage by 1.18x"
        for (const m of v.matchAll(
          /(?:^|and |, )(?:increases?|decreases?|reduces?|lowers?)?\s*((?:physical|magic|fire|lightning|holy|critical hit)?)\s*damage(?! negation| taken)\s*(?:dealt\s*)?by ([\d.]+)x/gi,
        )) {
          const type = m[1].toLowerCase();
          let x = parseFloat(m[2]);
          if (sign < 0 && x > 1) x = 1 / x;
          dmgMult[type] = (dmgMult[type] ?? 1) * x;
          used = true;
        }

        // "Increases physical damage negation by 10.5%",
        // "Increases magic/fire/lightning/holy damage negation by 10%"
        for (const m of v.matchAll(/(?:increases?|decreases?|reduces?|lowers?)\s+([\w/ ]*?)\s*damage negation by ([\d.]+)%/gi)) {
          const types = (m[1].trim() || "all").split("/").map((t) => t.trim().toLowerCase());
          const p = (sign * parseFloat(m[2])) / 100;
          for (const t of types) negPct[t] = 1 - (1 - (negPct[t] ?? 0)) * (1 - p);
          used = true;
        }

        // "Increases maximum HP by 1.1x"
        for (const m of v.matchAll(/max(?:imum)? (HP|FP|stamina) by ([\d.]+)x/gi)) {
          let x = parseFloat(m[2]);
          if (sign < 0 && x > 1) x = 1 / x;
          const k = m[1] === "stamina" ? "Stam" : m[1];
          resMult[k] = (resMult[k] ?? 1) * x;
          used = true;
        }

        // "Increases vigor by 10"
        for (const m of v.matchAll(/(vigor|mind|endurance|strength|dexterity|intelligence|faith|arcane) by (\d+)/gi)) {
          const k = m[1].toLowerCase();
          attrs[k] = (attrs[k] ?? 0) + sign * parseInt(m[2], 10);
          used = true;
        }

        // "Recovers 2 HP/s"
        for (const m of v.matchAll(/Recovers ([\d.]+) (HP|FP)\/s/gi)) {
          regen[m[2]] = (regen[m[2]] ?? 0) + parseFloat(m[1]);
          used = true;
        }

        if (used) counted += 1;
      }
    }
  }

  const chips = [];
  const fmtX = (x) => `×${(Math.round(x * 1000) / 1000).toString()}`;
  for (const [type, x] of Object.entries(dmgMult)) {
    if (Math.abs(x - 1) < 1e-9) continue;
    chips.push({ label: DMG_LABELS[type] ?? type, value: fmtX(x), title: `${type || "all"} damage dealt (copies multiply)` });
  }
  // All four elemental negations equal → one "Elem neg" chip.
  const ELEM = ["magic", "fire", "lightning", "holy"];
  if (ELEM.every((t) => negPct[t] != null && Math.abs(negPct[t] - negPct.magic) < 1e-9)) {
    negPct.elemental = negPct.magic;
    for (const t of ELEM) delete negPct[t];
  }
  for (const [type, p] of Object.entries(negPct)) {
    if (Math.abs(p) < 1e-9) continue;
    const label = type === "all" ? "Neg" : type === "elemental" ? "Elem neg" : `${DMG_LABELS[type] ?? type} neg`;
    chips.push({ label, value: `${Math.round(p * 1000) / 10}%`, title: `${type} damage negation (stacks multiplicatively)` });
  }
  for (const [k, x] of Object.entries(resMult)) {
    if (Math.abs(x - 1) < 1e-9) continue;
    chips.push({ label: `Max ${k}`, value: fmtX(x), title: `maximum ${k}` });
  }
  for (const [k, n] of Object.entries(attrs)) {
    if (!n) continue;
    chips.push({ label: k[0].toUpperCase() + k.slice(1), value: `${n > 0 ? "+" : ""}${n}`, title: `${k} attribute points` });
  }
  for (const [k, n] of Object.entries(regen)) {
    if (!n) continue;
    chips.push({ label: `${k} regen`, value: `${Math.round(n * 10) / 10}/s`, title: `continuous ${k} recovery` });
  }

  return { chips, counted, situational, total };
}
