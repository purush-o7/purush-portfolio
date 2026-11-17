"use client"

import { useViewport }       from "../../_hooks/use-viewport"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"
import { ExperienceSplit }   from "./ExperienceSplit"
import { ExperienceSpine }   from "./ExperienceSpine"

// Experience owns snaps 5–9 (one per role). The shell reveals it at 4vh (as Skills
// slides off) and lifts it away at 9vh→10vh when the Journey gateway takes over.
// Laptop: sticky split index. Phone: drawing spine + bottom sheet.
export function ExperienceSection() {
  const { width } = useViewport()

  const visible = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? 4 * window.innerHeight - 10 : 3190,
  )

  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? 9 * window.innerHeight : 7200,
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
      {width > 0 && (width < 768 ? <ExperienceSpine /> : <ExperienceSplit />)}
    </div>
  )
}
