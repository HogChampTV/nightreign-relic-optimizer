import React from "react";
import SharePopover from "./SharePopover.jsx";
import { buildChecklistPayload, encodeChecklist } from "../lib/share.js";

// "Checklist" button on an optimizer result: builds a self-contained link,
// copies it, and shows a QR code to open it on a phone.
export default function ShareChecklist({ vesselName, score, isDeep, relics }) {
  const makeLink = () => {
    const payload = buildChecklistPayload({ vesselName, score, isDeep, relics });
    return `${window.location.origin}${window.location.pathname}#cl=${encodeChecklist(payload)}`;
  };

  return (
    <SharePopover
      makeLink={makeLink}
      buttonLabel="📱 Checklist"
      note="scan to open this loadout as a tap-off checklist on your phone. The whole build is inside the link; nothing is uploaded."
    />
  );
}
