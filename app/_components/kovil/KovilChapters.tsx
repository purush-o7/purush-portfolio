"use client"

import { memo } from "react"

import Image                  from "next/image"
import Link                   from "next/link"
import { useRef, useState }   from "react"
import {
  MONO, SRC, STACK, DESCRIPTION, DEMO_URL, PAPER_URL, DOI, IMAGES, openExplorer, trackDemo,
} from "./data"

const CARD_GAP = 10
const CHAPTERS = 5

const kicker: React.CSSProperties = {
  fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#22e5f0",
}
const chip: React.CSSProperties = {
  fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", padding: "6px 10px", borderRadius: 4,
  background: "rgba(7,7,15,0.7)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(6px)",
}
const btn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 16px", borderRadius: 6,
  fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
  textDecoration: "none", cursor: "pointer", border: 0, alignSelf: "flex-start",
}

/**
 * Phone layout — chapter cards. A visual on top crossfades to match the card you
 * swipe to; the 3D explorer opens on its own full-space page.
 */
function KovilChaptersImpl({ onPhoto }: { onPhoto: (i: number) => void }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const [moved, setMoved] = useState(false)
  const rafRef = useRef<number | null>(null)

  function onScroll() {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const row = rowRef.current
      const card = row?.firstElementChild as HTMLElement | null
      if (!row || !card) return
      const i = Math.max(0, Math.min(CHAPTERS - 1, Math.round(row.scrollLeft / (card.offsetWidth + CARD_GAP))))
      setIdx(i)
    })
  }

  function goTo(i: number) {
    const row = rowRef.current
    const card = row?.firstElementChild as HTMLElement | null
    if (row && card) row.scrollTo({ left: i * (card.offsetWidth + CARD_GAP), behavior: "smooth" })
  }

  const layer = (i: number): React.CSSProperties => ({
    position: "absolute", inset: 0,
    opacity: idx === i ? 1 : 0,
    transform: idx === i ? "scale(1)" : "scale(1.04)",
    transition: "opacity 0.6s ease, transform 0.9s ease",
    pointerEvents: idx === i ? "auto" : "none",
  })

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      {/* ── Visual — changes with the card ─────────────────────────────────── */}
      <div style={{ position: "relative", flex: "1 1 0", minHeight: 0, overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

        {/* 0 · Intro — two photos stacked top and bottom, labelled Live / Mixed Reality */}
        <div style={layer(0)} aria-hidden={idx !== 0}>
          {/* two photos fill the whole top, edge to edge, with no gap between them */}
          {[
            { src: SRC.aerial, alt: "Moovar Kovil — aerial view",       top: "0%",  label: "Live",          live: true  },
            { src: SRC.models, alt: "HoloLens 2 demo at Moovar Kovil",  top: "50%", label: "Mixed Reality", live: false },
          ].map(ph => (
            <div key={ph.label} style={{ position: "absolute", left: 0, right: 0, top: ph.top, height: "50%", overflow: "hidden" }}>
              <Image src={ph.src} alt={ph.alt} fill sizes="100vw" style={{ objectFit: "cover" }} priority />
              <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,7,15,0.5) 0%, rgba(7,7,15,0) 40%)" }} />
              <span style={{
                position: "absolute", left: 14, top: ph.live ? "calc(14px + env(safe-area-inset-top, 0px))" : 14, display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 999, background: "rgba(7,7,15,0.62)", border: "1px solid rgba(34,229,240,0.45)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff",
              }}>
                {ph.live
                  ? <i aria-hidden className="kv-live" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22e5f0", display: "inline-block" }} />
                  : <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#22e5f0" strokeWidth="1.5" aria-hidden><rect x="0.75" y="1.5" width="12.5" height="6" rx="2.5" /><path d="M4 9h6" strokeLinecap="round" /></svg>}
                {ph.label}
              </span>
            </div>
          ))}
          <style>{`@keyframes kv-livepulse { 0% { box-shadow: 0 0 0 0 rgba(34,229,240,.6) } 100% { box-shadow: 0 0 0 9px rgba(34,229,240,0) } } .kv-live { animation: kv-livepulse 1.6s ease-out infinite } @media (prefers-reduced-motion: reduce) { .kv-live { animation: none } }`}</style>
        </div>

        {/* 1 · The scan — opens the 3D explorer */}
        <div style={layer(1)} aria-hidden={idx !== 1}>
          <Image src={SRC.scan} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,7,15,0.55) 0%, rgba(7,7,15,0) 30%, rgba(7,7,15,0.75) 100%)" }} />
          <Link href="/kovil-lens" onClick={openExplorer} aria-label="Open the 3D explorer" style={{ position: "absolute", inset: 0, textDecoration: "none" }}>
            <span style={{ position: "absolute", left: 14, top: "calc(12px + env(safe-area-inset-top, 0px))", ...chip, color: "#22e5f0" }}>Live 3D</span>
            <span style={{ position: "absolute", right: 14, bottom: 14, ...chip, color: "#04141a", background: "#22e5f0", borderColor: "#22e5f0" }}>Tap to explore ↗</span>
          </Link>
        </div>

        {/* 2 · The headset */}
        <div style={layer(2)} aria-hidden={idx !== 2}>
          <Image src={SRC.hologram} alt="KovilLens — life-size hologram at Moovar Kovil" fill sizes="100vw" style={{ objectFit: "cover" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,7,15,0.45) 0%, rgba(7,7,15,0) 30%, rgba(7,7,15,0.82) 100%)" }} />
          <span style={{ position: "absolute", left: 14, top: "calc(12px + env(safe-area-inset-top, 0px))", ...chip, color: "#22e5f0" }}>Through the headset</span>
          <div style={{ position: "absolute", left: 16, bottom: 14 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 44, fontWeight: 700, lineHeight: 1, color: "#22e5f0", letterSpacing: "-0.03em", textShadow: "0 2px 18px rgba(0,0,0,0.7)" }}>15→60</span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>fps on HoloLens 2</span>
          </div>
        </div>

        {/* 3 · The paper */}
        <div style={layer(3)} aria-hidden={idx !== 3}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(23,26,58,0.35) 0%, rgba(7,7,15,0.15) 75%)" }} />
          <div style={{
            position: "absolute", left: "50%", top: "50%", width: "46%", aspectRatio: "3 / 4", transform: "translate(-50%, -52%) rotate(-3deg)",
            background: "#eef0f7", borderRadius: 3, padding: "6% 6%", boxShadow: "0 24px 48px -12px #000",
          }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: "#3b4166", textTransform: "uppercase" }}>IEEE · ICVR 2025</div>
            {[86, 62, 100, 100, 94, 100, 78, 100, 90, 56].map((w, k) => (
              <div key={k} style={{ height: k < 2 ? 9 : 5, width: `${w}%`, marginTop: k < 2 ? 7 : 6, borderRadius: 3, background: k < 2 ? "#12142a" : "#c9cde0" }} />
            ))}
            <span style={{
              position: "absolute", right: -10, bottom: "10%", transform: "rotate(8deg)", border: "2px solid #0f9d6e", color: "#0f9d6e",
              background: "#eef0f7", padding: "2px 8px", fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            }}>PUBLISHED</span>
          </div>
        </div>

        {/* 4 · In the field */}
        <div style={layer(4)} aria-hidden={idx !== 4}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(20,24,58,0.35) 0%, rgba(7,7,15,0.15) 75%)" }} />
          {[
            { src: SRC.aerial,   l: "6%",  t: "14%", w: "56%", r: -6, i: 0 },
            { src: SRC.analysis, l: "36%", t: "30%", w: "56%", r: 4,  i: 3 },
            { src: SRC.tooltips, l: "12%", t: "54%", w: "52%", r: -2, i: 7 },
          ].map(p => (
            <button key={p.i} onClick={() => onPhoto(p.i)} aria-label={`${IMAGES[p.i].alt} — enlarge`}
              style={{ all: "unset", cursor: "zoom-in", position: "absolute", left: p.l, top: p.t, width: p.w, aspectRatio: "16 / 10",
                transform: `rotate(${p.r}deg)`, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 22px 44px -14px #000" }}>
              <Image src={IMAGES[p.i].src} alt="" fill sizes="56vw" style={{ objectFit: "cover" }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Chapter cards ──────────────────────────────────────────────────── */}
      <div style={{ position: "relative", flexShrink: 0, paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))" }}>
        <div
          ref={rowRef}
          onScroll={() => { if (!moved && (rowRef.current?.scrollLeft ?? 0) > 8) setMoved(true); onScroll() }}
          style={{
            display: "flex", gap: CARD_GAP, overflowX: "auto", scrollSnapType: "x mandatory",
            padding: "14px 16px 0", scrollPaddingLeft: 16, touchAction: "pan-x pan-y", scrollbarWidth: "none",
          }}
        >
          {/* 1 · Intro */}
          <Card n={1} kicker="Final-year research" hint={true} showHint={!moved && idx === 0}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, lineHeight: 1, margin: 0, color: "#fff" }}>
              Kovil<span style={{ color: "rgba(255,255,255,0.4)" }}>Lens</span>
            </h2>
            <p style={body}>{DESCRIPTION}</p>
            <Chips items={STACK} />
          </Card>

          {/* 2 · The scan */}
          <Card n={2} kicker="The scan" hint={false} showHint={!moved && idx === 0}>
            <h3 style={title}>Explore the temple in 3D</h3>
            <p style={body}>Rotate, zoom and see it the way the headset does — in its own full screen.</p>
            <Link href="/kovil-lens" onClick={openExplorer} style={{ ...btn, background: "#22e5f0", color: "#04141a" }}>Open 3D explorer →</Link>
          </Card>

          {/* 3 · The headset */}
          <Card n={3} kicker="The headset" hint={false} showHint={!moved && idx === 0}>
            <h3 style={title}>Seen through HoloLens 2</h3>
            <p style={body}>Research Assistant · Feb – May 2023. Optimised from ~15 fps to a steady 60 fps.</p>
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" onClick={trackDemo} style={{ ...btn, background: "#FBBF24", color: "#07070f" }}>
              <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor" aria-hidden><path d="M0 0l9 5-9 5z" /></svg>
              Watch the real demo
            </a>
          </Card>

          {/* 4 · The paper */}
          <Card n={4} kicker="The paper" hint={false} showHint={!moved && idx === 0}>
            <h3 style={title}>Published at IEEE ICVR 2025</h3>
            <p style={body}>Peer-reviewed, Wageningen NL — indexed on IEEE Xplore &amp; Scopus. Journal version in preparation.</p>
            <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: "transparent", color: "#22e5f0", border: "1px solid rgba(34,229,240,0.5)" }}>
              DOI {DOI.slice(0, 18)}… ↗
            </a>
          </Card>

          {/* 5 · In the field */}
          <Card n={5} kicker="In the field" hint={false} showHint={!moved && idx === 0}>
            <h3 style={title}>From the site</h3>
            <p style={body}>{IMAGES.length} photos from Moovar Kovil — on location and in the headset.</p>
            <button onClick={() => onPhoto(0)} style={{ ...btn, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>View photos</button>
          </Card>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingTop: 12 }}>
          {Array.from({ length: CHAPTERS }, (_, i) => (
            <button
              key={i} onClick={() => goTo(i)} aria-label={`Chapter ${i + 1}`} aria-current={i === idx ? "true" : undefined}
              style={{ all: "unset", cursor: "pointer", padding: "10px 3px" }}
            >
              <span style={{ display: "block", height: 6, width: i === idx ? 20 : 6, borderRadius: 3, background: i === idx ? "#22e5f0" : "rgba(255,255,255,0.22)", transition: "all 0.3s" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const title: React.CSSProperties = { fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, lineHeight: 1.15, margin: 0, color: "#fff" }
const body:  React.CSSProperties = { fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.75)", margin: 0 }

function Card({ n, kicker: k, hint, showHint, children }: { n: number; kicker: string; hint: boolean; showHint: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative", flex: "none", width: "84%", scrollSnapAlign: "start", minHeight: 178,
      background: "#0d0f22",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={kicker}>{String(n).padStart(2, "0")} · {k}</span>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>{n}/{CHAPTERS}</span>
      </div>
      {children}
      {hint && showHint && (
        <span aria-hidden style={{ position: "absolute", right: 14, bottom: 12, fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#22e5f0", animation: "kv-nudge 1.4s ease-in-out infinite" }}>
          swipe →
        </span>
      )}
      <style>{`@keyframes kv-nudge { 0%,100% { transform: translateX(0); opacity: .6 } 50% { transform: translateX(6px); opacity: 1 } } @media (prefers-reduced-motion: reduce) { [style*="kv-nudge"] { animation: none !important } }`}</style>
    </div>
  )
}

function Chips({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto" }}>
      {items.map(t => (
        <span key={t} style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.14)", padding: "2px 8px", borderRadius: 4 }}>{t}</span>
      ))}
    </div>
  )
}

export const KovilChapters = memo(KovilChaptersImpl)
