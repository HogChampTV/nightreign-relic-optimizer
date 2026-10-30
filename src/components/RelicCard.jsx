import React from "react";
import { COLOR_NAMES } from "../engine/game-data.js";
import { effectTooltip } from "../lib/effect-notes.js";

export const colorClass = (c) => `color-${(COLOR_NAMES[c] ?? "any").toLowerCase()}`;

export default function RelicCard({ relic, compact = false, highlightKeys, showLocation = false }) {
  return (
    <div className={`relic-card ${colorClass(relic.color)} ${relic.isDeep ? "deep" : ""} ${compact ? "compact" : ""}`}>
      <div className="relic-head">
        <span className="color-dot" title={COLOR_NAMES[relic.color]} />
        <span className="relic-name">{relic.name}</span>
        {relic.isDeep && <span className="badge deep-badge">Deep</span>}
        {relic.isUnique && <span className="badge unique-badge">Unique</span>}
        {relic.redundant && !compact && (
          <span
            className="badge redundant-badge"
            title={`${relic.redundant.outclassed ? "Outclassed by" : "Duplicate of"} ${relic.redundant.relic.name}`}
          >
            {relic.redundant.outclassed ? "Outclassed" : "Duplicate"}
          </span>
        )}
      </div>
      <ul className="relic-effects">
        {relic.effects.map((pair, i) => {
          const [effect, curse] = pair;
          const hl = highlightKeys?.has(effect.key);
          return (
            <li key={i}>
              <span className={`effect ${hl ? "highlight" : ""} ${effect.type === 1 ? "curse" : ""}`} title={effectTooltip(effect)}>
                {effect.name}
              </span>
              {curse && <span className="effect curse" title={effectTooltip(curse)}> ✦ {curse.name}</span>}
            </li>
          );
        })}
      </ul>
      {!compact && (
        <div className="relic-foot muted">
          Row {relic.coordinates[0] + 1}, slot {relic.coordinates[1] + 1} in “Order Found”
        </div>
      )}
      {compact && showLocation && (
        <div className="relic-foot muted">
          {COLOR_NAMES[relic.color]} filter · row {relic.coordinatesByColor[0] + 1}, slot{" "}
          {relic.coordinatesByColor[1] + 1}
        </div>
      )}
    </div>
  );
}
