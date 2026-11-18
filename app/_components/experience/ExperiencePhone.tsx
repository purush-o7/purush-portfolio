"use client"

import { memo } from "react"

import { useState }           from "react"
import { navToIndex }         from "../../_hooks/scroll-nav"
import { ALL_ENTRIES }        from "./data"
import { MONO }               from "./RoleContent"
import { RoleSheet }          from "./RoleSheet"
import { MetroMap, LaneKey }  from "./MetroMap"
import { STOPS, LANES, useToday } from "./stops"
import { StatusPill }     from "./StopPage"
import { EXP_START_SNAP, useExpProgress } from "./use-exp-progress"

const N = STOPS.length

/**
 * Phone layout. The metro map fills the screen and follows the scroll ("walk the line"); tap a
 * station to jump. A card at the bottom summarises the current stop; "Full details" opens the shadcn drawer.
 */
function ExperiencePhoneImpl() {
  const [active, setActive] = useState(0)
  const [open,   setOpen]   = useState<number | null>(null)
  const today = useToday()

  useExpProgress(cp => setActive(Math.round(cp)))

  const s      = STOPS[active]
  const entry  = s.entry !== undefined ? ALL_ENTRIES[s.entry] : null
  const accent = LANES[s.lane].color

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070f", overflow: "hidden", display: "flex", flexDirection: "column", padding: "calc(14px + env(safe-area-inset-top, 0px)) 14px calc(14px + env(safe-area-inset-bottom, 0px))" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 120% 40% at 0% 0%, ${accent}26 0%, transparent 70%)`, transition: "background 0.6s ease" }} />

      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: accent, transition: "color 0.4s" }}>Experience</span>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)" }}>{String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</span>
      </div>
      <p style={{ position: "relative", fontFamily: "var(--font-sans)", fontSize: 12.5, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>
        Swipe up to walk the line, or tap a station.
      </p>

      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <MetroMap sel={active} today={today} onSel={i => navToIndex(EXP_START_SNAP + i)} />
      </div>

      <div style={{ position: "relative", marginBottom: 8 }}><LaneKey /></div>

      {/* current stop */}
      <div key={active} style={{ position: "relative", marginRight: 56, background: "#0d1026", border: "1px solid #262c4f", borderLeft: `3px solid ${accent}`, borderRadius: 10, padding: "12px 14px", animation: "ex-in .3s ease" }}>
        <style>{`@keyframes ex-in{from{opacity:0;transform:translateY(6px)}} @media (prefers-reduced-motion:reduce){*{animation:none!important}}`}</style>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <span style={{ color: accent }}>{LANES[s.lane].name}</span><span style={{ color: "rgba(255,255,255,0.4)" }}> · {s.period}</span><StatusPill stop={s} />
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: "#fff", lineHeight: 1.2, margin: "5px 0 2px" }}>{s.title}</div>
        {s.steps && <div style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>{s.steps.join(" → ")}</div>}
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.45, color: "rgba(255,255,255,0.7)" }}>{s.line}</div>
        {entry && (
          <button onClick={() => setOpen(s.entry!)} style={{
            all: "unset", cursor: "pointer", marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32,
            fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: accent,
          }}>Full details →</button>
        )}
      </div>

      {open !== null && <RoleSheet entry={ALL_ENTRIES[open]} onClose={() => setOpen(null)} />}
    </div>
  )
}

export const ExperiencePhone = memo(ExperiencePhoneImpl)
