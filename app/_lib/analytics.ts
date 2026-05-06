"use client"

// Typed GA4 event helpers
// All calls are no-ops if gtag hasn't loaded yet (SSR / blocked)

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function track(event: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("event", event, params)
}

// ── Section visibility ────────────────────────────────────────────────────────
export function trackSectionView(section: string) {
  track("view_section", { section_name: section })
}

// ── Project card interactions ─────────────────────────────────────────────────
export function trackCardExpand(title: string) {
  track("card_expand", { project_title: title })
}

export function trackOverlayOpen(title: string) {
  track("overlay_opened", { project_title: title })
}

export function trackOverlayClose(title: string, dwell_ms: number) {
  track("overlay_closed", { project_title: title, dwell_ms })
}

export function trackProjectClick(title: string) {
  track("click_view_project", { project_title: title })
}

// ── Gallery ───────────────────────────────────────────────────────────────────
export function trackGalleryScroll(direction: "wheel" | "touch") {
  track("gallery_scroll", { input_type: direction })
}

// ── Contact / footer ──────────────────────────────────────────────────────────
export function trackContactClick(platform: "GitHub" | "LinkedIn" | "Email") {
  track("click_contact", { platform })
}

// ── Navigation ────────────────────────────────────────────────────────────────
export function trackNavArrow(direction: "up" | "down", from_section: number) {
  track("nav_arrow_click", { direction, from_section })
}
