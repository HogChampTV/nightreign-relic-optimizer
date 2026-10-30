import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Checklist from "./components/Checklist.jsx";
import { checklistFromHash } from "./lib/share.js";
import "./styles.css";

// A #cl= link renders as a standalone, phone-friendly equip checklist — the
// whole loadout travels in the URL, no save import needed. Otherwise, the app.
const cl = checklistFromHash();
createRoot(document.getElementById("root")).render(
  cl ? <Checklist data={cl.data} id={cl.id} /> : <App />,
);

// Offline/installable support (production only; dev server stays uncached).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
