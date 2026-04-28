"use client"

import { useState, useEffect, useRef } from "react"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"

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

// ── icons ─────────────────────────────────────────────────────────────────────

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
    name:    "GitHub",
    url:     "https://github.com/purush-o7",
    icon:    <IconGitHub />,
    delay:   0,
    baseBg:  "rgba(110, 64, 201, 0.12)",   // always-on purple tint
    glow:    "rgba(130, 70, 230, 0.70)",
    ring:    "rgba(130, 70, 230, 0.28)",
  },
  {
    name:    "LinkedIn",
    url:     "https://www.linkedin.com/in/purush-o7/",
    icon:    <IconLinkedIn />,
    delay:   130,
    baseBg:  "rgba(255,255,255,0.04)",
    glow:    "rgba(10, 102, 194, 0.55)",
    ring:    "rgba(10, 102, 194, 0.28)",
  },
  {
    name:    "Instagram",
    url:     "https://www.instagram.com/purush_o7",
    icon:    <IconInstagram />,
    delay:   260,
    baseBg:  "rgba(255,255,255,0.04)",
    glow:    "rgba(225, 48, 108, 0.55)",
    ring:    "rgba(225, 48, 108, 0.28)",
  },
] as const

// ── random orientation helpers ────────────────────────────────────────────────

type Rot = { x: number; y: number; z: number }

function randLand(): Rot {
  // Keep front face at least partially visible: Y in ±50°, X in ±30°
  return {
    x: (Math.random() - 0.5) * 60,
    y: (Math.random() - 0.5) * 100,
    z: (Math.random() - 0.5) * 50,
  }
}

function randDrop(): Rot {
  // Dramatic tumbling orientation — cube is "up in the air" rotating freely
  return {
    x: -100 - Math.random() * 100,
    y: (Math.random() - 0.5) * 200,
    z: (Math.random() - 0.5) * 120,
  }
}

function freshRots() {
  return CUBES.map(() => ({ land: randLand(), drop: randDrop() }))
}

// ── single cube ───────────────────────────────────────────────────────────────

interface CubeProps {
  name:   string
  url:    string
  icon:   React.ReactNode
  delay:  number
  fallen: boolean
  land:   Rot
  drop:   Rot
  baseBg: string
  glow:   string
  ring:   string
}

function Cube({ name, url, icon, delay, fallen, land, drop, baseBg, glow, ring }: CubeProps) {
  const rot = fallen ? land : drop
  const ty  = fallen ? 0    : -440
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-5"
      style={{ perspective: "700px" }}
      aria-label={name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width:          `${SIDE}px`,
          height:         `${SIDE}px`,
          position:       "relative",
          transformStyle: "preserve-3d",
          transform:      `translateY(${ty}px) rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg) scale(${hovered ? 1.08 : 1})`,
          transition:     fallen
            ? `transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
            : "transform 0.3s ease",
          willChange:     "transform",
        }}
      >
        {FACES.map(({ id, t }) => (
          <div
            key={id}
            style={{
              position:           "absolute",
              width:              `${SIDE}px`,
              height:             `${SIDE}px`,
              transform:          t,
              backfaceVisibility: "hidden",
              borderRadius:       "18px",
              border:             "1px solid rgba(255,255,255,0.10)",
              background: hovered ? ring : baseBg,
              display:            "flex",
              alignItems:         "center",
              justifyContent:     "center",
              boxShadow: hovered
                ? `0 0 50px ${glow}, inset 0 0 30px ${ring}`
                : "none",
              transition:         "background 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      <span
        className="font-mono text-[10px] tracking-[0.25em] uppercase"
        style={{
          color:      hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
          opacity:    fallen ? 1 : 0,
          transition: fallen
            ? `opacity 0.4s ease ${delay + 500}ms, color 0.3s ease`
            : "none",
        }}
      >
        {name}
      </span>
    </a>
  )
}

// ── main export ───────────────────────────────────────────────────────────────

export function SocialCubes() {
  const vh = typeof window !== "undefined" ? window.innerHeight : 800
  const p  = useScrollProgress(vh, vh)

  const [fallen, setFallen] = useState(false)
  // Deterministic initial value avoids SSR/client hydration mismatch.
  // Randomised on first client-side effect.
  const [rots, setRots] = useState<ReturnType<typeof freshRots>>(() =>
    CUBES.map(() => ({
      land: { x: 15, y: -20, z: 8 },
      drop: { x: -120, y: 30, z: 20 },
    }))
  )
  const prevFallen = useRef(false)

  // Randomise orientations once on mount so they differ from SSR placeholder
  useEffect(() => { setRots(freshRots()) }, [])

  useEffect(() => {
    const next = p >= 0.75

    if (next && !prevFallen.current) {
      // Crossing threshold downward — generate new random orientations then fall
      setRots(freshRots())
    }

    if (!next && prevFallen.current) {
      // Scrolled back up — reset fallen so cubes snap back off-screen instantly
      setFallen(false)
    }

    if (next && !fallen) setFallen(true)

    prevFallen.current = next
  }, [p, fallen])

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-10">
      <div
        className="flex flex-col items-center gap-3"
        style={{
          opacity:    fallen ? 1 : 0,
          transition: fallen ? "opacity 0.5s ease 700ms" : "none",
        }}
      >
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-white/30">
          Find me on
        </p>
        <p className="font-mono text-[10px] tracking-widest uppercase text-white/20">
          Open to contribute to open source
        </p>
      </div>

      <div className="flex items-end gap-8">
        {CUBES.map((cube, i) => (
          <Cube
            key={cube.name}
            {...cube}
            fallen={fallen}
            land={rots[i]?.land ?? { x: 15, y: -20, z: 8 }}
            drop={rots[i]?.drop ?? { x: -120, y: 30, z: 20 }}
          />
        ))}
      </div>
    </div>
  )
}
