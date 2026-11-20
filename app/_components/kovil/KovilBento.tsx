"use client"

import { memo } from "react"

import Image                 from "next/image"
import Link                  from "next/link"
import { useState }          from "react"
import { AmoebaBg }          from "../skills/AmoebaBg"
import {
  MONO, IMAGES, SRC, STACK, DESCRIPTION, DEMO_URL, PAPER_URL, DOI, openExplorer, trackDemo,
} from "./data"

const EDGE   = "1px solid rgba(255,255,255,0.1)"

// Real points from the Research Assistant role (experience/data.ts); **…** is emphasised.
const HIGHLIGHTS: string[][] = [
  "Took the HoloLens 2 app from **~15 fps to a stable 60 fps** with scene optimisation and baked lighting".split("**"),
  "Learned **Unity, C# and MRTK** from scratch for 3D spatial mapping".split("**"),
  "Researched the temple's **history and architecture** to design the experience".split("**"),
  "Contributed to a **peer-reviewed paper** at **ICVR 2025**".split("**"),
]

const tile: React.CSSProperties = {
  position: "relative", overflow: "hidden", minWidth: 0, minHeight: 0,
  background: "#0b0d1f", border: EDGE, borderRadius: 14,
  transition: "border-color 0.25s, transform 0.25s",
  textDecoration: "none", color: "inherit",
}

const label: React.CSSProperties = {
  fontFamily: MONO, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase",
}

function hover(on: boolean) {
  return (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = on ? "rgba(34,229,240,0.55)" : "rgba(255,255,255,0.1)"
    e.currentTarget.style.transform   = on ? "translateY(-2px)" : "none"
  }
}

/**
 * Laptop layout — project bento. Everything about KovilLens at a glance; the live
 * 3D opens on its own full-space page via the Explore tile.
 */
function KovilBentoImpl({ onPhoto }: { onPhoto: (i: number) => void }) {
  const [paused, setPaused] = useState(false)

  return (
    <div style={{
      position: "absolute", inset: 0, padding: "24px 28px",
      display: "flex", flexDirection: "column",
    }}>
      {/* Cursor-following amoeba background — shared with the Skills section */}
      <AmoebaBg />

      {/* ── Bento ──────────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", flex: 1, minHeight: 0, display: "grid", gap: 12,
        gridTemplateColumns: "1.55fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 0.8fr",
        gridTemplateAreas: `"explore paper metric" "explore demo metric" "gallery gallery stack"`,
      }}>

        {/* Explore — opens the full-space 3D page */}
        <Link
          href="/kovil-lens"
          onClick={openExplorer}
          onMouseEnter={hover(true)} onMouseLeave={hover(false)}
          aria-label="Explore the temple in 3D — opens full screen"
          style={{ ...tile, gridArea: "explore", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 22 }}
        >
          <Image src={SRC.scan} alt="" fill sizes="45vw" style={{ objectFit: "cover" }} priority />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,7,15,0.72) 0%, rgba(7,7,15,0.25) 38%, rgba(7,7,15,0.9) 100%)" }} />
          <span style={{ position: "absolute", top: 16, right: 16, ...label, fontSize: 11, color: "#04141a", background: "#22e5f0", padding: "5px 10px", borderRadius: 4 }}>
            Open ↗
          </span>
          {/* Title + context as an overlay on the photo */}
          <div style={{ position: "absolute", left: 24, top: 22, right: 110, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ ...label, color: "rgba(255,255,255,0.7)", margin: 0, textShadow: "0 1px 10px #000" }}>Final year research · IEEE published</p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 56, fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.02em", margin: 0, color: "#fff", textShadow: "0 2px 18px rgba(0,0,0,0.7)" }}>
              Kovil<span style={{ color: "rgba(255,255,255,0.55)" }}>Lens</span>
            </h2>
            <p style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.65, color: "rgba(255,255,255,0.8)", margin: 0, maxWidth: 440, textShadow: "0 1px 10px #000" }}>{DESCRIPTION}</p>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.6)", margin: 0, textShadow: "0 1px 8px #000" }}>Research Assistant · Feb – May 2023</p>
          </div>
          <span style={{ ...label, color: "#22e5f0", position: "relative" }}>Live 3D</span>
          <span style={{ position: "relative", fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, color: "#fff", margin: "6px 0 4px" }}>
            Explore the temple
          </span>
          <span style={{ position: "relative", fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            Full screen · drag to rotate · scroll to zoom · headset view
          </span>
        </Link>

        {/* Metric + what was done — the tall tile */}
        <div style={{ ...tile, gridArea: "metric", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 64, fontWeight: 700, lineHeight: 1, color: "#22e5f0", letterSpacing: "-0.03em" }}>15→60</span>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "rgba(255,255,255,0.72)", margin: "8px 0 0" }}>fps on HoloLens 2</p>
          </div>
          <div aria-hidden style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ ...label, color: "rgba(255,255,255,0.4)" }}>What I did</span>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
            {HIGHLIGHTS.map((h, i) => (
              <li key={i} style={{ position: "relative", paddingLeft: 22, fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.82)" }}>
                <span aria-hidden style={{ position: "absolute", left: 0, top: "0.7em", width: 10, height: 2, borderRadius: 1, background: "#22e5f0" }} />
                {h.map((part, k) => k % 2 === 1
                  ? <b key={k} style={{ color: "#22e5f0", fontWeight: 600 }}>{part}</b>
                  : part)}
              </li>
            ))}
          </ul>
          <span style={{ marginTop: "auto", fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Research Assistant · Feb – May 2023</span>
        </div>

        {/* Paper */}
        <div style={{ ...tile, gridArea: "paper", padding: 20, display: "flex", flexDirection: "column", gap: 8, justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ ...label, alignSelf: "flex-start", color: "#6ee7b7", background: "rgba(52,211,153,0.14)", border: "1px solid rgba(52,211,153,0.5)", padding: "3px 9px", borderRadius: 4 }}>
              ✓ Published
            </span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, lineHeight: 1.05, color: "#fff" }}>IEEE ICVR 2025</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Wageningen, NL</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.68)" }}>
              Peer-reviewed conference paper, indexed on <b style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>IEEE Xplore</b> &amp; <b style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Scopus</b>.
            </span>
            <a href={PAPER_URL} target="_blank" rel="noopener noreferrer"
               style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "#22e5f0", textDecoration: "none", wordBreak: "break-all" }}>
              DOI {DOI} ↗
            </a>
          </div>
          <div style={{ borderLeft: "2px solid rgba(251,191,36,0.35)", paddingLeft: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ ...label, fontSize: 11, color: "rgba(251,191,36,0.85)" }}>Yet to submit</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Journal — extended version, in preparation</span>
          </div>
        </div>

        {/* Demo video */}
        <a
          href={DEMO_URL} target="_blank" rel="noopener noreferrer" onClick={trackDemo}
          onMouseEnter={hover(true)} onMouseLeave={hover(false)}
          style={{ ...tile, gridArea: "demo", display: "flex", alignItems: "flex-end", padding: 16 }}
        >
          <Image src={SRC.hologram} alt="" fill sizes="25vw" style={{ objectFit: "cover" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,7,15,0.05) 35%, rgba(7,7,15,0.85))" }} />
          <span style={{
            position: "relative", display: "inline-flex", alignItems: "center", gap: 8,
            ...label, fontSize: 11, fontWeight: 600, color: "#07070f", background: "#FBBF24", padding: "8px 12px", borderRadius: 4,
          }}>
            <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor" aria-hidden><path d="M0 0l9 5-9 5z" /></svg>
            Watch the real demo
          </span>
        </a>

        {/* Gallery strip */}
        <div
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          style={{ ...tile, gridArea: "gallery", padding: 0 }}
        >
          <style>{`
            @keyframes kv-marquee { to { transform: translateX(-50%); } }
            @media (prefers-reduced-motion: reduce) { .kv-track { animation: none !important; } }
          `}</style>
          <div
            className="kv-track"
            style={{
              position: "absolute", left: 0, top: 10, bottom: 10, display: "flex", gap: 10, width: "max-content",
              animation: "kv-marquee 80s linear infinite", animationPlayState: paused ? "paused" : "running",
            }}
          >
            {[...IMAGES, ...IMAGES].map((img, i) => (
              <button
                key={i}
                onClick={() => onPhoto(i % IMAGES.length)}
                aria-label={`${img.alt} — enlarge`}
                style={{ all: "unset", cursor: "zoom-in", position: "relative", height: "100%", aspectRatio: "16 / 9", borderRadius: 10, overflow: "hidden", flexShrink: 0 }}
              >
                <Image src={img.src} alt="" fill sizes="240px" style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
          <span style={{ position: "absolute", left: 14, bottom: 12, ...label, fontSize: 11, color: "#fff", background: "rgba(7,7,15,0.75)", padding: "4px 10px", borderRadius: 4, pointerEvents: "none" }}>
            {IMAGES.length} photos from site · click to enlarge
          </span>
        </div>

        {/* Stack */}
        <div style={{ ...tile, gridArea: "stack", padding: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10 }}>
          <span style={{ ...label, color: "rgba(255,255,255,0.4)" }}>Built with</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STACK.map(t => (
              <span key={t} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.14)", padding: "3px 9px", borderRadius: 4 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const KovilBento = memo(KovilBentoImpl)
