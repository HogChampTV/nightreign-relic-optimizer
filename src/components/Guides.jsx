import React, { useState } from "react";
import { DAMAGE_TYPES, STATUS_TYPES, WEAKNESS_ROWS, RISE_GUIDE } from "../lib/guides-data.js";

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

export default function Guides({ onTargetNightlord }) {
  return (
    <div className="guides">
      <WeaknessTable onTarget={onTargetNightlord} />
      <RiseHelper />
    </div>
  );
}
