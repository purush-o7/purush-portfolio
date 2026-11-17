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

// "Free scroll" stage: the Experience roles (snaps 5–9) scroll natively and smoothly
// instead of stepping. The edges still hand off to the snap engine.
const FREE_FROM      = 5
const FREE_TO        = 9
const FREE_TAIL_MS   = 500   // keep clamping to the stage for a moment after the last free event

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
  // Free-scroll stage state
  const freeGesture = useRef(false)                  // current wheel gesture scrolls natively
  const touchFree   = useRef<boolean | null>(null)   // current touch gesture: undecided / native / snap
  const freeUntil   = useRef(0)                      // clamp-to-stage window (performance.now)

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

    const vh = () => window.innerHeight

    // After free scrolling, `current` is stale — re-derive it from where the page really is.
    function syncCurrent() {
      if (rafRef.current === null && !locked.current) current.current = Math.round(window.scrollY / vh())
    }

    // Does a gesture in this direction scroll natively right now?
    //   interior of the stage → yes; at its first role → only downwards; at its last → only upwards.
    function freeFor(dir: 1 | -1): boolean {
      if (rafRef.current !== null || locked.current) return false
      const y = window.scrollY, a = FREE_FROM * vh(), b = FREE_TO * vh()
      if (y > a + 2 && y < b - 2) return true
      if (Math.abs(y - a) <= 2)   return dir > 0
      if (Math.abs(y - b) <= 2)   return dir < 0
      return false
    }

    function goTo(idx: number, ms = ANIM_MS, ease = easeInOutCubic) {
      const target = Math.max(0, Math.min(idx, sections - 1))
      syncCurrent()
      const already = rafRef.current !== null
        ? target === current.current
        : Math.abs(window.scrollY - target * vh()) < 2
      if (already) { current.current = target; return }
      current.current  = target
      locked.current   = true
      animDone.current = false
      freeUntil.current = 0
      if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)

      animateScroll(target * window.innerHeight, () => {
        animDone.current = true
        wheelEndTimer.current = setTimeout(unlock, WHEELEND_MS)
        onSectionChange(target)
      }, ms, ease)
    }

    registerNav(goTo, () => (rafRef.current === null ? Math.round(window.scrollY / vh()) : current.current))

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
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1
      const now = performance.now()
      // A "gesture" ends after WHEEL_GAP_MS of silence or a direction flip.
      const isNewGesture = now - wheelLastT.current > WHEEL_GAP_MS || dir !== wheelDir.current
      wheelLastT.current = now
      wheelDir.current   = dir

      const inNoSnap = !!(e.target as Element | null)?.closest("[data-no-scroll-snap]")

      // Free-scroll stage — native scrolling, no preventDefault. A gesture that starts free
      // stays free; at the stage edge the rest of it is absorbed and the NEXT gesture hands off.
      if (!inNoSnap) {
        if (isNewGesture) { syncCurrent(); freeGesture.current = freeFor(dir) }
        if (freeGesture.current) {
          const y = window.scrollY
          const atEdge = (dir > 0 && y >= FREE_TO * vh() - 1) || (dir < 0 && y <= FREE_FROM * vh() + 1)
          if (!atEdge) { freeUntil.current = now + FREE_TAIL_MS; return }
          e.preventDefault()
          return
        }
      }

      e.preventDefault()
      if (inNoSnap) return

      // Passthrough scroll chaining — gesture-scoped, like touch:
      // • Gesture started with room → scroll the content, and when it hits the
      //   end, ABSORB the rest of the gesture (incl. trackpad momentum tail).
      // • Gesture started with the content already ended → hand off to snap.
      const pt = getPassthrough(e.target)
      if (pt) {
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
      touchFree.current = null
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return
      syncCurrent()
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
      if ((e.target as Element | null)?.closest("[data-vaul-drawer]")) return   // the shadcn Drawer owns its own gestures
      const pt = getPassthrough(e.target)
      // Free-scroll stage: decide once the direction is known; native scrolling = no preventDefault.
      if (touchFree.current === null && !(e.target as Element | null)?.closest("[data-no-scroll-snap]")) {
        const dy = e.touches[0].clientY - touchStartY.current
        if (Math.abs(dy) > 6) touchFree.current = freeFor(dy < 0 ? 1 : -1)
      }
      if (touchFree.current) { freeUntil.current = performance.now() + FREE_TAIL_MS; return }
      if (pt) return   // let browser scroll the element; boundary handled in touchEnd
      e.preventDefault()  // block native page scroll for everything else, including data-no-scroll-snap
    }

    function onTouchEnd(e: TouchEvent) {
      if (touchFree.current) { touchFree.current = null; return }   // native scroll handled it
      touchFree.current = null
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
      syncCurrent()
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        goTo(current.current + 1)
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault()
        goTo(current.current - 1)
      }
    }

    // Native momentum can carry the page past the free stage — pin it back to the edge.
    function onScroll() {
      const now = performance.now()
      if (now > freeUntil.current || rafRef.current !== null) return
      const y = window.scrollY, a = FREE_FROM * vh(), b = FREE_TO * vh()
      if (y > b)      window.scrollTo(0, b)
      else if (y < a) window.scrollTo(0, a)
      else            freeUntil.current = now + FREE_TAIL_MS
    }

    window.addEventListener("scroll",     onScroll,     { passive: true  })
    window.addEventListener("wheel",      onWheel,      { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true  })
    window.addEventListener("touchmove",  onTouchMove,  { passive: false })
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  })
    window.addEventListener("keydown",    onKeyDown)

    return () => {
      if (rafRef.current !== null)    cancelAnimationFrame(rafRef.current)
      if (wheelEndTimer.current)      clearTimeout(wheelEndTimer.current)
      window.removeEventListener("scroll",     onScroll)
      window.removeEventListener("wheel",      onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove",  onTouchMove)
      window.removeEventListener("touchend",   onTouchEnd)
      window.removeEventListener("keydown",    onKeyDown)
    }
  }, [sections])
}
