import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Interactive Great Hollow map: the real in-game map image with datamined
// marker positions (see GREAT_HOLLOW.map in guides-data.js). Pan with drag,
// zoom with wheel / pinch / buttons; markers keep their on-screen size by
// counter-scaling against the current zoom. Crystal spots are tappable and
// report up to the resonance tracker via onToggleCrystal.
const MIN_SCALE = 1;
const MAX_SCALE = 6;
const TAP_SLOP_PX = 8;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function GreatHollowMap({ map, marked, onToggleCrystal, focus }) {
  const viewRef = useRef(null);
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 });
  const [layers, setLayers] = useState({ crystals: true, pois: false, spawns: true, labels: true });
  const [selected, setSelected] = useState(null);
  // Live gesture state (refs so pointer handlers don't re-bind per frame).
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const movedRef = useRef(0);

  // Keep the image inside the viewport: at scale s the world is s× the
  // viewport, so the translate range is [size - size*s, 0] on both axes.
  const clampView = useCallback((v) => {
    const el = viewRef.current;
    const size = el ? el.clientWidth : 0;
    const min = size - size * v.scale;
    return { scale: v.scale, tx: clamp(v.tx, min, 0), ty: clamp(v.ty, min, 0) };
  }, []);

  const zoomAt = useCallback(
    (factor, cx, cy) => {
      setView((v) => {
        const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
        const k = scale / v.scale;
        // Keep the map point under (cx, cy) stationary while scaling.
        return clampView({ scale, tx: cx - k * (cx - v.tx), ty: cy - k * (cy - v.ty) });
      });
    },
    [clampView],
  );

  // "Show on map" from the crystal gallery: zoom in on the spot and select it.
  useEffect(() => {
    if (!focus) return;
    const el = viewRef.current;
    if (!el) return;
    const size = el.clientWidth;
    const scale = 3;
    const px = (focus.spot.x / map.size) * size;
    const py = (focus.spot.y / map.size) * size;
    setView(clampView({ scale, tx: size / 2 - scale * px, ty: size / 2 - scale * py }));
    setSelected(focus.spot);
    setLayers((l) => (l.crystals ? l : { ...l, crystals: true }));
  }, [focus, clampView, map.size]);

  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      const r = viewRef.current.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top);
    },
    [zoomAt],
  );

  // React attaches wheel listeners passively; zooming needs preventDefault so
  // the page doesn't scroll, so bind it natively.
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onPointerDown = (e) => {
    const el = viewRef.current;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = 0;
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      gesture.current = { mode: "pan", x: e.clientX, y: e.clientY };
    } else if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      gesture.current = { mode: "pinch", dist, mx: (pts[0].x + pts[1].x) / 2, my: (pts[0].y + pts[1].y) / 2 };
    }
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];
    if (g.mode === "pan" && pts.length === 1) {
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      movedRef.current += Math.abs(dx) + Math.abs(dy);
      gesture.current = { ...g, x: e.clientX, y: e.clientY };
      setView((v) => clampView({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
    } else if (g.mode === "pinch" && pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const r = viewRef.current.getBoundingClientRect();
      if (g.dist > 0) zoomAt(dist / g.dist, g.mx - r.left, g.my - r.top);
      movedRef.current += Math.abs(dist - g.dist);
      gesture.current = { ...g, dist };
    }
  };

  const onPointerEnd = (e) => {
    pointers.current.delete(e.pointerId);
    const pts = [...pointers.current.values()];
    gesture.current = pts.length === 1 ? { mode: "pan", x: pts[0].x, y: pts[0].y } : null;
  };

  // A click that follows a real drag is not a tap on a marker.
  const tap = (fn) => (e) => {
    if (movedRef.current > TAP_SLOP_PX) return;
    e.stopPropagation();
    fn();
  };

  const pct = (n) => `${(n / map.size) * 100}%`;
  const inv = 1 / view.scale;
  const markedCount = marked.size;
  const base = import.meta.env.BASE_URL + map.image;

  const layerChips = useMemo(
    () => [
      { key: "crystals", label: `Crystal spots (${map.crystals.length})` },
      { key: "pois", label: "Seed POIs" },
      { key: "spawns", label: "Spawns" },
      { key: "labels", label: "Labels" },
    ],
    [map],
  );

  return (
    <div className="ghm">
      <div className="ghm-toolbar">
        {layerChips.map((c) => (
          <button
            key={c.key}
            className={`chip ${layers[c.key] ? "on" : ""}`}
            onClick={() => setLayers((l) => ({ ...l, [c.key]: !l[c.key] }))}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div
        ref={viewRef}
        className="ghm-viewport"
        role="application"
        aria-label="Interactive map of the Great Hollow"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={() => {
          if (movedRef.current <= TAP_SLOP_PX) setSelected(null);
        }}
      >
        <div
          className="ghm-world"
          style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`, "--ghm-inv": inv }}
        >
          <img src={base} alt="The Great Hollow" className="ghm-image" draggable={false} />
          {layers.spawns &&
            map.spawns.map((s) => (
              <button
                key={s.label}
                className={`ghm-marker ghm-spawn ${selected === s ? "sel" : ""}`}
                style={{ left: pct(s.x), top: pct(s.y) }}
                title={s.label}
                onClick={tap(() => setSelected(s))}
              >
                ▼
              </button>
            ))}
          {layers.pois &&
            map.pois.map((p, i) => (
              <button
                key={i}
                className={`ghm-marker ghm-poi ghm-poi-${p.kind} ${selected === p ? "sel" : ""}`}
                style={{ left: pct(p.x), top: pct(p.y) }}
                title={p.label}
                onClick={tap(() => setSelected(p))}
              />
            ))}
          {layers.crystals &&
            map.crystals.map((c) => {
              const on = marked.has(c.id);
              return (
                <button
                  key={c.id}
                  className={`ghm-marker ghm-crystal ${c.underground ? "under" : ""} ${on ? "marked" : ""} ${selected === c ? "sel" : ""}`}
                  style={{ left: pct(c.x), top: pct(c.y) }}
                  title={`Possible Resonating Crystal${c.underground ? " (underground)" : ""} — tap to mark resonated`}
                  onClick={tap(() => {
                    onToggleCrystal(c.id);
                    setSelected(c);
                  })}
                >
                  <span className="ghm-gem">{on ? "✦" : "◆"}</span>
                  {c.underground && <span className="ghm-under-mark">↓</span>}
                </button>
              );
            })}
          {map.landmarks.map((lm, i) => (
            <button
              key={i}
              className={`ghm-marker ghm-lm ghm-lm-${lm.kind} ${selected === lm ? "sel" : ""}`}
              style={{ left: pct(lm.x), top: pct(lm.y) }}
              title={lm.label}
              onClick={tap(() => setSelected(lm))}
            >
              {layers.labels && <span className="ghm-label">{lm.label}</span>}
            </button>
          ))}
        </div>
        <div className="ghm-zoom">
          <button aria-label="Zoom in" onClick={tap(() => zoomAt(1.5, viewRef.current.clientWidth / 2, viewRef.current.clientHeight / 2))}>+</button>
          <button aria-label="Zoom out" onClick={tap(() => zoomAt(1 / 1.5, viewRef.current.clientWidth / 2, viewRef.current.clientHeight / 2))}>−</button>
          <button aria-label="Reset view" onClick={tap(() => setView({ scale: 1, tx: 0, ty: 0 }))}>⟲</button>
        </div>
      </div>
      <div className="ghm-caption">
        {selected ? (
          <p>
            <strong>{selected.label ?? `Crystal spot ${selected.id}${selected.underground ? " (underground)" : ""}`}</strong>
            {" — "}
            {selected.hint ??
              (marked.has(selected.id)
                ? "marked as resonated. Tap again to unmark."
                : "one of the 21 possible Resonating Crystal spots. Spawns are per-run random, so not every spot is used. Tap it when you resonate here.")}
          </p>
        ) : (
          <p className="muted">
            Drag to pan, scroll/pinch to zoom. <span className="ghm-key-crystal">◆</span> possible crystal spots
            ({markedCount > 0 ? `${markedCount} marked, ` : ""}↓ = in the underground inset, lower right) —{" "}
            tap one when you resonate it and the tracker follows. Tap any marker for details.
          </p>
        )}
      </div>
      <p className="preset-research ghm-credit">{map.credit}</p>
    </div>
  );
}

// Close-up card per crystal spot: a CSS crop of the same map image centered
// on the spot (no extra assets), its location note, and mark/show actions.
const THUMB_WINDOW = 220; // map units visible across a thumbnail

const THUMB_ASPECT = 2; // thumbs are 2:1 (matches .ghc-thumb aspect-ratio)

export function CrystalGallery({ map, marked, onToggleCrystal, onShow }) {
  const zoom = map.size / THUMB_WINDOW;
  const base = import.meta.env.BASE_URL + map.image;
  // Background-position % that centers map-space coordinate v in the thumb.
  // The size % sets image width relative to thumb width, so the vertical
  // scale relative to thumb height is larger by the aspect ratio. Near the
  // map edge the position clamps, so the ring gets the residual offset
  // (ring% equals 50 whenever the position didn't clamp).
  const pos = (v, s) => clamp((100 * (0.5 - (v / map.size) * s)) / (1 - s), 0, 100);
  const ringPos = (v, s, p) => `${(v / map.size) * s * 100 + (1 - s) * p}%`;
  return (
    <div className="ghc-grid">
      {map.crystals.map((c) => {
        const on = marked.has(c.id);
        const px = pos(c.x, zoom);
        const py = pos(c.y, zoom * THUMB_ASPECT);
        return (
          <div key={c.id} className={`ghc-card ${on ? "marked" : ""}`}>
            <button
              className="ghc-thumb"
              style={{
                backgroundImage: `url(${base})`,
                backgroundSize: `${zoom * 100}%`,
                backgroundPosition: `${px}% ${py}%`,
              }}
              title="Show on the big map"
              aria-label={`Show crystal spot ${c.id} on the map`}
              onClick={() => onShow(c)}
            >
              <span
                className={`ghc-ring ${c.underground ? "under" : ""} ${on ? "marked" : ""}`}
                style={{ left: ringPos(c.x, zoom, px), top: ringPos(c.y, zoom * THUMB_ASPECT, py) }}
              />
            </button>
            <div className="ghc-body">
              <div className="ghc-head">
                <strong>#{c.id}</strong>
                <span className={`badge ${c.underground ? "deep-badge" : "ok-badge"}`}>
                  {c.underground ? "underground" : "surface"}
                </span>
              </div>
              <p className="ghc-where">{c.where}</p>
              <div className="ghc-actions">
                <button className={`chip ${on ? "on" : ""}`} onClick={() => onToggleCrystal(c.id)}>
                  {on ? "✦ resonated" : "mark resonated"}
                </button>
                <button className="chip" onClick={() => onShow(c)}>
                  show on map
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
