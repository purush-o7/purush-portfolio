"use client"

import { useScrollProgress } from "../../_hooks/use-scroll-progress"
import { CanvasWrapper } from "../canvas-wrapper"
import { BioPanel } from "../bio-panel"

export function HeroCard() {
  const p = useScrollProgress()

  return (
    <div
      className="fixed inset-0 z-20 bg-[#07070f] overflow-hidden"
      style={{
        transform:  `translateY(-${p * 100}vh) scale(${1 - p * 0.03})`,
        opacity:    1 - p * 0.45,
        boxShadow:  p > 0 ? `0 ${p * 48}px ${p * 80}px rgba(0,0,0,0.8)` : "none",
        willChange: "transform, opacity",
      }}
    >
      <main className="flex h-screen w-screen">
        <section className="relative w-2/3 h-full">
          <CanvasWrapper />
        </section>

        <div className="w-px h-full bg-white/[0.06] shrink-0" />

        <section className="w-1/3 h-full overflow-y-auto">
          <BioPanel />
        </section>
      </main>
    </div>
  )
}
