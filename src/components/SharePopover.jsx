import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

// Share button + popover: builds the link on open, copies it, shows a QR.
// Plain black-on-white with a quiet zone: themed/tinted QR codes scan poorly.
// An integer scale keeps every module pixel-crisp, and low error correction
// keeps the dense (long-link) code as sparse as possible.
export default function SharePopover({ makeLink, buttonLabel, note }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

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
        {open ? "Close" : buttonLabel}
      </button>
      {open && (
        <span className="share-pop">
          {qr && <img src={qr} alt="QR code for this link" className="share-qr" />}
          <span className="muted">
            {copied ? "Link copied — " : ""}
            {note}
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
