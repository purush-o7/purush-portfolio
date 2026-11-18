"use client"

import { useEffect, useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// ── constants ─────────────────────────────────────────────────────────────────
const N         = 7000   // must match --count in generate_particles.py
const FORM_DUR  = 3.2    // how long the current takes to settle into the portrait (s)
const SPRING_K  = 0.048
const DAMPING   = 0.80
const REPEL_R   = 0.18
const REPEL_F   = 0.06
// Traveling wave along stroke direction
const WAVE_SPEED = 1.1   // temporal frequency (rad/s)
const WAVE_K     = 9.0   // spatial frequency
const WAVE_AMP   = 0.014 // max wave displacement (scene units)
// Cursor light — dots under the cursor take the site's cyan accent; the rest dims a touch
const WARM_R   = 0.32            // radius of the light (scene units)
const WARM_STR = 0.92            // max blend at centre
const WARM_RGB = [0.13, 0.90, 0.94] as const  // cyan accent
const DIM      = 0.80            // brightness of dots far from the cursor

// Loading current. While the data downloads the dots are already on screen, swirling in a current that roams the
// whole page (wrapping at the screen edges). Nothing about it is stored or fixed: every load a random generator
// invents the current — its direction, scale, speed and handedness — and scatters the dots, so no two loads look
// alike. When the data arrives the current bends and pulls the dots into the portrait from wherever they are.
const FLOW_F    = 0.0007                                    // current strength (scene units / frame²)
const LOAD_RGB  = [0.13, 0.90, 0.94] as const              // the accent
const LOAD_DIM  = 0.6
const clamp01   = (v: number) => Math.max(0, Math.min(1, v))
const rnd       = (a: number, b: number) => a + Math.random() * (b - a)

interface Current { th: number; a1: number; a2: number; p1: number; p2: number; s1: number; s2: number; amp: number }
function makeCurrent(): Current {
  const hand = Math.random() < 0.5 ? -1 : 1
  return {
    th: rnd(0, Math.PI * 2),                  // which way the field is rotated
    a1: rnd(2.2, 4.6), a2: rnd(2.4, 5.0),     // how tight the swirls are
    p1: rnd(0, Math.PI * 2), p2: rnd(0, Math.PI * 2),
    s1: hand * rnd(0.4, 1.0), s2: hand * rnd(0.3, 0.8),   // how fast, and which way, they turn
    amp: rnd(1.6, 2.8),
  }
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
/** Where the portrait sits on screen: its centre as a fraction of the canvas, and how much of the canvas height it spans. */
export interface Focus { x: number; y: number; k: number }

function FaceParticles({ onReady, focus }: { onReady?: () => void; focus: Focus }) {
  const ref    = useRef<THREE.Points>(null)
  const timer  = useRef(new THREE.Timer())
  const formT0 = useRef<number | null>(null)
  const ready  = useRef(false)
  const { gl, camera, size } = useThree()

  // The canvas fills the whole hero (so particles can fly in from every edge and corner); the camera is
  // dollied and panned so the portrait lands where the layout wants it.
  const view = useRef({ cx: 0, cy: 0, W: 1, H: 1 })
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const z   = 2 / focus.k
    const H   = 2 * z * Math.tan((cam.fov * Math.PI) / 360)
    const W   = H * (size.width / size.height)
    const cx  = (0.5 - focus.x) * W
    const cy  = (focus.y - 0.5) * H
    cam.position.set(cx, cy, z)
    view.current = { cx, cy, W, H }
  }, [camera, size, focus.x, focus.y, focus.k])

  const mouseRef  = useRef({ x: 0, y: -0.45 })       // default at chest

  const orig      = useRef(new Float32Array(N * 3))  // face target positions
  const current   = useRef<Current>({ th: 0, a1: 3, a2: 3.6, p1: 0, p2: 0, s1: 0.7, s2: 0.5, amp: 2.2 })  // replaced at mount
  const vel       = useRef(new Float32Array(N * 3))  // spring velocities
  const flow      = useRef(new Float32Array(N * 2))  // stroke direction (dx, dy)
  const hidden    = useRef(new Uint8Array(N))        // 1 = unused dot
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

  // Invent this load's current and scatter the dots across the whole visible page (before any data exists)
  useEffect(() => {
    current.current = makeCurrent()
    const { cx, cy, W, H } = view.current
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute
    for (let i = 0; i < N; i++) {
      posAttr.array[i * 3]     = cx + (Math.random() - 0.5) * W
      posAttr.array[i * 3 + 1] = cy + (Math.random() - 0.5) * H
      posAttr.array[i * 3 + 2] = 0
    }
    posAttr.needsUpdate = true
  }, [geo])

  useEffect(() => {
    fetch("/particles.json")
      .then(r => r.json())
      .then((raw: { p: number[][] }) => {
        const count   = Math.min(raw.p.length, N)
        const posAttr = geo.getAttribute("position") as THREE.BufferAttribute

        for (let i = 0; i < count; i++) {
          // [x, y, r, g, b, dx, dy]  — dx/dy may be absent for old JSON
          const [x, y, r, g, b, fdx = 0, fdy = 1] = raw.p[i]
          const i3 = i * 3
          orig.current[i3]     = x
          orig.current[i3 + 1] = y
          orig.current[i3 + 2] = (Math.random() - 0.5) * 0.04
          origColor.current[i3]     = r
          origColor.current[i3 + 1] = g
          origColor.current[i3 + 2] = b
          flow.current[i * 2]     = fdx    // stroke direction for the wave animation
          flow.current[i * 2 + 1] = fdy
        }
        // any dots beyond the data are parked off-screen
        for (let i = count; i < N; i++) { posAttr.array[i * 3] = posAttr.array[i * 3 + 1] = 999; hidden.current[i] = 1 }

        ready.current = true
        onReady?.()                       // data is in — the current bends and pulls the dots into the portrait
      })

    const canvas = gl.domElement
    // pointer (screen) → scene coordinates at the portrait's plane, through the pan/zoom set above
    function toWorld(cx: number, cy: number, rect: DOMRect) {
      const { cx: camX, cy: camY, W, H } = view.current
      mouseRef.current.x = camX + ((cx - rect.left) / rect.width  - 0.5) * W
      mouseRef.current.y = camY - ((cy - rect.top)  / rect.height - 0.5) * H
    }
    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      toWorld(e.clientX, e.clientY, rect)
    }
    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0]
      if (!touch) return
      const rect = canvas.getBoundingClientRect()
      // Ignore touches outside the canvas area (e.g. scrolling other sections)
      if (touch.clientX < rect.left || touch.clientX > rect.right ||
          touch.clientY < rect.top  || touch.clientY > rect.bottom) return
      toWorld(touch.clientX, touch.clientY, rect)
    }
    function onTouchEnd() {
      mouseRef.current = { x: 0, y: -0.45 }
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend",  onTouchEnd,  { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend",  onTouchEnd)
    }
  }, [geo, gl])

  useFrame((_, delta) => {
    if (!ref.current) return

    timer.current.update()
    const t = timer.current.getElapsed()
    if (ready.current && formT0.current === null) formT0.current = t
    const ft = ready.current ? t - (formT0.current ?? t) : 0

    const posAttr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute
    const colAttr = ref.current.geometry.getAttribute("color")    as THREE.BufferAttribute

    const pos     = posAttr.array as Float32Array
    const col     = colAttr.array as Float32Array
    const o       = orig.current
    const v       = vel.current
    const f       = flow.current
    const oc      = origColor.current
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    if (!ready.current || ft < FORM_DUR) {
      // ── the current: dots swirl across the whole page; once the data is in, it pulls them into the portrait ──
      const rev = ready.current ? clamp01(ft / FORM_DUR) : 0
      const k   = rev * rev * 0.11                          // pull toward the portrait
      const f   = FLOW_F * (1 - rev) * Math.min(2.5, delta * 60)
      const m   = clamp01(rev * 1.3)                        // 0 = the cyan current, 1 = the portrait's own colours
      const c   = current.current, ct = Math.cos(c.th), st = Math.sin(c.th)
      const { cx, cy, W, H } = view.current
      for (let i = 0; i < N; i++) {
        const i3 = i * 3
        if (hidden.current[i]) continue
        let x = pos[i3], y = pos[i3 + 1]
        const u = x * ct + y * st, w = y * ct - x * st      // the field's own axes
        const ang = Math.sin(u * c.a1 + t * c.s1 + c.p1) * c.amp + Math.cos(w * c.a2 - t * c.s2 + c.p2) * c.amp
        v[i3]     = (v[i3]     + Math.cos(ang) * f + (ready.current ? (o[i3]     - x) * k : 0)) * 0.9
        v[i3 + 1] = (v[i3 + 1] + Math.sin(ang) * f + (ready.current ? (o[i3 + 1] - y) * k : 0)) * 0.9
        x += v[i3]; y += v[i3 + 1]
        if (rev < 0.4) {   // roam the whole page: wrap at the screen edges
          if (x < cx - W / 2) x += W; else if (x > cx + W / 2) x -= W
          if (y < cy - H / 2) y += H; else if (y > cy + H / 2) y -= H
        }
        pos[i3] = x; pos[i3 + 1] = y
        pos[i3 + 2] += ((ready.current ? o[i3 + 2] : 0) - pos[i3 + 2]) * 0.08
        col[i3]     = LOAD_RGB[0] * LOAD_DIM + (oc[i3]     * DIM - LOAD_RGB[0] * LOAD_DIM) * m
        col[i3 + 1] = LOAD_RGB[1] * LOAD_DIM + (oc[i3 + 1] * DIM - LOAD_RGB[1] * LOAD_DIM) * m
        col[i3 + 2] = LOAD_RGB[2] * LOAD_DIM + (oc[i3 + 2] * DIM - LOAD_RGB[2] * LOAD_DIM) * m
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

        // Cursor light: dim at rest, brighten and tint toward the accent as the cursor approaches
        const near   = d < WARM_R ? (1 - d / WARM_R) : 0
        const warmF  = near * WARM_STR
        const lit    = DIM + (1 - DIM) * near
        const br = oc[i3] * lit, bg = oc[i3 + 1] * lit, bb = oc[i3 + 2] * lit
        col[i3]     = br + (WARM_RGB[0] - br) * warmF
        col[i3 + 1] = bg + (WARM_RGB[1] - bg) * warmF
        col[i3 + 2] = bb + (WARM_RGB[2] - bb) * warmF
      }
    }

    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
  })

  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />
}

// ── canvas export ─────────────────────────────────────────────────────────────
export function ParticleFace({ onReady, focus = { x: 0.5, y: 0.5, k: 1 } }: { onReady?: () => void; focus?: Focus }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 55 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <FaceParticles onReady={onReady} focus={focus} />
    </Canvas>
  )
}
