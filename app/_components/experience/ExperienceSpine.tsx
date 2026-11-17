"use client"

import { useRef, useState }   from "react"
import { ALL_ENTRIES }        from "./data"
import { MONO }               from "./RoleContent"
import { RoleSheet }          from "./RoleSheet"
import { startYear, useExpProgress } from "./use-exp-progress"

const N       = ALL_ENTRIES.length
const CARD_H  = 132   // card height, px
const PITCH   = 150   // distance between card tops, px
const SPINE_X = 22    // spine line x, px
const NODE_Y  = 24    // node centre inside a card, px

/**
 * Phone layout — drawing spine. A glowing line fills down the left as the page
 * snaps through roles; a sticky year chip follows. Tap a card for the bottom sheet.
 */
export function ExperienceSpine() {
  const stripRef = useRef<HTMLDivElement>(null)
  const fillRef  = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [open,   setOpen]   = useState<number | null>(null)

  useExpProgress(cp => {
    if (stripRef.current) stripRef.current.style.transform = `translateY(calc(27vh - ${cp * PITCH}px))`
    if (fillRef.current)  fillRef.current.style.height     = `${cp * PITCH}px`
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const d = i - cp
      el.style.opacity = String(d < 0 ? Math.max(0, 1 + d * 0.85) : Math.max(0.5, 1 - d * 0.2))
    })
    nodeRefs.current.forEach((el, i) => {
      if (!el) return
      const reached = i <= cp + 0.02
      el.style.background  = reached ? ALL_ENTRIES[i].accent : "#07070f"
      el.style.boxShadow   = Math.abs(i - cp) < 0.5 ? `0 0 12px ${ALL_ENTRIES[i].accent}` : "none"
    })
    setActive(Math.round(cp))
  })

  const cur = ALL_ENTRIES[active]

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070f", overflow: "hidden" }}>
      {/* soft accent wash behind the active role */}
      {ALL_ENTRIES.map((e, i) => (
        <div key={i} aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 120% 45% at 0% 20%, ${e.accent}26 0%, transparent 70%)`,
          opacity: i === active ? 1 : 0, transition: "opacity 0.6s ease",
        }} />
      ))}

      {/* header: year chip + counter */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, zIndex: 5,
        padding: "calc(14px + env(safe-area-inset-top, 0px)) 16px 0",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start", pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em",
          color: cur.accent, padding: "2px 12px", borderRadius: 8,
          background: "rgba(7,7,15,0.8)", border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(6px)", transition: "color 0.4s",
        }}>
          {startYear(cur.period)}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", paddingTop: 10 }}>
          Experience · {String(active + 1).padStart(2, "0")}/{String(N).padStart(2, "0")}
        </div>
      </div>

      {/* spine + cards */}
      <div ref={stripRef} style={{ position: "absolute", left: 0, right: 0, top: 0, height: N * PITCH, willChange: "transform" }}>
        <div aria-hidden style={{ position: "absolute", left: SPINE_X, top: NODE_Y, width: 2, height: (N - 1) * PITCH, background: "rgba(255,255,255,0.1)", borderRadius: 1 }} />
        <div ref={fillRef} aria-hidden style={{
          position: "absolute", left: SPINE_X, top: NODE_Y, width: 2, height: 0, borderRadius: 1,
          background: cur.accent, boxShadow: `0 0 10px ${cur.accent}`, transition: "background 0.4s, box-shadow 0.4s",
        }} />

        {ALL_ENTRIES.map((e, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * PITCH, height: CARD_H }}>
            <span
              ref={el => { nodeRefs.current[i] = el }}
              aria-hidden
              style={{
                position: "absolute", left: SPINE_X - 6, top: NODE_Y - 7, width: 14, height: 14, borderRadius: "50%",
                border: `2px solid ${e.accent}`, background: "#07070f", transition: "background 0.3s, box-shadow 0.3s",
              }}
            />
            <button
              ref={el => { cardRefs.current[i] = el }}
              onClick={() => setOpen(i)}
              aria-label={`${e.role} — open details`}
              style={{
                all: "unset", boxSizing: "border-box", cursor: "pointer",
                position: "absolute", left: 46, right: 16, top: 0, height: CARD_H,
                padding: "12px 14px", overflow: "hidden",
                display: "flex", flexDirection: "column", gap: 4,
                background: "rgba(14,16,34,0.82)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: e.accent }}>{e.period}</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{e.role}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{e.org}</span>
              <span style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: "auto", overflow: "hidden", maxHeight: 22 }}>
                {(e.metrics
                  ? e.metrics.slice(0, 3).map(m => `${m.value} ${m.label}`)
                  : e.tech.slice(0, 3)
                ).map(t => (
                  <span key={t} style={{
                    fontFamily: MONO, fontSize: 11, padding: "1px 7px", borderRadius: 4, whiteSpace: "nowrap",
                    border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)",
                  }}>{t}</span>
                ))}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* hint */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: "calc(18px + env(safe-area-inset-bottom, 0px))", zIndex: 5,
        textAlign: "center", pointerEvents: "none",
        fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
        opacity: open === null ? 1 : 0, transition: "opacity 0.2s",
      }}>
        Tap a card for details
      </div>

      {open !== null && <RoleSheet entry={ALL_ENTRIES[open]} onClose={() => setOpen(null)} />}
    </div>
  )
}
