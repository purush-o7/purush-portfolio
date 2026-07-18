"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

const ParticleFace = dynamic(
  () => import("./particle-face").then((m) => m.ParticleFace),
  { ssr: false }
)

export function CanvasWrapper() {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative w-full h-full">
      <ParticleFace onReady={() => setReady(true)} />

      {/* Monogram loader — covers the chunk + particles.json load, then
          dissolves exactly as the 7,000-particle fly-in begins. Pure CSS. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 bg-[#07070f] transition-opacity duration-700 ease-out"
        style={{ opacity: ready ? 0 : 1 }}
      >
        <style>{`
          @keyframes ldr-spin     { to { transform: rotate(360deg) } }
          @keyframes ldr-spin-rev { to { transform: rotate(-360deg) } }
          @keyframes ldr-breathe  { 0%,100% { opacity: .5; transform: scale(.97) } 50% { opacity: 1; transform: scale(1) } }
          @keyframes ldr-blink    { 0%,100% { opacity: .18 } 50% { opacity: .6 } }
        `}</style>

        <div className="relative flex items-center justify-center w-[128px] h-[128px]">
          {/* static inner ring */}
          <div className="absolute inset-[14px] rounded-full border border-white/10" />
          {/* counter-rotating dashed rings */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: "1px dashed rgba(0,229,255,.30)", animation: "ldr-spin 11s linear infinite" }}
          />
          <div
            className="absolute inset-[24px] rounded-full"
            style={{ border: "1px dashed rgba(255,255,255,.14)", animation: "ldr-spin-rev 7s linear infinite" }}
          />
          {/* orbiting spark */}
          <div className="absolute inset-0" style={{ animation: "ldr-spin 2.6s linear infinite" }}>
            <span
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full"
              style={{ background: "#00e5ff", boxShadow: "0 0 10px #00e5ff" }}
            />
          </div>
          {/* breathing monogram */}
          <span
            className="font-heading text-4xl font-semibold text-white/90"
            style={{ animation: "ldr-breathe 2.2s ease-in-out infinite" }}
          >
            P
          </span>
        </div>

        <p
          className="font-mono text-[9px] tracking-[0.35em] uppercase text-white/40"
          style={{ animation: "ldr-blink 2.2s ease-in-out infinite" }}
        >
          forming · 7,000 particles
        </p>
      </div>
    </div>
  )
}
