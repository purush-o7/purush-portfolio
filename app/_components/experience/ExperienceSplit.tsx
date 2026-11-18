"use client"

import { memo } from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import { MONO }               from "./RoleContent"
import { MetroMap, LaneKey }  from "./MetroMap"
import { StopPage }           from "./StopPage"
import { STOPS, LANES, useToday } from "./stops"
import { useExpProgress } from "./use-exp-progress"
import { setLaptopExpStops, setStopFractions, scrollToStop, snapMapNow } from "../../_hooks/snap-map"

const N = STOPS.length

/**
 * Laptop layout. Left: the metro map (real time scale) — it follows the scroll and every station is a
 * jump link. Right: the page for the current stop, moving with the scroll, one screen per stop.
 */
function ExperienceSplitImpl() {
  const paneRef  = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const centers  = useRef<number[]>([])     // vertical centre of each page inside the track
  const cpRef    = useRef(0)
  const [active, setActive] = useState(0)
  const today = useToday()

  // Pages are stacked tightly in one column. The column moves with the scroll position (0 → its full length), and the
  // stage's scroll length is set from the column's own length (below), so the movement is close to 1:1 with the wheel.
  const apply = useCallback(() => {
    const c = centers.current, pane = paneRef.current, track = trackRef.current
    if (!c.length || !pane || !track) return
    const D    = c[N - 1] - c[0]                                   // distance the column travels
    const t    = Math.max(0, Math.min(1, cpRef.current / Math.max(1, snapMapNow().expStops - 1)))
    const mid  = c[0] + t * D                                      // the column position that sits at the pane's centre
    track.style.transform = `translate3d(0, ${(pane.clientHeight / 2 - mid).toFixed(1)}px, 0)`
    let best = 0
    pageRefs.current.forEach((el, i) => {
      const d = Math.abs(c[i] - mid)
      if (d < Math.abs(c[best] - mid)) best = i
      if (el) el.style.opacity = String(1 - Math.min(1, d / (pane.clientHeight * 0.55)) * 0.66)
    })
    setActive(a => (a === best ? a : best))
  }, [])

  const measure = useCallback(() => {
    centers.current = pageRefs.current.map(el => (el ? el.offsetTop + el.offsetHeight / 2 : 0))
    const D = centers.current[N - 1] - centers.current[0]
    setLaptopExpStops(1 + Math.ceil(D / window.innerHeight))       // stage length = content length
    setStopFractions(centers.current.map(c => (D > 0 ? (c - centers.current[0]) / D : 0)))
    apply()
  }, [apply])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    pageRefs.current.forEach(el => el && ro.observe(el))
    if (paneRef.current) ro.observe(paneRef.current)
    return () => ro.disconnect()
  }, [measure])

  useExpProgress(cp => { cpRef.current = cp; apply() })

  const accent = LANES[STOPS[active].lane].color

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", background: "#07070f" }}>

      {/* ── Left: identity + metro map ─────────────────────────────────────── */}
      <aside style={{
        width: "36%", minWidth: 340, maxWidth: 520, flexShrink: 0, position: "relative", overflow: "hidden",
        borderRight: "1px solid rgba(255,255,255,0.07)", padding: "clamp(24px, 5vh, 48px) 40px clamp(20px, 3vh, 32px)",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 120% 45% at 0% 0%, ${accent}2e 0%, transparent 70%)`, transition: "background 0.6s ease",
        }} />

        <div style={{ position: "relative" }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: accent, transition: "color 0.4s" }}>Experience</span>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, color: "#fff", margin: "10px 0 0", lineHeight: 1.05, letterSpacing: "-0.015em" }}>Purushottam Reddy</h2>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: "8px 0 0" }}>Full-stack · ML engineer</p>
        </div>

        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
          <MetroMap sel={active} today={today} onSel={scrollToStop} />
        </div>

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
          <LaneKey />
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
            {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </span>
        </div>
      </aside>

      {/* ── Right: stop pages — one tight column that scrolls with the page ── */}
      <div ref={paneRef} style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>
        <div ref={trackRef} style={{ position: "absolute", top: 0, left: 0, right: 0, willChange: "transform" }}>
          {STOPS.map((s, i) => (
            <div
              key={i}
              ref={el => { pageRefs.current[i] = el }}
              style={{
                display: "flex", flexDirection: "column", padding: "clamp(16px, 3.2vh, 30px) 72px clamp(16px, 3.2vh, 30px) 64px",
                opacity: i === 0 ? 1 : 0.34, willChange: "opacity",
              }}
            >
              <StopPage stop={s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const ExperienceSplit = memo(ExperienceSplitImpl)
