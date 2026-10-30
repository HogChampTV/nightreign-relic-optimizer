// localStorage persistence. The parsed save (raw effect/item ids only) is kept
// so the app reopens with your relics without re-importing; nothing ever
// leaves the browser.

const SAVE_KEY = "nro.save.v1";
const PREV_SAVE_KEY = "nro.save.prev.v1";
const PREFS_KEY = "nro.prefs.v1";
const BUILDS_KEY = "nro.customBuilds.v1";

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private window or full storage: the app still works, it just forgets.
  }
};

export const loadSave = () => read(SAVE_KEY);
export const persistSave = (parsed) => write(SAVE_KEY, parsed);
export const clearSave = () => { write(SAVE_KEY, null); write(PREV_SAVE_KEY, null); };

// Snapshot of the save as it was BEFORE the latest import, for the
// "what's new since last import" diff.
export const loadPrevSave = () => read(PREV_SAVE_KEY);
export const persistPrevSave = (parsed) => write(PREV_SAVE_KEY, parsed);

export const loadPrefs = () => read(PREFS_KEY) ?? {};
export const persistPrefs = (prefs) => write(PREFS_KEY, prefs);

export const loadCustomBuilds = () => read(BUILDS_KEY) ?? [];
export const persistCustomBuilds = (builds) => write(BUILDS_KEY, builds);
