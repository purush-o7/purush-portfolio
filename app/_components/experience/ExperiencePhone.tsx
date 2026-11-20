"use client"

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MONO }               from "./RoleContent"
import { MetroMap, LaneKey, stopYs, elasticHeight } from "./MetroMap"
import { useSnapMap, setPhoneExpStops } from "../../_hooks/snap-map"
import { StopSheet }          from "./StopSheet"
import { STOPS, LANES, useToday, type Today } from "./stops"
import { useExpProgress }     from "./use-exp-progress"

/**
 * Phone layout. The whole page IS the timeline: one tall metro map on a real time scale that scrolls like any
 * other page (as many screens tall as its labels need, moved 1:1 with your finger). Tap a station for the full story
 * in a bottom sheet. When you reach the end, the page moves on.
 */
function ExperiencePhoneImpl() {
  const [open,   setOpen]   = useState<number | null>(null)
  const [active, setActive] = useState(0)
  const [dims,   setDims]   = useState({ vh: 800, w: 362 })
  const today   = useToday()
  const trackRef = useRef<HTMLDivElement>(null)
  const boxRef   = useRef<HTMLDivElement>(null)

  // the content is a whole number of screens tall, so the scroll distance matches the content overflow 1:1
  useEffect(() => {
    const fit = () => setDims({ vh: window.innerHeight, w: boxRef.current?.clientWidth ?? window.innerWidth - 28 })
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])
  // The timeline is the fewest whole screens that give every crowded stretch the room its labels need; the quiet stretches
  // share whatever is left (the time scale is elastic: it grows only where marks are dense). The page length follows.
  const { expStops } = useSnapMap()
  const unit = dims.w / 360, pad = 76 + 24                                  // map units → px; header room above, a little below
  const fit = useMemo(() => {
    const tEnd = today.end, tNow = today.now
    const t: Today = { now: tNow, end: tEnd, label: "" }
    const stops = Math.max(2, Math.ceil((elasticHeight(t, 40, true) * unit + pad) / dims.vh))
    const target = (stops * dims.vh - pad) / unit
    let lo = 40, hi = target * 2
    for (let k = 0; k < 28; k++) { const mid = (lo + hi) / 2; if (elasticHeight(t, mid, true) > target) hi = mid; else lo = mid }
    return { stops, baseH: lo }
  }, [today.end, today.now, unit, dims.vh, pad])
  const baseH = fit.baseH
  useEffect(() => { setPhoneExpStops(fit.stops) }, [fit.stops])
  const H  = dims.vh * expStops
  const vbH = Math.round(H * (360 / dims.w))                  // svg height in its own units

  const apply = useCallback((cp: number) => {
    if (trackRef.current) trackRef.current.style.transform = `translate3d(0, ${-(cp * dims.vh).toFixed(1)}px, 0)`
    // highlight the stop nearest the middle of the screen
    const mid = ((cp * dims.vh) + dims.vh * 0.5) * (360 / dims.w)
    const ys = stopYs(vbH, today, true, baseH)
    let best = 0
    ys.forEach((y, i) => { if (Math.abs(y - mid) < Math.abs(ys[best] - mid)) best = i })
    setActive(a => (a === best ? a : best))
  }, [dims, vbH, baseH, today])
  useExpProgress(apply)

  const accent = LANES[STOPS[active].lane].color

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070f", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 120% 30% at 0% 0%, ${accent}22 0%, transparent 70%)`, transition: "background 0.6s ease", zIndex: 0 }} />

      <div ref={trackRef} style={{ position: "absolute", top: 0, left: 14, right: 14, height: H, willChange: "transform" }}>
        <div ref={boxRef} style={{ position: "absolute", inset: 0, paddingTop: "calc(76px + env(safe-area-inset-top, 0px))", boxSizing: "border-box" }}>
          <MetroMap sel={active} today={today} onSel={setOpen} H={vbH} baseH={baseH} big dimFuture={false} />
        </div>
      </div>

      {/* header — stays put while the timeline scrolls under it */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 3, padding: "calc(12px + env(safe-area-inset-top, 0px)) 16px 10px", background: "linear-gradient(180deg, #07070f 70%, rgba(7,7,15,0))", pointerEvents: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: accent, transition: "color .4s" }}>Experience</span>
          <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Tap a stop</span>
        </div>
        <div style={{ marginTop: 6 }}><LaneKey /></div>
      </div>

      {open !== null && <StopSheet stop={STOPS[open]} onClose={() => setOpen(null)} />}
    </div>
  )
}

export const ExperiencePhone = memo(ExperiencePhoneImpl)
