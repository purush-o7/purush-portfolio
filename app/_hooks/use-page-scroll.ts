"use client"

import { useEffect } from "react"
import { snapMapNow } from "./snap-map"
import { trackSectionView } from "../_lib/analytics"

const SECTION_NAMES = ["Hero", "Education", "Projects", "Skills", "Experience", "Reel", "Footer"]

/** How close (as a fraction of one screen) a stopped scroll must be to the next section start before it glides there. */
export const SNAP_THRESHOLD = 0.18

/**
 * The page scrolls natively end to end — nothing steps or intercepts the wheel, touch or keyboard while you scroll.
 * This hook does three small jobs:
 *  - settle: once scrolling has fully stopped (momentum included), if a section start lies ahead in the direction
 *    of travel and within SNAP_THRESHOLD of a screen, glide to it. Otherwise do nothing, so scrolling just carries on.
 *    Only section starts count; the long stages (Experience, the reel) have no snap points inside them.
 *  - coming back from a full-page route (the 3D explorer), land on the screen the visitor left from;
 *  - report which section is on screen (analytics), once the scroll settles.
 */
export function usePageScroll() {
  useEffect(() => {
    try {
      const restore = sessionStorage.getItem("snap:restore")
      if (restore !== null) {
        sessionStorage.removeItem("snap:restore")
        const idx = Number(restore)
        if (Number.isFinite(idx)) window.scrollTo(0, idx * window.innerHeight)
      }
    } catch { /* storage unavailable */ }

    // ── settle: glide to a section start when the scroll stops close ahead of one ──
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const hasEnd = "onscrollend" in window                       // Chrome 114+, Firefox 109+, Safari 26.2+
    let touching = false, dir = 0, lastY = window.scrollY
    let settleTimer: ReturnType<typeof setTimeout> | null = null
    const cancel = () => { if (settleTimer) { clearTimeout(settleTimer); settleTimer = null } }
    const settle = () => {
      if (touching || calm || dir === 0) return
      const m = snapMapNow()
      const screenH = document.documentElement.scrollHeight / m.total      // the real height of one screen, whatever the browser bars are doing
      if (!(screenH > 200)) return
      const y = window.scrollY, limit = screenH * SNAP_THRESHOLD
      let target = -1, nearest = Infinity
      for (const s of m.starts) {
        const p = s * screenH
        const ahead = dir > 0 ? p - y : y - p                              // distance to the start, in the direction we were travelling
        if (ahead >= 1 && ahead <= limit && ahead < nearest) { nearest = ahead; target = p }
      }
      if (target >= 0) window.scrollTo({ top: target, behavior: "smooth" })
    }
    const queueSettle = () => { cancel(); settleTimer = setTimeout(settle, hasEnd ? 60 : 140) }
    const noteMove = () => {
      const y = window.scrollY
      if (y !== lastY) { dir = y > lastY ? 1 : -1; lastY = y }
      if (!hasEnd) queueSettle()                                           // no scrollend: wait for a quiet moment instead
    }
    const down = () => { touching = true; cancel() }
    const up   = () => { touching = false; if (!hasEnd) queueSettle() }
    window.addEventListener("scroll", noteMove, { passive: true })
    if (hasEnd) window.addEventListener("scrollend", queueSettle)
    window.addEventListener("touchstart", down, { passive: true })
    window.addEventListener("touchend", up, { passive: true })
    window.addEventListener("touchcancel", up, { passive: true })
    window.addEventListener("wheel", cancel, { passive: true })
    window.addEventListener("keydown", cancel)

    let last = -1
    let timer: ReturnType<typeof setTimeout> | null = null
    const report = () => {
      const idx = Math.round(window.scrollY / window.innerHeight)
      const starts = snapMapNow().starts
      let s = 0
      starts.forEach((v, i) => { if (idx >= v) s = i })
      if (s !== last) { last = s; trackSectionView(SECTION_NAMES[s]) }
    }
    const onScroll = () => { if (timer) clearTimeout(timer); timer = setTimeout(report, 250) }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      if (timer) clearTimeout(timer)
      cancel()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("scroll", noteMove)
      window.removeEventListener("scrollend", queueSettle)
      window.removeEventListener("touchstart", down)
      window.removeEventListener("touchend", up)
      window.removeEventListener("touchcancel", up)
      window.removeEventListener("wheel", cancel)
      window.removeEventListener("keydown", cancel)
    }
  }, [])
}
