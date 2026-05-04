"use client"

import { useEffect, useRef } from "react"

const SECTIONS      = 4
const COOLDOWN_MS   = 800
const TOUCH_MIN     = 50   // px swipe needed to trigger

export function useScrollSnap() {
  const current     = useRef(0)
  const locked      = useRef(false)
  const touchStartY = useRef(0)

  useEffect(() => {
    current.current = Math.round(window.scrollY / window.innerHeight)

    function goTo(idx: number) {
      const target = Math.max(0, Math.min(idx, SECTIONS - 1))
      if (target === current.current) return
      current.current = target
      locked.current  = true
      window.scrollTo({ top: target * window.innerHeight, behavior: "smooth" })
      setTimeout(() => { locked.current = false }, COOLDOWN_MS)
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()   // always block default page scroll
      // Inside the 3D canvas: let OrbitControls handle zoom, skip section nav
      if ((e.target as Element | null)?.closest("[data-no-scroll-snap]")) return
      if (locked.current) return
      goTo(current.current + (e.deltaY > 0 ? 1 : -1))
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY
    }

    function onTouchEnd(e: TouchEvent) {
      if (locked.current) return
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
      window.removeEventListener("wheel",      onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend",   onTouchEnd)
      window.removeEventListener("keydown",    onKeyDown)
    }
  }, [])
}
