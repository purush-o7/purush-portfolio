"use client"

import { useScrollProgress } from "../../_hooks/use-scroll-progress"


export function EducationRightCard() {
  // Starts at scrollY = 1×vh, completes at scrollY = 2×vh
  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? window.innerHeight : 800,
  )

  return (
    <div
      className="fixed top-0 right-0 bottom-0 w-2/5 z-[11] bg-[#07070f] overflow-hidden"
      style={{
        transform:  `translateY(-${p * 100}vh)`,
        boxShadow:  p > 0 ? `0 ${p * 48}px ${p * 80}px rgba(0,0,0,0.8)` : "none",
        willChange: "transform",
      }}
    >
      <div className="flex flex-col justify-center h-full px-10 py-16 gap-8">

        <p className="font-mono text-sm tracking-[0.3em] uppercase text-white/35">
          Education
        </p>

        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-5xl font-semibold leading-[1.1] tracking-tight text-white">
            Amrita
          </h2>
          <h3 className="font-heading text-5xl font-light leading-[1.1] tracking-tight text-white/50">
            Vishwa Vidyapeetham
          </h3>
        </div>

        <div className="w-10 h-px bg-white/20" />

        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm tracking-widest uppercase text-white/40">
            B.Tech · Computer Science & Engineering
          </p>
          <p className="font-mono text-sm tracking-widest uppercase text-white/30">
            Amritapuri, Kerala
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between max-w-[240px]">
            <span className="font-mono text-sm text-white/35 uppercase tracking-widest">Period</span>
            <span className="text-base text-white/70">2020 – 2024</span>
          </div>
          <div className="flex items-baseline justify-between max-w-[240px]">
            <span className="font-mono text-sm text-white/35 uppercase tracking-widest">CGPA</span>
            <span className="text-base text-white/70">7.96 / 10</span>
          </div>
        </div>

      </div>
    </div>
  )
}
