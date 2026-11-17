"use client"

import { useEffect, useRef } from "react"
import { registerNav, SECTION_STARTS } from "./scroll-nav"
import { trackSectionView }            from "../_lib/analytics"

const ANIM_MS        = 900   // snap animation duration (ms)
const ANIM_MS_TOUCH  = 680   // slightly snappier on touch
const WHEELEND_MS    = 200   // idle window after momentum before unlock
const DELTA_MIN      = 10    // minimum |deltaY| for intentional wheel tick
const TOUCH_MIN      = 35    // px — distance threshold (slow deliberate drag)
const VEL_SNAP       = 0.3   // px/ms — velocity threshold (quick flick)
const WHEEL_GAP_MS   = 220   // wheel silence that separates one gesture from the next

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
  const touchStartT   = useRef(0)
  const rafRef        = useRef<number | null>(null)
  // Wheel gestures are segmented by silence (WHEEL_GAP_MS) or a direction flip.
  // A gesture that STARTS mid-content only ever scrolls the content to its end;
  // only a gesture that STARTS with the content already ended changes section —
  // mirroring the touch behaviour below.
  const wheelLastT       = useRef(0)      // timestamp of the previous wheel event
  const wheelDir         = useRef(0)      // direction of the current wheel gesture
  const wheelAtBoundary  = useRef(false)  // was the passthrough already ended at gesture start?
  // Touch: was the passthrough at boundary in the swipe direction when gesture started?
  const ptAtBoundaryOnTouchStart = useRef(false)

  useEffect(() => {
    // Coming back from a full-page route (e.g. the 3D explorer): land on the snap we left from.
    try {
      const restore = sessionStorage.getItem("snap:restore")
      if (restore !== null) {
        sessionStorage.removeItem("snap:restore")
        const idx = Number(restore)
        if (Number.isFinite(idx)) window.scrollTo(0, Math.max(0, Math.min(idx, sections - 1)) * window.innerHeight)
      }
    } catch { /* storage unavailable */ }
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
        onSectionChange(target)
      }, ms, ease)
    }

    registerNav(goTo, () => current.current)

    const SECTION_NAMES = ["Hero", "Education", "Projects", "Skills", "Experience", "Journey", "Footer"]
    function onSectionChange(idx: number) {
      const si = [...SECTION_STARTS].reverse().findIndex(s => idx >= s)
      const name = SECTION_NAMES[SECTION_STARTS.length - 1 - si]
      if (name) trackSectionView(name)
    }

    // Returns the nearest scroll-passthrough container if the element is inside one
    function getPassthrough(target: EventTarget | null): HTMLElement | null {
      return (target as Element | null)?.closest("[data-scroll-passthrough]") as HTMLElement | null
    }

    // True when the container still has room to scroll in the given direction
    function canScroll(el: HTMLElement, down: boolean): boolean {
      const { scrollTop, scrollHeight, clientHeight } = el
      return down ? scrollTop + clientHeight < scrollHeight - 2 : scrollTop > 2
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return

      // Passthrough scroll chaining — gesture-scoped, like touch:
      // • Gesture started with room → scroll the content, and when it hits the
      //   end, ABSORB the rest of the gesture (incl. trackpad momentum tail).
      // • Gesture started with the content already ended → hand off to snap.
      // A "gesture" ends after WHEEL_GAP_MS of silence or a direction flip.
      const pt = getPassthrough(e.target)
      if (pt) {
        const now = performance.now()
        const dir = e.deltaY > 0 ? 1 : -1
        const isNewGesture = now - wheelLastT.current > WHEEL_GAP_MS || dir !== wheelDir.current
        wheelLastT.current = now
        wheelDir.current   = dir
        if (isNewGesture) wheelAtBoundary.current = !canScroll(pt, dir > 0)

        if (canScroll(pt, dir > 0)) {
          pt.scrollTop += e.deltaY
          return
        }
        // Content ended. If this gesture began mid-content, it stops here —
        // the user lifts / pauses, and the NEXT gesture changes section.
        if (!wheelAtBoundary.current) return
        // fall through to snap logic
      }

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

      // Snapshot whether the passthrough element is at both boundaries right now
      // Direction isn't known yet — we check the relevant one in touchEnd
      const pt = getPassthrough(e.target)
      ptAtBoundaryOnTouchStart.current = pt
        ? (!canScroll(pt, true) || !canScroll(pt, false))  // at top OR bottom
        : false
    }

    // Prevent browser native scroll during swipes so inertia can't move
    // scrollY past the current section before our snap takes over.
    // Exception: passthrough containers scroll natively; we only intercept at boundary.
    function onTouchMove(e: TouchEvent) {
      const pt = getPassthrough(e.target)
      if (pt) return   // let browser scroll the element; boundary handled in touchEnd
      e.preventDefault()  // block native page scroll for everything else, including data-no-scroll-snap
    }

    function onTouchEnd(e: TouchEvent) {
      if (locked.current) return
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return

      const endY    = e.changedTouches[0].clientY
      const delta   = touchStartY.current - endY          // +ve = swipe up, -ve = swipe down
      const elapsed = performance.now() - touchStartT.current
      const velocity = elapsed > 0 ? Math.abs(delta) / elapsed : 0

      const isFlick = velocity >= VEL_SNAP
      const isDrag  = Math.abs(delta) >= TOUCH_MIN

      if (!isFlick && !isDrag) return

      // Inside a passthrough container: only snap if it was ALREADY at the boundary
      // when this gesture started (not just if it happens to be at boundary now)
      const pt = getPassthrough(e.changedTouches[0].target as EventTarget)
      if (pt) {
        const goingDown = delta > 0
        const atBoundaryNow = !canScroll(pt, goingDown)
        // Only hand off if boundary was reached before this gesture began
        if (!atBoundaryNow || !ptAtBoundaryOnTouchStart.current) return
      }

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
