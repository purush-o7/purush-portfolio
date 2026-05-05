"use client"

import { useScrollProgress } from "../../_hooks/use-scroll-progress"

// ── Horizontal zigzag — mobile only, sits at the art/info boundary ────────────
const N_MOB = 10
const V_MOB = 24

function hFillPoints(): string {
  const pts = Array.from({ length: N_MOB * 2 + 1 }, (_, i) => {
    const x = ((i / (N_MOB * 2)) * 100).toFixed(4)
    return `${x},${i % 2 === 0 ? 0 : V_MOB}`
  })
  return [...pts, "100,9999", "0,9999"].join(" ")
}

function hStrokePoints(): string {
  return Array.from({ length: N_MOB * 2 + 1 }, (_, i) => {
    const x = ((i / (N_MOB * 2)) * 100).toFixed(4)
    return `${x},${i % 2 === 0 ? 0 : V_MOB}`
  }).join(" ")
}

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
      <div className="flex flex-col md:block h-full">

        {/* ── Top 50 % — transparent window into campus art ── */}
        <div className="h-1/2 md:hidden relative shrink-0">
          {/* Horizontal zigzag at the bottom edge */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: V_MOB, zIndex: 1,
          }}>
            <svg
              viewBox={`0 0 100 ${V_MOB}`}
              preserveAspectRatio="none"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}
            >
              <polygon points={hFillPoints()} fill="#07070f" />
              <polyline points={hStrokePoints()} stroke="rgba(255,255,255,0.20)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>

        {/* ── Bottom 50 % on mobile / full height on desktop ── */}
        <div
          className="h-1/2 md:h-full bg-[#07070f] flex flex-col justify-center shrink-0
                     px-6 py-5 md:px-10 md:py-16 gap-3 md:gap-8 overflow-hidden"
        >

          <p className="font-mono text-[10px] md:text-sm tracking-[0.3em] uppercase text-white/35">
            Education
          </p>

          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-2xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-white">
              Amrita
            </h2>
            <h3 className="font-heading text-2xl md:text-5xl font-light leading-[1.1] tracking-tight text-white/50">
              Vishwa Vidyapeetham
            </h3>
          </div>

          <div className="w-8 h-px bg-white/20 md:w-10" />

          <div className="flex flex-col gap-1 md:gap-3">
            <p className="font-mono text-[10px] md:text-sm tracking-widest uppercase text-white/40">
              B.Tech · Computer Science & Engineering
            </p>
            <p className="font-mono text-[10px] md:text-sm tracking-widest uppercase text-white/30">
              Amritapuri, Kerala
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between max-w-[220px]">
              <span className="font-mono text-[10px] md:text-sm text-white/35 uppercase tracking-widest">Period</span>
              <span className="text-xs md:text-base text-white/70">2020 – 2024</span>
            </div>
            <div className="flex items-baseline justify-between max-w-[220px]">
              <span className="font-mono text-[10px] md:text-sm text-white/35 uppercase tracking-widest">CGPA</span>
              <span className="text-xs md:text-base text-white/70">7.96 / 10</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
