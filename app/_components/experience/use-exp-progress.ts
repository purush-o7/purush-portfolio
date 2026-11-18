"use client"

import { useEffect, useRef } from "react"

import { EXP_START_SNAP, snapMapNow } from "../../_hooks/snap-map"
export { EXP_START_SNAP }


/** Year the role started, e.g. "Mar 2024 – Jan 2026" → "2024". */
export function startYear(period: string): string {
  return period.match(/\d{4}/)?.[0] ?? ""
}

/**
 * Calls `onChange` with the continuous stop position 0 … N-1 as the page scrolls through the
 * experience stage. It is the real scroll position, one-to-one (no easing), so native scrolling
 * feels normal. Callers write straight to DOM styles, so there is no re-render per frame.
 */
export function useExpProgress(onChange: (cp: number) => void) {
  const cb = useRef(onChange)
  useEffect(() => { cb.current = onChange })

  useEffect(() => {
    let raf = 0

    function read() {
      const h = window.innerHeight
      return Math.max(0, Math.min((window.scrollY - EXP_START_SNAP * h) / h, snapMapNow().expStops - 1))
    }
    function frame() { raf = 0; cb.current(read()) }
    function schedule() { if (!raf) raf = requestAnimationFrame(frame) }

    cb.current(read())
    const init = requestAnimationFrame(() => cb.current(read()))
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(init)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])
}
