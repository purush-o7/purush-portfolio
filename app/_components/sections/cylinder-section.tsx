"use client"

import dynamic from "next/dynamic"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"

const CylinderScene = dynamic(
  () => import("../cylinder-scene").then((m) => m.CylinderScene),
  { ssr: false },
)

export function CylinderSection() {
  // Snap visible at scroll ≥ 3vh while ProjectsSection (z-20) still covers us (z-15),
  // so there is no flash. Revealed as ProjectsSection exits upward during 3vh → 4vh.
  const p = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? 3 * window.innerHeight - 10 : 2390,
  )

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{
        zIndex:     15,
        visibility: p >= 1 ? "visible" : "hidden",
      }}
    >
      <CylinderScene />
    </div>
  )
}
