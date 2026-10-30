import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves the site under /<repo>/; the deploy workflow sets
  // VITE_BASE. Local dev and plain builds stay at "/".
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  // The combo worker imports modules (code-splitting), which the default
  // iife worker format rejects at build time.
  worker: { format: "es" },
  server: { port: 5190 },
});
