// Per-Nightlord counter goals, layered on top of any preset when a target
// boss is picked. Researched from the Fextralife Nightreign wiki and
// eldenring.wiki.gg per-boss negation/status tables, cross-checked against
// Game8 and the Shacknews community weakness chart (current patch, 2026-10).
// Negation numbers cited in notes: negative = the boss takes bonus damage.
// Every slug here must exist in obtainable-effects (test-enforced) — same
// rule as presets.js.
//
// Deep of Night note: no source documents changed elemental weaknesses in
// Deep of Night or Everdark Sovereign variants (movesets and HP change, the
// weakness tables do not), so the same counters apply at depth.

const ELEM_NEG_ALTS = {
  fire: ["fireDamageNegationUp", "improvedFireDamageNegationPlus1", "improvedAffinityDamageNegation"],
  lightning: ["lightningDamageNegationUp", "improvedLightningDamageNegationPlus1", "improvedAffinityDamageNegation"],
  magic: ["magicDamageNegationUp", "improvedMagicDamageNegationPlus1", "improvedAffinityDamageNegation"],
  holy: ["holyDamageNegationUp", "improvedHolyDamageNegationPlus1", "improvedAffinityDamageNegation"],
};
const neg = (type, priority, note) => ({
  slug: ELEM_NEG_ALTS[type][0],
  min: 0,
  max: 10,
  priority,
  alternatives: ELEM_NEG_ALTS[type].slice(1),
  note,
});
const atk = (type, priority, note) => ({
  slug: `${type}AttackPowerUp`,
  min: 0,
  max: 10,
  priority,
  alternatives: ["improvedAffinityAttackPower"],
  note,
});

export const NIGHTLORDS = [
  {
    id: "gladius",
    name: "Gladius, Beast of Night",
    expedition: "Tricephalos",
    blurb: "Weak to holy (-35); resists fire (+50). Breathes fire.",
    warn: "Leave fire damage at home (+50 resist). Holy hits stagger him and apply an attack/defense debuff — strongest once he splits into three.",
    goals: [
      atk("holy", "high", "Holy -35, his defining weakness"),
      neg("fire", "high", "Fire breath, Volcanic Burst, flaming chain-sword"),
    ],
    research:
      "Holy -35 / Pierce -10, Fire +50: Fextralife + wiki.gg negation tables, Game8, Shacknews chart. Sleep is his lowest status threshold (154) if you run sleep weapons.",
  },
  {
    id: "adel",
    name: "Adel, Baron of Night",
    expedition: "Gaping Jaw",
    blurb: "No elemental weakness — poison him instead. Resists lightning (+50) and fire (+20).",
    warn: "No element does bonus damage; lightning and fire do LESS. Poison (154 threshold) interrupts his onslaught for a big punish window. His grab inflicts bleed on you.",
    goals: [
      {
        slug: "changesCompatibleArmamentsSkillToPoisonousMistAtStartOfExpedition",
        min: 0,
        max: 1,
        priority: "high",
        alternatives: [
          "changesCompatibleArmamentsSkillToPoisonMothFlightAtStartOfExpedition",
          "ironeyeArtChargeActivationAddsPoisonEffect",
        ],
        note: "Poisoning him forces the sludge-regurgitate punish window (phase 1 especially)",
      },
      { slug: "attackPowerUpWhenFacingPoisonAfflictedEnemy", min: 0, max: 10, priority: "normal", alternatives: [] },
      neg("lightning", "high", "Purple-lightning phase 2: leaps leave lightning fissures"),
      { slug: "improvedBloodLossResistance", min: 0, max: 10, priority: "low", alternatives: [], note: "His grab/bite inflicts blood loss" },
    ],
    research:
      "All-elements-neutral, Lightning +50 / Fire +20, Poison/Rot/Frost/Sleep at 154: Fextralife + wiki.gg tables (ignore news articles claiming a holy weakness — the tables say otherwise). Counts as a lesser dragon: anti-dragon effects bonus-damage him and break the grab.",
  },
  {
    id: "gnoster",
    name: "Gnoster, Wisdom of Night",
    expedition: "Sentient Pest",
    blurb: "Weak to fire (moth -40, scorpion -35); moth resists magic (+50). Inflicts parasite poison.",
    warn: "Fire keeps the moth burning ~15s. Its poison mist attaches a parasite (DoT for 2 minutes) — bring poison resistance or boluses. Blunt weapons favored on the scorpion.",
    goals: [
      atk("fire", "high", "Fire -40 (moth) / -35 (scorpion)"),
      { slug: "improvedPoisonResistance", min: 0, max: 10, priority: "normal", alternatives: [], note: "Parasite poison mist" },
      neg("magic", "normal", "Projectile volleys and the phase-2 beam are magic"),
    ],
    research:
      "Fire -40/-35, moth Magic +50, Rot/Bleed/Frost at 154: Fextralife + wiki.gg + Game8 + Shacknews. Physical secondaries disputed between sources (Strike vs Slash/Pierce) — fire is the agreed answer.",
  },
  {
    id: "maris",
    name: "Maris, Fathom of Night",
    expedition: "Augur",
    blurb: "Weak to lightning (-40); resists fire (+50). Inflicts sleep; immune to most statuses.",
    warn: "Status builds are dead here (immune to poison/bleed/sleep/madness). Lightning interrupts her Hypnosis channel. Kill the jellyfish swarms — it damages her.",
    goals: [
      atk("lightning", "high", "Lightning -40, her defining weakness"),
      { slug: "improvedSleepResistance", min: 0, max: 10, priority: "high", alternatives: [], note: "Hypnosis, Teardrop Explosions" },
      neg("magic", "normal", "Her ranged kit is magic"),
    ],
    research:
      "Lightning -40 / Slash -15, Fire +50, status immunities: Fextralife + wiki.gg + Game8 + Shacknews all agree. Stimulating Boluses from day 1-2 sleep camps are the consumable answer.",
  },
  {
    id: "libra",
    name: "Libra, Creature of Night",
    expedition: "Equilibrious Beast",
    blurb: "Weak to holy (-35) and fire (-20); madness procs send him berserk. Inflicts madness.",
    warn: "He deals holy and stacks madness on you (grab the yellow crystals to purge it). Proccing madness on HIM triggers a self-damaging frenzy — big damage, but stay clear of the explosion.",
    goals: [
      atk("holy", "high", "Holy -35 primary"),
      { slug: "improvedMadnessResistance", min: 0, max: 10, priority: "high", alternatives: [], note: "Fog, sigils and Frenzied Sky all build madness" },
      neg("holy", "normal", "Much of his damage is holy"),
    ],
    research:
      "Holy -35 / Fire -20 / Slash -10, Magic +20, Madness at 154 (Game8 calls frenzy THE weakness): Fextralife + wiki.gg tables. Break his meditation sigils fast.",
  },
  {
    id: "fulghor",
    name: "Fulghor, Champion of Nightglow",
    expedition: "Darkdrift Knight",
    blurb: "Weak only to lightning (-20); resists holy (+30). Mostly physical pressure.",
    warn: "Lightning staggers him and 1-2 hits interrupt the Golden Lance channel. Holy does less damage. Dodge INTO his charges. Poison/rot tick him down fine (low thresholds).",
    goals: [
      atk("lightning", "high", "His only elemental weakness (-20), and it interrupts Golden Lance"),
      neg("holy", "normal", "Golden Lance and phase-2 Crucible attacks are holy"),
      { slug: "improvedPhysicalDamageNegation", min: 0, max: 10, priority: "normal", alternatives: ["improvedDamageNegationAtLowHP"], note: "Relentless spear moveset" },
      {
        slug: "changesCompatibleArmamentsSkillToPoisonousMistAtStartOfExpedition",
        min: 0,
        max: 1,
        priority: "low",
        alternatives: ["changesCompatibleArmamentsSkillToPoisonMothFlightAtStartOfExpedition"],
        note: "All his status thresholds are low — DoTs stick",
      },
    ],
    research:
      "Lightning -20, Holy +30, statuses at 154 except madness: Fextralife + wiki.gg + Game8 + Shacknews (community disputes fire claims; the tables say lightning).",
  },
  {
    id: "caligo",
    name: "Caligo, Miasma of Night",
    expedition: "Fissure in the Fog",
    blurb: "Weak to fire (-35); resists every other element. Heavy frostbite pressure.",
    warn: "Fire or blunt — everything else is resisted. His breath, mines and shards stack frostbite, and each proc lowers your frost resist further. Counts as an Ancient Dragon (anti-dragon gear works; Mountaintop Shifting Earth gives the counter-buff).",
    goals: [
      atk("fire", "high", "Fire -35; a fire stagger applies a 30s defense debuff"),
      { slug: "improvedFrostResistance", min: 0, max: 10, priority: "high", alternatives: [], note: "Escalating frostbite buildup all fight" },
      neg("magic", "normal", "Freezing breath/beam counts as magic"),
    ],
    research:
      "Fire -35 / Strike -15, everything else +10..+20, Frost/Sleep useless on him (542): Fextralife + wiki.gg + Game8 + Shacknews.",
  },
  {
    id: "heolstor",
    name: "Heolstor the Nightlord",
    expedition: "Night Aspect",
    blurb: "Weak to holy in both phases (P1 -35, P2 -20, + lightning -20 in P2). Inflicts everything.",
    warn: "Only holy staggers him and applies his debuff. Status builds are dead (immune to poison/bleed/frost/madness, resist carries across phases). His sword imbue is random each cast — broad ailment resistance beats any single immunity. Three parries = critical.",
    goals: [
      atk("holy", "high", "The all-fight pick: P1 -35, P2 -20, and the only stagger element"),
      {
        slug: "improvedAffinityDamageNegation",
        min: 0,
        max: 10,
        priority: "normal",
        alternatives: ["holyDamageNegationUp", "lightningDamageNegationUp", "fireDamageNegationUp", "magicDamageNegationUp"],
        note: "He deals magic, fire, lightning and holy across the fight",
      },
      { slug: "improvedSleepResistance", min: 0, max: 10, priority: "low", alternatives: [], note: "Random sleep imbue + phase-2 sleep" },
      { slug: "improvedMadnessResistance", min: 0, max: 10, priority: "low", alternatives: [], note: "Random madness imbue + phase-2 madness" },
    ],
    research:
      "P1 Holy -35/Fire -20/Slash -15, P2 Holy -20/Lightning -20/Pierce -15, status immunities with cross-phase carryover: Fextralife + wiki.gg Heolstor tables (post-Forsaken Hollows), Game8, Shacknews.",
  },
];

export const nightlordById = (id) => NIGHTLORDS.find((n) => n.id === id) ?? null;
