"use client"

import dynamic from "next/dynamic"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"

const JourneyScene = dynamic(
  () => import("../journey/JourneyScene").then((m) => m.JourneyScene),
  { ssr: false },
)

export function JourneySection() {
  // Visible at scroll ≥ 9vh while ExperienceSection (z-15) still covers us (z-12).
  // Revealed as ExperienceSection exits upward during 9vh → 10vh.
  const p = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? 9 * window.innerHeight - 10 : 7190,
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
