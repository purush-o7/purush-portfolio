"use client"

import { useState, useEffect } from "react"

/**
 * Returns scroll progress [0, 1] for a given scroll distance.
 * Default: one full viewport height = full transition (0 → 1).
 */
export function useScrollProgress(scrollDistance?: number): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const max = scrollDistance ?? window.innerHeight
      setProgress(Math.min(window.scrollY / max, 1))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [scrollDistance])

  return progress
}
