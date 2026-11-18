"use client"

import dynamic from "next/dynamic"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"
import { useSnapMap }        from "../../_hooks/snap-map"

const JourneyScene = dynamic(
  () => import("../journey/JourneyScene").then((m) => m.JourneyScene),
  { ssr: false },
)

export function JourneySection() {
  const { expEnd } = useSnapMap()
  // Visible once the last experience snap is reached, while ExperienceSection (z-15) still covers us (z-12).
  // Revealed as ExperienceSection exits upward over the last snap.
  const p = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? expEnd * window.innerHeight - 10 : 8790,
  )

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{
        zIndex:     12,
        visibility: p >= 1 ? "visible" : "hidden",
      }}
    >
      <JourneyScene />
    </div>
  )
}
