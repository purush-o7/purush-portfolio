"use client"

import { useRef, useEffect }    from "react"
import { useFrame }             from "@react-three/fiber"
import { Html }                 from "@react-three/drei"
import * as THREE               from "three"
import { DEMO_CARDS, ORBIT_R, ORBIT_H } from "./data"

interface Props { onExpand: (i: number) => void }

export function HelixCards({ onExpand }: Props) {
  const N           = DEMO_CARDS.length
  const groupRefs   = useRef<(THREE.Group | null)[]>(Array(N).fill(null))
  const domRefs     = useRef<(HTMLDivElement | null)[]>(Array(N).fill(null))
  const expandRefs  = useRef<(HTMLDivElement | null)[]>(Array(N).fill(null))
  const progressRef = useRef(0)

  useEffect(() => {
    function onScroll() {
      const vh = window.innerHeight
      // N+1 snaps: first snap is "approach", each subsequent snap centers one card
      progressRef.current = Math.max(0, Math.min((window.scrollY - 9 * vh) / ((N + 1) * vh), 1))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useFrame(() => {
    const cp = progressRef.current

    DEMO_CARDS.forEach((_, i) => {
      const g  = groupRefs.current[i]
      const d  = domRefs.current[i]
      const ex = expandRefs.current[i]
      if (!g || !d || !ex) return

      // Offset by (i+1)/(N+1) so card 0 starts to the side and centres at snap 1
      const t_raw = (0.5 - (i + 1) / (N + 1)) + cp

      if (t_raw < 0 || t_raw > 1) {
        g.position.set(0, t_raw < 0 ? -ORBIT_H - 5 : ORBIT_H + 5, 0)
        d.style.opacity    = "0"
        d.style.transform  = "scale(0)"
        ex.style.maxHeight = "0px"
        ex.style.opacity   = "0"
        return
      }

      const t     = t_raw
      const angle = t * Math.PI * 2
      const x     = ORBIT_R * Math.sin(angle)
      const z     = -ORBIT_R * Math.cos(angle)
      const y     = -ORBIT_H + t * ORBIT_H * 2

      const sc         = Math.pow(Math.sin(t * Math.PI), 2)
      const depthFade  = (z / ORBIT_R + 1) / 2
      const rawOpacity = Math.min(sc * depthFade * 2, 1)
      const opacity    = t > 0.01 && t <= 0.5 ? Math.max(rawOpacity, 0.2) : rawOpacity
      const expanded   = t <= 0.5 && sc > 0.93

      g.position.set(x, y, z)
      d.style.opacity    = String(opacity)
      d.style.transform  = `scale(${sc})`
      d.style.width      = expanded ? "260px" : "160px"
      ex.style.maxHeight = expanded ? "260px" : "0px"
      ex.style.opacity   = expanded ? "1"     : "0"
    })
  })

  return (
    <>
      {DEMO_CARDS.map((card, i) => (
        <group key={i} ref={el => { groupRefs.current[i] = el }}>
          {/* zIndexRange kept below overlay z-60 so ProjectOverlay always wins */}
          <Html center zIndexRange={[50, 0]}>
            <div
              ref={el => { domRefs.current[i] = el }}
              style={{
                width: "160px", background: "rgba(0,4,14,0.88)",
                border: "1px solid rgba(0,255,255,0.22)", borderRadius: 12,
                padding: "14px 16px", backdropFilter: "blur(12px)",
                color: "#c8e8ff", fontFamily: "monospace",
                userSelect: "none", pointerEvents: "none",
                willChange: "transform, opacity", lineHeight: 1.4,
                overflow: "hidden", transition: "width 0.35s ease",
              }}
            >
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:8, color:"#0ff", letterSpacing:"0.22em",
                                textTransform:"uppercase", marginBottom:4 }}>
                    {card.tag}
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#fff", whiteSpace:"nowrap" }}>
                    {card.title}
                  </div>
                </div>
                <span style={{ fontSize:13, color:"#0ff", marginLeft:8, flexShrink:0 }}>
                  ↗
                </span>
              </div>

              {/* Expandable body — points + tech row + VIEW MORE */}
              <div
                ref={el => { expandRefs.current[i] = el }}
                style={{ overflow:"hidden", maxHeight:"0px", opacity:0,
                         transition:"max-height 0.4s ease, opacity 0.3s ease" }}
              >
                <ul style={{ margin:"12px 0 10px", padding:"0 0 0 14px",
                             fontSize:10, color:"#5a7a9a", lineHeight:1.7, listStyleType:"disc" }}>
                  {card.points.map((pt, pi) => <li key={pi}>{pt}</li>)}
                </ul>

                {/* Tech chips + VIEW MORE on same row */}
                <div style={{ paddingTop:10, borderTop:"1px solid rgba(0,255,255,0.10)",
                              display:"flex", alignItems:"center",
                              justifyContent:"space-between", gap:6 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4, flex:1 }}>
                    {card.tech.map((tk, ti) => (
                      <span key={ti} style={{
                        fontSize:8, padding:"2px 7px", borderRadius:4,
                        background:"rgba(0,255,255,0.07)",
                        border:"1px solid rgba(0,255,255,0.18)", color:"#0ff",
                      }}>
                        {tk}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onExpand(i) }}
                    style={{
                      pointerEvents:"auto", cursor:"pointer", background:"transparent",
                      border:"1px solid rgba(0,255,255,0.28)", color:"#0ff",
                      fontFamily:"monospace", fontSize:8, letterSpacing:"0.15em",
                      padding:"3px 10px", borderRadius:4, flexShrink:0,
                    }}
                  >
                    VIEW MORE
                  </button>
                </div>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </>
  )
}
