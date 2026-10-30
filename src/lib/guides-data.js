// In-expedition reference guides (Guides tab).
//
// Weakness table: community-datamined per-boss damage modifiers and status
// buildup thresholds, matching the circulating community weakness chart and
// the Fextralife / wiki.gg negation tables. dmg values are percent damage
// dealt vs that type (+ = boss takes bonus damage, - = resisted). Status
// values are buildup thresholds (lower = easier to proc; null = immune).

export const DAMAGE_TYPES = ["Standard", "Slash", "Strike", "Pierce", "Magic", "Fire", "Lightning", "Holy"];
export const STATUS_TYPES = ["Poison", "Rot", "Bleed", "Frostbite", "Sleep", "Madness"];

export const WEAKNESS_ROWS = [
  { expedition: "Tricephalos", boss: "Gladius", nightlordId: "gladius", dmg: [0, 0, 0, 10, 0, -50, 0, 35], status: [541, 252, 252, 541, 154, null] },
  { expedition: "Gaping Jaw", boss: "Adel", nightlordId: "adel", dmg: [0, 0, 0, 0, 0, -20, -50, 0], status: [154, 154, 541, 154, 154, null] },
  { expedition: "Sentient Pest", boss: "Gnoster (Moth)", nightlordId: "gnoster", dmg: [15, 25, 15, 25, -50, 40, -10, -10], status: [541, 154, 154, 154, 541, null] },
  { expedition: "Sentient Pest", boss: "Gnoster (Scorpion)", nightlordId: "gnoster", dmg: [-10, -20, 20, 10, -10, 35, -10, -10], status: [252, 154, 154, 154, 154, null] },
  { expedition: "Augur", boss: "Maris", nightlordId: "maris", dmg: [0, 15, -20, -10, -20, -50, 40, -15], status: [null, 252, null, 252, null, null] },
  { expedition: "Equilibrious Beast", boss: "Libra", nightlordId: "libra", dmg: [0, 10, 0, 0, -20, 20, 0, 35], status: [154, 154, 252, 252, null, 154] },
  { expedition: "Darkdrift Knight", boss: "Fulghor", nightlordId: "fulghor", dmg: [0, 0, 0, 0, 0, 0, 20, -30], status: [154, 154, 154, 154, 154, null] },
  { expedition: "Fissure in the Fog", boss: "Caligo", nightlordId: "caligo", dmg: [0, -15, 15, -10, -20, 35, -20, -20], status: [252, 252, 252, 541, 541, null] },
  { expedition: "Night Aspect", boss: "Heolstor — Phase 1", nightlordId: "heolstor", dmg: [0, 15, -10, 10, 0, 20, 0, 35], status: [null, 252, null, null, 541, null] },
  { expedition: "Night Aspect", boss: "Heolstor — Phase 2", nightlordId: "heolstor", dmg: [0, -10, 10, 15, 0, 0, 20, 20], status: [null, 252, null, null, 541, null] },
];

// Sorcerer's Rise unlock routes: each Rise door is held by magic seals hidden
// around (and sometimes inside) the building. These are all the known spots,
// in an efficient search order. Ruined Towers (Shifting Earth) instead use
// three exploding seals.
export const RISE_GUIDE = {
  intro:
    "Rise doors are held shut by hidden magic seals — find and hit every seal and the door opens. The spots are always drawn from the same pool, so sweep them in this order:",
  sections: [
    {
      title: "1 · Explore outside, starting at the front",
      spots: [
        { name: "Seal above the door", hint: "Look up — a glowing sigil right over the entrance" },
        { name: "Imp statue / podium by the door", hint: "A readable statue or open-book podium near the entrance" },
        { name: "Fake building", hint: "A phantom structure nearby — hit it and it dissolves" },
        { name: "Windy trees", hint: "A tree gusting unnaturally; strike it" },
        { name: "Dead trees", hint: "A conspicuously dead/withered tree among healthy ones" },
        { name: "Reflection in a pool", hint: "The seal shows only as a reflection in nearby water" },
        { name: "Moving tree stump", hint: "A stump that shifts when you approach" },
      ],
    },
    {
      title: "2 · Door open (fog door)? Check inside",
      spots: [
        { name: "Unlit candle left of the door", hint: "A single cold candle just inside, left-hand side" },
        { name: "Missing statue, back-right wall", hint: "An empty pedestal in the back-right — hit the gap" },
      ],
    },
    {
      title: "Ruined Towers (Shifting Earth) — 3 exploding seals",
      note: "The crystal-covered towers use three volatile seals instead; they detonate when struck, so hit and step back. Extra spots:",
      spots: [
        { name: "Invisible, second floor above the pond", hint: "Stand on the second floor over the pond side and swing — it's unseeable" },
        { name: "Ground floor, around the back", hint: "Walk the tower's outer base, rear side" },
        { name: "Inside, opposite the second-floor door", hint: "From the second-floor doorway, look straight across" },
      ],
    },
  ],
  credit: "Route distilled from community guides (seal-spot pool is fixed; which spots roll varies per expedition).",
};

// Shifting Earth events: what each map takeover gives you and whether it's
// worth the detour. Researched from the wiki.gg Nightreign Shifting Earth page
// and Game8's per-event guides (cross-checked; Fextralife for names/affinities).
export const SHIFTING_EARTH = [
  {
    name: "The Crater",
    where: "North-central Limveld",
    terrain: "Volcanic crater with a lava pit; the route descends to a smithing altar at the bottom.",
    boss: "Fire Prelates (mandatory trio mid-descent), then a Magma Wyrm at the altar",
    reward:
      "Special Smithing Table: upgrade ONE weapon per run to Legendary rarity — whatever its current rarity — with its level requirement removed.",
    tips: [
      "Go day 2 after leveling; rush the bosses and skip the trash (and the Flaming Hand enemies).",
      "The Spectral Hawk exit also works as an escape before the Magma Wyrm — but leaving before using the table forfeits the upgrade.",
      "A church always spawns just west of the crater; optional bosses include a Falling-Star Beast and Valiant Gargoyle.",
    ],
    hazard: "Lava and heavy fire damage — fire-negation relics help.",
  },
  {
    name: "The Mountaintop",
    where: "Northern Limveld",
    terrain: "Snowy peaks linked by giant chain bridges, topped by a huge blue crystal.",
    boss: "No mandatory boss — the Mountaintop Ice Dragon is the signature (optional) threat",
    reward:
      "“Favor of the Mountaintop” at the summit crystal: halves frostbite damage and buildup speed, and nearby frostbite boosts your attack power.",
    tips: [
      "The reward is a pure climb with no required boss — viable on day 1; save the dragons for day 2.",
      "Ride the Spiritstreams up (east path crosses one chain bridge, west crosses two) and grab the Favor before engaging the Ice Dragon.",
    ],
    hazard: "Constant frostbite buildup on the way up; the Ice Dragon hits very hard.",
  },
  {
    name: "Rotted Woods",
    where: "South-eastern Limveld",
    terrain: "Scarlet-rot forest; a fort sits in the far corner and a giant rot tree spawns at a random spot.",
    boss: "No mandatory boss — random field bosses (Tree Sentinel, Erdtree Avatar, Black Blade Kindred…)",
    reward:
      "“Favor of the Rotted Woods” at the rot tree: scarlet rot is nullified, max HP rises, and attacking after taking damage restores HP — the rot zone becomes a buff. Every party member must grab it individually.",
    tips: [
      "The treasure map on the fort's top floor marks the tree on your map (one member reading it is enough — it just speeds up the find).",
      "Grab the Favor first, then fight field bosses; day 1 is fine if you skip the bosses.",
    ],
    hazard: "Passive rot buildup everywhere until you have the Favor; Sacramental Buds cure it.",
  },
  {
    name: "Noklateo, the Shrouded City",
    where: "South-western Limveld",
    terrain: "A walled Eternal City with a single entrance on its north-east side; a grand hall sits at the far end.",
    boss: "Naturalborn of the Void (mandatory, before the grand hall); optional Dragonkin Soldier and Black Knife Assassins",
    reward:
      "“Favor of Noklateo”: one self-revive per Nightfarer, plus a temporary power boost after reviving. There's also a mid-city altar that duplicates a weapon — copy your best one for a teammate.",
    tips: [
      "A merchant waits just right of the entrance, and a Site of Grace sits before the hall steps — recommended day 2.",
      "Required for Wylder's Remembrance.",
    ],
    hazard: "Basilisk black smoke in the waterways causes Death Blight; the Naturalborn's laser and AoEs hit hard.",
  },
];
