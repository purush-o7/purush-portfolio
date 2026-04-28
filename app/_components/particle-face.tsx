"use client"

import { useEffect, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// ── constants ─────────────────────────────────────────────────────────────────
const N         = 7000   // must match --count in generate_particles.py
const FORM_DUR  = 2.6    // fly-in duration (s)
const SPRING_K  = 0.048
const DAMPING   = 0.80
const REPEL_R   = 0.30
const REPEL_F   = 0.07
// Traveling wave along stroke direction
const WAVE_SPEED = 1.1   // temporal frequency (rad/s)
const WAVE_K     = 9.0   // spatial frequency
const WAVE_AMP   = 0.014 // max wave displacement (scene units)
// Color temperature
const WARM_R   = 0.40            // radius of colour glow (scene units)
const WARM_STR = 0.88            // max blend at centre
const WARM_RGB = [1.0, 0.52, 0.14] as const  // amber

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function makeCircleTexture(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  const half = size / 2
  const g = ctx.createRadialGradient(half, half, 0, half, half, half)
  g.addColorStop(0.0, "rgba(255,255,255,1.0)")
  g.addColorStop(0.3, "rgba(255,255,255,0.85)")
  g.addColorStop(0.7, "rgba(255,255,255,0.25)")
  g.addColorStop(1.0, "rgba(255,255,255,0.0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

// ── particle mesh ─────────────────────────────────────────────────────────────
function FaceParticles() {
  const ref    = useRef<THREE.Points>(null)
  const timer  = useRef(new THREE.Timer())
  const formT0 = useRef<number | null>(null)
  const ready  = useRef(false)

  const orig      = useRef(new Float32Array(N * 3))  // face target positions
  const scat      = useRef(new Float32Array(N * 3))  // formation start positions
  const vel       = useRef(new Float32Array(N * 3))  // spring velocities
  const flow      = useRef(new Float32Array(N * 2))  // stroke direction (dx, dy)
  const origColor = useRef(new Float32Array(N * 3))  // base colours for warmth blend

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3).fill(999), 3))
    g.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    return g
  }, [])

  const mat = useMemo(() => {
    const tex = makeCircleTexture(64)
    return new THREE.PointsMaterial({
      size:            0.018,
      sizeAttenuation: true,
      map:             tex,
      vertexColors:    true,
      transparent:     true,
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
      alphaTest:       0.001,
    })
  }, [])

  useEffect(() => {
    fetch("/particles.json")
      .then(r => r.json())
      .then((raw: { p: number[][] }) => {
        const posAttr = geo.getAttribute("position") as THREE.BufferAttribute
        const colAttr = geo.getAttribute("color")    as THREE.BufferAttribute
        const posArr  = posAttr.array as Float32Array
        const colArr  = colAttr.array as Float32Array

        const count = Math.min(raw.p.length, N)

        for (let i = 0; i < count; i++) {
          // [x, y, r, g, b, dx, dy]  — dx/dy may be absent for old JSON
          const [x, y, r, g, b, fdx = 0, fdy = 1] = raw.p[i]
          const i3 = i * 3

          orig.current[i3]     = x
          orig.current[i3 + 1] = y
          orig.current[i3 + 2] = (Math.random() - 0.5) * 0.04

          // scatter: burst in from a flat ring outside the viewport
          const angle = Math.random() * Math.PI * 2
          const rd    = 2.2 + Math.random() * 1.4
          scat.current[i3]     = Math.cos(angle) * rd
          scat.current[i3 + 1] = Math.sin(angle) * rd
          scat.current[i3 + 2] = (Math.random() - 0.5) * 0.6

          posArr[i3]     = scat.current[i3]
          posArr[i3 + 1] = scat.current[i3 + 1]
          posArr[i3 + 2] = scat.current[i3 + 2]

          colArr[i3]          = r
          colArr[i3 + 1]      = g
          colArr[i3 + 2]      = b
          origColor.current[i3]     = r
          origColor.current[i3 + 1] = g
          origColor.current[i3 + 2] = b

          // stroke direction for wave animation
          flow.current[i * 2]     = fdx
          flow.current[i * 2 + 1] = fdy
        }

        posAttr.needsUpdate = true
        colAttr.needsUpdate = true
        ready.current = true
      })
  }, [geo])

  useFrame(({ pointer }) => {
    if (!ready.current || !ref.current) return

    timer.current.update()
    const t = timer.current.getElapsed()
    if (formT0.current === null) formT0.current = t
    const ft = t - formT0.current

    const posAttr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute
    const colAttr = ref.current.geometry.getAttribute("color")    as THREE.BufferAttribute
    const pos     = posAttr.array as Float32Array
    const col     = colAttr.array as Float32Array
    const o       = orig.current
    const s       = scat.current
    const v       = vel.current
    const f       = flow.current
    const oc      = origColor.current
    const mx = pointer.x * 1.15
    const my = pointer.y * 0.90

    if (ft < FORM_DUR) {
      // ── fly-in formation ────────────────────────────────────────────────
      const ease = easeInOutCubic(Math.min(ft / FORM_DUR, 1))
      for (let i = 0; i < N; i++) {
        const i3 = i * 3
        pos[i3]     = s[i3]     + (o[i3]     - s[i3])     * ease
        pos[i3 + 1] = s[i3 + 1] + (o[i3 + 1] - s[i3 + 1]) * ease
        pos[i3 + 2] = s[i3 + 2] + (o[i3 + 2] - s[i3 + 2]) * ease
      }
    } else {
      // ── steady: wave + parallax + colour warmth + spring + repulsion ────
      for (let i = 0; i < N; i++) {
        const i3  = i * 3
        const fdx = f[i * 2]
        const fdy = f[i * 2 + 1]
        // Traveling wave along stroke direction
        const wavePos = o[i3] * fdx + o[i3 + 1] * fdy
        const flowAmt = Math.sin(wavePos * WAVE_K + t * WAVE_SPEED) * WAVE_AMP

        const tx = o[i3]     + fdx * flowAmt
        const ty = o[i3 + 1] + fdy * flowAmt

        // Mouse repulsion
        const dx = pos[i3]     - mx
        const dy = pos[i3 + 1] - my
        const d  = Math.sqrt(dx * dx + dy * dy) + 0.001
        const rf = d < REPEL_R ? (REPEL_R - d) / REPEL_R * REPEL_F : 0

        // Spring toward animated + parallax target
        v[i3]     = (v[i3]     + (tx - pos[i3])     * SPRING_K + (dx / d) * rf) * DAMPING
        v[i3 + 1] = (v[i3 + 1] + (ty - pos[i3 + 1]) * SPRING_K + (dy / d) * rf) * DAMPING
        v[i3 + 2] = (v[i3 + 2] + (o[i3 + 2] - pos[i3 + 2])     * SPRING_K)      * DAMPING

        pos[i3]     += v[i3]
        pos[i3 + 1] += v[i3 + 1]
        pos[i3 + 2] += v[i3 + 2]

        // Colour temperature: blend toward warm amber as cursor approaches
        const warmF  = d < WARM_R ? Math.pow(1 - d / WARM_R, 1.5) * WARM_STR : 0
        col[i3]     = oc[i3]     + (WARM_RGB[0] - oc[i3])     * warmF
        col[i3 + 1] = oc[i3 + 1] + (WARM_RGB[1] - oc[i3 + 1]) * warmF
        col[i3 + 2] = oc[i3 + 2] + (WARM_RGB[2] - oc[i3 + 2]) * warmF
      }
    }

    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
  })

  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />
}

// ── canvas export ─────────────────────────────────────────────────────────────
export function ParticleFace() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 55 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <FaceParticles />
    </Canvas>
  )
}
