import { trackProjectClick } from "../../_lib/analytics"

export const MONO = "var(--font-geist-mono)"

/** Where the KovilLens section lives in the snap order (see page.tsx). */
export const KOVIL_SNAP = 2

export const DEMO_URL = "https://drive.google.com/file/d/1lllf3tCQryNS4RoeqSIFmSF3VF5SIgCL/view"
export const PAPER_URL = "https://ieeexplore.ieee.org/abstract/document/11172645"
export const DOI = "10.1109/ICVR66534.2025.11172645"

export const STACK = ["HoloLens 2", "Unity", "C#", "MRTK", "Mixed Reality"]

export const DESCRIPTION =
  "Mixed Reality on Microsoft HoloLens 2 for digital preservation of Moovar Kovil — a 9th-century Chola temple complex in Tamil Nadu."

export const IMAGES = [
  { src: "/projects/kovil-lens/aerial-view.webp",   alt: "Moovar Kovil — aerial view" },
  { src: "/projects/kovil-lens/hololens-demo.webp", alt: "HoloLens 2 demo at Moovar Kovil" },
  { src: "/projects/kovil-lens/screenshot-1.webp",  alt: "KovilLens — guided storytelling mode" },
  { src: "/projects/kovil-lens/screenshot-2.webp",  alt: "KovilLens — interactive analysis mode" },
  { src: "/projects/kovil-lens/screenshot-3.webp",  alt: "KovilLens — temple reconstruction" },
  { src: "/projects/kovil-lens/site-visit-1.jpg",   alt: "Site visit — Moovar Kovil" },
  { src: "/projects/kovil-lens/site-visit-2.jpg",   alt: "KovilLens — life-size hologram at Moovar Kovil" },
  { src: "/projects/kovil-lens/tooltips.webp",      alt: "KovilLens — UI tooltips" },
] as const

export const SRC = {
  aerial:   IMAGES[0].src,
  models:   IMAGES[1].src,
  scan:     IMAGES[4].src,
  hologram: IMAGES[6].src,
  analysis: IMAGES[3].src,
  tooltips: IMAGES[7].src,
}

/**
 * Called when the visitor opens the 3D explorer. Leaves a note so the home page
 * lands back on this section when they come back (read in use-page-scroll.ts).
 */
export function openExplorer() {
  try { sessionStorage.setItem("snap:restore", String(KOVIL_SNAP)) } catch { /* private mode */ }
  trackProjectClick("KovilLens · 3D Explorer")
}

export function trackDemo() {
  trackProjectClick("KovilLens · Real Demo")
}
