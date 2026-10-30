import React, { useEffect, useState } from "react";
import { COLOR_NAMES } from "../engine/game-data.js";

// Standalone equip checklist, rendered when the URL carries a #cl= payload.
// Designed for a phone next to the PC: big tap targets, check off each relic
// as you equip it. Ticks are remembered per-link in this browser.
const storageKey = (id) => `nro.checklist.${id}`;

export default function Checklist({ data, id }) {
  const [done, setDone] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(storageKey(id)) ?? "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(id), JSON.stringify([...done]));
    } catch {
      // Private window: ticks just don't persist.
    }
  }, [done, id]);

  const toggle = (i) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const slots = data.r.map((r, i) => ({ r, i })).filter((s) => s.r);
  const allDone = slots.length > 0 && slots.every((s) => done.has(s.i));

  return (
    <div className="app checklist-page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-sigil">◆</span>
          <h1>Equip checklist</h1>
        </div>
      </header>
      <div className="checklist-head">
        <h2>
          {data.v} {data.d ? <span className="badge deep-badge">Deep of Night</span> : null}
        </h2>
        <p className="muted">
          Score {data.s} · {slots.length} relic{slots.length === 1 ? "" : "s"}. On the in-game relic rite screen, set
          the color filter shown on each card with sorting on <strong>“Order Found”</strong>, then count to the row
          and slot.
        </p>
      </div>
      <div className="checklist-items">
        {data.r.map((r, i) => {
          if (!r) return null;
          const colorName = COLOR_NAMES[r.c] ?? "Any";
          const slotLabel = i < 3 ? `Slot ${i + 1}` : `Deep slot ${i - 2}`;
          return (
            <button
              key={i}
              className={`checklist-item color-${colorName.toLowerCase()} ${r.d ? "deep" : ""} ${done.has(i) ? "done" : ""}`}
              onClick={() => toggle(i)}
            >
              <span className="checklist-box">{done.has(i) ? "✓" : ""}</span>
              <span className="checklist-main">
                <span className="checklist-slot muted">{slotLabel}</span>
                <span className="checklist-name">
                  <span className="color-dot" /> {r.n}
                </span>
                <span className="checklist-loc">
                  {colorName} filter · row {r.l[0]}, slot {r.l[1]}
                </span>
                <span className="checklist-effects muted">{r.e.join(" · ")}</span>
              </span>
            </button>
          );
        })}
      </div>
      {allDone && <p className="checklist-done-msg">All equipped — good hunting, Nightfarer. ◆</p>}
      <footer className="footer">
        This checklist is fully contained in the link — nothing was uploaded.{" "}
        <a href={window.location.pathname}>Open the full optimizer</a>
      </footer>
    </div>
  );
}
