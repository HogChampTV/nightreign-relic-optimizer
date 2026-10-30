// Community-consensus curse tiers for Deep relic curses, researched 2026-10 from
// Steam discussions ("Best curses to take on relics?", "Which Depth Relics to Keep
// and Sell?"), r/Nightreign threads (incl. the 1.3K-vote "Which Demerit is Worst?"
// poll), the community DoN guide (sites.google.com/view/nightreign-guide-9999) and
// the aoeah curse value sheet.
//
// Tiers: "never" = run-killing, reject builds carrying it when the toggle is on;
// "painful" = manageable one copy at a time; "free" = basically acceptable;
// "unknown" = no community consensus (several are datamined/cut content).

export const CURSE_TIERS = {
  // ---- Tier A: run-killing / never accept ----
  allResistancesDown: { tier: "never", note: "−80 all resistances, stacks, lethal vs status-heavy Nightlords; the most-named never-take" },
  takingDamageCausesDeathBuildup: { tier: "never", note: "Deathblight has no partial penalty — enough chip hits is instant death" },
  continuousHPLoss: { tier: "never", note: "Voted worst demerit in a 1.3K-vote poll: never at full HP, disables at-max-HP bonuses (some keep it with Continuous HP Recovery)" },
  nearDeathReducesMaxHP: { tier: "never", note: "0.75× max HP for 60s per down — snowballs; 'instant sell' is the common verdict" },
  nearDeathReducesArtGauge: { tier: "never", note: "Deletes the res-and-recover ult play after a down; 'absolute no' on revive ults (ok on Recluse)" },

  // ---- Tier B: painful but manageable ----
  reducedVigor: { tier: "painful", note: "≈ −60 HP; crosses one-shot survival thresholds" },
  reducedVigorAndArcane: { tier: "painful", note: "The one stat pair players respect: −60 HP plus universally-useful Arcane" },
  ultimateArtChargingImpaired: { tier: "painful", note: "0.85× charge; avoid on ult-dependent characters (Wylder, Ironeye, Executor, Guardian, Revenant)" },
  moreDamageTakenAfterEvasion: { tier: "painful", note: "−45% negation around the roll; brutal for panic-rollers, fine for spacing/block players" },
  repeatedEvasionsLowerDamageNegation: { tier: "painful", note: "−23/−35% for 15s; disciplined dodgers barely notice it" },
  takingDamageCausesMadnessBuildup: { tier: "painful", note: "Worst non-death status variant (FP wipe + stun); never stack two of the same status" },
  takingDamageCausesSleepBuildup: { tier: "painful", note: "Misery on fragile ranged characters; never stack two of the same status" },
  takingDamageCausesFrostBuildup: { tier: "painful", note: "Manageable one copy; multi-hit bosses make it spike" },
  takingDamageCausesBloodLossBuildup: { tier: "painful", note: "Manageable one copy; multi-hit bosses make it spike" },
  poisonBuildupWhenBelowMaxHP: { tier: "painful", note: "Bad on casters/ranged who sit below max HP (deliberate synergy in dreg-Raider builds)" },
  rotBuildupWhenBelowMaxHP: { tier: "painful", note: "Worse than the poison version: rot lasts longer and cuts negation" },
  reducedRuneAcquisition: { tier: "painful", note: "0.9× runes; polarizing — painful day 1, manageable for efficient farmers" },
  attacksImpairedOnOccasion: { tier: "painful", note: "Random whiffs, can eat your ultimate; 'horrible but rarely a deal breaker'" },
  lowerStaminaImpairsDmgNegation: { tier: "painful", note: "Split verdict; notably worse on Guardian and Raider (blocking drains stamina)" },
  damageIncreasedByNightsEncroachment: { tier: "painful", note: "ALL damage taken rises as the day's circle closes — the strictly worse twin of the tide curse" },
  ailmentsCauseIncreasedDamage: { tier: "painful", note: "Boss-dependent: drop it vs status-spam Nightlords" },

  // ---- Tier C: basically free ----
  reducedStrengthAndIntelligence: { tier: "free", note: "−3 each (~3% damage); free when off-build — just don't stack several on your main stat" },
  reducedFaithAndStrength: { tier: "free", note: "−3 each; free when off-build" },
  reducedIntelligenceAndDexterity: { tier: "free", note: "−3 each; free when off-build" },
  reducedDexterityAndFaith: { tier: "free", note: "−3 each; free when off-build" },
  reducedFlaskHPRestoration: { tier: "free", note: "Flask heals 51% instead of 60% — 'a complete non issue'" },
  reducedDamageNegationForFlaskUsages: { tier: "free", note: "'Kind of a freebie' — just don't face-chug; riskier solo" },
  lowerAttackWhenBelowMaxHP: { tier: "free", note: "0.915× below 85% HP; at high depths you're either at max HP or dead" },
  impairedAffinityDamageNegation: { tier: "free", note: "'Very very minor'; red Balancer builds actively want it" },
  nightsTideDamageIncreased: { tier: "free", note: "Only the closing rain's own damage — free if you never fight in the tide (drop it for tide battles)" },
  takingDamageCausesPoisonBuildup: { tier: "free", note: "Can't burst you; synergizes with Executor's passive and vicinity attack-power relics" },
  takingDamageCausesRotBuildup: { tier: "free", note: "Slow damage only; synergizes with dreg builds (worse than poison, still acceptable)" },

  // ---- No community consensus (several are datamined/cut content) ----
  sleepBuildupForFlaskUsages: { tier: "unknown", note: "Likely cut content per Oct 2026 datamine; no live discussion" },
  madnessBuildupForFlaskUsages: { tier: "unknown", note: "Likely cut content per Oct 2026 datamine; no live discussion" },
  maxHPReducesAttackPower: { tier: "unknown", note: "Likely cut content per Oct 2026 datamine" },
  nearDeathSpillsFlask: { tier: "unknown", note: "Likely cut content per Oct 2026 datamine" },
  surgeSprintingDrainsMoreStamina: { tier: "unknown", note: "Likely cut content per Oct 2026 datamine" },
  increasedDrainOnStaminaForEvasion: { tier: "unknown", note: "Likely cut content per Oct 2026 datamine" },
  reducedEndurance: { tier: "unknown", note: "No community verdict found" },
  reducedMaximumHP: { tier: "unknown", note: "No clear consensus; thread titles suggest it's hated in Deep of Night" },
  reducedMaximumFP: { tier: "unknown", note: "No consensus; plausibly near-free on no-FP characters, bad on casters" },
  reducedMaximumStamina: { tier: "unknown", note: "No community verdict found" },
  slowerArtGaugeWhenBelowMaxHP: { tier: "unknown", note: "No dedicated verdicts; probably mid-tier by analogy with other below-max-HP curses" },
};

export const TIER_LABELS = {
  never: "⛔ run-killing (community consensus)",
  painful: "⚠ painful but manageable",
  free: "✓ basically free",
  unknown: "? no community consensus",
};

export const curseTier = (effect) => (effect?.slug ? CURSE_TIERS[effect.slug] : undefined);

/** Slugs of the tier-A curses, used to auto-reject builds carrying them. */
export const RUN_KILLER_SLUGS = Object.entries(CURSE_TIERS)
  .filter(([, v]) => v.tier === "never")
  .map(([slug]) => slug);
