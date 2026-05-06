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
        transform:  `translateY(-${p * 100}vh)`,
        willChange: "transform",
      }}
    >
      <main className="flex flex-col md:flex-row h-screen w-screen">
        {/* Canvas: top 50% on mobile, left 2/3 on desktop */}
        <section className="relative w-full md:w-2/3 h-1/2 md:h-full">
          <CanvasWrapper />
        </section>

        {/* Divider: horizontal on mobile, vertical on desktop */}
        <div className="w-full h-px md:w-px md:h-full bg-white/[0.06] shrink-0" />

        {/* Bio: bottom 50% on mobile, right 1/3 on desktop */}
        <section className="w-full md:w-1/3 h-1/2 md:h-full overflow-y-auto">
          <BioPanel />
        </section>
      </main>
    </div>
  )
}
