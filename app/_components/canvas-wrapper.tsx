"use client"

import dynamic from "next/dynamic"

const ParticleFace = dynamic(
  () => import("./particle-face").then((m) => m.ParticleFace),
  { ssr: false }
)

/** The portrait canvas. No spinner: the particles themselves are the loading state — a randomly generated current
 *  that roams the whole page, then settles into the portrait (see particle-face.tsx). */
export function CanvasWrapper({ onReady, focus }: { onReady?: () => void; focus?: { x: number; y: number; k: number } } = {}) {
  return (
    <div className="relative w-full h-full">
      <ParticleFace focus={focus} onReady={onReady} />
    </div>
  )
}
