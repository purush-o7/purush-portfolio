"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame }                    from "@react-three/fiber"
import { Html }                        from "@react-three/drei"
import * as THREE                      from "three"
import { DEMO_CARDS, ORBIT_R, ORBIT_H } from "./data"

interface Props { onExpand: (i: number) => void }

const TRAIL_N    = 14
const TRAIL_STEP = 0.016

export function HelixCards({ onExpand }: Props) {
  const N = DEMO_CARDS.length

  const groupRefs    = useRef<(THREE.Group | null)[]>(Array(N).fill(null))
  const domRefs      = useRef<(HTMLDivElement | null)[]>(Array(N).fill(null))
  const expandRefs   = useRef<(HTMLDivElement | null)[]>(Array(N).fill(null))
  const burstRefs    = useRef<(HTMLDivElement | null)[]>(Array(N).fill(null))
  const prevExpanded = useRef<boolean[]>(Array(N).fill(false))
  const progressRef  = useRef(0)

  const lightRef  = useRef<THREE.PointLight>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trailRefs = useRef<(any | null)[]>(Array(N).fill(null))

  const trailGeos = useMemo(() =>
    Array.from({ length: N }, () => {
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL_N * 3), 3))
      return g
    }), [N])

  const trailMats = useMemo(() =>
    Array.from({ length: N }, () => new THREE.PointsMaterial({
      color: 0x00ffff, size: 0.07, sizeAttenuation: true,
      transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending,
    })), [N])

  useEffect(() => {
    const el = document.createElement("style")
    el.textContent = `
      @keyframes hx-shimmer {
        0%   { transform: translateX(-120%); }
        100% { transform: translateX(420%); }
      }
      @keyframes hx-burst {
        0%   { transform: scale(0.85); opacity: 0.85; border-width: 2px; }
        100% { transform: scale(3.0);  opacity: 0;    border-width: 0.5px; }
      }
      @keyframes hx-bracket {
        0%, 100% { opacity: 0.35; }
        50%       { opacity: 0.95; }
      }
    `
    document.head.appendChild(el)
    return () => { document.head.removeChild(el) }
  }, [])

  useEffect(() => {
    function onScroll() {
      const vh = window.innerHeight
      progressRef.current = Math.max(0, Math.min((window.scrollY - 9 * vh) / ((N + 1) * vh), 1))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [N])

  useFrame(({ clock }) => {
    const cp = progressRef.current
    const et = clock.getElapsedTime()
    let spotX = 0, spotY = 0, spotZ = 0, spotSc = 0

    DEMO_CARDS.forEach((_, i) => {
      const g     = groupRefs.current[i]
      const d     = domRefs.current[i]
      const ex    = expandRefs.current[i]
      const burst = burstRefs.current[i]
      const tgeo  = trailGeos[i]
      const tmat  = trailMats[i]
      if (!g || !d || !ex) return

      const t_raw = (0.5 - (i + 1) / (N + 1)) + cp

      if (t_raw < 0 || t_raw > 1) {
        g.position.set(0, t_raw < 0 ? -ORBIT_H - 5 : ORBIT_H + 5, 0)
        d.style.opacity    = "0"
        d.style.transform  = "scale(0)"
        ex.style.maxHeight = "0px"
        ex.style.opacity   = "0"
        tmat.opacity = 0
        return
      }

      const t         = t_raw
      const angle     = t * Math.PI * 2
      const x         = ORBIT_R * Math.sin(angle)
      const z         = -ORBIT_R * Math.cos(angle)
      const y         = -ORBIT_H + t * ORBIT_H * 2
      const sc      = Math.pow(Math.sin(t * Math.PI), 2)
      const opacity = Math.max(Math.pow(Math.sin(t * Math.PI), 0.4), t > 0.01 && t < 0.99 ? 0.12 : 0)
      const expanded  = t <= 0.5 && sc > 0.90

      // 1. 3-D tilt
      const tiltY = -Math.sin(angle) * 42
      g.position.set(x, y, z)
      d.style.opacity    = String(opacity)
      d.style.transform  = `perspective(900px) rotateY(${tiltY}deg) scale(${sc})`
      d.style.width      = expanded ? "260px" : "160px"
      ex.style.maxHeight = expanded ? "260px" : "0px"
      ex.style.opacity   = expanded ? "1"     : "0"

      // 4. CSS burst ring on expand transition
      const was = prevExpanded.current[i]
      if (expanded && !was && burst) {
        burst.style.animation = "none"
        void burst.offsetHeight
        burst.style.animation = "hx-burst 0.65s ease-out forwards"
      }
      prevExpanded.current[i] = expanded

      // 5. Orbit trail
      const pos = (tgeo.getAttribute("position") as THREE.BufferAttribute).array as Float32Array
      let trailVisible = false
      for (let j = 0; j < TRAIL_N; j++) {
        const tt = t_raw - (j + 1) * TRAIL_STEP
        if (tt >= 0 && tt <= 1) {
          const ta    = tt * Math.PI * 2
          pos[j*3]   = ORBIT_R * Math.sin(ta)
          pos[j*3+1] = -ORBIT_H + tt * ORBIT_H * 2
          pos[j*3+2] = -ORBIT_R * Math.cos(ta)
          trailVisible = true
        } else {
          pos[j*3] = 0; pos[j*3+1] = -999; pos[j*3+2] = 0
        }
      }
      ;(tgeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true
      tmat.opacity = trailVisible ? opacity * (expanded ? 0.55 : 0.28) : 0
      tmat.size    = expanded ? 0.10 : 0.06

      // 2. Spotlight tracking
      if (expanded && sc > spotSc) {
        spotX = x; spotY = y; spotZ = z; spotSc = sc
      }
    })

    // 2. Spotlight pulse
    if (lightRef.current) {
      lightRef.current.position.set(spotX, spotY, spotZ)
      lightRef.current.intensity = spotSc > 0
        ? spotSc * (2.8 + Math.sin(et * 3.2) * 0.5)
        : 0
    }
  })

  return (
    <>
      <pointLight ref={lightRef} color="#00ffff" intensity={0} distance={28} decay={2} />

      {Array.from({ length: N }, (_, i) => (
        <points
          key={`trail-${i}`}
          ref={el => { trailRefs.current[i] = el }}
          geometry={trailGeos[i]}
          material={trailMats[i]}
          frustumCulled={false}
        />
      ))}

      {DEMO_CARDS.map((card, i) => (
        <group key={i} ref={el => { groupRefs.current[i] = el }}>
          <Html center zIndexRange={[50, 0]}>
            <div
              data-no-scroll-snap="true"
              ref={el => { domRefs.current[i] = el }}
              style={{
                position: "relative", width: "160px",
                transition: "width 0.35s ease",
                willChange: "transform, opacity",
                userSelect: "none", pointerEvents: "none",
              }}
            >
              <div
                ref={el => { burstRefs.current[i] = el }}
                style={{
                  position: "absolute", inset: "-10px", borderRadius: 18,
                  border: "2px solid rgba(0,255,255,0.75)", opacity: 0,
                  pointerEvents: "none",
                }}
              />

              <div style={{
                width: "100%", background: "rgba(0,4,14,0.92)",
                border: "1px solid rgba(0,255,255,0.28)", borderRadius: 12,
                padding: "14px 16px", backdropFilter: "blur(18px)",
                color: "rgba(255,255,255,0.88)", lineHeight: 1.4,
                overflow: "hidden",
                boxShadow: "0 0 24px rgba(0,255,255,0.06), inset 0 0 12px rgba(0,255,255,0.03)",
              }}>

                <div style={{
                  position:"absolute", inset:0, pointerEvents:"none", zIndex:3, borderRadius:12,
                  background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,255,0.022) 3px,rgba(0,255,255,0.022) 4px)",
                }} />

                {([
                  { top:5, left:5,   borderTop:"1px solid #0ff", borderLeft:"1px solid #0ff"   },
                  { top:5, right:5,  borderTop:"1px solid #0ff", borderRight:"1px solid #0ff"  },
                  { bottom:5, left:5,  borderBottom:"1px solid #0ff", borderLeft:"1px solid #0ff"  },
                  { bottom:5, right:5, borderBottom:"1px solid #0ff", borderRight:"1px solid #0ff" },
                ] as React.CSSProperties[]).map((s, bi) => (
                  <div key={bi} style={{
                    position:"absolute", width:9, height:9, zIndex:4,
                    animation:`hx-bracket 2.2s ease-in-out ${bi * 0.55}s infinite`,
                    ...s,
                  }} />
                ))}

                <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:2, borderRadius:12 }}>
                  <div style={{
                    position:"absolute", top:0, bottom:0, width:"28%",
                    background:"linear-gradient(90deg,transparent,rgba(0,255,255,0.07),transparent)",
                    animation:`hx-shimmer 3.5s ease-in-out ${i * 0.45}s infinite`,
                  }} />
                </div>

                <div style={{ position:"relative", zIndex:5 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontFamily:"var(--font-geist-mono)", fontSize:9, color:"#0ff", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:4, opacity:0.75 }}>
                        {card.tag}
                      </div>
                      <div style={{ fontFamily:"var(--font-heading)", fontSize:16, fontWeight:700, color:"#ffffff", whiteSpace:"nowrap", letterSpacing:"-0.01em" }}>
                        {card.title}
                      </div>
                    </div>
                    <span style={{ fontSize:11, color:"#0ff", marginLeft:8, flexShrink:0, opacity:0.6 }}>↗</span>
                  </div>

                  <div
                    ref={el => { expandRefs.current[i] = el }}
                    style={{ overflow:"hidden", maxHeight:"0px", opacity:0, transition:"max-height 0.4s ease, opacity 0.3s ease" }}
                  >
                    <p style={{ fontFamily:"var(--font-geist-mono)", margin:"10px 0 10px", fontSize:12, color:"rgba(255,255,255,0.82)", lineHeight:1.7 }}>
                      {card.desc}
                    </p>
                    <div style={{ paddingTop:10, borderTop:"1px solid rgba(0,255,255,0.10)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, flex:1 }}>
                        {card.tech.map((tk, ti) => (
                          <span key={ti} style={{ fontFamily:"var(--font-geist-mono)", fontSize:9, padding:"2px 7px", borderRadius:4, background:"rgba(0,255,255,0.06)", border:"1px solid rgba(0,255,255,0.20)", color:"#0ff" }}>
                            {tk}
                          </span>
                        ))}
                      </div>
                      <button
                        tabIndex={-1}
                        onPointerDown={e => { e.stopPropagation(); onExpand(i) }}
                        style={{
                          pointerEvents:"auto", cursor:"pointer", background:"rgba(0,255,255,0.08)",
                          border:"1px solid rgba(0,255,255,0.38)", color:"#0ff",
                          fontFamily:"var(--font-geist-mono)", fontSize:9, letterSpacing:"0.15em",
                          padding:"3px 10px", borderRadius:4, flexShrink:0,
                        }}
                      >
                        VIEW MORE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </>
  )
}
