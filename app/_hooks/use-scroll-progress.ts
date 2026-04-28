"use client"

import { useState, useEffect } from "react"

/**
 * Returns scroll progress [0, 1].
 * @param scrollDistance  Scroll range that maps 0 → 1. Default: 1 viewport height.
 * @param offset          scrollY at which the progress starts counting. Default: 0.
 */
export function useScrollProgress(
  scrollDistance?: number,
  offset?: number,
): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const dist = scrollDistance ?? window.innerHeight
      const off  = offset        ?? 0
      setProgress(Math.max(0, Math.min((window.scrollY - off) / dist, 1)))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [scrollDistance, offset])

  return progress
}
