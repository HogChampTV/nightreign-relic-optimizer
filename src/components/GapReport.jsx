import React from "react";

const ICONS = { ok: "✓", swapped: "⇄", missing: "✗", excluded: "⃠" };

export default function GapReport({ report, preset }) {
  const missing = report.filter((r) => r.status === "missing");
  const swapped = report.filter((r) => r.status === "swapped");
  const relaxed = report.filter((r) => r.status === "ok" && r.note);

  return (
    <section className="gap-report">
      <h2>Inventory check{preset ? ` — ${preset.name}` : ""}</h2>
      {missing.length === 0 && swapped.length === 0 && relaxed.length === 0 ? (
        <p className="gap-ok">✓ You own relics for every effect in this preset. Full build below.</p>
      ) : (
        <p className="muted">
          You don't have everything this preset wants — here's what was substituted so the optimizer
          can still build the closest thing from your relics.
        </p>
      )}
      <ul className="gap-list">
        {report.map((r, i) => (
          <li key={i} className={`gap-row ${r.status}`}>
            <span className="gap-icon">{ICONS[r.status]}</span>
            <span className="gap-text">
              {r.effect ? r.effect.name : r.goal.slug}
              {r.status === "ok" && !r.note && <span className="muted"> — owned ({r.owned} stack{r.owned === 1 ? "" : "s"})</span>}
              {r.status === "ok" && r.note && <span className="warn-text"> — {r.note}</span>}
              {r.status === "swapped" && (
                <span className="warn-text"> — not owned, using <strong>{r.replacedBy.name}</strong> instead</span>
              )}
              {r.status === "missing" && <span className="error-text"> — not in your inventory{r.note ? ` (${r.note})` : ""}; the optimizer will fill with next-best effects</span>}
              {r.status === "excluded" && <span className="muted"> — builds with this are rejected</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
