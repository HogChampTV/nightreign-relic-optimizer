import React, { useEffect, useState } from "react";
import RelicCard from "./RelicCard.jsx";
import ShareChecklist from "./ShareChecklist.jsx";
import { goalSatisfaction } from "../lib/preset-engine.js";
import { loadoutTotals } from "../lib/stat-totals.js";

const SHOW_STEP = 5;

// Side-by-side diff of two pinned loadouts: goals, totals, differing relics.
function ComparePanel({ ranks, combinations, pool, deepPool, entries, vessels }) {
  const sides = ranks.map((rank) => {
    const combo = combinations[rank];
    const relics = combo.idx6.map((idx, s) => (idx < 0 ? null : s < 3 ? pool[idx] : deepPool[idx]));
    return { rank, combo, relics, sat: goalSatisfaction(entries, relics), totals: loadoutTotals(relics) };
  });
  const [a, b] = sides;
  const sharedKeys = new Set(a.relics.filter(Boolean).map((r) => r.key));
  const totalsByLabel = (side) => new Map(side.totals.chips.map((c) => [c.label, c.value]));
  const ta = totalsByLabel(a);
  const tb = totalsByLabel(b);
  const totalLabels = [...new Set([...ta.keys(), ...tb.keys()])];
  return (
    <div className="compare-panel">
      <h3>Comparing #{a.rank + 1} vs #{b.rank + 1}</h3>
      <table className="compare-table">
        <thead>
          <tr>
            <th></th>
            {sides.map((s) => (
              <th key={s.rank}>
                #{s.rank + 1} · {vessels[s.combo.vessel]?.name} <span className="muted">({s.combo.points.toFixed(2)})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {a.sat.map((row, i) => {
            const other = b.sat[i];
            return (
              <tr key={`g${i}`}>
                <td className="compare-label">{row.effect.name}</td>
                {[row, other].map((r, j) => (
                  <td key={j} className={r.stacks > [row, other][1 - j].stacks ? "better" : ""}>
                    {r.met ? "✓" : "·"} {r.stacks > 0 ? `×${r.stacks}` : "—"}
                  </td>
                ))}
              </tr>
            );
          })}
          {totalLabels.map((label) => (
            <tr key={`t${label}`} className="compare-totals-row">
              <td className="compare-label">{label}</td>
              {[ta, tb].map((t, j) => (
                <td key={j}>{t.get(label) ?? "—"}</td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="compare-label">Differing relics</td>
            {sides.map((s, j) => (
              <td key={j} className="compare-relics">
                {s.relics
                  .filter(Boolean)
                  .filter((r) => (j === 0 ? !b.relics.some((o) => o?.key === r.key) : !sharedKeys.has(r.key)))
                  .map((r) => r.name)
                  .join(", ") || "— same —"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Results({ results, gd, mode }) {
  const [shown, setShown] = useState(SHOW_STEP);
  const [pinned, setPinned] = useState([]);
  const { combinations, pool, deepPool, entries, vessels, ms, checked } = results;

  // New search results: old pins point at different loadouts, so drop them.
  useEffect(() => setPinned([]), [results]);

  const togglePin = (rank) =>
    setPinned((prev) =>
      prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev.slice(-1), rank],
    );

  if (combinations.length === 0) {
    return (
      <section className="results">
        <h2>Results</h2>
        <p className="muted">
          No valid loadout found. Lower some “need ≥” requirements, enable more vessels, or relax exclusions.
        </p>
      </section>
    );
  }

  const highlightKeys = new Set(entries.map((e) => e.effect.key));

  // Vessel verdict: each vessel's best-scoring loadout among the top results.
  const vesselBest = new Map();
  combinations.forEach((combo, rank) => {
    const cur = vesselBest.get(combo.vessel);
    if (!cur || combo.points > cur.points) vesselBest.set(combo.vessel, { points: combo.points, rank });
  });
  const vesselRanking = [...vesselBest.entries()]
    .map(([v, best]) => ({ vessel: vessels[v], ...best }))
    .sort((a, b) => b.points - a.points);
  const absentVessels = vessels.filter((_, i) => !vesselBest.has(i));

  return (
    <section className="results">
      <h2>
        Best loadouts <span className="muted">({checked.toLocaleString()} combinations checked in {ms} ms)</span>
      </h2>
      <div className="vessel-verdict">
        <h4>Vessel verdict</h4>
        <div className="chip-row">
          {vesselRanking.map(({ vessel, points, rank }, i) => (
            <span key={vessel.name} className={`chip vessel-chip ${i === 0 ? "on" : ""}`} title={`Best loadout: #${rank + 1}, score ${points.toFixed(2)}`}>
              {i === 0 ? "★ " : ""}{vessel.name}
              <span className="vessel-dots">
                {vessel.slots.map((c, s) => (
                  <span key={s} className={`slot-dot color-${["any", "red", "blue", "yellow", "green"][c]} ${s >= 3 ? "deep-slot" : ""}`} />
                ))}
              </span>
              <span className="muted"> {points.toFixed(1)}</span>
            </span>
          ))}
          {absentVessels.map((v) => (
            <span key={v.name} className="chip vessel-chip absent" title="No loadout from this vessel reached the top results">
              {v.name} <span className="muted">—</span>
            </span>
          ))}
        </div>
      </div>
      {pinned.length === 2 && (
        <ComparePanel
          ranks={[...pinned].sort((x, y) => x - y)}
          combinations={combinations}
          pool={pool}
          deepPool={deepPool}
          entries={entries}
          vessels={vessels}
        />
      )}
      {combinations.slice(0, shown).map((combo, rank) => {
        const comboRelics = combo.idx6.map((idx, s) => (idx < 0 ? null : s < 3 ? pool[idx] : deepPool[idx]));
        const sat = goalSatisfaction(entries, comboRelics);
        const met = sat.filter((s) => s.met).length;
        const vessel = vessels[combo.vessel];
        const totals = loadoutTotals(comboRelics);
        return (
          <div key={rank} className="combo">
            <div className="combo-head">
              <span className="combo-rank">#{rank + 1}</span>
              <span className="combo-vessel">{vessel?.name}</span>
              <span className="combo-score muted">score {combo.points.toFixed(2)}</span>
              <span className={`combo-met ${met === sat.length ? "all" : ""}`}>
                {met}/{sat.length} goals met
              </span>
              <button
                className={`ghost small pin-btn ${pinned.includes(rank) ? "on" : ""}`}
                title="Pin two loadouts to compare them side by side"
                onClick={() => togglePin(rank)}
              >
                {pinned.includes(rank) ? "📌 Pinned" : "Pin to compare"}
              </button>
              <ShareChecklist
                vesselName={vessel?.name ?? "Loadout"}
                score={combo.points.toFixed(1)}
                isDeep={mode === "deep"}
                relics={comboRelics}
              />
            </div>
            {totals.chips.length > 0 && (
              <div className="combo-totals">
                <span
                  className="totals-label muted"
                  title="Always-on effects with parseable community values, summed. Situational buffs (on-kill, timed, conditional) are not folded in. Non-stacking duplicate effects count once."
                >
                  Totals
                </span>
                {totals.chips.map((c) => (
                  <span key={c.label} className="total-chip" title={c.title}>
                    {c.label} <strong>{c.value}</strong>
                  </span>
                ))}
                {totals.situational > 0 && (
                  <span className="muted total-note">+{totals.situational} situational</span>
                )}
              </div>
            )}
            <div className="combo-goals">
              {sat.map((s, i) => (
                <span key={i} className={`goal-chip ${s.met ? "met" : "unmet"}`} title={`${s.stacks} stack${s.stacks === 1 ? "" : "s"} in this loadout`}>
                  {s.met ? "✓" : "·"} {s.effect.name}{s.stacks > 1 ? ` ×${s.stacks}` : ""}
                </span>
              ))}
            </div>
            <div className="combo-slots">
              <div className="slot-group">
                <h4>Relics</h4>
                <div className="slot-cards">
                  {comboRelics.slice(0, 3).map((r, i) =>
                    r ? <RelicCard key={i} relic={r} compact showLocation highlightKeys={highlightKeys} /> : <div key={i} className="empty-slot">empty</div>,
                  )}
                </div>
              </div>
              {mode === "deep" && (
                <div className="slot-group">
                  <h4>Deep relics</h4>
                  <div className="slot-cards">
                    {comboRelics.slice(3).map((r, i) =>
                      r ? <RelicCard key={i} relic={r} compact showLocation highlightKeys={highlightKeys} /> : <div key={i} className="empty-slot">empty</div>,
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {shown < combinations.length && (
        <button className="ghost" onClick={() => setShown(shown + SHOW_STEP)}>
          Show more ({combinations.length - shown} remaining)
        </button>
      )}
    </section>
  );
}
