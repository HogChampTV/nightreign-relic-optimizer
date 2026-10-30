import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { buildChecklistPayload, encodeChecklist } from "../lib/share.js";

// "Checklist" button on an optimizer result: builds a self-contained link,
// copies it, and shows a QR code to open it on a phone.
export default function ShareChecklist({ vesselName, score, isDeep, relics }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  const makeLink = () => {
    const payload = buildChecklistPayload({ vesselName, score, isDeep, relics });
    return `${window.location.origin}${window.location.pathname}#cl=${encodeChecklist(payload)}`;
  };

  const onClick = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    const url = makeLink();
    setLink(url);
    setOpen(true);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (!open || !link) return;
    // Plain black-on-white with a real quiet zone: themed/tinted QR codes scan
    // poorly. An integer scale keeps every module pixel-crisp, and low error
    // correction keeps the dense (long-link) code as sparse as possible.
    QRCode.toDataURL(link, {
      margin: 2,
      scale: 3,
      errorCorrectionLevel: "L",
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [open, link]);

  return (
    <span className="share-checklist">
      <button className="ghost small" onClick={onClick}>
        {open ? "Close" : "📱 Checklist"}
      </button>
      {open && (
        <span className="share-pop">
          {qr && <img src={qr} alt="QR code for this checklist" className="share-qr" />}
          <span className="muted">
            {copied ? "Link copied — " : ""}scan to open this loadout as a tap-off checklist on your phone. The
            whole build is inside the link; nothing is uploaded.
          </span>
          <span className="share-actions">
            <button
              className="ghost small"
              onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true)).catch(() => {})}
            >
              Copy link
            </button>
            <a className="ghost small open-link" href={link} target="_blank" rel="noreferrer">
              Open here
            </a>
          </span>
        </span>
      )}
    </span>
  );
}
