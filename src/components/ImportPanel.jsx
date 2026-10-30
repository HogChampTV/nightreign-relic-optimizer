import React, { useRef, useState } from "react";
import { parseSave, SaveParseError } from "../engine/save-parser.js";

export default function ImportPanel({ onImported, onCancel, onClear, onDemo }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const parsed = await parseSave(await file.arrayBuffer());
      const total = parsed.slots.reduce((n, s) => n + s.relics.length, 0);
      if (total === 0) {
        setError("The save was decrypted but no relics were found in any character slot.");
      } else {
        onImported(parsed);
      }
    } catch (err) {
      setError(err instanceof SaveParseError ? err.message : `Could not read this file: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="import-panel">
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className="dropzone-icon">⬥</div>
        <h2>{busy ? "Decrypting save…" : "Drop your Nightreign save here"}</h2>
        <p>or click to browse for it</p>
        <input
          ref={fileRef}
          type="file"
          accept=".sl2,.co2"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && <div className="error-box">{error}</div>}

      {onDemo && (
        <div className="demo-offer">
          <span className="muted">No save handy? Look around first:</span>
          <button className="ghost" onClick={onDemo}>Browse with demo data</button>
        </div>
      )}

      <div className="import-help">
        <h3>Where is my save file?</h3>
        <p>
          On PC the save lives at{" "}
          <code>%APPDATA%\Nightreign\&lt;your Steam ID&gt;\NR0000.sl2</code>. Paste that into the
          File Explorer address bar (or into the file picker above) and choose <code>NR0000.sl2</code>.
        </p>
        <p className="muted">
          Everything happens locally in your browser — the file is never uploaded anywhere, and it is
          only read, never modified.
        </p>
      </div>

      <div className="import-actions">
        {onCancel && <button className="ghost" onClick={onCancel}>Cancel</button>}
        {onClear && <button className="ghost danger" onClick={onClear}>Forget stored save data</button>}
      </div>
    </div>
  );
}
