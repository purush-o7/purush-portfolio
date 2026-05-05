"use client"

import { useEffect, useRef, useMemo } from "react"
import { Canvas, useFrame }           from "@react-three/fiber"
import * as THREE                      from "three"

// ── constants ─────────────────────────────────────────────────────────────────
const N        = 8000
const GLOW_R   = 0.32
const GLOW_STR = 0.90
const GLOW_RGB = [0.0, 0.85, 1.0] as const

function makeCircleTexture(size = 64): THREE.CanvasTexture {
  const c   = document.createElement("canvas")
  c.width   = c.height = size
  const ctx = c.getContext("2d")!
  const h   = size / 2
  const g   = ctx.createRadialGradient(h, h, 0, h, h, h)
  g.addColorStop(0.0, "rgba(255,255,255,1.0)")
  g.addColorStop(0.3, "rgba(255,255,255,0.85)")
  g.addColorStop(0.7, "rgba(255,255,255,0.25)")
  g.addColorStop(1.0, "rgba(255,255,255,0.0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

// ── particle mesh ─────────────────────────────────────────────────────────────
function PeacockPoints() {
  const ref    = useRef<THREE.Points>(null)
  const ready     = useRef(false)
  const orig      = useRef(new Float32Array(N * 3))
  const origColor = useRef(new Float32Array(N * 3))

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3).fill(999), 3))
    g.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    return g
  }, [])

  const mat = useMemo(() => new THREE.PointsMaterial({
    size:            0.020,
    sizeAttenuation: true,
    map:             makeCircleTexture(64),
    vertexColors:    true,
    transparent:     true,
    depthWrite:      false,
    blending:        THREE.AdditiveBlending,
    alphaTest:       0.001,
  }), [])

  useEffect(() => {
    fetch("/peacock_particles.json")
      .then(r => r.json())
      .then((raw: { p: number[][] }) => {
        const posAttr = geo.getAttribute("position") as THREE.BufferAttribute
        const colAttr = geo.getAttribute("color")    as THREE.BufferAttribute
        const posArr  = posAttr.array as Float32Array
        const colArr  = colAttr.array as Float32Array
        const count   = Math.min(raw.p.length, N)

        for (let i = 0; i < count; i++) {
          const [x, y, r, g, b, fdx = 0, fdy = 1] = raw.p[i]
          const i3 = i * 3

          orig.current[i3]     = x
          orig.current[i3 + 1] = y
          orig.current[i3 + 2] = 0

          posArr[i3]     = x
          posArr[i3 + 1] = y
          posArr[i3 + 2] = 0

          colArr[i3]     = r
          colArr[i3 + 1] = g
          colArr[i3 + 2] = b
          origColor.current[i3]     = r
          origColor.current[i3 + 1] = g
          origColor.current[i3 + 2] = b
        }

        posAttr.needsUpdate = true
        colAttr.needsUpdate = true
        ready.current = true
      })
  }, [geo])

  useFrame(({ pointer }) => {
    if (!ready.current || !ref.current) return

    const colAttr = ref.current.geometry.getAttribute("color") as THREE.BufferAttribute
    const col = colAttr.array as Float32Array
    const oc  = origColor.current
    const mx  = pointer.x * 1.1
    const my  = pointer.y * 0.95
    const posAttr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute
    const pos = posAttr.array as Float32Array
    const o   = orig.current

    for (let i = 0; i < N; i++) {
      const i3 = i * 3
      const dx = pos[i3]     - mx
      const dy = pos[i3 + 1] - my
      const d  = Math.sqrt(dx * dx + dy * dy) + 0.001
      // Teal glow on cursor proximity only
      const glowF  = d < GLOW_R ? Math.pow(1 - d / GLOW_R, 1.5) * GLOW_STR : 0
      col[i3]     = oc[i3]     + (GLOW_RGB[0] - oc[i3])     * glowF
      col[i3 + 1] = oc[i3 + 1] + (GLOW_RGB[1] - oc[i3 + 1]) * glowF
      col[i3 + 2] = oc[i3 + 2] + (GLOW_RGB[2] - oc[i3 + 2]) * glowF
      // Keep positions fixed at origin
      pos[i3]     = o[i3]
      pos[i3 + 1] = o[i3 + 1]
      pos[i3 + 2] = o[i3 + 2]
    }

    colAttr.needsUpdate = true
    posAttr.needsUpdate = true
  })

  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />
}

export function PeacockParticles() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <PeacockPoints />
    </Canvas>
  )
}
