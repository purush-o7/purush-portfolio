"use client"

import { useEffect } from "react"
import { snapMapNow, EXP_START_SNAP } from "./snap-map"
import { trackSectionView } from "../_lib/analytics"

const SECTION_NAMES = ["Hero", "Education", "Projects", "Skills", "Experience", "Reel", "Footer"]

/** Hero → Skills → start of Experience are one-screen pages. If you travel at least this fraction of a screen the way you were going, the swipe finishes; otherwise it returns. */
export const PAGE_NUDGE = 0.25
/** The settle glide: how long it takes (ms), shortest and longest. Duration grows with the distance; the landing is soft (ease-out). */
export const GLIDE_MIN = 220
export const GLIDE_MAX = 460
/** In the long stages, how close (fraction of a screen) a stopped scroll must be ahead of the next section start before it glides there. */
export const SNAP_THRESHOLD = 0.18

/**
 * The page scrolls natively — nothing intercepts the wheel, touch or keyboard while you scroll.
 * Two simple rules apply only once scrolling has fully stopped (momentum included):
 *  1. The one-screen pages (Hero, Education, Kovil, Skills, up to the start of Experience) never rest between two pages:
 *     the scroll settles on a whole page, finishing the swipe if you went far enough, else returning.
 *  2. After that, in the long stages (Experience, the reel) it is free scrolling; only a stop close ahead of the reel start
 *     or the footer glides to it.
 * Also: coming back from a full-page route (the 3D explorer) lands on the screen the visitor left from, and the section on screen is reported (analytics).
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

    // Our own glide instead of the browser's smooth scroll (which gives no say over speed). Ease-out so it lands softly,
    // and any touch, wheel or key press stops it on the spot so it never fights the visitor.
    let raf = 0, gliding = false
    const stopGlide = () => { if (raf) cancelAnimationFrame(raf); raf = 0; gliding = false }
    const glide = (to: number) => {
      stopGlide()
      const from = window.scrollY, dist = to - from
      if (Math.abs(dist) < 1) return
      const dur = Math.max(GLIDE_MIN, Math.min(GLIDE_MAX, Math.abs(dist) * 0.6))
      const t0 = performance.now()
      gliding = true
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur)
        window.scrollTo({ top: from + dist * (1 - Math.pow(1 - p, 3)), behavior: "instant" })
        if (p < 1) raf = requestAnimationFrame(step)
        else { raf = 0; gliding = false }
      }
      raf = requestAnimationFrame(step)
    }
    const interrupt = () => { cancel(); stopGlide() }
    const settle = () => {
      if (touching || gliding || calm || dir === 0) return
      const m = snapMapNow()
      // One screen = innerHeight, the same measure every section layer uses to place itself. (100vh would be taller than innerHeight on a phone
      // while the address bar shows, so the snap would land a little past the section start, a sliver of the next one showing.)
      const screenH = window.innerHeight
      if (!(screenH > 200)) return
      const y = window.scrollY, limit = screenH * SNAP_THRESHOLD
      if (y < EXP_START_SNAP * screenH) {                                   // rule 1: one-screen pages always land on a whole page
        const page = Math.max(0, Math.min(EXP_START_SNAP, Math.round(y / screenH + dir * PAGE_NUDGE)))
        if (Math.abs(page * screenH - y) >= 1) glide(page * screenH)
        return
      }
      let target = -1, nearest = Infinity
      for (const s of m.starts) {
        const p = s * screenH
        const ahead = dir > 0 ? p - y : y - p                              // distance to the start, in the direction we were travelling
        if (ahead >= 1 && ahead <= limit && ahead < nearest) { nearest = ahead; target = p }
      }
      if (target >= 0) glide(target)
    }
    const queueSettle = () => { cancel(); settleTimer = setTimeout(settle, hasEnd ? 60 : 140) }
    const noteMove = () => {
      const y = window.scrollY
      if (y !== lastY) { dir = y > lastY ? 1 : -1; lastY = y }
      if (!hasEnd) queueSettle()                                           // no scrollend: wait for a quiet moment instead
    }
    const down = () => { touching = true; interrupt() }
    const up   = () => { touching = false; if (!hasEnd) queueSettle() }
    window.addEventListener("scroll", noteMove, { passive: true })
    if (hasEnd) window.addEventListener("scrollend", queueSettle)
    window.addEventListener("touchstart", down, { passive: true })
    window.addEventListener("touchend", up, { passive: true })
    window.addEventListener("touchcancel", up, { passive: true })
    window.addEventListener("wheel", interrupt, { passive: true })
    window.addEventListener("keydown", interrupt)

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
      interrupt()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("scroll", noteMove)
      window.removeEventListener("scrollend", queueSettle)
      window.removeEventListener("touchstart", down)
      window.removeEventListener("touchend", up)
      window.removeEventListener("touchcancel", up)
      window.removeEventListener("wheel", interrupt)
      window.removeEventListener("keydown", interrupt)
    }
  }, [])
}
