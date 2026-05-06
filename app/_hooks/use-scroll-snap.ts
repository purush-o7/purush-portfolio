"use client"

import { useEffect, useRef } from "react"
import { registerNav }       from "./scroll-nav"


const ANIM_MS      = 900    // snap animation duration (ms)
const ANIM_MS_TOUCH = 680   // slightly snappier on touch
const WHEELEND_MS  = 200    // idle window after momentum before unlock
const DELTA_MIN    = 10     // minimum |deltaY| for intentional wheel tick
const TOUCH_MIN    = 35     // px — distance threshold (slow deliberate drag)
const VEL_SNAP     = 0.3    // px/ms — velocity threshold (quick flick)

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Ease-out cubic — feels more like native iOS deceleration on touch
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function useScrollSnap(sections: number) {
  const current       = useRef(0)
  const locked        = useRef(false)
  const animDone      = useRef(false)
  const wheelEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartY   = useRef(0)
  const touchStartT   = useRef(0)   // timestamp of touchstart (ms)
  const rafRef        = useRef<number | null>(null)

  useEffect(() => {
    current.current = Math.round(window.scrollY / window.innerHeight)

    function animateScroll(
      to:     number,
      onDone: () => void,
      ms    = ANIM_MS,
      ease  = easeInOutCubic,
    ) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      const from  = window.scrollY
      const delta = to - from
      const start = performance.now()

      function tick(now: number) {
        const t = Math.min((now - start) / ms, 1)
        window.scrollTo(0, from + delta * ease(t))
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

    function goTo(idx: number, ms = ANIM_MS, ease = easeInOutCubic) {
      const target = Math.max(0, Math.min(idx, sections - 1))
      if (target === current.current) return
      current.current  = target
      locked.current   = true
      animDone.current = false
      if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)

      animateScroll(target * window.innerHeight, () => {
        animDone.current = true
        wheelEndTimer.current = setTimeout(unlock, WHEELEND_MS)
      }, ms, ease)
    }

    registerNav(goTo, () => current.current)

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return

      const intentional = Math.abs(e.deltaY) >= DELTA_MIN

      if (animDone.current) {
        if (intentional) {
          if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)
          unlock()
          goTo(current.current + (e.deltaY > 0 ? 1 : -1))
        } else {
          if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)
          wheelEndTimer.current = setTimeout(unlock, WHEELEND_MS)
        }
        return
      }

      if (locked.current) return
      if (!intentional)   return

      goTo(current.current + (e.deltaY > 0 ? 1 : -1))
    }

    function onTouchStart(e: TouchEvent) {
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return
      touchStartY.current = e.touches[0].clientY
      touchStartT.current = performance.now()
    }

    // Prevent browser native scroll during swipes so inertia can't move
    // scrollY past the current section before our snap takes over.
    function onTouchMove(e: TouchEvent) {
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return
      e.preventDefault()
    }

    function onTouchEnd(e: TouchEvent) {
      if (locked.current) return
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return

      const endY    = e.changedTouches[0].clientY
      const delta   = touchStartY.current - endY          // +ve = swipe up, -ve = swipe down
      const elapsed = performance.now() - touchStartT.current
      // px/ms — average velocity over the whole gesture
      const velocity = elapsed > 0 ? Math.abs(delta) / elapsed : 0

      const isFlick = velocity >= VEL_SNAP               // quick flick, any distance
      const isDrag  = Math.abs(delta) >= TOUCH_MIN        // slow deliberate drag

      if (!isFlick && !isDrag) return                     // accidental touch, ignore

      goTo(current.current + (delta > 0 ? 1 : -1), ANIM_MS_TOUCH, easeOutCubic)
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
    window.addEventListener("touchmove",  onTouchMove,  { passive: false })
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  })
    window.addEventListener("keydown",    onKeyDown)

    return () => {
      if (rafRef.current !== null)    cancelAnimationFrame(rafRef.current)
      if (wheelEndTimer.current)      clearTimeout(wheelEndTimer.current)
      window.removeEventListener("wheel",      onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove",  onTouchMove)
      window.removeEventListener("touchend",   onTouchEnd)
      window.removeEventListener("keydown",    onKeyDown)
    }
  }, [sections])
}
