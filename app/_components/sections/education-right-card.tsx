"use client"

import { useScrollProgress } from "../../_hooks/use-scroll-progress"


export function EducationRightCard() {
  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? window.innerHeight : 800,
  )

  return (
    <div
      className="fixed top-0 right-0 bottom-0 w-full md:w-2/5 z-[11] overflow-hidden"
      style={{
        transform:  `translateY(-${p * 100}vh) scale(${1 - p * 0.03})`,
        opacity:    1 - p * 0.45,
        boxShadow:  p > 0 ? `0 ${p * 48}px ${p * 80}px rgba(0,0,0,0.8)` : "none",
        willChange: "transform, opacity",
      }}
    >
      {/* Mobile: flex-col — transparent top 60% (campus art shows through), opaque bottom 40% */}
      {/* Desktop: single full-height panel */}
      <div className="flex flex-col md:block h-full">

        {/* Transparent spacer — top 60% on mobile only */}
        <div className="flex-[3] md:hidden" />

        {/* Info panel — bottom 40% on mobile, full height on desktop */}
        <div className="flex-[2] bg-[#07070f] md:h-full flex flex-col justify-center
                        px-6 py-6 md:px-10 md:py-16 gap-4 md:gap-8">

          <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-white/35">
            Education
          </p>

          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-3xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-white">
              Amrita
            </h2>
            <h3 className="font-heading text-3xl md:text-5xl font-light leading-[1.1] tracking-tight text-white/50">
              Vishwa Vidyapeetham
            </h3>
          </div>

          <div className="w-10 h-px bg-white/20" />

          <div className="flex flex-col gap-2 md:gap-3">
            <p className="font-mono text-xs md:text-sm tracking-widest uppercase text-white/40">
              B.Tech · Computer Science & Engineering
            </p>
            <p className="font-mono text-xs md:text-sm tracking-widest uppercase text-white/30">
              Amritapuri, Kerala
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between max-w-[240px]">
              <span className="font-mono text-xs md:text-sm text-white/35 uppercase tracking-widest">Period</span>
              <span className="text-sm md:text-base text-white/70">2020 – 2024</span>
            </div>
            <div className="flex items-baseline justify-between max-w-[240px]">
              <span className="font-mono text-xs md:text-sm text-white/35 uppercase tracking-widest">CGPA</span>
              <span className="text-sm md:text-base text-white/70">7.96 / 10</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
