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

// The Great Hollow: the Forsaken Hollows DLC's Shifting Earth. Unlike the four
// base events it replaces ALL of Limveld with its own multi-layered map, built
// around the Crystal Curse mechanic. Researched from Fextralife's Great Hollow
// page, eldenring.wiki.gg, Game8, PC Gamer, Destructoid and intoindiegames
// (cross-checked); seed facts from nightreign-seed-finder.com and
// thefifthmatt's datamined pattern tracker.
export const GREAT_HOLLOW = {
  name: "The Great Hollow",
  dlc: "The Forsaken Hollows",
  blurb:
    "The DLC's Shifting Earth takes over the entire map: Limveld is replaced by a vast sunken, multi-layered region of cliffs, chasms and ruins with its own POIs, enemies and bosses — built around one mechanic: the Crystal Curse.",
  curse:
    "Entering a major POI (the two cursed castles, forts, towers) halves your max HP until the curse is lifted. A bottomless central chasm is instant death. Avoid the castles until you're curse-proof.",
  mechanic: [
    "Dark-blue Resonating Crystals are scattered around the map — resonate with 4 of them (3 in solo expeditions). Each one cracks the Great Crystal at map centre a little more.",
    "Crystal spawns are per-run random — not seeded, so no tool can predict them. The map below marks all 21 possible spots (6 of them underground); not every spot is used, so scan for the blue glow from a Spectral Hawk's overhead view.",
    "Once cracked open, touch the Great Crystal (red map flag, pinned by day 2) for the Favor — every party member must touch it individually. The broken crystal also becomes a teleport point.",
  ],
  reward:
    "“Favor of the Great Hollow”: breaks the Crystal Curse (restoring full max HP), and once your Sacred Flasks are exhausted, your Art gauge charges faster.",
  bosses:
    "Night bosses come in duos (e.g. Curseblade + Divine Beast Warrior, Demon in Pain + Demon from Below); night 2 is fought at the north Divine Tower (Lord of Blood or Demon Prince). The Gaping Dragon headlines the field bosses, and an Elder Inquisitor guards the weapon-duplication altar. The two Divine Towers are boss-rushes that grant a False Vision of a Great Rune (faster Ult charge, bonus murk).",
  tips: [
    "Day 1: clear the Kaiden Mercenaries at spawn, hit 2–3 churches, and resonate every crystal you can — all needed crystals are usually findable on day 1. Stay out of the castles.",
    "Day 2: grab the Favor first thing, then farm the NW/SE castles for purple/legendary gear, and take the western bridge to the north Divine Tower (safer than jumping from the east/south).",
    "Aim for ~level 6–7 by night 1 and ~12 before the underground forts; use fort waygates and the Great Crystal teleport to cross the map.",
  ],
  hazard:
    "Crystal Curse (−50% max HP in POIs), the bottomless central chasm, and cursed dungeons stacking poison / flame / frost / rot. There are no Evergaols here.",
  availability: [
    "Requires the Forsaken Hollows DLC for everyone in the lobby — non-owners never see it.",
    "Unlocks after beating two Nightlords (including Tricephalos) with the DLC installed; enter via the chapel behind the Small Jar Merchant at the Roundtable.",
    "Like other Shifting Earths it rolls randomly after completed expeditions; the Collector Signboard (post-Everdark, 1 Sovereign Sigil) can force an unlocked event. Fextralife reports it can also roll in Deep of Night queues for DLC owners since patch 1.03.1.",
  ],
  seeds: [
    "Limveld layouts aren't fully random: the community datamined a fixed pattern pool. The DLC grew it from 320 to 520 patterns, 80 of which are Great Hollow layouts — far more variants than the 5-per-event the base Shifting Earths get, which is why runs feel so different.",
    "You can identify your seed from day-1 landmark positions (churches, Rises, forts) and plan the route ahead with the community seed tools below.",
  ],
  tools: [
    { name: "Nightreign Seed Finder", url: "https://nightreign-seed-finder.com", desc: "interactive recognizer covering all 520 patterns, Great Hollow included" },
    { name: "thefifthmatt's pattern tracker", url: "https://thefifthmatt.github.io/nightreign", desc: "the datamined pattern list, per Nightlord" },
  ],
  // Interactive map data. Coordinates are in the 1000×1000 space the
  // Nightreign Seed Finder project publishes for its Great Hollow overlay
  // (slot/crystal tables from its app, datamined foundations by thefifthmatt),
  // and land pixel-exact on the in-game map image. The lower-right landmass on
  // the image is the game's own inset for the underground cave network.
  map: {
    image: "guides/great-hollow-map.webp",
    size: 1000,
    credit:
      "Location data from the Nightreign Seed Finder project (datamined foundations by thefifthmatt). Map art from Elden Ring Nightreign © FromSoftware / Bandai Namco, shown for identification in this fan guide.",
    // Fixed geography — identical in all 80 Great Hollow seeds.
    landmarks: [
      { x: 347, y: 312, kind: "castle", label: "Western Underground Fort", hint: "Cursed POI — the Crystal Curse halves max HP inside until you hold the Favor. Elemental theme varies by seed (magic or fire). Prime day-2 loot run." },
      { x: 641, y: 655, kind: "castle", label: "Eastern Underground Fort", hint: "Cursed POI — the Crystal Curse halves max HP inside until you hold the Favor. Elemental theme varies by seed (holy or rot). Prime day-2 loot run." },
      { x: 579, y: 322, kind: "tower", label: "North Divine Tower", hint: "Boss-rush; grants a False Vision of a Great Rune (faster Ult charge, bonus murk). Night 2 is fought at a Divine Tower — approach over the western bridge." },
      { x: 260, y: 423, kind: "tower", label: "West Divine Tower", hint: "Boss-rush; grants a False Vision of a Great Rune (faster Ult charge, bonus murk)." },
      { x: 534, y: 592, kind: "great-crystal", label: "The Great Crystal", hint: "Resonate 4 crystals (3 solo) to crack it open, then touch it for the Favor — every party member individually. Becomes a teleport point. The chasm around it is a bottomless fall." },
      { x: 417, y: 234, kind: "church", label: "Church (fixed)", hint: "Drawn into the game's own map — this church is here in every seed. Guaranteed Sacred Flask stop." },
      { x: 543, y: 433, kind: "church", label: "Church (fixed)", hint: "Drawn into the game's own map — this church is here in every seed. Guaranteed Sacred Flask stop." },
      { x: 802, y: 745, kind: "underground", label: "The Underground (inset)", hint: "This corner of the map is the game's inset for the cave network beneath the Hollow. Crystal spots marked ↓ are down here." },
    ],
    // The three possible drop-in points (which one you get varies by seed).
    spawns: [
      { x: 733, y: 347, label: "Spawn (northeast)" },
      { x: 280, y: 683, label: "Spawn (southwest)" },
      { x: 453, y: 779, label: "Spawn (south)" },
    ],
    // Seed-variable POI slots: the buildings are always at these spots, but
    // what each one is (or whether the merchant shows at all) depends on the
    // seed — identify yours with the tools below to know.
    pois: [
      { x: 770, y: 414, kind: "greatchurch", label: "Great Church", hint: "Elemental theme varies by seed (lightning or sleep)." },
      { x: 685, y: 931, kind: "greatchurch", label: "Great Church (underground)", hint: "In the underground inset. Elemental theme varies by seed (frost or holy)." },
      { x: 612, y: 512, kind: "church-or-rise", label: "Church or Sorcerer's Rise", hint: "Every seed puts 2 churches and 1–2 Sorcerer's Rises on these four spots — which is which varies." },
      { x: 353, y: 525, kind: "church-or-rise", label: "Church or Sorcerer's Rise", hint: "Every seed puts 2 churches and 1–2 Sorcerer's Rises on these four spots — which is which varies." },
      { x: 361, y: 773, kind: "church-or-rise", label: "Church or Sorcerer's Rise", hint: "Every seed puts 2 churches and 1–2 Sorcerer's Rises on these four spots — which is which varies." },
      { x: 921, y: 806, kind: "church-or-rise", label: "Church or Sorcerer's Rise (underground)", hint: "In the underground inset. Every seed puts 2 churches and 1–2 Sorcerer's Rises on these four spots — which is which varies." },
      { x: 253, y: 579, kind: "ruins", label: "Ruins", hint: "Status-themed ruins; the status varies by seed (poison or bleed)." },
      { x: 881, y: 898, kind: "ruins", label: "Ruins (underground)", hint: "In the underground inset. Status varies by seed (sleep or magic)." },
      { x: 397, y: 390, kind: "merchant", label: "Possible Scale-Bearing Merchant", hint: "Only ~1 in 3 seeds has the merchant at all, at exactly one of these seven spots." },
      { x: 723, y: 475, kind: "merchant", label: "Possible Scale-Bearing Merchant", hint: "Only ~1 in 3 seeds has the merchant at all, at exactly one of these seven spots." },
      { x: 436, y: 551, kind: "merchant", label: "Possible Scale-Bearing Merchant", hint: "Only ~1 in 3 seeds has the merchant at all, at exactly one of these seven spots." },
      { x: 319, y: 636, kind: "merchant", label: "Possible Scale-Bearing Merchant", hint: "Only ~1 in 3 seeds has the merchant at all, at exactly one of these seven spots." },
      { x: 362, y: 741, kind: "merchant", label: "Possible Scale-Bearing Merchant", hint: "Only ~1 in 3 seeds has the merchant at all, at exactly one of these seven spots." },
      { x: 893, y: 816, kind: "merchant", label: "Possible Scale-Bearing Merchant (underground)", hint: "In the underground inset. Only ~1 in 3 seeds has the merchant at all, at exactly one of these seven spots." },
      { x: 811, y: 908, kind: "merchant", label: "Possible Scale-Bearing Merchant (underground)", hint: "In the underground inset. Only ~1 in 3 seeds has the merchant at all, at exactly one of these seven spots." },
    ],
    // All 21 possible Resonating Crystal spots. Which ones are used is
    // per-run random (NOT seeded — confirmed by thefifthmatt's datamining),
    // so these are the complete pool to check, not a per-seed answer.
    // "where" lines are read off the map image around each verified
    // coordinate (plus the fixed landmarks above for reference points).
    crystals: [
      { id: 1, x: 451, y: 326, where: "Just southeast of the Western Underground Fort, on the open ledge between the fort's yard and the north fixed church." },
      { id: 2, x: 705, y: 348, where: "High northeast plateau, east of the North Divine Tower — on the cliff lip just west of the northeast spawn ledge." },
      { id: 3, x: 531, y: 439, where: "Right beside the central fixed church, on the ridge above the Great Crystal's chasm." },
      { id: 4, x: 370, y: 449, where: "Open ground east of the West Divine Tower, about halfway toward the north fixed church." },
      { id: 5, x: 639, y: 471, where: "East of the central fixed church, by the stream at the edge of the eastern hollow." },
      { id: 6, x: 727, y: 472, where: "Far eastern edge, below the northeast ravine — at the way into the eastern hollow, south of the Great Church spot." },
      { id: 7, x: 418, y: 480, where: "On the slope southeast of the West Divine Tower, by the small ruin on the way to the central pillars." },
      { id: 8, x: 265, y: 482, where: "Directly south of the West Divine Tower, at the foot of its approach near the western cliffs." },
      { id: 9, x: 453, y: 580, where: "Just west of the Great Crystal's chasm rim, below the tall pillar ruins." },
      { id: 10, x: 294, y: 591, where: "Eastern edge of the orange southwest ruins, where they meet the open slope." },
      { id: 11, x: 237, y: 613, where: "South side of the orange southwest ruins, near the western cliff edge." },
      { id: 12, x: 401, y: 613, where: "Open ground between the southwest ruins and the Great Crystal's chasm, by the stream." },
      { id: 13, x: 512, y: 667, where: "South-southwest of the Great Crystal, at the stream bend on the way toward the Eastern Underground Fort." },
      { id: 14, x: 357, y: 749, where: "Southern rim, west of the south spawn — on the open ledge along the cliff edge." },
      { id: 15, x: 419, y: 793, where: "Southern rim, just southwest of the south spawn point." },
      { id: 16, x: 882.5, y: 756.1, underground: true, where: "Underground: at the caverns' northern tip, beside the blue-lit way in." },
      { id: 17, x: 832.5, y: 814.9, underground: true, where: "Underground: west-central cavern, below the northern way in." },
      { id: 18, x: 913.1, y: 837.5, underground: true, where: "Underground: eastern cavern, in the teal mossy section." },
      { id: 19, x: 800.9, y: 871.1, underground: true, where: "Underground: where the stream crosses the west side, northeast of the underground Great Church." },
      { id: 20, x: 911.9, y: 925.5, underground: true, where: "Underground: the far southeast corner of the caverns." },
      { id: 21, x: 806.9, y: 926.1, underground: true, where: "Underground: southern cavern, just east of the underground Great Church." },
    ],
  },
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
