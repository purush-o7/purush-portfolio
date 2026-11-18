"use client"

import { useViewport }       from "../../_hooks/use-viewport"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"
import { ExperienceSplit }   from "./ExperienceSplit"
import { ExperiencePhone }   from "./ExperiencePhone"
import { EXP_START_SNAP, useSnapMap } from "../../_hooks/snap-map"

// Experience owns one snap per stop on the metro line (see snap-map.ts). The shell reveals it just before
// its first snap (as Skills slides off) and lifts it away over the last snap when the Journey gateway takes over.
// Laptop: metro map + stop pages. Phone: full-screen metro map + stop card + drawer.
export function ExperienceSection() {
  const { width } = useViewport()
  const { expEnd } = useSnapMap()

  const visible = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? (EXP_START_SNAP - 1) * window.innerHeight - 10 : 2390,
  )

  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? expEnd * window.innerHeight : 8800,
  )

  return (
    <div
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     15,
        overflow:   "hidden",
        visibility: visible >= 1 ? "visible" : "hidden",
        transform:  `translateY(${-exit * 100}vh)`,
        willChange: "transform",
      }}
    >
      {width > 0 && (width < 768 ? <ExperiencePhone /> : <ExperienceSplit />)}
    </div>
  )
}
