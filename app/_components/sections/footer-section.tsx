"use client"

import Image                          from "next/image"
import { motion }                   from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { useScrollProgress }          from "../../_hooks/use-scroll-progress"
import { useMobile }                  from "../../_hooks/use-mobile"
import { trackContactClick }          from "../../_lib/analytics"

// ── Icons ─────────────────────────────────────────────────────────────────────

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

// ── Data ──────────────────────────────────────────────────────────────────────

const LINKS = [
  { label: "GitHub",   href: "https://github.com/purush-o7",           icon: <GithubIcon />   },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/purush-o7/", icon: <LinkedInIcon /> },
  { label: "Email",    href: "mailto:dev.coreops26@gmail.com",          icon: <MailIcon />     },
]

// Peacock colour stops cycling through teal → purple → gold → green
const COLORS = [
  "rgba(0,212,255,0.55)",
  "rgba(120,0,255,0.55)",
  "rgba(255,200,0,0.55)",
  "rgba(0,255,160,0.55)",
  "rgba(0,212,255,0.55)",
]

// ── Grid panel with cursor spotlight ─────────────────────────────────────────

const GRID  = 72
const DECAY = 0.965

function GridPanel({ isMobile }: { isMobile: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cells     = useRef<Map<string, number>>(new Map())
  const rafId     = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext("2d")!

    function resize() {
      const r = canvas.parentElement!.getBoundingClientRect()
      canvas.width  = r.width
      canvas.height = r.height
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const [key, op] of cells.current) {
        const [col, row] = key.split(",").map(Number)
        const newOp = op * DECAY
        if (newOp < 0.005) { cells.current.delete(key); continue }
        cells.current.set(key, newOp)

        ctx.fillStyle = `rgba(255,255,255,${newOp * 0.18})`
        ctx.fillRect(col * GRID + 1, row * GRID + 1, GRID - 1, GRID - 1)
      }

      rafId.current = requestAnimationFrame(tick)
    }
    tick()

    return () => { cancelAnimationFrame(rafId.current); ro.disconnect() }
  }, [])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r   = e.currentTarget.getBoundingClientRect()
    const col = Math.floor((e.clientX - r.left) / GRID)
    const row = Math.floor((e.clientY - r.top)  / GRID)
    cells.current.set(`${col},${row}`, 1)
  }

  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const r   = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    const col = Math.floor((touch.clientX - r.left) / GRID)
    const row = Math.floor((touch.clientY - r.top)  / GRID)
    cells.current.set(`${col},${row}`, 1)
  }

  return (
    <div
      className="relative overflow-hidden flex flex-col justify-center"
      style={{
        width:      isMobile ? "100%" : "45%",
        height:     isMobile ? "40%" : "100%",
        padding:    isMobile ? "20px 20px" : "0 56px",
        gap:        isMobile ? 16 : 32,
        borderTop:  isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
        borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID}px ${GRID}px`,
      }}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {/* Content sits above the grid */}
      <div className="relative z-10 flex flex-col" style={{ gap: isMobile ? 16 : 32 }}>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/30">
            available for opportunities
          </p>
          <h2 style={{ fontSize: isMobile ? 24 : 36 }} className="font-heading font-bold text-white leading-tight tracking-tight">
            Let&apos;s build<br />
            <span className="text-transparent bg-clip-text
                             bg-gradient-to-r from-cyan-400 to-violet-400">
              something great.
            </span>
          </h2>
        </div>

        <p className="text-white/50 leading-relaxed" style={{ fontSize: isMobile ? 12 : 14, maxWidth: isMobile ? "none" : 280 }}>
          Full-stack developer &amp; ML engineer. I blend systems thinking
          with creative interfaces — reach out if you&apos;d like to
          collaborate.
        </p>

        <div className="flex flex-col gap-3">
          {LINKS.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center gap-3 group w-fit"
              onClick={() => trackContactClick(label as "GitHub" | "LinkedIn" | "Email")}
            >
              <span className="text-white/30 group-hover:text-cyan-400 transition-colors duration-200">
                {icon}
              </span>
              <span className="font-mono text-xs tracking-[0.2em] uppercase
                               text-white/40 group-hover:text-white/80
                               transition-colors duration-200">
                {label}
              </span>
            </a>
          ))}
        </div>

        <div className="pt-4 border-t border-white/[0.07]">
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/20">
            Purushottam Reddy Chinthakuntla · 2025
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

interface Props { triggerVh: number }

export function FooterSection({ triggerVh }: Props) {
  const isMobile = useMobile()

  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? (triggerVh - 1) * window.innerHeight : 99999,
  )

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#07070f]"
      style={{
        zIndex:        13,
        transform:     `translateY(${(1 - p) * 100}vh)`,
        opacity:       p,
        willChange:    "transform, opacity",
        pointerEvents: p > 0.05 ? "auto" : "none",
        display:       "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* ── Peacock — top 60% on mobile, left 55% on desktop ─────────────── */}
      <div
        className="relative overflow-hidden bg-[#07070f]"
        style={{
          width:  isMobile ? "100%" : "55%",
          height: isMobile ? "60%" : "100%",
        }}
      >
        <Image
          src="/peacock.png"
          alt="Peacock line art"
          fill
          sizes={isMobile ? "100vw" : "55vw"}
          style={{ objectFit: "cover", objectPosition: "center", filter: "invert(1)" }}
          draggable={false}
        />

        {/* Colour wash: cycles through peacock hues */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: "color" }}
          animate={{ backgroundColor: COLORS }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <GridPanel isMobile={isMobile} />
    </div>
  )
}
