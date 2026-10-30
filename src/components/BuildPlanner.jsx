import React, { useCallback, useEffect, useMemo, useState } from "react";
import { buildSearch } from "../engine/combo-core.js";
import { searchCombos, SearchCancelled } from "../lib/combo-client.js";
import { PRESETS, PRIORITY_WEIGHTS, CURSE_PENALTIES } from "../lib/presets.js";
import { resolvePreset } from "../lib/preset-engine.js";
import { loadCustomBuilds, persistCustomBuilds } from "../lib/store.js";
import EffectPicker from "./EffectPicker.jsx";
import Results from "./Results.jsx";
import GapReport from "./GapReport.jsx";
import { effectTooltip } from "../lib/effect-notes.js";
import { RUN_KILLER_SLUGS } from "../lib/curse-tiers.js";
import { COLOR_NAMES } from "../engine/game-data.js";
import { NIGHTLORDS, nightlordById } from "../lib/nightlords.js";

export default function BuildPlanner({ gd, relics, deepRelics, prefs, setPref }) {
  const nightfarer = prefs.nightfarer ?? 0;
  const mode = prefs.mode ?? "deep";
  const targetNightlordId = prefs.nightlord ?? "";
  const [goals, setGoals] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);
  const [report, setReport] = useState(null);
  const [cursePenalty, setCursePenalty] = useState("mild");
  const [banRunKillers, setBanRunKillers] = useState(true);
  const [disabledVessels, setDisabledVessels] = useState(new Set());
  const [showVessels, setShowVessels] = useState(false);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [customBuilds, setCustomBuilds] = useState(() => loadCustomBuilds());
  const [buildName, setBuildName] = useState("");

  const nf = gd.nightfarers[nightfarer];
  const allVessels = useMemo(() => {
    // The per-character vessel list already contains the "anyone" grails.
    const seen = new Set();
    return [...nf.vessels, ...gd.anyoneVessels].filter((v) => !seen.has(v.name) && seen.add(v.name));
  }, [nf, gd]);
  const enabledVessels = useMemo(
    () => allVessels.filter((v) => !disabledVessels.has(v.name)),
    [allVessels, disabledVessels],
  );
  const modeDeepRelics = mode === "deep" ? deepRelics : [];

  // Effect keys actually present in this inventory — lets the picker offer effects
  // the player owns even if they're missing from the static obtainable whitelist.
  const inventoryKeys = useMemo(() => {
    const keys = new Set();
    for (const r of [...relics, ...deepRelics]) for (const e of r.effects.flat()) keys.add(e.key);
    return keys;
  }, [relics, deepRelics]);

  // Counter goals for the chosen target Nightlord, resolved against the
  // inventory with the same fallback machinery presets use. Merged into every
  // search on top of whatever preset/custom goals are active.
  const nightlord = nightlordById(targetNightlordId);
  const nightlordRes = useMemo(() => {
    if (!nightlord) return null;
    return resolvePreset({ goals: nightlord.goals }, gd, relics, deepRelics, mode, nightfarer);
  }, [nightlord, gd, relics, deepRelics, mode, nightfarer]);

  const runSearch = useCallback(
    async (goalRows, penalty) => {
      const rows = goalRows.filter((g) => gd.effectByKey(g.effectKey));
      if (rows.length === 0 || enabledVessels.length === 0) return;
      setSearching(true);
      setError(null);
      try {
        const selectedEffects = rows.map((g) => gd.effectByKey(g.effectKey));
        const selectedEntries = rows.map((g) => ({
          effectKey: g.effectKey,
          minStacks: g.min,
          maxStacks: g.max,
          weight: PRIORITY_WEIGHTS[g.priority] ?? 1,
        }));
        // Layer the target-Nightlord counter goals on top (goal rows win on overlap).
        const extraEntries = [];
        for (const e of nightlordRes?.entries ?? []) {
          if (rows.some((r) => r.effectKey === e.effect.key)) continue;
          selectedEffects.push(e.effect);
          selectedEntries.push({
            effectKey: e.effect.key,
            minStacks: e.minStacks,
            maxStacks: e.maxStacks,
            weight: PRIORITY_WEIGHTS[e.priority] ?? 1,
          });
          extraEntries.push(e);
        }
        if (banRunKillers) {
          // Exclude builds carrying community-consensus run-killing curses.
          const present = new Set(selectedEntries.map((e) => e.effectKey));
          for (const effect of gd.effectsByKey) {
            if (effect?.slug && RUN_KILLER_SLUGS.includes(effect.slug) && !present.has(effect.key)) {
              selectedEffects.push(effect);
              selectedEntries.push({ effectKey: effect.key, minStacks: 0, maxStacks: 0, weight: 1 });
            }
          }
        }
        const { input, relics: pool, deepRelics: deepPool } = buildSearch(gd, {
          nightfarer,
          selectedEffects,
          relics,
          deepRelics: modeDeepRelics,
          enabledVessels,
          selectedEntries,
          cursePenalty: CURSE_PENALTIES[penalty] ?? 0,
        });
        const res = await searchCombos(input);
        const entries = [
          ...rows.map((g) => ({
            effect: gd.effectByKey(g.effectKey),
            minStacks: g.min,
            maxStacks: g.max,
          })),
          ...extraEntries.map((e) => ({ effect: e.effect, minStacks: e.minStacks, maxStacks: e.maxStacks })),
        ];
        setResults({ ...res, pool, deepPool, entries, vessels: enabledVessels });
      } catch (err) {
        if (!(err instanceof SearchCancelled)) setError(String(err?.message ?? err));
      } finally {
        setSearching(false);
      }
    },
    [gd, nightfarer, relics, modeDeepRelics, enabledVessels, banRunKillers, nightlordRes],
  );

  const applyPreset = useCallback(
    (preset, { autoRun = true } = {}) => {
      const { entries, report } = resolvePreset(preset, gd, relics, deepRelics, mode, nightfarer);
      const rows = entries.map((e) => ({
        effectKey: e.effect.key,
        min: e.minStacks,
        max: e.maxStacks,
        priority: e.priority ?? "normal",
      }));
      setActivePresetId(preset.id);
      setReport(report);
      setGoals(rows);
      setCursePenalty(preset.cursePenalty);
      setResults(null);
      if (autoRun) runSearch(rows, preset.cursePenalty);
    },
    [gd, relics, deepRelics, mode, nightfarer, runSearch],
  );

  // Re-resolve and re-run the active preset when the character, mode, or inventory changes.
  useEffect(() => {
    const preset = PRESETS.find((p) => p.id === activePresetId);
    if (preset) applyPreset(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, nightfarer, relics, deepRelics]);

  // Changing the target Nightlord re-ranks existing results with its counter goals.
  useEffect(() => {
    if (goals.length > 0 && results) runSearch(goals, cursePenalty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetNightlordId]);

  const editGoal = (i, patch) => {
    setGoals((g) => g.map((row, j) => (i === j ? { ...row, ...patch } : row)));
    setActivePresetId(null);
    setReport(null);
  };
  const removeGoal = (i) => {
    setGoals((g) => g.filter((_, j) => j !== i));
    setActivePresetId(null);
    setReport(null);
  };
  const addGoal = (effect) => {
    setGoals((g) => [...g, { effectKey: effect.key, min: 0, max: 10, priority: "normal" }]);
    setActivePresetId(null);
    setReport(null);
  };

  const goalKeys = useMemo(() => new Set(goals.map((g) => g.effectKey)), [goals]);

  const saveCustom = () => {
    const name = buildName.trim() || `${nf.name} build`;
    const next = [
      ...customBuilds.filter((b) => b.name !== name),
      { id: `custom-${Date.now()}`, name, nightfarer, mode, cursePenalty, goals },
    ];
    setCustomBuilds(next);
    persistCustomBuilds(next);
    setBuildName("");
  };

  const applyCustom = (build) => {
    setPref("nightfarer", build.nightfarer);
    setPref("mode", build.mode);
    setCursePenalty(build.cursePenalty);
    setGoals(build.goals);
    setActivePresetId(null);
    setReport(null);
    setResults(null);
    runSearch(build.goals, build.cursePenalty);
  };

  const deleteCustom = (id) => {
    const next = customBuilds.filter((b) => b.id !== id);
    setCustomBuilds(next);
    persistCustomBuilds(next);
  };

  return (
    <div className="planner">
      <section className="planner-controls">
        <div className="control-row">
          <label>
            Nightfarer
            <select value={nightfarer} onChange={(e) => setPref("nightfarer", Number(e.target.value))}>
              {gd.nightfarers.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </label>
          <label>
            Mode
            <div className="segmented">
              <button className={mode === "deep" ? "on" : ""} onClick={() => setPref("mode", "deep")}>
                Deep of Night
              </button>
              <button className={mode === "normal" ? "on" : ""} onClick={() => setPref("mode", "normal")}>
                Normal
              </button>
            </div>
          </label>
          <label>
            Target Nightlord
            <select value={targetNightlordId} onChange={(e) => setPref("nightlord", e.target.value)}>
              <option value="">Any — no counter goals</option>
              {NIGHTLORDS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.expedition})
                </option>
              ))}
            </select>
          </label>
          <label>
            Curse penalty
            <select value={cursePenalty} onChange={(e) => setCursePenalty(e.target.value)}>
              <option value="none">None — curses are fine</option>
              <option value="mild">Mild — avoid when possible</option>
              <option value="strong">Strong — really avoid curses</option>
            </select>
          </label>
          <label
            className="checkbox-row"
            title={`Rejects any build carrying: ${RUN_KILLER_SLUGS.map((s) => gd.effectsByKey.find((e) => e?.slug === s)?.name ?? s).join("; ")}`}
          >
            <input type="checkbox" checked={banRunKillers} onChange={(e) => setBanRunKillers(e.target.checked)} />
            Reject run-killing curses ({RUN_KILLER_SLUGS.length})
          </label>
          <button className="ghost small" onClick={() => setShowVessels(!showVessels)}>
            Vessels ({enabledVessels.length}/{allVessels.length}) {showVessels ? "▴" : "▾"}
          </button>
        </div>

        {nightlord && (
          <div className="nightlord-card">
            <div className="nightlord-head">
              <strong>{nightlord.name}</strong> <span className="muted">· {nightlord.expedition}</span>
            </div>
            <p className="nightlord-blurb">{nightlord.blurb}</p>
            <p className="muted">{nightlord.warn}</p>
            {nightlordRes && (
              <div className="nightlord-goals">
                <span className="muted">Counter goals added:</span>
                {nightlordRes.report.map((r, i) => (
                  <span
                    key={i}
                    className={`chip nl-goal ${r.status}`}
                    title={
                      (r.goal.note ? `${r.goal.note}. ` : "") +
                      (r.status === "swapped"
                        ? `You don't own ${r.effect?.name}; using ${r.replacedBy?.name} instead.`
                        : r.status === "missing"
                          ? `You don't own ${r.effect?.name ?? r.goal.slug} or any fallback — goal skipped.`
                          : `Owned ×${r.owned}.`)
                    }
                  >
                    {r.status === "missing" ? "✕ " : r.status === "swapped" ? "≈ " : "✓ "}
                    {(r.status === "swapped" ? r.replacedBy?.name : r.effect?.name) ?? r.goal.slug}
                  </span>
                ))}
              </div>
            )}
            <p className="preset-research">Research: {nightlord.research}</p>
          </div>
        )}

        {showVessels && (
          <div className="vessel-list">
            {allVessels.map((v) => (
              <label key={v.name} className="vessel-row">
                <input
                  type="checkbox"
                  checked={!disabledVessels.has(v.name)}
                  onChange={() =>
                    setDisabledVessels((prev) => {
                      const next = new Set(prev);
                      next.has(v.name) ? next.delete(v.name) : next.add(v.name);
                      return next;
                    })
                  }
                />
                <span className="vessel-name">{v.name}</span>
                <span className="vessel-slots">
                  {(mode === "deep" ? v.slots : v.slots.slice(0, 3)).map((c, i) => (
                    <span key={i} className={`slot-dot color-${COLOR_NAMES[c].toLowerCase()} ${i >= 3 ? "deep-slot" : ""}`} title={`${i >= 3 ? "Deep · " : ""}${COLOR_NAMES[c]}`} />
                  ))}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="presets">
        {(() => {
          const suits = (p) => !p.nightfarers || p.nightfarers.includes(nightfarer);
          // A signature preset is one character's researched build: shown first for
          // that character, hidden entirely for everyone else.
          const recommended = PRESETS.filter((p) => suits(p) && (p.signature ? p.nightfarers.includes(nightfarer) : true));
          const others = PRESETS.filter((p) => !suits(p) && !p.signature);
          const card = (p) => (
            <button
              key={p.id}
              className={`preset-card ${activePresetId === p.id ? "active" : ""} ${suits(p) ? "" : "unsuited"}`}
              onClick={() => applyPreset(p)}
            >
              <span className="preset-name">{p.name}</span>
              <span className="preset-tagline">{p.tagline}</span>
              <span className="preset-for">
                {p.signature
                  ? `★ Signature ${gd.nightfarers[p.nightfarers[0]].name} build`
                  : p.nightfarers
                    ? `For ${p.nightfarers.map((id) => gd.nightfarers[id].name).join(", ")}`
                    : "All Nightfarers"}
                {p.characterGoals?.[nightfarer] && suits(p) && ` · ${nf.name}-specific goals included`}
              </span>
              <span className="preset-desc muted">{p.description}</span>
              {p.research && <span className="preset-research">Based on: {p.research}</span>}
            </button>
          );
          return (
            <>
              <h2>Deep of Night presets for {nf.name}</h2>
              <div className="preset-grid">{recommended.map(card)}</div>
              {others.length > 0 && (
                <>
                  <h3 className="muted">Built for other Nightfarers</h3>
                  <div className="preset-grid">{others.map(card)}</div>
                </>
              )}
            </>
          );
        })()}
        {customBuilds.length > 0 && (
          <div className="custom-builds">
            <h3>Your saved builds</h3>
            {customBuilds.map((b) => (
              <div key={b.id} className="custom-build-row">
                <button className="link" onClick={() => applyCustom(b)}>{b.name}</button>
                <span className="muted">
                  {gd.nightfarers[b.nightfarer]?.name} · {b.mode === "deep" ? "Deep of Night" : "Normal"} · {b.goals.length} goals
                </span>
                <button className="ghost small danger" onClick={() => deleteCustom(b.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {report && <GapReport report={report} preset={PRESETS.find((p) => p.id === activePresetId)} />}

      <section className="goal-editor">
        <h2>
          Build goals
          {activePresetId && <span className="muted"> — from preset “{PRESETS.find((p) => p.id === activePresetId)?.name}” (editing makes it custom)</span>}
        </h2>
        {goals.length === 0 && <p className="muted">Pick a preset above or add effects below to start.</p>}
        {goals.map((g, i) => {
          const effect = gd.effectByKey(g.effectKey);
          if (!effect) return null;
          return (
            <div key={`${g.effectKey}-${i}`} className={`goal-row ${g.max === 0 ? "excluded" : ""}`}>
              <span className={`goal-name ${effect.type === 1 ? "curse" : ""}`} title={effectTooltip(effect)}>{effect.name}</span>
              {g.max === 0 ? (
                <span className="badge excluded-badge">Excluded</span>
              ) : (
                <>
                  <label className="mini">
                    need ≥
                    <input
                      type="number" min="0" max="6" value={g.min}
                      onChange={(e) => editGoal(i, { min: Math.max(0, Number(e.target.value)) })}
                    />
                  </label>
                  <label className="mini">
                    max
                    <input
                      type="number" min="0" max="10" value={g.max}
                      onChange={(e) => editGoal(i, { max: Math.max(0, Number(e.target.value)) })}
                    />
                  </label>
                  <select value={g.priority} onChange={(e) => editGoal(i, { priority: e.target.value })}>
                    <option value="high">High priority</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </>
              )}
              <button className="ghost small danger" onClick={() => removeGoal(i)}>✕</button>
            </div>
          );
        })}
        <EffectPicker gd={gd} nightfarer={nightfarer} excludeKeys={goalKeys} onPick={addGoal} inventoryKeys={inventoryKeys} />

        <div className="run-row">
          <button className="primary" disabled={searching || goals.length === 0} onClick={() => runSearch(goals, cursePenalty)}>
            {searching ? "Searching…" : "Find best loadouts"}
          </button>
          <input
            className="build-name"
            placeholder="Name this build…"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
          />
          <button className="ghost" disabled={goals.length === 0} onClick={saveCustom}>Save as custom build</button>
        </div>
        {error && <div className="error-box">{error}</div>}
      </section>

      {results && <Results results={results} gd={gd} mode={mode} />}
    </div>
  );
}
