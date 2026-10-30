import React, { useEffect, useMemo, useState } from "react";
import gameDataJson from "./data/game-data.json";
import { createGameData } from "./engine/game-data.js";
import { buildCharacter } from "./engine/model.js";
import {
  loadSave, persistSave, clearSave, loadPrefs, persistPrefs, loadPrevSave, persistPrevSave,
  loadTutorialSeen, persistTutorialSeen, loadWishlist, persistWishlist,
} from "./lib/store.js";
import { buildFromHash } from "./lib/share.js";
import Tutorial from "./components/Tutorial.jsx";
import ImportPanel from "./components/ImportPanel.jsx";
import RelicBrowser from "./components/RelicBrowser.jsx";
import BuildPlanner from "./components/BuildPlanner.jsx";
import SellAudit from "./components/SellAudit.jsx";
import WhatsNew from "./components/WhatsNew.jsx";
import Guides from "./components/Guides.jsx";
import { auditSellables } from "./lib/sell-audit.js";

const gd = createGameData(gameDataJson);

export default function App() {
  const [save, setSave] = useState(() => loadSave());
  const [demoSave, setDemoSave] = useState(null);
  const [prevSave, setPrevSave] = useState(() => loadPrevSave());
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [tab, setTab] = useState("builds");
  const [showImport, setShowImport] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [wishlist, setWishlistState] = useState(() => loadWishlist());
  // A #b= link carries a friend's build goals; held until the planner mounts
  // (after an import or demo load) and cleared from the URL right away.
  const [sharedBuild, setSharedBuild] = useState(() => {
    const b = buildFromHash();
    if (b) history.replaceState(null, "", window.location.pathname + window.location.search);
    return b;
  });

  const setWishlist = (slugs) => {
    setWishlistState(slugs);
    persistWishlist(slugs);
  };

  const setPref = (k, v) => {
    setPrefs((p) => {
      const next = { ...p, [k]: v };
      persistPrefs(next);
      return next;
    });
  };

  // A real import always wins over demo data; demo is only a stand-in.
  const activeSave = save ?? demoSave;
  const isDemo = !save && !!demoSave;

  const characters = useMemo(
    () => (activeSave?.slots ?? []).map((slot) => buildCharacter(slot, gd)).filter((c) => c.relics.length > 0),
    [activeSave],
  );

  const slotIndex = characters.some((c) => c.index === prefs.slotIndex)
    ? prefs.slotIndex
    : characters.reduce((best, c) => (c.relics.length > (characters.find((x) => x.index === best)?.relics.length ?? -1) ? c.index : best), characters[0]?.index ?? 0);
  const character = characters.find((c) => c.index === slotIndex) ?? null;

  useEffect(() => {
    if (save && characters.length === 0) setShowImport(true);
  }, [save, characters.length]);

  // First successful import: offer the tour once.
  useEffect(() => {
    if (character && !loadTutorialSeen()) setShowTutorial(true);
  }, [character]);

  const closeTutorial = () => {
    persistTutorialSeen();
    setShowTutorial(false);
  };

  const onImported = (parsed) => {
    // Keep the outgoing save as the diff baseline, unless it's the same import.
    if (save && JSON.stringify(save) !== JSON.stringify(parsed)) {
      persistPrevSave(save);
      setPrevSave(save);
    }
    setSave(parsed);
    persistSave(parsed);
    setDemoSave(null);
    setShowImport(false);
  };

  // Demo browsing: a sample relic collection (synthetic test data, not a real
  // player's save) so every tab can be explored before importing. Not persisted.
  const startDemo = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}demo-save.json`);
      setDemoSave(await res.json());
      setShowImport(false);
    } catch {
      /* stay on the import screen */
    }
  };

  const onClear = () => {
    clearSave();
    setSave(null);
    setPrevSave(null);
  };

  const relics = useMemo(() => character?.relics.filter((r) => !r.isDeep) ?? [], [character]);
  const deepRelics = useMemo(() => character?.relics.filter((r) => r.isDeep) ?? [], [character]);
  const sellCount = useMemo(() => (character ? auditSellables(gd, character.relics).safe.length : 0), [character]);

  const prevCharacter = useMemo(() => {
    if (!prevSave || !character) return null;
    const slot = (prevSave.slots ?? []).find((s) => s.index === character.index);
    return slot ? buildCharacter(slot, gd) : null;
  }, [prevSave, character]);
  const newCount = useMemo(() => {
    if (!prevCharacter || !character) return 0;
    const prevKeys = new Set(prevCharacter.relics.map((r) => r.key));
    return character.relics.filter((r) => !prevKeys.has(r.key)).length;
  }, [character, prevCharacter]);

  return (
    <div className={`app ${showTutorial ? "tutorial-open" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-sigil">◆</span>
          <h1>Nightreign Relic Optimizer</h1>
          <span className="brand-sub">Deep of Night build curation</span>
        </div>
        <div className="topbar-right">
          {character && (
            <>
              <label className="slot-picker">
                Character
                <select value={slotIndex} onChange={(e) => setPref("slotIndex", Number(e.target.value))}>
                  {characters.map((c) => (
                    <option key={c.index} value={c.index}>
                      {c.name || `Slot ${c.index + 1}`} · {c.relics.length} relics
                    </option>
                  ))}
                </select>
              </label>
              <button className="ghost" onClick={() => setShowImport(true)}>
                {isDemo ? "Import your save" : "Re-import save"}
              </button>
              <button className="ghost help-btn" title="Show the guided tour" onClick={() => setShowTutorial(true)}>
                ? Help
              </button>
            </>
          )}
        </div>
      </header>

      {showImport || !character ? (
        <ImportPanel
          onImported={onImported}
          onCancel={character ? () => setShowImport(false) : undefined}
          onClear={save ? onClear : undefined}
          onDemo={!activeSave ? startDemo : undefined}
          pendingBuild={sharedBuild ? (sharedBuild.n ?? "") : undefined}
        />
      ) : (
        <>
          {isDemo && (
            <div className="demo-banner">
              <span>
                <strong>Demo data</strong> — a sample relic collection, not yours. Every tab works; import your own
                save to see your relics.
              </span>
              <button className="ghost small" onClick={() => setShowImport(true)}>Import your save</button>
            </div>
          )}
          <nav className="tabs">
            <button className={tab === "builds" ? "active" : ""} onClick={() => setTab("builds")}>Build Optimizer</button>
            <button className={tab === "relics" ? "active" : ""} onClick={() => setTab("relics")}>
              Relic Browser <span className="count">{character.relics.length}</span>
            </button>
            <button className={tab === "sell" ? "active" : ""} onClick={() => setTab("sell")}>
              Sell Audit <span className="count">{sellCount}</span>
            </button>
            <button className={tab === "new" ? "active" : ""} onClick={() => setTab("new")}>
              What's New {prevCharacter && <span className="count">{newCount}</span>}
            </button>
            <button className={tab === "guides" ? "active" : ""} onClick={() => setTab("guides")}>
              Guides
            </button>
          </nav>
          {tab === "relics" ? (
            <RelicBrowser character={character} gd={gd} wishlist={wishlist} setWishlist={setWishlist} />
          ) : tab === "sell" ? (
            <SellAudit gd={gd} character={character} />
          ) : tab === "new" ? (
            <WhatsNew character={character} prevCharacter={prevCharacter} wishlist={wishlist} />
          ) : tab === "guides" ? (
            <Guides
              gd={gd}
              onTargetNightlord={(id) => {
                setPref("nightlord", id);
                setTab("builds");
              }}
            />
          ) : (
            <BuildPlanner
              gd={gd}
              relics={relics}
              deepRelics={deepRelics}
              prefs={prefs}
              setPref={setPref}
              sharedBuild={sharedBuild}
              onSharedBuildApplied={() => setSharedBuild(null)}
            />
          )}
          <Tutorial open={showTutorial} onClose={closeTutorial} setTab={setTab} />
        </>
      )}

      <footer className="footer">
        Your save is parsed entirely in this browser and never uploaded. Read-only: the optimizer cannot change your save.
        Save-format research &amp; search engine: <a href="https://github.com/metinc/nightreign-relic-browser" target="_blank" rel="noreferrer">nightreign-relic-browser</a> and{" "}
        <a href="https://github.com/tonydavis629/nightreign-relic-vault" target="_blank" rel="noreferrer">nightreign-relic-vault</a> (MIT).
      </footer>
    </div>
  );
}
