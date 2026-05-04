"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const SIDE = 120
const HALF = SIDE / 2

const FACES = [
  { id: "front",  t: `translateZ(${HALF}px)` },
  { id: "back",   t: `rotateY(180deg) translateZ(${HALF}px)` },
  { id: "left",   t: `rotateY(-90deg) translateZ(${HALF}px)` },
  { id: "right",  t: `rotateY(90deg) translateZ(${HALF}px)` },
  { id: "top",    t: `rotateX(90deg) translateZ(${HALF}px)` },
  { id: "bottom", t: `rotateX(-90deg) translateZ(${HALF}px)` },
]

const IconGitHub = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-white/80">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)
const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-white/80">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-white/80">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

const CUBES = [
  {
    name: "LinkedIn", url: "https://www.linkedin.com/in/purush-o7/", icon: <IconLinkedIn />,
    delay: 0,   initRot: { x: 15,  y: -20, z: 8  },
    baseBg: "rgba(10, 102, 194, 0.12)", glow: "rgba(10, 102, 194, 0.70)", ring: "rgba(10, 102, 194, 0.28)",
  },
  {
    name: "GitHub", url: "https://github.com/purush-o7", icon: <IconGitHub />,
    delay: 150, initRot: { x: -10, y: 25,  z: -15 },
    baseBg: "rgba(110, 64, 201, 0.12)", glow: "rgba(130, 70, 230, 0.70)", ring: "rgba(130, 70, 230, 0.28)",
  },
  {
    name: "Instagram", url: "https://www.instagram.com/purush_o7", icon: <IconInstagram />,
    delay: 300, initRot: { x: 20,  y: 10,  z: 30  },
    baseBg: "rgba(225, 48, 108, 0.12)", glow: "rgba(225, 48, 108, 0.70)", ring: "rgba(225, 48, 108, 0.28)",
  },
] as const

interface CubeProps {
  name: string; url: string; icon: React.ReactNode
  delay: number; initRot: { x: number; y: number; z: number }
  baseBg: string; glow: string; ring: string; noScale?: boolean
}

function Cube({ name, url, icon, delay, initRot, baseBg, glow, ring, noScale }: CubeProps) {
  const [hovered, setHovered] = useState(false)
  const d = delay / 1000

  const spinDur = {
    x: 23 + delay * 0.02,
    y: 17 + delay * 0.015,
    z: 31 + delay * 0.025,
  }

  return (
    <motion.a
      href={url} target="_blank" rel="noopener noreferrer"
      className="flex flex-col items-center gap-4"
      style={{ perspective: "700px" }}
      aria-label={name}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <motion.div
        animate={{
          rotateX: [initRot.x, initRot.x + 360],
          rotateY: [initRot.y, initRot.y + 360],
          rotateZ: [initRot.z, initRot.z + 360],
        }}
        transition={{
          rotateX: { repeat: Infinity, duration: spinDur.x, ease: "linear", delay: d },
          rotateY: { repeat: Infinity, duration: spinDur.y, ease: "linear", delay: d },
          rotateZ: { repeat: Infinity, duration: spinDur.z, ease: "linear", delay: d },
          scale:   { type: "spring", stiffness: 280, damping: 18 },
        }}
        whileHover={noScale ? {} : { scale: 1.10 }}
        style={{
          width: SIDE, height: SIDE,
          position: "relative",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {FACES.map(({ id, t }) => (
          <motion.div
            key={id}
            animate={{
              background: hovered ? ring : baseBg,
              boxShadow:  hovered ? `0 0 52px ${glow}, inset 0 0 28px ${ring}` : "none",
            }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute", width: SIDE, height: SIDE,
              transform: t, backfaceVisibility: "hidden",
              borderRadius: "16px", border: "1px solid rgba(255,255,255,0.10)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {icon}
          </motion.div>
        ))}
      </motion.div>

      <motion.span
        className="font-mono text-xs tracking-[0.25em] uppercase"
        animate={{ color: hovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.28)" }}
        transition={{ color: { duration: 0.25 } }}
      >
        {name}
      </motion.span>
    </motion.a>
  )
}

export function SocialCubes() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">

      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm tracking-[0.3em] uppercase text-white/30">Find me on</p>
        <p className="font-mono text-xs tracking-widest uppercase text-white/20">
          Open to contribute to open source
        </p>
      </div>

      <div className="flex flex-col items-center">

        <Cube {...CUBES[0]} noScale />

        <div style={{ height: 20 }} />

        <div style={{ display: "flex", alignItems: "flex-end", gap: 56 }}>
          <Cube {...CUBES[1]} />
          <Cube {...CUBES[2]} />
        </div>

        <div
          style={{
            marginTop: 18, width: 360, height: 1,
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.20) 22%, rgba(255,255,255,0.20) 78%, transparent)",
          }}
        />
        <div
          style={{ width: 360, height: 40, background: "linear-gradient(to bottom, rgba(255,255,255,0.025), transparent)" }}
        />

      </div>
    </div>
  )
}
