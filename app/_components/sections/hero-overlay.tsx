"use client"

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "framer-motion"
import { useEffect }         from "react"
import { trackContactClick } from "../../_lib/analytics"

const HEAD = "var(--font-heading)"
const MONO = "var(--font-geist-mono)"
const EASE = [0.2, 0.8, 0.2, 1] as const

const LINKS = [
  { label: "GitHub",      href: "https://github.com/purush-o7",                           track: "GitHub"   as const },
  { label: "LinkedIn",    href: "https://www.linkedin.com/in/purush-o7/",                  track: "LinkedIn" as const },
  { label: "IEEE Xplore", href: "https://ieeexplore.ieee.org/abstract/document/11172645",  track: null },
]

const FACTS = [
  { k: "Role",      v: "Full-stack · ML" },
  { k: "Now",       v: "TalkingLands" },
  { k: "Education", v: "B.Tech, Amrita" },
  { k: "Published", v: "IEEE ICVR 2025" },
]

// ── motion variants ───────────────────────────────────────────────────────────
const letter: Variants = {
  hide: { y: "108%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.75, ease: EASE, delay: 0.05 + i * 0.045 } }),
}
const rise: Variants = {
  hide: { opacity: 0, y: 14 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: d } }),
}

/** A word whose letters slide up out of a mask, one after another. */
function Word({ text, base, outline = false, label }: { text: string; base: number; outline?: boolean; label: string }) {
  return (
    <span role="text" aria-label={label} style={{ display: "block", overflow: "hidden", paddingBottom: "0.06em" }}>
      {text.split("").map((c, i) => (
        <motion.span
          key={i} aria-hidden custom={base + i} variants={letter}
          style={{
            display: "inline-block",
            color: outline ? "transparent" : "#e8ecf5",
            WebkitTextStroke: outline ? "1.5px rgba(255,255,255,0.78)" : undefined,
          }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  )
}

/** Slow, endless marquee of chips (phone). Pure CSS; static and scrollable under reduced motion. */
function Marquee({ items, reduced }: { items: string[]; reduced: boolean }) {
  const list = reduced ? items : [...items, ...items]
  return (
    <div
      style={{
        overflow: reduced ? "auto" : "hidden", scrollbarWidth: "none",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
        maskImage:       "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
      }}
    >
      <style>{`@keyframes hero-marq { to { transform: translateX(-50%) } }`}</style>
      <div style={{ display: "flex", width: "max-content", animation: reduced ? undefined : "hero-marq 38s linear infinite" }}>
        {list.map((t, i) => (
          <span
            key={i}
            style={{
              flexShrink: 0, marginRight: 8, padding: "7px 14px", borderRadius: 999, whiteSpace: "nowrap",
              border: "1px solid #262c4f", background: "#0d1026", color: "#fff",
              fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Hero text layer — option A: huge name over the full-bleed portrait, role line, links, and a ruled facts
 * strip. Everything animates in once the particles are ready; the name drifts opposite the cursor
 * (a little depth against the WebGL portrait) and slides away as you scroll.
 */
export function HeroOverlay({ ready, mobile }: { ready: boolean; mobile: boolean }) {
  const calm = useReducedMotion()

  // cursor parallax (laptop only)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 70, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 70, damping: 18, mass: 0.6 })
  useEffect(() => {
    if (mobile || calm) return
    const move = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth  - 0.5) * 2)
      my.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener("pointermove", move, { passive: true })
    return () => window.removeEventListener("pointermove", move)
  }, [mobile, calm, mx, my])
  const px = useTransform(sx, v => v * -14)
  const py = useTransform(sy, v => v * -8)

  // scroll exit — the name slides left and fades while the hero lifts off
  const { scrollY } = useScroll()
  const vh    = () => (typeof window !== "undefined" ? window.innerHeight : 800)
  const exitX = useTransform(scrollY, v => -Math.min(1, v / vh()) * (mobile ? 40 : 160))
  const exitO = useTransform(scrollY, v => 1 - Math.min(1, v / (vh() * 0.7)))

  const state = ready ? "show" : "hide"
  const pad   = mobile ? 16 : "clamp(28px, 5vw, 80px)"

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>

      {/* phone: the portrait runs full-screen; a dark fade keeps the text readable */}
      {mobile && <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, background: "linear-gradient(180deg, transparent 42%, rgba(7,7,15,0.9) 78%)" }} />}

      {/* links — top-right on a laptop, bottom row on a phone */}
      <motion.nav
        initial="hide" animate={state} variants={rise} custom={1.3} aria-label="Elsewhere"
        style={mobile
          ? { position: "absolute", zIndex: 2, bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", left: pad, right: 70, display: "flex", gap: 18, pointerEvents: "auto" }
          : { position: "absolute", zIndex: 2, top: "clamp(24px, 4vw, 56px)", right: pad, display: "flex", gap: 24, pointerEvents: "auto" }}
      >
        {LINKS.map(l => (
          <a
            key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
            onClick={() => { if (l.track) trackContactClick(l.track) }}
            className="text-white/60 underline decoration-white/20 underline-offset-[5px] transition-colors hover:text-white hover:decoration-white/70"
            style={{ fontFamily: MONO, fontSize: mobile ? 11 : 12, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            {l.label}
          </a>
        ))}
      </motion.nav>

      {/* name + role */}
      <motion.div style={{ position: "relative", zIndex: 1, x: exitX, opacity: exitO, paddingLeft: pad, paddingRight: pad, marginBottom: mobile ? 12 : "clamp(20px, 3.4vw, 44px)" }}>
        <motion.div initial="hide" animate={state} style={{ x: calm || mobile ? 0 : px, y: calm || mobile ? 0 : py }}>
          <h1 style={{ fontFamily: HEAD, fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.045em", margin: 0, fontSize: mobile ? "clamp(34px, 12.6vw, 64px)" : "clamp(60px, 8.6vw, 156px)" }}>
            <Word text="PURUSHOTTAM" base={0} label="Purushottam" />
            <Word text="REDDY" base={11} outline label="Reddy" />
          </h1>
          <motion.p variants={rise} custom={1.0} style={{ fontFamily: MONO, color: "#22e5f0", margin: mobile ? "12px 0 0" : "clamp(16px, 2vw, 28px) 0 0", fontSize: mobile ? 12 : "clamp(13px, 1.25vw, 18px)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            AI Full Stack Engineer
          </motion.p>
        </motion.div>
      </motion.div>

      {/* phone: the facts drift past as a marquee, with the links beneath */}
      {mobile && (
        <motion.div initial="hide" animate={state} variants={rise} custom={0.9} style={{ position: "relative", zIndex: 1, marginBottom: 58 }}>
          <Marquee items={FACTS.map(f => `${f.k} · ${f.v}`)} reduced={!!calm} />
        </motion.div>
      )}

      {/* laptop: facts strip */}
      {!mobile && (
      <div style={{ position: "relative", background: "rgba(7,7,15,0.72)", backdropFilter: "blur(6px)" }}>
        <motion.div
          aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: ready ? 1 : 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
          style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: "rgba(255,255,255,0.16)", transformOrigin: "left" }}
        />
        <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {FACTS.map((f, i) => (
            <motion.div key={f.k} initial="hide" animate={state} variants={rise} custom={0.9 + i * 0.09} style={{
              paddingTop: mobile ? 10 : "clamp(14px, 1.8vw, 24px)", paddingBottom: mobile ? 10 : "clamp(14px, 1.8vw, 24px)",
              paddingRight: mobile ? 8 : "clamp(28px, 5vw, 80px)", paddingLeft: mobile ? 16 : i === 0 ? pad : 0,
            }}>
              <dt style={{ fontFamily: MONO, fontSize: mobile ? 10 : 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}>{f.k}</dt>
              <dd style={{ margin: "4px 0 0", fontFamily: "var(--font-sans)", fontSize: mobile ? 14 : "clamp(15px, 1.3vw, 19px)", color: "#fff" }}>{f.v}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
      )}
    </div>
  )
}
