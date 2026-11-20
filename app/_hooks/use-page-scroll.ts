"use client"

import { useEffect } from "react"
import { snapMapNow } from "./snap-map"
import { trackSectionView } from "../_lib/analytics"

const SECTION_NAMES = ["Hero", "Education", "Projects", "Skills", "Experience", "Reel", "Footer"]

/**
 * The page scrolls natively end to end — nothing steps, snaps or intercepts the wheel, touch or keyboard.
 * This hook only does two small jobs:
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
    return () => { if (timer) clearTimeout(timer); window.removeEventListener("scroll", onScroll) }
  }, [])
}
