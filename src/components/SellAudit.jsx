import React, { useMemo, useState } from "react";
import { Color, COLOR_NAMES } from "../engine/game-data.js";
import { RUN_KILLER_SLUGS } from "../lib/curse-tiers.js";
import { auditSellables } from "../lib/sell-audit.js";
import RelicCard from "./RelicCard.jsx";

// Stacking-aware sell list (see src/lib/sell-audit.js for the rules):
// only relics whose sale provably loses nothing are called safe; relics that
// look redundant but still stack are listed separately as keepers.

const KIND_TABS = [
  { id: "deep", label: "Deep relics" },
  { id: "normal", label: "Normal relics" },
];

function location(r) {
  const [row, col] = r.coordinatesByColor;
  return `${COLOR_NAMES[r.color]} filter · row ${row + 1}, slot ${col + 1}`;
}

function Reason({ entry }) {
  const { kind, keeper, copies, keep } = entry;
  return (
    <div className="sell-reason">
      {kind === "surplus" ? (
        <>
          <span className="badge dup-badge">Surplus copy</span> you own {copies} identical; at most{" "}
          {keep} can {keep === 1 ? "usefully be equipped (effects don't stack)" : "be equipped in one vessel half"}.
          Keeping the {keep === 1 ? "copy" : `${keep} copies`} with the mildest curses.
        </>
      ) : (
        <>
          <span className="badge redundant-badge">Dead weight</span> equipping it next to{" "}
          <strong>{keeper.name}</strong> ({location(keeper)}) adds nothing: every effect either
          doesn't stack and is already there, or is researched as "only one of its family counts".
        </>
      )}
    </div>
  );
}

export default function SellAudit({ gd, character }) {
  const [kind, setKind] = useState("deep");
  const [showKeepers, setShowKeepers] = useState(false);
  const [showCursed, setShowCursed] = useState(false);

  const { safeByKind, keepByKind, cursedByKind } = useMemo(() => {
    const { safe, stackKeep } = auditSellables(gd, character.relics);
    const safeSet = new Set(safe.map((s) => s.relic));
    const runKillers = new Set(RUN_KILLER_SLUGS);
    const cursed = character.relics.filter(
      (r) => r.sellable && !safeSet.has(r) && r.effects.flat().some((e) => runKillers.has(e.slug)),
    );
    const split = (list, pick = (x) => x) => ({
      deep: list.filter((x) => pick(x).isDeep),
      normal: list.filter((x) => !pick(x).isDeep),
    });
    return {
      safeByKind: split(safe, (s) => s.relic),
      keepByKind: split(stackKeep, (s) => s.relic),
      cursedByKind: split(cursed),
    };
  }, [gd, character]);

  const list = safeByKind[kind];
  const keepers = keepByKind[kind];
  const cursedList = cursedByKind[kind];
  const surplus = list.filter((s) => s.kind === "surplus").length;

  const colorOrder = [Color.Red, Color.Blue, Color.Yellow, Color.Green];
  const grouped = colorOrder
    .map((c) => ({
      color: c,
      entries: list
        .filter((s) => s.relic.color === c)
        .sort(
          (a, b) =>
            a.relic.coordinatesByColor[0] - b.relic.coordinatesByColor[0] ||
            a.relic.coordinatesByColor[1] - b.relic.coordinatesByColor[1],
        ),
    }))
    .filter((g) => g.entries.length > 0);

  return (
    <div className="sell-audit">
      <div className="browser-controls">
        <div className="chip-row">
          {KIND_TABS.map((k) => (
            <button key={k.id} className={`chip ${kind === k.id ? "on" : ""}`} onClick={() => setKind(k.id)}>
              {k.label} ({safeByKind[k.id].length})
            </button>
          ))}
          <button className={`chip ${showKeepers ? "on" : ""}`} onClick={() => setShowKeepers(!showKeepers)}>
            Kept for stacking ({keepers.length})
          </button>
          <button className={`chip ${showCursed ? "on" : ""}`} onClick={() => setShowCursed(!showCursed)}>
            Run-killer cursed ({cursedList.length})
          </button>
        </div>
        <p className="muted">
          {list.length} {kind} relics are provably safe to sell: {surplus} surplus copies (more
          identical copies than any vessel half can equip — up to 3 same-color slots exist) and{" "}
          {list.length - surplus} dead weight (non-stacking effects fully covered by a better relic).
          Relics that merely <em>look</em> redundant but still stack are under “Kept for stacking”.
          Positions assume the in-game sell menu sorted by <strong>Order Found</strong> with the color
          filter applied — sell from the bottom of this list upward so earlier positions stay valid.
        </p>
      </div>

      {grouped.length === 0 && <p className="muted">Nothing to sell here — this inventory is clean.</p>}

      {grouped.map(({ color, entries }) => (
        <section key={color} className="sell-group">
          <h3 className={`sell-group-title color-${COLOR_NAMES[color].toLowerCase()}`}>
            {COLOR_NAMES[color]} · {entries.length} to sell
          </h3>
          <div className="relic-grid">
            {entries.map((entry) => (
              <div key={entry.relic.uid} className="sell-item">
                <RelicCard relic={entry.relic} />
                <Reason entry={entry} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {showKeepers && (
        <section className="sell-group">
          <h3 className="sell-group-title">Kept for stacking · {keepers.length}</h3>
          <p className="muted">
            A better relic covers these, but selling would still lose value — per researched
            stacking data (relics.pro compendium, cross-checked against the community stacking
            sheets), the named effect still adds something when equipped alongside the keeper.
          </p>
          <div className="relic-grid">
            {keepers.map(({ relic, keeper, why }) => (
              <div key={relic.uid} className="sell-item">
                <RelicCard relic={relic} />
                <div className="sell-reason">
                  Covered by <strong>{keeper.name}</strong> ({location(keeper)}), but {why}.
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showCursed && (
        <section className="sell-group">
          <h3 className="sell-group-title">Run-killer curses · {cursedList.length} (judgment call)</h3>
          <p className="muted">
            Not duplicates — these carry a curse the community rates never-play (deathblight,
            continuous HP loss, all-resistances-down, near-death penalties). Sell only if the upsides
            don't justify the curse for you; the optimizer already rejects them when “ban run-killer
            curses” is on.
          </p>
          <div className="relic-grid">
            {cursedList.map((r) => (
              <div key={r.uid} className="sell-item">
                <RelicCard relic={r} />
                <div className="sell-reason">{location(r)}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
