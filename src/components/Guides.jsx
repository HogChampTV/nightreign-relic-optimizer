import React, { useRef, useState } from "react";
import { DAMAGE_TYPES, STATUS_TYPES, WEAKNESS_ROWS, RISE_GUIDE, SHIFTING_EARTH, GREAT_HOLLOW } from "../lib/guides-data.js";
import { CURSE_TIERS } from "../lib/curse-tiers.js";
import { effectNote } from "../lib/effect-notes.js";

const dmgClass = (v) => (v > 0 ? "good" : v < 0 ? "bad" : "");
const statusClass = (v) => (v === null ? "immune" : v <= 154 ? "good" : v >= 541 ? "bad" : "");

function WeaknessTable({ onTarget }) {
  return (
    <section className="guide-section">
      <h2>Nightlord weaknesses</h2>
      <p className="muted">
        Damage modifiers per type (<span className="dmg good">green = bonus damage</span>,{" "}
        <span className="dmg bad">red = resisted</span>) and status buildup thresholds (lower procs faster;{" "}
        <span className="dmg immune">— = immune</span>). Click a boss to target it in the optimizer.
      </p>
      <div className="weakness-scroll">
        <table className="weakness-table">
          <thead>
            <tr>
              <th>Expedition</th>
              <th>Nightlord</th>
              {DAMAGE_TYPES.map((t) => (
                <th key={t}>{t}</th>
              ))}
              {STATUS_TYPES.map((t) => (
                <th key={t} className="status-col">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEAKNESS_ROWS.map((row, i) => (
              <tr key={i}>
                <td className="muted">{row.expedition}</td>
                <td>
                  <button className="link boss-link" onClick={() => onTarget(row.nightlordId)} title="Set as Target Nightlord in the Build Optimizer">
                    {row.boss}
                  </button>
                </td>
                {row.dmg.map((v, j) => (
                  <td key={j} className={`dmg ${dmgClass(v)}`}>
                    {v === 0 ? "·" : `${v > 0 ? "+" : ""}${v}%`}
                  </td>
                ))}
                {row.status.map((v, j) => (
                  <td key={j} className={`dmg status-col ${statusClass(v)}`}>
                    {v === null ? "—" : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="preset-research">
        Community-datamined chart, cross-checked against the Fextralife and wiki.gg negation/status tables. Deep of
        Night and Everdark variants keep the same tables.
      </p>
    </section>
  );
}

function RiseHelper() {
  const [found, setFound] = useState(() => new Set());
  const toggle = (name) =>
    setFound((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  return (
    <section className="guide-section">
      <h2>
        Sorcerer's Rise — quick unlock{" "}
        {found.size > 0 && (
          <button className="ghost small" onClick={() => setFound(new Set())}>
            Reset ticks
          </button>
        )}
      </h2>
      <p className="muted">{RISE_GUIDE.intro}</p>
      {RISE_GUIDE.sections.map((sec) => (
        <div key={sec.title} className="rise-group">
          <h3>{sec.title}</h3>
          {sec.note && <p className="muted">{sec.note}</p>}
          <div className="rise-spots">
            {sec.spots.map((s) => (
              <button
                key={s.name}
                className={`rise-spot ${found.has(s.name) ? "done" : ""}`}
                onClick={() => toggle(s.name)}
                title={s.hint}
              >
                <span className="rise-check">{found.has(s.name) ? "✓" : ""}</span>
                <span>
                  <span className="rise-name">{s.name}</span>
                  <span className="rise-hint muted">{s.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="preset-research">{RISE_GUIDE.credit}</p>
    </section>
  );
}

function ShiftingEarth() {
  return (
    <section className="guide-section">
      <h2>Shifting Earth events</h2>
      <p className="muted">
        When a Shifting Earth is active, part of Limveld is replaced by a special region with a unique
        permanent-for-the-run reward. What each one gives you, and whether to detour:
      </p>
      <div className="se-grid">
        {SHIFTING_EARTH.map((se) => (
          <div key={se.name} className="se-card">
            <div className="se-head">
              <strong>{se.name}</strong> <span className="muted">· {se.where}</span>
            </div>
            <p className="muted">{se.terrain}</p>
            <p>
              <span className="badge ok-badge">Reward</span> {se.reward}
            </p>
            <p className="muted">
              <strong>Boss:</strong> {se.boss}
            </p>
            <ul className="se-tips">
              {se.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <p className="se-hazard">⚠ {se.hazard}</p>
          </div>
        ))}
      </div>
      <p className="preset-research">
        Researched from the wiki.gg Nightreign Shifting Earth page and Game8's per-event guides,
        cross-checked against Fextralife.
      </p>
    </section>
  );
}

// Schematic icons per landmark kind, drawn at the landmark's x/y.
function LandmarkIcon({ lm }) {
  switch (lm.kind) {
    case "great-crystal":
      return (
        <g>
          <path d={`M ${lm.x} ${lm.y - 16} L ${lm.x + 11} ${lm.y} L ${lm.x} ${lm.y + 16} L ${lm.x - 11} ${lm.y} Z`} className="gh-great-crystal" />
          <path d={`M ${lm.x - 4} ${lm.y - 9} L ${lm.x + 5} ${lm.y + 7}`} className="gh-crack" />
        </g>
      );
    case "castle":
      return <path d={`M ${lm.x - 9} ${lm.y + 8} v -11 h 4 v -4 h 3 v 4 h 4 v -4 h 3 v 4 h 4 v 11 Z`} className="gh-castle" />;
    case "tower":
      return <path d={`M ${lm.x - 5} ${lm.y + 9} L ${lm.x - 3} ${lm.y - 10} h 6 L ${lm.x + 5} ${lm.y + 9} Z`} className="gh-tower" />;
    case "altar":
      return <circle cx={lm.x} cy={lm.y} r={6} className="gh-altar" />;
    default:
      return null;
  }
}

function GreatHollow() {
  const [solo, setSolo] = useState(false);
  const [resonated, setResonated] = useState(0);
  const needed = solo ? 3 : 4;
  const done = resonated >= needed;
  return (
    <section className="guide-section">
      <h2>
        The Great Hollow <span className="badge deep-badge">DLC</span>
      </h2>
      <p className="muted">{GREAT_HOLLOW.blurb}</p>
      <p className="se-hazard">⚠ {GREAT_HOLLOW.curse}</p>

      <div className="gh-layout">
        <div className="gh-map-wrap">
          <svg viewBox="0 0 400 400" className="gh-map" role="img" aria-label="Schematic map of the Great Hollow">
            <rect x="14" y="14" width="372" height="372" rx="46" className="gh-ground" />
            {/* central chasm */}
            <circle cx="200" cy="200" r="52" className="gh-chasm" />
            <circle cx="200" cy="200" r="52" className="gh-chasm-edge" />
            {/* western bridge toward the north tower */}
            <path d="M 148 182 C 130 150, 150 110, 196 78" className="gh-bridge" />
            {GREAT_HOLLOW.crystalSpots.map((c, i) => (
              <g key={i} className="gh-spot">
                <title>{c.hint} — spawns vary per run</title>
                <circle cx={c.x} cy={c.y} r={11} className="gh-spot-ring" />
                <path d={`M ${c.x} ${c.y - 5} L ${c.x + 4} ${c.y} L ${c.x} ${c.y + 5} L ${c.x - 4} ${c.y} Z`} className="gh-spot-gem" />
              </g>
            ))}
            {GREAT_HOLLOW.landmarks.map((lm) => (
              <g key={lm.label} className="gh-landmark">
                <title>{`${lm.label} — ${lm.hint}`}</title>
                <LandmarkIcon lm={lm} />
                <text x={lm.x} y={lm.y + (lm.kind === "great-crystal" ? 30 : 22)} className="gh-label">
                  {lm.label}
                </text>
              </g>
            ))}
          </svg>
          <p className="muted gh-caption">
            Schematic, not to scale. <span className="gh-legend-spot">◇</span> = common Resonating Crystal spots —
            spawns are randomized per run, so not every spot is used; scan for the blue glow from a Spectral Hawk.
          </p>
        </div>

        <div className="gh-side">
          <div className="gh-tracker">
            <h3>Resonance tracker</h3>
            <div className="segmented">
              <button className={!solo ? "on" : ""} onClick={() => { setSolo(false); setResonated(0); }}>Team (4)</button>
              <button className={solo ? "on" : ""} onClick={() => { setSolo(true); setResonated(0); }}>Solo (3)</button>
            </div>
            <div className="gh-pips">
              {Array.from({ length: needed }, (_, i) => (
                <button
                  key={i}
                  className={`gh-pip ${i < resonated ? "done" : ""}`}
                  title={`Resonating Crystal ${i + 1}`}
                  onClick={() => setResonated(i < resonated ? i : i + 1)}
                >
                  {i < resonated ? "✦" : "◇"}
                </button>
              ))}
            </div>
            <p className={done ? "gh-done" : "muted"}>
              {done
                ? "The Great Crystal is open — everyone must touch it individually for the Favor."
                : `${needed - resonated} more to crack the Great Crystal.`}
            </p>
          </div>
          <p>
            <span className="badge ok-badge">Reward</span> {GREAT_HOLLOW.reward}
          </p>
          <ul className="se-tips">
            {GREAT_HOLLOW.mechanic.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3>Bosses</h3>
      <p className="muted">{GREAT_HOLLOW.bosses}</p>
      <h3>Route</h3>
      <ul className="se-tips">
        {GREAT_HOLLOW.tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
      <p className="se-hazard">⚠ {GREAT_HOLLOW.hazard}</p>

      <h3>Getting it to appear</h3>
      <ul className="se-tips">
        {GREAT_HOLLOW.availability.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>

      <h3>Map seeds</h3>
      {GREAT_HOLLOW.seeds.map((s, i) => (
        <p key={i} className="muted">{s}</p>
      ))}
      <ul className="se-tips">
        {GREAT_HOLLOW.tools.map((t) => (
          <li key={t.name}>
            <a href={t.url} target="_blank" rel="noreferrer">{t.name}</a> — {t.desc}.
          </li>
        ))}
      </ul>
      <p className="preset-research">
        Researched from Fextralife's Great Hollow page, eldenring.wiki.gg, Game8, PC Gamer, Destructoid and
        intoindiegames; pattern counts from nightreign-seed-finder.com and thefifthmatt's datamined tracker.
        Crystal-count note: most guides say 4 to resonate (3 solo); one outlet reports ~8 spots spawn in total.
      </p>
    </section>
  );
}

const CURSE_TIER_META = {
  never: { label: "Run-killing — never accept", cls: "bad" },
  painful: { label: "Painful but manageable", cls: "warn" },
  free: { label: "Basically free", cls: "good" },
  unknown: { label: "No community consensus", cls: "" },
};

function CurseGuide({ gd }) {
  const rows = Object.entries(CURSE_TIERS)
    .map(([slug, info]) => ({ slug, ...info, effect: gd.effectsByKey.find((e) => e?.slug === slug) }))
    .filter((r) => r.effect);
  return (
    <section className="guide-section">
      <h2>Curse tiers (Deep relics)</h2>
      <p className="muted">
        Every Deep relic curse, ranked by community consensus. The optimizer's “Reject run-killing
        curses” toggle blocks the top tier automatically.
      </p>
      {["never", "painful", "free", "unknown"].map((tier) => (
        <div key={tier} className="curse-group">
          <h3 className={`curse-tier ${CURSE_TIER_META[tier].cls}`}>{CURSE_TIER_META[tier].label}</h3>
          <div className="curse-rows">
            {rows
              .filter((r) => r.tier === tier)
              .map((r) => (
                <div key={r.slug} className="curse-row">
                  <span className="curse-name curse">✦ {r.effect.name}</span>
                  {effectNote(r.effect)?.v && <span className="curse-value muted">{effectNote(r.effect).v}</span>}
                  <span className="curse-note">{r.note}</span>
                </div>
              ))}
          </div>
        </div>
      ))}
      <p className="preset-research">
        Tiers researched from Steam discussions, r/Nightreign polls, and the community Deep of Night
        guide — same data the optimizer's curse penalties use.
      </p>
    </section>
  );
}

const SECTIONS = [
  { id: "weakness", label: "Nightlord weaknesses" },
  { id: "hollow", label: "Great Hollow (DLC)" },
  { id: "shifting", label: "Shifting Earth" },
  { id: "rise", label: "Sorcerer's Rise" },
  { id: "curses", label: "Curse tiers" },
];

export default function Guides({ gd, onTargetNightlord }) {
  const refs = useRef({});
  return (
    <div className="guides">
      <div className="chip-row guide-toc">
        {SECTIONS.map((s) => (
          <button key={s.id} className="chip" onClick={() => refs.current[s.id]?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            {s.label}
          </button>
        ))}
      </div>
      <div ref={(el) => (refs.current.weakness = el)}>
        <WeaknessTable onTarget={onTargetNightlord} />
      </div>
      <div ref={(el) => (refs.current.hollow = el)}>
        <GreatHollow />
      </div>
      <div ref={(el) => (refs.current.shifting = el)}>
        <ShiftingEarth />
      </div>
      <div ref={(el) => (refs.current.rise = el)}>
        <RiseHelper />
      </div>
      <div ref={(el) => (refs.current.curses = el)}>
        <CurseGuide gd={gd} />
      </div>
    </div>
  );
}
