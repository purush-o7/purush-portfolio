"use client"

import { useEffect, useRef } from "react"

const ANIM_MS     = 900   // animation duration
const WHEELEND_MS = 200   // idle time after last momentum tick before unlocking
const DELTA_MIN   = 10    // minimum |deltaY| to count as intentional (filters 1-3px tails)
const TOUCH_MIN   = 50    // px swipe needed on touch

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function useScrollSnap(sections: number) {
  const current       = useRef(0)
  const locked        = useRef(false)
  const animDone      = useRef(false)
  const wheelEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartY   = useRef(0)
  const rafRef        = useRef<number | null>(null)

  useEffect(() => {
    current.current = Math.round(window.scrollY / window.innerHeight)

    function animateScroll(to: number, onDone: () => void) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      const from  = window.scrollY
      const delta = to - from
      const start = performance.now()

      function tick(now: number) {
        const t = Math.min((now - start) / ANIM_MS, 1)
        window.scrollTo(0, from + delta * easeInOutCubic(t))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          rafRef.current = null
          onDone()
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    function unlock() {
      locked.current   = false
      animDone.current = false
    }

    function goTo(idx: number) {
      const target = Math.max(0, Math.min(idx, sections - 1))
      if (target === current.current) return
      current.current  = target
      locked.current   = true
      animDone.current = false
      if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)

      animateScroll(target * window.innerHeight, () => {
        // Animation finished — enter wheel-end window.
        // Momentum ticks will keep resetting this timer; intentional scrolls
        // bypass it (see onWheel below).
        animDone.current = true
        wheelEndTimer.current = setTimeout(unlock, WHEELEND_MS)
      })
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return

      const intentional = Math.abs(e.deltaY) >= DELTA_MIN

      if (animDone.current) {
        if (intentional) {
          // Deliberate scroll after animation — navigate immediately
          if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)
          unlock()
          goTo(current.current + (e.deltaY > 0 ? 1 : -1))
        } else {
          // Momentum tail — push the unlock window further
          if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)
          wheelEndTimer.current = setTimeout(unlock, WHEELEND_MS)
        }
        return
      }

      if (locked.current) return    // animation still running
      if (!intentional)   return    // tiny tick before first scroll

      goTo(current.current + (e.deltaY > 0 ? 1 : -1))
    }

    function onTouchStart(e: TouchEvent) {
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return
      touchStartY.current = e.touches[0].clientY
    }

    function onTouchEnd(e: TouchEvent) {
      if (locked.current) return
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return
      const delta = touchStartY.current - e.changedTouches[0].clientY
      if (Math.abs(delta) < TOUCH_MIN) return
      goTo(current.current + (delta > 0 ? 1 : -1))
    }

    function onKeyDown(e: KeyboardEvent) {
      if (locked.current) return
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        goTo(current.current + 1)
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault()
        goTo(current.current - 1)
      }
    }

    window.addEventListener("wheel",      onWheel,      { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true  })
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  })
    window.addEventListener("keydown",    onKeyDown)

    return () => {
      if (rafRef.current !== null)    cancelAnimationFrame(rafRef.current)
      if (wheelEndTimer.current)      clearTimeout(wheelEndTimer.current)
      window.removeEventListener("wheel",      onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend",   onTouchEnd)
      window.removeEventListener("keydown",    onKeyDown)
    }
  }, [sections])
}
