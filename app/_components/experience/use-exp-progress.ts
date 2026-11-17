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
 * Calls `onChange` with a continuous role position 0 … N-1 as the page scrolls through the
 * experience stage. The value glides toward the real scroll position (exponential smoothing)
 * so native free-scroll feels fluid instead of stepping with each scroll event. Callers write
 * straight to DOM styles, so there is no re-render per frame.
 */
export function useExpProgress(onChange: (cp: number) => void) {
  const cb = useRef(onChange)
  useEffect(() => { cb.current = onChange })

  useEffect(() => {
    let target = 0, shown = 0, raf = 0

    function read() {
      const h = window.innerHeight
      return Math.max(0, Math.min((window.scrollY - EXP_START_SNAP * h) / h, EXP_COUNT - 1))
    }
    function frame() {
      const d = target - shown
      if (Math.abs(d) < 0.0008) { shown = target; cb.current(shown); raf = 0; return }
      shown += d * 0.18
      cb.current(shown)
      raf = requestAnimationFrame(frame)
    }
    function onScroll() {
      target = read()
      if (!raf) raf = requestAnimationFrame(frame)
    }
    function onResize() {
      target = shown = read()
      cb.current(shown)
    }

    target = shown = read()
    const init = requestAnimationFrame(() => cb.current(shown))
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(init)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])
}
