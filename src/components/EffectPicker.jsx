import React, { useMemo, useRef, useState } from "react";
import { effectNote } from "../lib/effect-notes.js";
import { makeMatcher, queryTokens } from "../lib/text-match.js";
import obtainable from "../data/obtainable-effects.json";

// Effects seen on real relics (big inventory ∪ community sheet ∪ upstream recs).
// The game-data tables also hold datamined effects that never roll — hide those.
const OBTAINABLE = new Set(obtainable.keys);

export default function EffectPicker({ gd, nightfarer, excludeKeys, onPick, inventoryKeys }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const matches = makeMatcher(query);
    const first = queryTokens(query)[0];
    return gd.effectsByKey
      .filter(
        (e) =>
          e &&
          !e.mmv &&
          !e.unknown &&
          (e.nightfarer === undefined || e.nightfarer === nightfarer) &&
          (OBTAINABLE.has(e.key) || inventoryKeys?.has(e.key)) &&
          !excludeKeys.has(e.key) &&
          matches(e.name.toLowerCase()),
      )
      // Names that contain the first word earlier rank higher, so an exact
      // "starts with" match still tops the list.
      .sort((a, b) => a.name.toLowerCase().indexOf(first) - b.name.toLowerCase().indexOf(first))
      .slice(0, 30);
  }, [gd, query, nightfarer, excludeKeys]);

  return (
    <div className="effect-picker" ref={boxRef}>
      <input
        placeholder="Add an effect goal (type to search, e.g. “damage negation”)…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && candidates.length > 0 && (
        <ul className="picker-dropdown">
          {candidates.map((e) => (
            <li key={e.key}>
              <button
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => { onPick(e); setQuery(""); setOpen(false); }}
              >
                <span className={e.type === 1 ? "curse" : ""}>{e.name}</span>
                {e.stacks && <span className="muted"> · stacks</span>}
                {effectNote(e)?.v && <span className="picker-note muted">{effectNote(e).v}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
