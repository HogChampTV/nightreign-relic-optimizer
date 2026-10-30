// Self-contained checklist links: the whole loadout (names, colors, effects,
// equip locations) is packed into the URL hash, so the link works on any
// device — e.g. a phone next to the PC — with no save import and no server.

const b64url = (s) => s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64std = (s) => s.replace(/-/g, "+").replace(/_/g, "/");

export function encodeChecklist(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return b64url(btoa(bin));
}

export function decodeChecklist(encoded) {
  try {
    const bin = atob(b64std(encoded));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(data?.r)) return null;
    return data;
  } catch {
    return null;
  }
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
