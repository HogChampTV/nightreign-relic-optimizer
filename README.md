# Nightreign Relic Optimizer

A local web app that reads your Elden Ring Nightreign save, gives you a fast filter/search
view of every relic you own, and finds the best vessel + relic loadouts for **Deep of Night**
(3 normal + 3 deep slots) or normal expeditions.

- **Import**: drag your `NR0000.sl2` onto the page. It is decrypted and parsed entirely in the
  browser (Web Crypto AES-CBC) — nothing is uploaded, and the save is only ever read.
- **Demo mode**: no save handy? "Browse with demo data" on the import screen loads a sample
  collection of ~1,300 relics so every tab can be explored before importing anything.
- **Relic Browser**: search by relic or effect name, filter by color and normal/deep, and flag
  duplicate or outclassed relics you can safely sell.
- **Build presets**: a researched **signature build for each of the ten Nightfarers** (shown
  only for the selected character, sources cited on the card) plus nine universal Deep of Night
  archetypes. Applying one checks your inventory first: effects you don't own are automatically
  swapped for the closest fallback you do own, and the report tells you exactly what was
  substituted. Community-consensus run-killing curses are rejected by default (toggleable),
  and every effect shows its numeric value and curse tier on hover.
- **Custom builds**: edit any preset's goals (min/max stacks, priority) or build from scratch
  with the effect search, then save your builds locally.
- **Sell Audit**: lists relics that are *provably* safe to sell — surplus identical copies beyond
  what any vessel half can equip, and dead-weight relics whose every effect adds nothing next to
  a better relic — using researched per-effect stacking data (`src/data/stacking.json`, from the
  relics.pro compendium cross-checked against the community stacking sheets; regenerate with
  `scripts/build-stacking.mjs`). Relics that merely look redundant but still stack are listed
  separately, and every effect tooltip shows its stacking behavior.
- **Optimizer**: scores every relic triple per vessel half across all enabled vessels
  (multi-threaded via web workers) and returns the top 50 loadouts with per-goal satisfaction.
- **Target Nightlord**: pick the boss you're raiding and researched counter goals (their
  elemental weakness, the negation for what they deal, resistance against what they inflict)
  are layered on top of any preset — `src/lib/nightlords.js`, grounded in the Fextralife and
  wiki.gg negation/status tables, cross-checked against Game8 and the community weakness chart,
  with per-boss source notes and a warning card (what NOT to bring, e.g. fire into Gladius).
- **Stat totals** on every result: always-on effect values (damage multipliers, negation,
  max HP/FP, attributes, regen) parsed from the community numbers and summed per loadout —
  situational buffs are counted but never folded in, and non-stacking duplicates count once.
- **Equip checklist links**: every result has a 📱 Checklist button — a QR/link that opens a
  tap-off, phone-friendly checklist of the loadout (vessel, each relic's color-filter + row/slot
  location, effects). The whole build is encoded in the URL itself: nothing is uploaded, and the
  link works on any device with no save import.
- **Build share links**: a 🔗 Share build button encodes the current goals (as effect slugs)
  into a link/QR. A friend who opens it gets the same goals loaded into their optimizer and run
  against *their* relics — works with the demo data too, no save required.
- **Farming wishlist**: star the effects you're hunting in the Relic Browser — matches glow on
  every card, a filter shows only wishlisted relics, and What's New calls out fresh imports
  that contain one so you don't sell it by accident.
- **Guides tab**: the full Nightlord weakness table (per-type damage modifiers and status
  buildup thresholds, click a boss to target it in the optimizer), all four Shifting Earth
  events with their rewards and routing tips, a Sorcerer's Rise unlock route listing every
  known seal spot — including the Ruined Towers' exploding seals — tickable as you sweep them,
  and every Deep relic curse ranked by community tier.
- **Guided tour**: a first-import walkthrough of every tab; reopen it anytime with the ? Help
  button.
- **Installable (PWA)**: works offline once visited and installs to desktop or phone — handy for
  the checklist page mid-expedition.

## Run it

```bash
npm install
npm run dev     # http://localhost:5190
npm test        # parser + preset smoke tests
npm run build   # static production build in dist/
```

`node scripts/inspect-save.mjs [path-to-save]` prints a read-only summary of a save from the CLI.

`node scripts/audit-effects.mjs <path-to-save> [--write]` audits every preset effect against
reality: the game's tables hold ~850 effect definitions, but only ~524 have ever been seen on an
actual relic (checked against a 1,668-relic inventory, the community numbers sheet, and upstream's
recommended lists). `--write` regenerates `src/data/obtainable-effects.json`, the whitelist that
keeps datamined never-rolls effects out of presets and the effect search.

## Where is my save?

`%APPDATA%\Nightreign\<your Steam ID>\NR0000.sl2` (PC/Steam only).

## Credits

The save-format research, game data tables, and combo-search engine are MIT-licensed work from
[metinc/nightreign-relic-browser](https://github.com/metinc/nightreign-relic-browser) and
[tonydavis629/nightreign-relic-vault](https://github.com/tonydavis629/nightreign-relic-vault)
(vendored in `src/engine/`, license in `src/engine/LICENSE-relic-vault.txt`). SL2 AES key credit: TKGP.

Per-effect numeric values and notes (`src/data/effect-notes.json`, shown as tooltips) come from
the community "Nightreign Useful Info" spreadsheet as distilled by
[tijmen/nightreign-relic-optimizer](https://github.com/tijmen/nightreign-relic-optimizer) (MIT);
regenerate with `node scripts/build-effect-notes.mjs <path-to-effect_ref.json>`.

Per-effect stacking behavior (`src/data/stacking.json`) is researched from the
[relics.pro compendium](https://relics.pro/compendium/) and cross-checked against COOKIE LIPS'
"Nightreign Holy Bible" stacking spreadsheet and the Useful Info sheet; the few conflicts between
sources are adjudicated in `scripts/build-stacking.mjs`.

Game data targets relic-browser v1.0.30 tables; a game patch that adds effects will show them as
"Unknown effect" until `src/data/game-data.json` is refreshed from upstream.
