"use client"

import dynamic from "next/dynamic"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"

const CylinderScene = dynamic(
  () => import("../cylinder-scene").then((m) => m.CylinderScene),
  { ssr: false },
)

export function CylinderSection() {
  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? 3 * window.innerHeight : 2400,
  )

  return (
    <div
      className="fixed inset-0 z-20 bg-black overflow-hidden"
      style={{
        transform:  `translateY(${(1 - p) * 100}vh) scale(${0.97 + p * 0.03})`,
        opacity:    p,
        willChange: "transform, opacity",
      }}
    >
      <CylinderScene />
    </div>
  )
}
