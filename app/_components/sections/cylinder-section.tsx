"use client"

import dynamic from "next/dynamic"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"

const CylinderScene = dynamic(
  () => import("../cylinder").then((m) => m.CylinderScene),
  { ssr: false },
)

export function CylinderSection() {
  // Visible at scroll ≥ 8vh while ExperienceSection (z-15) still covers us (z-12).
  // Revealed as ExperienceSection exits upward during 8vh → 9vh.
  const p = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? 8 * window.innerHeight - 10 : 6390,
  )

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{
        zIndex:     12,
        visibility: p >= 1 ? "visible" : "hidden",
      }}
    >
      <CylinderScene />
    </div>
  )
}
