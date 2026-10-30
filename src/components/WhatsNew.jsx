import React, { useMemo, useState } from "react";
import { PRESETS } from "../lib/presets.js";
import RelicCard from "./RelicCard.jsx";

// Diff of the current import against the previous one: which relics are new,
// whether each arrival is an upgrade (it outclasses relics you already owned),
// already outclassed on arrival (straight to the Sell Audit), and which build
// presets it feeds. Relic identity is the stable acquisition-order key, so
// re-imports match reliably. Read-only like everything else: saves are parsed,
// never written.

const NF_NAMES = ["Wylder", "Guardian", "Ironeye", "Duchess", "Raider", "Revenant", "Recluse", "Executor", "Scholar", "Undertaker"];

function presetMatches(relic, nightfarer) {
  const hits = [];
  for (const preset of PRESETS) {
    if (preset.nightfarers && nightfarer !== null && !preset.nightfarers.includes(nightfarer)) continue;
    const slugs = new Set();
    for (const g of [...preset.goals, ...Object.values(preset.characterGoals ?? {}).flat()]) {
      if (g.max === 0) continue;
      slugs.add(g.slug);
      for (const a of g.alternatives ?? []) slugs.add(a);
    }
    if (relic.effects.some(([e]) => e.type !== 1 && slugs.has(e.slug))) hits.push(preset);
  }
  return hits;
}

export default function WhatsNew({ character, prevCharacter }) {
  const [nfFilter, setNfFilter] = useState(null);

  const diff = useMemo(() => {
    if (!prevCharacter) return null;
    const prevKeys = new Set(prevCharacter.relics.map((r) => r.key));
    const curKeys = new Set(character.relics.map((r) => r.key));
    const added = character.relics.filter((r) => !prevKeys.has(r.key));
    const removedCount = prevCharacter.relics.filter((r) => !curKeys.has(r.key)).length;

    // Old relics that the newcomers pushed into redundancy.
    const addedKeys = new Set(added.map((r) => r.key));
    const nowOutclassed = character.relics.filter(
      (r) => !addedKeys.has(r.key) && r.redundant && addedKeys.has(r.redundant.relic.key),
    );
    const outclassesBy = new Map();
    for (const r of nowOutclassed) {
      const k = r.redundant.relic.key;
      outclassesBy.set(k, (outclassesBy.get(k) ?? 0) + 1);
    }
    return { added, removedCount, outclassesBy };
  }, [character, prevCharacter]);

  if (!diff) {
    return (
      <div className="whats-new">
        <p className="muted">
          No earlier import to compare against yet. After your next play session, re-import your save
          (it is only ever read, never written) and this tab will show what you looted — and whether
          any of it is an upgrade.
        </p>
      </div>
    );
  }

  const { added, removedCount, outclassesBy } = diff;
  const shownAdded = added.filter((r) => {
    if (nfFilter === null) return true;
    return presetMatches(r, nfFilter).length > 0;
  });

  return (
    <div className="whats-new">
      <div className="browser-controls">
        <p className="muted">
          Since your previous import: <strong>{added.length}</strong> new relics
          {removedCount > 0 ? <> · {removedCount} gone (sold or converted)</> : null}. Each card says
          whether it upgrades your collection, and which build presets its effects feed
          {nfFilter !== null ? <> (filtered for {NF_NAMES[nfFilter]})</> : null}.
        </p>
        <div className="chip-row">
          <button className={`chip ${nfFilter === null ? "on" : ""}`} onClick={() => setNfFilter(null)}>
            All
          </button>
          {NF_NAMES.map((n, id) => (
            <button key={id} className={`chip ${nfFilter === id ? "on" : ""}`} onClick={() => setNfFilter(id)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {added.length === 0 && <p className="muted">Nothing new in this import.</p>}
      {added.length > 0 && shownAdded.length === 0 && (
        <p className="muted">None of the new relics feed a {NF_NAMES[nfFilter]} preset.</p>
      )}

      <div className="relic-grid">
        {shownAdded.map((r) => {
          const upgrades = outclassesBy.get(r.key) ?? 0;
          const presets = presetMatches(r, nfFilter);
          return (
            <div key={r.uid} className="sell-item">
              <RelicCard relic={r} />
              <div className="sell-reason">
                {upgrades > 0 && (
                  <div>
                    <span className="badge ok-badge">Upgrade</span> outclasses {upgrades} relic
                    {upgrades > 1 ? "s" : ""} you own — now in the Sell Audit.
                  </div>
                )}
                {r.redundant && (
                  <div>
                    <span className="badge redundant-badge">Covered on arrival</span>{" "}
                    {r.redundant.outclassed ? "outclassed by" : "duplicate of"}{" "}
                    <strong>{r.redundant.relic.name}</strong> — check the Sell Audit before keeping it.
                  </div>
                )}
                {presets.length > 0 && (
                  <div>
                    Feeds: {presets.slice(0, 4).map((p) => p.name).join(", ")}
                    {presets.length > 4 ? ` +${presets.length - 4} more` : ""}
                  </div>
                )}
                {upgrades === 0 && !r.redundant && presets.length === 0 && (
                  <div className="muted">No preset uses its effects{nfFilter === null ? "" : ` for ${NF_NAMES[nfFilter]}`}.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
