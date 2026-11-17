"use client"

import { useEffect, useRef } from "react"
import { ALL_ENTRIES }       from "./data"

/** Snap index where the first role is fully shown (hero 0, edu 1–2, projects 3, skills 4, experience 5–9). */
export const EXP_START_SNAP = 5

export const EXP_COUNT = ALL_ENTRIES.length

/** Year the role started, e.g. "Mar 2024 – Jan 2026" → "2024". */
export function startYear(period: string): string {
  return period.match(/\d{4}/)?.[0] ?? ""
}

/**
 * Calls `onChange` with a continuous role position 0 … N-1 as the page scrolls
 * through the experience snaps. Fires on scroll, resize and once on mount, so
 * callers can write straight to DOM styles without re-rendering every frame.
 */
export function useExpProgress(onChange: (cp: number) => void) {
  const cb = useRef(onChange)
  useEffect(() => { cb.current = onChange })

  useEffect(() => {
    function fire() {
      const h  = window.innerHeight
      const cp = Math.max(0, Math.min((window.scrollY - EXP_START_SNAP * h) / h, EXP_COUNT - 1))
      cb.current(cp)
    }
    window.addEventListener("scroll", fire, { passive: true })
    window.addEventListener("resize", fire)
    const id = requestAnimationFrame(fire)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener("scroll", fire)
      window.removeEventListener("resize", fire)
    }
  }, [])
}
