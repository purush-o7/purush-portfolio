"use client"

import { useEffect }   from "react"
import { type CardData } from "./data"

interface Props {
  card:    CardData | null
  onClose: () => void
}

export function ProjectOverlay({ card, onClose }: Props) {
  useEffect(() => {
    if (!card) return
    const startY = window.scrollY
    function onScroll() {
      if (Math.abs(window.scrollY - startY) > 40) onClose()
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [card, onClose])

  const open = card !== null

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,4,14,0.96)", backdropFilter: "blur(24px)",
      opacity:         open ? 1 : 0,
      transform:       open ? "scale(1)" : "scale(0.06)",
      transformOrigin: "50% 50%",
      transition:      "opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
      pointerEvents:   open ? "auto" : "none",
    }}>
      {card && (
        <div style={{ maxWidth:680, width:"90%", fontFamily:"monospace",
                      color:"#c8e8ff", position:"relative" }}>

          <button onClick={onClose} style={{
            position:"absolute", top:-52, right:0, background:"transparent",
            border:"1px solid rgba(0,255,255,0.3)", color:"#0ff",
            fontFamily:"monospace", fontSize:11, letterSpacing:"0.12em",
            padding:"6px 18px", borderRadius:6, cursor:"pointer",
          }}>
            ✕ CLOSE
          </button>

          <div style={{ fontSize:9, color:"#0ff", letterSpacing:"0.28em",
                        textTransform:"uppercase", marginBottom:14 }}>
            {card.tag}
          </div>

          <h2 style={{ fontSize:40, fontWeight:800, color:"#fff",
                       margin:"0 0 28px", lineHeight:1.1 }}>
            {card.title}
          </h2>

          <ul style={{ listStyle:"disc", padding:"0 0 0 18px",
                       fontSize:15, color:"#6a8aaa", lineHeight:1.9, marginBottom:28 }}>
            {card.points.map((pt, pi) => <li key={pi}>{pt}</li>)}
          </ul>

          <div style={{ display:"flex", flexWrap:"wrap", gap:8,
                        paddingTop:18, borderTop:"1px solid rgba(0,255,255,0.12)",
                        marginBottom:32 }}>
            {card.tech.map((tk, ti) => (
              <span key={ti} style={{
                fontSize:11, padding:"5px 14px", borderRadius:6,
                background:"rgba(0,255,255,0.07)",
                border:"1px solid rgba(0,255,255,0.22)", color:"#0ff",
              }}>
                {tk}
              </span>
            ))}
          </div>

          <a href={card.link} style={{
            display:"inline-flex", alignItems:"center", gap:6,
            color:"#0ff", textDecoration:"none", fontSize:12,
            letterSpacing:"0.12em", border:"1px solid rgba(0,255,255,0.3)",
            padding:"10px 22px", borderRadius:8,
          }}>
            VIEW PROJECT ↗
          </a>

          <p style={{ fontSize:9, color:"#243040", marginTop:28,
                      letterSpacing:"0.15em", textTransform:"uppercase" }}>
            scroll to continue
          </p>
        </div>
      )}
    </div>
  )
}
