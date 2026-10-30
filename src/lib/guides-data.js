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
