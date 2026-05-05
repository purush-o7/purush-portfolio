"use client"

import { useScrollProgress } from "../../_hooks/use-scroll-progress"
import { useMobile }         from "../../_hooks/use-mobile"

// ── Horizontal zigzag — mobile boundary between campus art and info ───────────
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
  const isMobile = useMobile()

  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? window.innerHeight : 800,
  )

  const animStyle = {
    transform:  `translateY(-${p * 100}vh) scale(${1 - p * 0.03})`,
    opacity:    1 - p * 0.45,
    boxShadow:  p > 0 ? `0 ${p * 48}px ${p * 80}px rgba(0,0,0,0.8)` : "none",
    willChange: "transform, opacity" as const,
  }

  /* ── Desktop ──────────────────────────────────────────────────────────────── */
  if (!isMobile) {
    return (
      <div
        className="fixed top-0 right-0 bottom-0 w-2/5 z-[11] overflow-hidden bg-[#07070f]"
        style={animStyle}
      >
        <div className="flex flex-col justify-center h-full px-10 py-16 gap-8">
          <DesktopContent />
        </div>
      </div>
    )
  }

  /* ── Mobile — top 50% transparent (campus art), bottom 50% info ───────────── */
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 11, overflow: "hidden", ...animStyle }}>

      {/* Top 50% — transparent window into campus art */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%" }}>
        {/* Horizontal zigzag at the art/info boundary */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: V_MOB }}>
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

      {/* Bottom 50% — opaque info panel */}
      <div style={{
        position: "absolute", top: "50%", left: 0, right: 0, bottom: 0,
        background: "#07070f",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "20px 24px", gap: 12, overflow: "hidden",
      }}>
        <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          Education
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600, lineHeight: 1.1, color: "#fff", margin: 0 }}>
            Amrita
          </h2>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 300, lineHeight: 1.1, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            Vishwa Vidyapeetham
          </h3>
        </div>

        <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            B.Tech · Computer Science & Engineering
          </p>
          <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>
            Amritapuri, Kerala
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 220 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Period</span>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>2020 – 2024</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 220 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>CGPA</span>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>7.96 / 10</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopContent() {
  return (
    <>
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
    </>
  )
}
