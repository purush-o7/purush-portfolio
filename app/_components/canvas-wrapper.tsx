"use client"

import dynamic from "next/dynamic"

const ParticleFace = dynamic(
  () => import("./particle-face").then((m) => m.ParticleFace),
  { ssr: false }
)

export function CanvasWrapper() {
  return <ParticleFace />
}
