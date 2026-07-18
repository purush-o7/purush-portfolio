"use client"

import { useEffect, useRef } from "react"
import { initJourney } from "./journey-core"
import { DEMO_CARDS } from "./data"
import { navToIndex } from "../../_hooks/scroll-nav"
import { trackProjectClick } from "../../_lib/analytics"

// Gate lives at snap 10; projects at snaps 11..17 (see page.tsx scroll budget)
const GATE_SNAP = 10

export function JourneyScene() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const api = initJourney(el, {
      onProjectClick: trackProjectClick,
      navToSnap: navToIndex,
    })

    // Debounced: only the FINAL resting snap becomes the target, so a dot-jump
    // from project A to C flies directly — never chaining through B.
    let settleTimer: ReturnType<typeof setTimeout> | null = null
    function applyTarget() {
      const idx = Math.round(window.scrollY / window.innerHeight)
      api.setTarget(idx <= GATE_SNAP ? -1 : Math.min(idx - GATE_SNAP - 1, DEMO_CARDS.length - 1))
    }
    function onScroll() {
      if (settleTimer) clearTimeout(settleTimer)
      settleTimer = setTimeout(applyTarget, 130)
    }
    applyTarget()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      if (settleTimer) clearTimeout(settleTimer)
      window.removeEventListener("scroll", onScroll)
      api.dispose()
    }
  }, [])

  return <div ref={ref} className="absolute inset-0" />
}
