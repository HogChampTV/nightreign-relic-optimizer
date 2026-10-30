import React, { useEffect, useState } from "react";

// Guided tour: a docked card (no backdrop) so the real UI stays visible, and
// steps that reference a tab switch the app to it so you see the thing being
// described.
const STEPS = [
  {
    title: "Welcome, Nightfarer",
    tab: null,
    body: (
      <>
        <p>
          This tool reads your Nightreign save — entirely in your browser, <strong>read-only</strong>, so it can
          never touch the file — and helps you get the most out of your relics.
        </p>
        <p>
          This quick tour walks through the tabs. Reopen it anytime with the <strong>? Help</strong> button up
          top.
        </p>
      </>
    ),
  },
  {
    title: "Build Optimizer",
    tab: "builds",
    body: (
      <>
        <p>
          Pick your <strong>Nightfarer</strong> and a <strong>preset</strong> — curated builds aimed at Deep of
          Night, built only from effects that actually roll on relics. Or add your own goals with the effect
          search.
        </p>
        <p>
          Raiding a specific boss? Set a <strong>Target Nightlord</strong> and researched counter goals (their
          weakness element, the right negation and resistances) are layered on automatically. Then hit{" "}
          <strong>Find best loadouts</strong> to search every vessel + relic combination.
        </p>
        <p>
          Like a build? <strong>🔗 Share build</strong> turns its goals into a link/QR a friend can open — it
          runs against <em>their</em> relics.
        </p>
      </>
    ),
  },
  {
    title: "Reading the results",
    tab: "builds",
    body: (
      <>
        <p>
          Loadouts are ranked by score, with goal chips, a <strong>vessel verdict</strong> strip (★ = best
          chalice), and a <strong>Totals</strong> row summing the always-on numbers: damage multipliers,
          negation, regen — so you can compare #1 and #2 by what they actually give you.
        </p>
        <p>
          Every relic card says where to grab it in-game (<em>“Red filter · row 26, slot 1”</em> under Order
          Found) — and the <strong>📱 Checklist</strong> button turns the whole loadout into a QR code your phone
          can scan: a tap-off equip list, no save needed there.
        </p>
      </>
    ),
  },
  {
    title: "Relic Browser",
    tab: "relics",
    body: (
      <>
        <p>
          Search matches <strong>words anywhere, in any order</strong> — “fp attacks” finds “Attacks Restore FP”.
          Filter by color or Deep.
        </p>
        <p>Hover any effect for a tooltip with notes, including whether copies of it stack.</p>
        <p>
          Hunting something specific? Open the <strong>Wishlist</strong> and star the effects you're farming —
          matches glow on every card, and What's New flags fresh imports that contain one.
        </p>
      </>
    ),
  },
  {
    title: "Sell Audit",
    tab: "sell",
    body: (
      <>
        <p>
          Relics that are <strong>provably safe to sell</strong>: surplus copies beyond what you could ever equip
          at once, and dead weight whose every effect is covered by a better relic you own — respecting researched
          stacking rules.
        </p>
        <p>
          Anything debatable is listed under <strong>Kept for stacking</strong> with the exact effect that makes
          it worth keeping.
        </p>
      </>
    ),
  },
  {
    title: "What's New",
    tab: "new",
    body: (
      <>
        <p>
          After a play session, <strong>re-import your save</strong>: this tab diffs it against the previous
          import and shows what dropped.
        </p>
        <p>
          Each new relic is marked as an <strong>upgrade</strong> (outclasses relics you own), <strong>covered on
          arrival</strong> (instant sell fodder), or shown with the build presets it feeds.
        </p>
      </>
    ),
  },
  {
    title: "Guides",
    tab: "guides",
    body: (
      <>
        <p>
          Mid-expedition reference: the full <strong>Nightlord weakness table</strong> (click a boss to target
          it in the optimizer), a <strong>Great Hollow</strong> guide with a crystal map and resonance tracker,
          every <strong>Shifting Earth</strong> event's reward and route, a tickable{" "}
          <strong>Sorcerer's Rise unlock route</strong>, and all Deep relic <strong>curses ranked by tier</strong>.
        </p>
      </>
    ),
  },
];

export default function Tutorial({ open, onClose, setTab }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (open && STEPS[step].tab) setTab(STEPS[step].tab);
  }, [open, step, setTab]);

  if (!open) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="tutorial-card" role="dialog" aria-label="Tutorial">
      <div className="tutorial-head">
        <h3>{s.title}</h3>
        <span className="muted">
          {step + 1} / {STEPS.length}
        </span>
      </div>
      <div className="tutorial-body">{s.body}</div>
      <div className="tutorial-actions">
        <button className="ghost small" onClick={onClose}>
          {last ? "Close" : "Skip tour"}
        </button>
        <div className="tutorial-nav">
          {step > 0 && (
            <button className="ghost small" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button className="primary small" onClick={() => (last ? onClose() : setStep(step + 1))}>
            {last ? "Done" : "Next"}
          </button>
        </div>
      </div>
      <div className="tutorial-dots">
        {STEPS.map((_, i) => (
          <button key={i} className={i === step ? "on" : ""} onClick={() => setStep(i)} aria-label={`Step ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
