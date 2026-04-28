"use client"

import { useState, useEffect } from "react"

export type Viewport = { width: number; height: number }

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>({ width: 0, height: 0 })

  useEffect(() => {
    function sync() {
      setVp({ width: window.innerWidth, height: window.innerHeight })
    }
    sync()
    window.addEventListener("resize", sync)
    return () => window.removeEventListener("resize", sync)
  }, [])

  return vp
}
