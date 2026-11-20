"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import { navToIndex }                from "../../_hooks/scroll-nav"
import { useSnapMap, setReelSnaps }  from "../../_hooks/snap-map"
import { trackProjectClick }         from "../../_lib/analytics"
import { PROJECTS }                  from "./data"
import { SRC }                       from "../kovil/data"
import { ProjectWindow }             from "./ProjectWindow"
import { ProjectCard }               from "./ProjectCard"
import { NameDial }                  from "./NameDial"

const HEAD = "var(--font-heading)"
const MONO = "var(--font-geist-mono)"
const N    = PROJECTS.length
const SPEED = 1.7      // the clips move this many px sideways per px of page scroll (keeps the stage a few screens long)
const pad2 = (n: number) => String(n).padStart(2, "0")

/**
 * Projects. Laptop: scrolling slides the clips sideways (eased, ~1.7 px per px). Phone: full-height cards slide up over each other.
 * Either way the bottom bar is the row of names: the current one grows, centred and highlighted. Click a name or press ← → to jump.
 * The page is exactly as long as the reel needs, and ordinary scrolling carries on past it.
 */
function ProjectsReelImpl() {
  const { reelStart, reelSnaps, reelEnd, expEnd } = useSnapMap()
  const [cur, setCur] = useState(0)
  const [geo, setGeo]   = useState({ cw: 720, gap: 56, vw: 1440, top: 99 })

  const root   = useRef<HTMLDivElement>(null)
  const track  = useRef<HTMLDivElement>(null)
  const clipEl = useRef<(HTMLElement | null)[]>([])
  const cardEl = useRef<(HTMLElement | null)[]>([])
  const curRef = useRef(0)
  const m      = useRef({ cw: 760, gap: 56, vw: 1440, vh: 900, overflow: 1, trackW: 1, starts: [] as number[], shown: 0, phone: false })
  const stage  = useRef({ reelStart, reelSnaps, reelEnd, expEnd })
  useEffect(() => { stage.current = { reelStart, reelSnaps, reelEnd, expEnd } }, [reelStart, reelSnaps, reelEnd, expEnd])

  // measure → clip size, track length, and how many screens of scrolling the reel needs
  useEffect(() => {
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight
      const top = Math.max(84, Math.min(110, vh * 0.11))             // clear of the header
      // clip width: by screen width, and capped so window + caption + timeline always fit the height
      const cw  = Math.min(vw > 900 ? Math.min(vw * 0.5, 760) : vw * 0.86, Math.max(280, (vh - top - 266) / 0.625))
      const gap = Math.max(24, vw * 0.04)
      const pad = (vw - cw) / 2
      const trackW = pad * 2 + N * cw + (N - 1) * gap
      const overflow = Math.max(1, trackW - vw)
      const phone = vw < 640
      m.current = { ...m.current, cw, gap, vw, vh, overflow, trackW, phone, starts: PROJECTS.map((_, i) => pad + i * (cw + gap)) }
      setGeo({ cw, gap, vw, top })
      setReelSnaps(phone ? N - 1 : Math.ceil(overflow / SPEED / vh))        // phone: one screen of scrolling per card
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])

  const stageTop = useCallback(() => stage.current.reelStart * m.current.vh, [])
  const stageLen = useCallback(() => stage.current.reelSnaps * m.current.vh, [])
  const progress = useCallback(() => Math.max(0, Math.min(1, (window.scrollY - stageTop()) / stageLen())), [stageTop, stageLen])
  const scrollToFraction = useCallback((p: number, smooth: boolean) => {
    window.scrollTo({ top: stageTop() + Math.max(0, Math.min(1, p)) * stageLen(), behavior: smooth ? "smooth" : "auto" })
  }, [stageTop, stageLen])
  const goTo = useCallback((i: number) => {
    const { starts, cw, vw, overflow, phone } = m.current
    if (phone) { scrollToFraction(i / (N - 1), true); return }
    scrollToFraction((starts[i] + cw / 2 - vw / 2) / overflow, true)
  }, [scrollToFraction])

  // the render loop: ease toward the scroll position, move the track, light the current clip, move the playhead
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    const frame = () => {
      const g = m.current
      const visible = window.scrollY >= stage.current.expEnd * g.vh - 5
      if (root.current) root.current.style.visibility = visible ? "visible" : "hidden"
      if (visible) {
        const target = progress()
        g.shown += (target - g.shown) * (calm ? 1 : 0.14)
        if (Math.abs(target - g.shown) < 0.0002) g.shown = target
        let best = 0
        if (g.phone) {
          const t = g.shown * (N - 1)
          best = Math.max(0, Math.min(N - 1, Math.round(t)))
          cardEl.current.forEach((c, i) => {
            if (!c) return
            const enter = i === 0 ? 1 : Math.max(0, Math.min(1, t - (i - 1)))
            const depth = Math.max(0, Math.min(3, t - i))
            c.style.visibility = depth >= 3 ? "hidden" : "visible"
            c.style.transform = `translate3d(0, calc(${((1 - enter) * 130).toFixed(2)}% - ${(depth * 10).toFixed(1)}px), 0) scale(${(1 - depth * 0.04).toFixed(3)})`
          })
        } else {
          const tx = -g.shown * g.overflow
          if (track.current) track.current.style.transform = `translate3d(${tx.toFixed(1)}px,0,0)`
          const mid = -tx + g.vw / 2
          let bd = Infinity
          clipEl.current.forEach((c, i) => {
            const d = Math.abs(g.starts[i] + g.cw / 2 - mid)
            if (d < bd) { bd = d; best = i }
            if (c) c.style.opacity = String((1 - Math.min(1, d / (g.cw * 0.9)) * 0.4).toFixed(2))
          })
        }
        if (best !== curRef.current) { curRef.current = best; setCur(best) }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  const pick = (i: number) => goTo(Math.max(0, Math.min(N - 1, i)))

  const { cw, gap, vw, top } = geo
  const phone = vw < 640
  const edge  = "clamp(16px, 5vw, 64px)"

  return (
    <div ref={root} aria-label="Projects" style={{ position: "fixed", inset: 0, zIndex: 12, overflow: "hidden", background: "#07070f", visibility: "hidden" }}>
      <style>{`
        .reel-skip:focus-visible,.reel-btn:focus-visible{outline:2px solid #22e5f0;outline-offset:2px}
      `}</style>

      {/* header */}
      <div style={{ position: "absolute", left: edge, right: edge, top: "calc(clamp(14px, 3.2vh, 30px) + env(safe-area-inset-top, 0px))", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#8bf0ff" }}>Projects</span>
        <button className="reel-skip" onClick={() => navToIndex(stage.current.reelEnd + 1)} type="button"
          style={{ all: "unset", cursor: "pointer", border: "1px solid #262c4f", background: "#0d1026", color: "#cfd4e6", borderRadius: 999, padding: "7px 14px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Skip projects ↓
        </button>
      </div>

      {/* laptop: the clips slide sideways */}
      {!phone && <div ref={track} style={{ position: "absolute", left: 0, top: 0, height: "100%", display: "flex", alignItems: "flex-start", gap, padding: `${top}px ${(vw - cw) / 2}px 0`, willChange: "transform" }}>
        {PROJECTS.map((p, i) => {
          const hasLink = p.link && p.link !== "#"
          const kovil = p.title === "KovilLens"
          return (
            <article key={p.title} ref={el => { clipEl.current[i] = el }} style={{ flex: "none", width: cw, containerType: "inline-size", opacity: i === 0 ? 1 : 0.6 }}>
              <div style={{ border: "2px solid #cfd4e6", borderRadius: 14, background: "#0b0d1f", overflow: "hidden", boxShadow: "8px 8px 0 #000" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderBottom: "1px solid #2a3157", background: "#12163a" }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map(c => <i key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "block" }} />)}
                  <span style={{ marginLeft: 8, flex: 1, background: "#0b0d1f", borderRadius: 6, padding: "3px 10px", fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    projects / {p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  </span>
                </div>
                <div style={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden" }}>
                  <ProjectWindow p={p} photo={kovil ? SRC.models : undefined} />
                </div>
              </div>

              <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Clip {pad2(i + 1)} · {p.tag}</div>
                  <h3 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(22px, 3vw, 34px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "6px 0 0", color: "#fff" }}>{p.title}</h3>
                </div>
                {hasLink && (
                  <a className="reel-btn" href={p.link} target="_blank" rel="noopener noreferrer" onFocus={() => goTo(i)} onClick={() => trackProjectClick(p.title)}
                    style={{ flex: "none", display: "inline-flex", alignItems: "center", minHeight: 44, fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: p.color, textDecoration: "none", borderBottom: "1px solid currentColor" }}>
                    View project →
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>}

      {/* phone: full-height cards that slide up over each other */}
      {phone && (
        <div style={{ position: "absolute", left: 12, right: 12, top: "calc(clamp(14px, 3.2vh, 30px) + 36px + env(safe-area-inset-top, 0px))", bottom: "calc(102px + env(safe-area-inset-bottom, 0px))" }}>
          {PROJECTS.map((p, i) => (
            <div key={p.title} ref={el => { cardEl.current[i] = el }} style={{ position: "absolute", inset: 0, zIndex: i, willChange: "transform", transformOrigin: "50% 0%" }}>
              <ProjectCard p={p} i={i} total={N} photo={p.title === "KovilLens" ? SRC.models : undefined} />
            </div>
          ))}
        </div>
      )}

      {/* the bottom bar: the names */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: "calc(clamp(14px, 3.6vh, 36px) + env(safe-area-inset-bottom, 0px))", height: phone ? 64 : 84, zIndex: 7 }}>
        <NameDial names={PROJECTS.map(p => p.title)} colors={PROJECTS.map(p => p.color)} cur={cur} onPick={pick} phone={phone} />
      </div>
    </div>
  )
}

export const ProjectsReel = memo(ProjectsReelImpl)
