import React, { useMemo, useState } from "react";
import { Color, COLOR_NAMES } from "../engine/game-data.js";
import RelicCard from "./RelicCard.jsx";
import { makeMatcher } from "../lib/text-match.js";

const KIND_OPTIONS = [
  { id: "all", label: "All relics" },
  { id: "normal", label: "Normal" },
  { id: "deep", label: "Deep" },
];

export default function RelicBrowser({ character }) {
  const [query, setQuery] = useState("");
  const [colors, setColors] = useState(new Set());
  const [kind, setKind] = useState("all");
  const [hideRedundant, setHideRedundant] = useState(false);

  const toggleColor = (c) =>
    setColors((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const filtered = useMemo(() => {
    const matches = makeMatcher(query);
    return character.relics.filter((r) => {
      if (kind === "normal" && r.isDeep) return false;
      if (kind === "deep" && !r.isDeep) return false;
      if (colors.size > 0 && !colors.has(r.color)) return false;
      if (hideRedundant && r.redundant) return false;
      if (!matches(r.searchText)) return false;
      return true;
    });
  }, [character, query, colors, kind, hideRedundant]);

  const redundantCount = character.relics.filter((r) => r.redundant).length;

  return (
    <div className="browser">
      <div className="browser-controls">
        <input
          className="search"
          placeholder="Search relic or effect names…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chip-row">
          {[Color.Red, Color.Blue, Color.Yellow, Color.Green].map((c) => (
            <button
              key={c}
              className={`chip color-chip color-${COLOR_NAMES[c].toLowerCase()} ${colors.has(c) ? "on" : ""}`}
              onClick={() => toggleColor(c)}
            >
              {COLOR_NAMES[c]}
            </button>
          ))}
          {KIND_OPTIONS.map((k) => (
            <button key={k.id} className={`chip ${kind === k.id ? "on" : ""}`} onClick={() => setKind(k.id)}>
              {k.label}
            </button>
          ))}
          <button className={`chip ${hideRedundant ? "on" : ""}`} onClick={() => setHideRedundant(!hideRedundant)}>
            Hide duplicates/outclassed ({redundantCount})
          </button>
        </div>
        <div className="muted result-count">
          {filtered.length} of {character.relics.length} relics
        </div>
      </div>
      <div className="relic-grid">
        {filtered.map((r) => (
          <RelicCard key={r.uid} relic={r} />
        ))}
      </div>
    </div>
  );
}
