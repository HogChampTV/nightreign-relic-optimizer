// Self-contained checklist links: the whole loadout (names, colors, effects,
// equip locations) is packed into the URL hash, so the link works on any
// device — e.g. a phone next to the PC — with no save import and no server.

import { deflateSync, inflateSync } from "fflate";

const b64url = (s) => s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64std = (s) => s.replace(/-/g, "+").replace(/_/g, "/");

const toB64 = (bytes) => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return b64url(btoa(bin));
};
const fromB64 = (encoded) => Uint8Array.from(atob(b64std(encoded)), (c) => c.charCodeAt(0));

// Deflate before base64: the payload is repetitive text, so this roughly
// halves the link — which drops the QR code several versions and makes it
// far easier for a phone camera to lock onto.
const encodeShare = (data) => toB64(deflateSync(new TextEncoder().encode(JSON.stringify(data))));

const decodeShare = (encoded) => {
  try {
    const bytes = fromB64(encoded);
    try {
      return JSON.parse(new TextDecoder().decode(inflateSync(bytes)));
    } catch {
      // Older links were plain base64 JSON; keep them working.
      return JSON.parse(new TextDecoder().decode(bytes));
    }
  } catch {
    return null;
  }
};

export function encodeChecklist(data) {
  return encodeShare(data);
}

export function decodeChecklist(encoded) {
  const data = decodeShare(encoded);
  return Array.isArray(data?.r) ? data : null;
}

/** Stable short id for a checklist payload, for per-list checkbox storage. */
export function checklistId(encoded) {
  let h = 0;
  for (let i = 0; i < encoded.length; i++) h = ((h << 5) - h + encoded.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function checklistFromHash() {
  const m = window.location.hash.match(/^#cl=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const data = decodeChecklist(m[1]);
  return data ? { data, id: checklistId(m[1]) } : null;
}

// ---- Shared builds (#b= links) ----
// Goals travel as effect slugs (stable across game-data updates), so a friend's
// app resolves them against its own tables.

/** Build the payload for the current goal editor state. */
export function buildSharePayload({ name, nightfarer, mode, cursePenalty, nightlordId, goals, gd }) {
  return {
    t: "build",
    n: name,
    f: nightfarer,
    m: mode,
    c: cursePenalty,
    nl: nightlordId || undefined,
    g: goals
      .map((g) => {
        const e = gd.effectByKey(g.effectKey);
        return e?.slug ? { s: e.slug, min: g.min, max: g.max, p: g.priority } : null;
      })
      .filter(Boolean),
  };
}

export function encodeBuild(payload) {
  return encodeShare(payload);
}

export function decodeBuild(encoded) {
  const data = decodeShare(encoded);
  return data?.t === "build" && Array.isArray(data.g) ? data : null;
}

export function buildFromHash() {
  const m = window.location.hash.match(/^#b=([A-Za-z0-9_-]+)/);
  return m ? decodeBuild(m[1]) : null;
}

/** Build the payload for one optimizer result. */
export function buildChecklistPayload({ vesselName, score, isDeep, relics }) {
  return {
    v: vesselName,
    s: score,
    d: isDeep ? 1 : 0,
    r: relics.map((r) =>
      r
        ? {
            n: r.name,
            c: r.color,
            d: r.isDeep ? 1 : 0,
            l: [r.coordinatesByColor[0] + 1, r.coordinatesByColor[1] + 1],
            e: r.effects.flatMap((pair) =>
              pair.filter(Boolean).map((ef) => (ef.type === 1 ? `✦ ${ef.name}` : ef.name)),
            ),
          }
        : null,
    ),
  };
}
