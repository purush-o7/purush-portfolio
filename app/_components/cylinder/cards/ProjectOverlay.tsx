"use client"

import { useEffect, useRef }              from "react"
import { motion, AnimatePresence }        from "framer-motion"
import { type CardData }                  from "./data"

const MONO    = "var(--font-geist-mono)"
const HEADING = "var(--font-heading)"

interface Props {
  card:    CardData | null
  onClose: () => void
}

export function ProjectOverlay({ card, onClose }: Props) {
  const openYRef    = useRef(0)
  const activeRef   = useRef(false)

  useEffect(() => {
    if (!card) { activeRef.current = false; return }

    // Snapshot scroll position when overlay opens
    openYRef.current  = window.scrollY
    activeRef.current = false

    // Grace period before scroll-close activates
    const grace = setTimeout(() => { activeRef.current = true }, 700)

    function onScroll() {
      if (!activeRef.current) return
      const delta = Math.abs(window.scrollY - openYRef.current)
      if (delta > 100) onClose()
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      clearTimeout(grace)
      window.removeEventListener("scroll", onScroll)
    }
  }, [card, onClose])

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0, scale: 0.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{    opacity: 0, scale: 0.06 }}
          transition={{
            opacity: { duration: 0.35, ease: "easeOut" },
            scale:   { duration: 0.4,  ease: [0.34, 1.56, 0.64, 1] },
          }}
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,4,14,0.96)", backdropFilter: "blur(24px)",
            transformOrigin: "50% 50%",
          }}
        >
          <div style={{ maxWidth:680, width:"90%", color:"rgba(255,255,255,0.88)", position:"relative" }}>

            <button onClick={onClose} style={{
              position:"absolute", top:-52, right:0, background:"transparent",
              border:`1px solid ${card.accent}55`, color:card.accent,
              fontFamily: MONO, fontSize:11, letterSpacing:"0.12em",
              padding:"6px 18px", borderRadius:6, cursor:"pointer",
            }}>
              ✕ CLOSE
            </button>

            <div style={{ fontFamily: MONO, fontSize:10, color:card.accent,
                          letterSpacing:"0.28em", textTransform:"uppercase", marginBottom:14 }}>
              {card.tag}
            </div>

            <h2 style={{ fontFamily: HEADING, fontSize:44, fontWeight:800, color:"#fff",
                         margin:"0 0 28px", lineHeight:1.05, letterSpacing:"-0.02em" }}>
              {card.title}
            </h2>

            <ul style={{ listStyle:"disc", padding:"0 0 0 18px", fontFamily: MONO,
                         fontSize:14, color:"rgba(255,255,255,0.6)", lineHeight:1.9, marginBottom:28 }}>
              {card.points.map((pt, pi) => <li key={pi}>{pt}</li>)}
            </ul>

            <div style={{ display:"flex", flexWrap:"wrap", gap:8,
                          paddingTop:18, borderTop:"1px solid rgba(0,255,255,0.12)",
                          marginBottom:32 }}>
              {card.tech.map((tk, ti) => (
                <span key={ti} style={{
                  fontFamily: MONO, fontSize:11, padding:"5px 14px", borderRadius:6,
                  background:"rgba(0,255,255,0.07)",
                  border:`1px solid ${card.accent}44`, color:card.accent,
                }}>
                  {tk}
                </span>
              ))}
            </div>

            <a href={card.link} target="_blank" rel="noopener noreferrer" style={{
              display:"inline-flex", alignItems:"center", gap:6,
              fontFamily: MONO, color:card.accent, textDecoration:"none", fontSize:12,
              letterSpacing:"0.12em", border:"1px solid rgba(0,255,255,0.3)",
              padding:"10px 22px", borderRadius:8,
            }}>
              VIEW PROJECT ↗
            </a>

            <p style={{ fontFamily: MONO, fontSize:9, color:"#243040", marginTop:28,
                        letterSpacing:"0.15em", textTransform:"uppercase" }}>
              scroll to dismiss
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
