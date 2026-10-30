import React, { useMemo, useState } from "react";
import { Color, COLOR_NAMES } from "../engine/game-data.js";
import RelicCard from "./RelicCard.jsx";
import EffectPicker from "./EffectPicker.jsx";
import { makeMatcher } from "../lib/text-match.js";

const KIND_OPTIONS = [
  { id: "all", label: "All relics" },
  { id: "normal", label: "Normal" },
  { id: "deep", label: "Deep" },
];

export default function RelicBrowser({ character, gd, wishlist, setWishlist }) {
  const [query, setQuery] = useState("");
  const [colors, setColors] = useState(new Set());
  const [kind, setKind] = useState("all");
  const [hideRedundant, setHideRedundant] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const toggleColor = (c) =>
    setColors((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  // Wishlist is stored as slugs; resolve to effect objects/keys for display
  // and card highlighting.
  const wlEffects = useMemo(
    () => wishlist.map((slug) => gd.effectsByKey.find((e) => e?.slug === slug)).filter(Boolean),
    [wishlist, gd],
  );
  const wlKeys = useMemo(() => new Set(wlEffects.map((e) => e.key)), [wlEffects]);

  const inventoryKeys = useMemo(() => {
    const keys = new Set();
    for (const r of character.relics) for (const e of r.effects.flat()) keys.add(e.key);
    return keys;
  }, [character]);

  const hasWishlisted = (r) => r.effects.flat().some((e) => wlKeys.has(e.key));

  const filtered = useMemo(() => {
    const matches = makeMatcher(query);
    return character.relics.filter((r) => {
      if (kind === "normal" && r.isDeep) return false;
      if (kind === "deep" && !r.isDeep) return false;
      if (colors.size > 0 && !colors.has(r.color)) return false;
      if (hideRedundant && r.redundant) return false;
      if (wishlistOnly && !hasWishlisted(r)) return false;
      if (!matches(r.searchText)) return false;
      return true;
    });
  }, [character, query, colors, kind, hideRedundant, wishlistOnly, wlKeys]);

  const redundantCount = character.relics.filter((r) => r.redundant).length;
  const wishlistMatchCount = useMemo(
    () => (wlKeys.size === 0 ? 0 : character.relics.filter(hasWishlisted).length),
    [character, wlKeys],
  );

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
          {wishlist.length > 0 && (
            <button
              className={`chip wishlist-chip ${wishlistOnly ? "on" : ""}`}
              title="Only relics carrying a wishlisted effect"
              onClick={() => setWishlistOnly(!wishlistOnly)}
            >
              ★ Wishlist matches ({wishlistMatchCount})
            </button>
          )}
          <button className="chip" onClick={() => setShowWishlist(!showWishlist)}>
            Wishlist ({wishlist.length}) {showWishlist ? "▴" : "▾"}
          </button>
        </div>
        {showWishlist && (
          <div className="wishlist-panel">
            <p className="muted">
              Star the effects you're farming for. Matching effects glow on every relic card here, and
              What's New flags fresh imports that contain one.
            </p>
            {wlEffects.length > 0 && (
              <div className="chip-row">
                {wlEffects.map((e) => (
                  <span key={e.key} className="chip wishlist-item on">
                    ★ {e.name}
                    <button
                      className="chip-x"
                      title="Remove from wishlist"
                      onClick={() => setWishlist(wishlist.filter((s) => s !== e.slug))}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <EffectPicker
              gd={gd}
              nightfarer="any"
              excludeKeys={wlKeys}
              inventoryKeys={inventoryKeys}
              placeholder="Add an effect to your wishlist (type to search)…"
              onPick={(e) => e.slug && setWishlist([...wishlist, e.slug])}
            />
          </div>
        )}
        <div className="muted result-count">
          {filtered.length} of {character.relics.length} relics
        </div>
      </div>
      <div className="relic-grid">
        {filtered.map((r) => (
          <RelicCard key={r.uid} relic={r} highlightKeys={wlKeys.size > 0 ? wlKeys : undefined} />
        ))}
      </div>
    </div>
  );
}
