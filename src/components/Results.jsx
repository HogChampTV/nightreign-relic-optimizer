import React, { useState } from "react";
import RelicCard from "./RelicCard.jsx";
import ShareChecklist from "./ShareChecklist.jsx";
import { goalSatisfaction } from "../lib/preset-engine.js";
import { loadoutTotals } from "../lib/stat-totals.js";

const SHOW_STEP = 5;

export default function Results({ results, gd, mode }) {
  const [shown, setShown] = useState(SHOW_STEP);
  const { combinations, pool, deepPool, entries, vessels, ms, checked } = results;

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
