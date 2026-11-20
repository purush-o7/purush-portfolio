"use client"

import Image                 from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform,
  type Variants,
} from "framer-motion"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"
import { useMobile }         from "../../_hooks/use-mobile"
import { navToIndex }        from "../../_hooks/scroll-nav"
import { EXP_START_SNAP, snapMapNow, scrollToStop } from "../../_hooks/snap-map"
import { STOPS }             from "../experience/stops"

const HEAD = "var(--font-heading)"
const MONO = "var(--font-geist-mono)"
const EASE = [0.2, 0.8, 0.2, 1] as const

// ── motion ────────────────────────────────────────────────────────────────────
// "hide" snaps back instantly (the layer is covered by then), so the entry replays every time you arrive.
const textV: Variants = { hide: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }
const riseV: Variants = {
  hide: { opacity: 0, y: 16, transition: { duration: 0 } },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}
const dropV: Variants = {
  hide: { y: "-125%", transition: { duration: 0 } },
  show: { y: 0, transition: { type: "spring", stiffness: 85, damping: 11 } },
}
const stampV: Variants = {
  hide: { opacity: 0, scale: 2.4, transition: { duration: 0 } },
  show: { opacity: 0.92, scale: 1, transition: { delay: 1.25, type: "spring", stiffness: 420, damping: 20 } },
}

/** True while the Education screen is the one on show (between the hero lifting and Projects arriving). */
function useInView() {
  const view = (y: number) => { const r = y / window.innerHeight; return r > 0.45 && r < 1.7 }
  const { scrollY } = useScroll()
  const [on, setOn] = useState(() => typeof window !== "undefined" && view(window.scrollY))
  useMotionValueEvent(scrollY, "change", y => { const v = view(y); setOn(p => (p === v ? p : v)) })
  return on
}

/**
 * Education — a student ID card on a lanyard. It drops in, swings like a pendulum (drag it), tilts toward
 * the cursor with a sheen, flips on click, and gets an "Alumni" stamp. The campus drawing lights up around
 * the cursor, and chips under the text jump to the college-era stops on the Experience map.
 * Fixed behind everything; the hero lifts off it and Projects slide over it.
 */
export function EducationCard() {
  const mobile = useMobile()
  const calm   = useReducedMotion()
  const inView = useInView()
  const state  = calm || inView ? "show" : "hide"
  const root   = useRef<HTMLDivElement>(null)

  // Hidden once scrolled well past, so it can't show through
  const gone = useScrollProgress(10, typeof window !== "undefined" ? 2.6 * window.innerHeight : 2000)

  // campus light follows the pointer
  const onMove = (e: React.PointerEvent) => {
    const el = root.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--lx", `${e.clientX - r.left}px`)
    el.style.setProperty("--ly", `${e.clientY - r.top}px`)
  }

  const mask = "radial-gradient(circle 200px at var(--lx, 64%) var(--ly, 40%), #000 20%, transparent 100%)"

  return (
    <div
      ref={root}
      aria-label="Education"
      onPointerMove={onMove}
      style={{ position: "fixed", inset: 0, zIndex: 11, overflow: "hidden", background: "#07070f", visibility: gone >= 1 ? "hidden" : "visible" }}
    >
      {/* campus drawing, faint… */}
      <Image
        src="/amrita-campus.png" alt="" fill sizes="100vw" priority
        style={{ objectFit: "cover", objectPosition: mobile ? "50% 50%" : "30% 40%", filter: "invert(1)", opacity: 0.12, pointerEvents: "none" }}
      />
      {/* …and the same drawing lit cyan under the cursor */}
      <Image
        src="/amrita-campus.png" alt="" fill sizes="100vw" aria-hidden
        style={{
          objectFit: "cover", objectPosition: mobile ? "50% 50%" : "30% 40%", opacity: 0.5, pointerEvents: "none",
          filter: "invert(1) sepia(1) hue-rotate(150deg) saturate(5) brightness(1.1)",
          WebkitMaskImage: mask, maskImage: mask,
        }}
      />

      {mobile ? <Phone state={state} /> : <Laptop state={state} />}
    </div>
  )
}

/* ── layouts ─────────────────────────────────────────────────────────────── */

function Laptop({ state }: { state: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(40px, 9vw, 150px)", padding: "0 6vw" }}>
      <Text align="left" state={state} />
      <Lanyard scale={1} state={state} />
    </div>
  )
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** Phone: one big card on its lanyard (tilts with the phone; tap to flip), then the story and the college chips. */
function Phone({ state }: { state: string }) {
  const calm = useReducedMotion()
  const [tiltOn, setTiltOn] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const sway = useRef<HTMLDivElement>(null)

  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 16 })
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 16 })
  const sheenPos = useTransform(ry, [-14, 14], ["100% 0", "0% 0"])

  // iPhone asks for permission before it shares the motion sensor; Android just sends it.
  const needsPerm = typeof window !== "undefined"
    && typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent?.requestPermission === "function"
  const active = !calm && (!needsPerm || tiltOn)

  const onOrient = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return
    ry.set(clamp(e.gamma, -30, 30) * 0.5)              // left / right
    rx.set(-clamp(e.beta - 50, -30, 30) * 0.35)        // toward / away (≈50° is a natural hold)
  }, [rx, ry])
  useEffect(() => {
    if (!active) return
    window.addEventListener("deviceorientation", onOrient)
    return () => window.removeEventListener("deviceorientation", onOrient)
  }, [active, onOrient])

  const enableTilt = useCallback(async () => {
    const DOE = (window as unknown as { DeviceOrientationEvent: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent
    if (typeof DOE?.requestPermission !== "function") return
    try { if ((await DOE.requestPermission()) === "granted") setTiltOn(true) } catch { /* needs a tap first, or denied */ }
  }, [])
  // on by default: Android needs no permission; iPhone allows the request only from a tap, so ask on the first tap anywhere (the button stays as a fallback)
  useEffect(() => {
    if (!needsPerm) return
    const first = () => { void enableTilt() }
    window.addEventListener("pointerup", first, { once: true })
    return () => window.removeEventListener("pointerup", first)
  }, [needsPerm, enableTilt])

  // the lanyard sways gently, like a pendulum at rest
  useEffect(() => {
    const el = sway.current
    if (!el || calm) return
    let raf = 0
    const tick = (t: number) => { el.style.transform = `rotate(${(Math.sin(t / 1700) * 3).toFixed(2)}deg)`; raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [calm])

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "0 20px calc(26px + env(safe-area-inset-bottom, 0px))" }}>
      {/* lanyard + card */}
      <motion.div variants={dropV} initial="hide" animate={state} style={{ width: "100%", paddingTop: "clamp(0px, calc((100svh - 690px) * 0.5), 44px)" }}>
        <div ref={sway} style={{ transformOrigin: "50% -4px" }}>
          <svg viewBox="0 0 30 110" preserveAspectRatio="none" aria-hidden style={{ display: "block", width: 24, height: "clamp(36px, 7vh, 64px)", margin: "0 auto", overflow: "visible" }}>
            <path d="M15 0 L15 110" fill="none" stroke="#233463" strokeWidth={22} />
            <path d="M15 0 L15 110" fill="none" stroke="#2f4478" strokeWidth={2} strokeDasharray="6 6" />
          </svg>
          <div style={{ width: 32, height: 12, margin: "-4px auto 0", background: "#9aa3b8", borderRadius: "2px 2px 6px 6px", position: "relative", zIndex: 2 }} />

          <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 800, transformStyle: "preserve-3d", marginTop: -4, display: "flex", justifyContent: "center" }}>
            {/* sizing wrapper: scales the card to fit, from its corner */}
            <div style={{ width: 250 * 0.96, height: (250 / 0.64) * 0.96, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 250, height: 250 / 0.64, transform: "scale(0.96)", transformOrigin: "0 0" }}>
                {/* the flipper turns around its own centre, so the card never swings off to the side */}
                <motion.div
                  onClick={() => setFlipped(f => !f)}
                  animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 70, damping: 14 }}
                  style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d" }}
                >
                  <Front sheenPos={sheenPos} hover={false} />
                  <Back />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* story + college chips */}
      <motion.div variants={textV} initial="hide" animate={state} style={{ width: "100%", textAlign: "center" }}>
        <motion.p variants={riseV} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: "#22e5f0", margin: 0 }}>
          Education · Class of 2024
        </motion.p>
        <motion.h2 variants={riseV} style={{ fontFamily: HEAD, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#fff", margin: "10px 0 8px", fontSize: 30 }}>
          Amrita <span style={{ fontWeight: 300, color: "rgba(255,255,255,0.55)" }}>Vishwa Vidyapeetham</span>
        </motion.h2>
        <motion.p variants={riseV} style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, lineHeight: 1.5, color: "rgba(255,255,255,0.66)", margin: 0 }}>
          B.Tech in Computer Science &amp; Engineering, Amritapuri, Kerala. CGPA 7.96 / 10.
        </motion.p>

        <motion.div variants={riseV} style={{ marginTop: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingRight: 52 }}>
            {CHIPS.map(c => (
              <button
                key={c.label}
                onClick={() => goToStop(c.i)}
                style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", borderRadius: 999, border: "1px solid #262c4f", background: "#0d1026", color: "#fff", padding: "7px 12px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "left" }}
              >
                <span style={{ display: "block", fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.55)" }}>{c.year}</span>
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>

        {needsPerm && !tiltOn && !calm && (
          <button
            onClick={enableTilt}
            style={{ marginTop: 14, border: "1px solid #22e5f0", color: "#22e5f0", borderRadius: 999, padding: "7px 16px", background: "transparent", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Enable tilt
          </button>
        )}
      </motion.div>
    </div>
  )
}

/** Snap that shows stop i: one per stop on a laptop; on a phone the timeline is two screens, so the first half or the second. */
const snapFor = (i: number) => (snapMapNow().mobile ? EXP_START_SNAP + (i >= 4 ? 1 : 0) : EXP_START_SNAP + i)

const goToStop = (i: number) => (snapMapNow().mobile ? navToIndex(snapFor(i)) : scrollToStop(i))

/** Chips for the college-era stops; each jumps to its station on the Experience map. */
const CHIPS = ["Cloud Intern", "Research Asst.", "Teaching Asst.", "IEEE ICVR"].map(short => {
  const i = STOPS.findIndex(s => s.short === short)
  return { i, year: STOPS[i].year, label: short }
})

function Text({ align, state }: { align: "left" | "center"; state: string }) {
  const left = align === "left"
  return (
    <motion.div variants={textV} initial="hide" animate={state} style={{ maxWidth: left ? 540 : 360, textAlign: align }}>
      <motion.p variants={riseV} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "#22e5f0", margin: 0 }}>
        Education · Class of 2024
      </motion.p>
      <motion.h2 variants={riseV} style={{ fontFamily: HEAD, fontWeight: 600, lineHeight: 1.02, letterSpacing: "-0.025em", color: "#fff", margin: "14px 0 14px", fontSize: left ? "clamp(40px, 5.4vw, 80px)" : 28 }}>
        Amrita<br />
        <span style={{ fontWeight: 300, color: "rgba(255,255,255,0.55)" }}>Vishwa Vidyapeetham</span>
      </motion.h2>
      <motion.p variants={riseV} style={{ fontFamily: "var(--font-sans)", fontSize: left ? 17 : 14.5, lineHeight: 1.55, color: "rgba(255,255,255,0.64)", margin: 0 }}>
        B.Tech in Computer Science &amp; Engineering, Amritapuri, Kerala. CGPA 7.96 / 10.
      </motion.p>
      <motion.div variants={riseV} style={{ marginTop: left ? 22 : 14 }}>
        <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>
          During college
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: left ? "flex-start" : "center" }}>
          {CHIPS.map(c => (
            <button
              key={c.label}
              onClick={() => goToStop(c.i)}
              className="rounded-full border border-[#262c4f] bg-[#0d1026] px-3 py-1.5 text-left text-white transition-colors hover:border-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-400"
              style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              <span style={{ display: "block", fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.55)" }}>{c.year}</span>
              {c.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── lanyard + card ──────────────────────────────────────────────────────── */

function Lanyard({ scale, phone = false, state }: { scale: number; phone?: boolean; state: string }) {
  const swing   = useRef<HTMLDivElement>(null)
  const card    = useRef<HTMLDivElement>(null)
  const rope1   = useRef<SVGPathElement>(null)
  const rope2   = useRef<SVGPathElement>(null)
  const moved   = useRef(0)                  // how far the last press travelled — a drag must not flip the card
  const [flipped, setFlipped] = useState(false)
  const [hover,   setHover]   = useState(false)

  // 3D tilt toward the cursor, with a sheen sliding across
  const calm = useReducedMotion()
  const rx = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 })
  const ry = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 })
  const sheenPos = useTransform(ry, [-14, 14], ["100% 0", "0% 0"])
  const onTilt = (e: React.PointerEvent) => {
    if (calm) return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width  - 0.5) * 28)
    rx.set(-((e.clientY - r.top)  / r.height - 0.5) * 22)
  }
  const onLeave = () => { rx.set(0); ry.set(0); setHover(false) }

  // pendulum: drag it, it eases to the finger, keeps its speed on release and never quite stops
  useEffect(() => {
    const el = swing.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let a = reduce ? 0 : 6, v = 0, target = 0, drag = false, sx = 0, a0 = 0, raf = 0, last = performance.now()

    const down = (e: PointerEvent) => {
      e.preventDefault()                       // no text selection / native drag
      drag = true; sx = e.clientX; a0 = a; target = a; moved.current = 0
      el.setPointerCapture(e.pointerId)
      el.style.cursor = "grabbing"
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      target = Math.max(-30, Math.min(30, a0 + (e.clientX - sx) * 0.16))
      moved.current = Math.max(moved.current, Math.abs(e.clientX - sx))
    }
    const up    = () => { drag = false; el.style.cursor = "grab" }
    const noSel = (e: Event) => e.preventDefault()
    el.addEventListener("pointerdown", down)
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", up)
    el.addEventListener("selectstart", noSel)
    el.addEventListener("dragstart", noSel)

    const tick = (t: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (t - last) / 1000)); last = t
      if (drag) {
        const prev = a
        a += (target - a) * (1 - Math.exp(-dt * 16))
        v = (a - prev) / dt
      } else {
        v += (-22 * a - 2.2 * v) * dt
        a += v * dt
        if (!reduce && Math.abs(a) < 0.3 && Math.abs(v) < 0.5) v = 1.1
      }
      el.style.transform = `rotate(${a.toFixed(3)}deg)`
      // the lanyard curves against the swing
      const bend = Math.max(-9, Math.min(9, -v * 0.35))
      const d = `M15 0 C ${15 + bend} 36 ${15 - bend} 74 15 110`
      rope1.current?.setAttribute("d", d)
      rope2.current?.setAttribute("d", d)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointerdown", down)
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", up)
      el.removeEventListener("selectstart", noSel)
      el.removeEventListener("dragstart", noSel)
    }
  }, [])

  // The pendulum captures the pointer on press, so the click lands on it — test the point against the card
  const onClick = (e: React.MouseEvent) => {
    if (moved.current > 6) return
    const r = card.current?.getBoundingClientRect()
    if (!r || e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return
    setFlipped(f => !f)
  }

  const ropeH = phone ? 60 : "clamp(80px, 14vh, 140px)"

  return (
    <div style={{ alignSelf: phone ? "center" : "flex-start", marginTop: phone ? 0 : "-6vh" }}>
      <motion.div variants={dropV} initial="hide" animate={state}>
        <div
          ref={swing}
          onClick={onClick}
          style={{ transformOrigin: "50% -4px", touchAction: "pan-y", cursor: "grab", scale: String(scale), userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
        >
          <svg viewBox="0 0 30 110" preserveAspectRatio="none" aria-hidden style={{ display: "block", width: 26, height: ropeH, margin: "0 auto", overflow: "visible" }}>
            <path ref={rope1} d="M15 0 L15 110" fill="none" stroke="#233463" strokeWidth={22} />
            <path ref={rope2} d="M15 0 L15 110" fill="none" stroke="#2f4478" strokeWidth={2} strokeDasharray="6 6" />
          </svg>
          <div style={{ width: 32, height: 12, margin: "-4px auto 0", background: "#9aa3b8", borderRadius: "2px 2px 6px 6px", position: "relative", zIndex: 2 }} />

          <motion.div
            ref={card}
            onPointerMove={onTilt} onPointerEnter={() => setHover(true)} onPointerLeave={onLeave}
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, transformStyle: "preserve-3d", marginTop: -4, position: "relative" }}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 70, damping: 14 }}
              style={{ position: "relative", width: 250, aspectRatio: "0.64", transformStyle: "preserve-3d" }}
            >
              <Front sheenPos={sheenPos} hover={hover} />
              <Back />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

const face: React.CSSProperties = {
  position: "absolute", inset: 0, borderRadius: 16, background: "#0e1124", border: "1px solid #2b3050", overflow: "hidden",
  display: "flex", flexDirection: "column", boxShadow: "0 28px 44px -24px #000",
  backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
}

function Front({ sheenPos, hover }: { sheenPos: ReturnType<typeof useTransform<number, string>>; hover: boolean }) {
  return (
    <div style={face}>
      <div style={{ padding: "12px 16px", background: "linear-gradient(120deg,#12306a,#0b1d44)", fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1.5, color: "#cfe0ff" }}>
        Amrita Vishwa Vidyapeetham<br />Student identity card
      </div>

      <div style={{ margin: "18px auto 10px", width: 82, aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle at 50% 38%,#1d2b56,#0c1530)", border: "2px solid #22e5f0", display: "grid", placeItems: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: "#22e5f0" }}>
        P
      </div>
      <div style={{ textAlign: "center", fontFamily: HEAD, fontWeight: 600, fontSize: 20, color: "#fff" }}>B.Tech · CSE</div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)", marginTop: 4 }}>
        Amritapuri, Kerala
      </div>

      <dl style={{ margin: "14px 18px 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 10px", fontFamily: "var(--font-sans)", fontSize: 13 }}>
        {[["Program", "Computer Science"], ["Valid", "2020 – 2024"], ["CGPA", "7.96 / 10"]].map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.66)", lineHeight: "20px" }}>{k}</dt>
            <dd style={{ margin: 0, textAlign: "right", color: "#e8ecf5" }}>{v}</dd>
          </div>
        ))}
      </dl>

      <div style={{ margin: "auto 18px 16px", height: 34, borderRadius: 2, opacity: 0.75, background: "repeating-linear-gradient(90deg,#d9deee 0 2px,transparent 2px 4px,#d9deee 4px 5px,transparent 5px 8px,#d9deee 8px 11px,transparent 11px 12px)" }} />

      {/* alumni stamp — slaps on after the card lands */}
      <motion.div
        aria-hidden variants={stampV}
        style={{
          position: "absolute", left: "50%", top: "85%", x: "-50%", y: "-50%", rotate: -12, whiteSpace: "nowrap", pointerEvents: "none",
          padding: "4px 12px", border: "2px solid rgba(255,100,100,0.9)", color: "rgba(255,110,110,0.95)", borderRadius: 5,
          fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: "0.18em", textTransform: "uppercase",
        }}
      >
        Alumni · 2024
      </motion.div>

      {/* sheen — follows the tilt */}
      <motion.div
        aria-hidden
        animate={{ opacity: hover ? 1 : 0 }} transition={{ duration: 0.2 }}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen", backgroundSize: "250% 100%", backgroundPosition: sheenPos,
          backgroundImage: "linear-gradient(115deg,transparent 30%,rgba(120,220,255,.22) 45%,rgba(255,255,255,.28) 50%,rgba(120,220,255,.18) 55%,transparent 70%)",
        }}
      />
    </div>
  )
}

function Back() {
  const lab: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.66)" }
  return (
    <div style={{ ...face, transform: "rotateY(180deg)", padding: 18, gap: 14 }}>
      <div>
        <div style={lab}>CGPA</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 54, lineHeight: 1, letterSpacing: "-0.03em", color: "#fff" }}>
          7.96<span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 16, letterSpacing: 0, color: "rgba(255,255,255,0.66)" }}> / 10</span>
        </div>
      </div>
      <div><div style={lab}>Valid</div><div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#e8ecf5", marginTop: 2 }}>2020 – 2024</div></div>
      <div><div style={lab}>Campus</div><div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "#e8ecf5", marginTop: 2 }}>Amritapuri, Kerala</div></div>
      <div style={{ marginTop: "auto", height: 56, borderRadius: 2, opacity: 0.75, background: "repeating-linear-gradient(90deg,#d9deee 0 2px,transparent 2px 4px,#d9deee 4px 5px,transparent 5px 8px,#d9deee 8px 11px,transparent 11px 12px)" }} />
    </div>
  )
}
