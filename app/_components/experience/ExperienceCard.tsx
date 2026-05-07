"use client"

import { useEffect, useRef, useState } from "react"
import { type ExperienceEntry }        from "./data"

interface Props {
  entry:    ExperienceEntry
  index:    number
  total:    number
  isMobile: boolean
}

const MONO = "var(--font-geist-mono)"

function hl(text: string, accent: string) {
  const parts = text.split(/\*\*(.+?)\*\*/)
  return parts.map((p, i) =>
    i % 2 === 1
      ? <span key={i} style={{ color: accent, opacity: 0.9, fontWeight: 600 }}>{p}</span>
      : p
  )
}

export function ExperienceCard({ entry, index, total, isMobile }: Props) {
  const scrollRef         = useRef<HTMLDivElement>(null)
  const [showFade, setShowFade] = useState(false)

  function checkFade() {
    const el = scrollRef.current
    if (!el) return
    const hasOverflow = el.scrollHeight > el.clientHeight + 5
    const atBottom    = el.scrollTop + el.clientHeight >= el.scrollHeight - 10
    setShowFade(hasOverflow && !atBottom)
  }

  useEffect(() => {
    checkFade()
    const ro = new ResizeObserver(checkFade)
    if (scrollRef.current) ro.observe(scrollRef.current)
    return () => ro.disconnect()
  }, [])

  // Inject bounce keyframe once
  useEffect(() => {
    const el = document.createElement("style")
    el.textContent = `@keyframes exp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }`
    document.head.appendChild(el)
    return () => { document.head.removeChild(el) }
  }, [])

  const pad = isMobile ? "14px 16px 16px 20px" : "56px 60px 56px 52px"

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      background: "#07070f",
    }}>

      {/* ── Identity panel ──────────────────────────────────────────────────── */}
      <div style={{
        width:      isMobile ? "100%" : "42%",
        height:     isMobile ? "40%" : "100%",
        minWidth:   isMobile ? 0 : "42vw",
        flexShrink: 0,
        position:   "relative",
        padding:    isMobile ? "8px 0 0 8px" : "8px 0 8px 8px",
        borderRight:  isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
        borderBottom: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 200% 90% at 0% 50%, ${entry.accent}cc 0%, ${entry.accent}33 55%, transparent 75%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position:      "relative",
          height:        "100%",
          background:    "#07070f",
          borderRadius:  isMobile ? "6px 6px 0 0" : "6px 0 0 6px",
          padding:       isMobile ? "16px 16px 12px 20px" : "56px 56px",
          display:       "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap:           isMobile ? 10 : 22,
          overflow:      "hidden",
        }}>
          <span style={{ fontFamily: MONO, fontSize: isMobile ? 10 : 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)" }}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span style={{ fontFamily: MONO, fontSize: isMobile ? 10 : 11, letterSpacing: "0.3em", textTransform: "uppercase", color: entry.accent, opacity: 0.9 }}>
            {entry.tag}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 5 : 8 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: isMobile ? 22 : 38, fontWeight: 700, color: "#fff", lineHeight: 1.1, margin: 0, letterSpacing: "-0.01em" }}>
              {entry.role}
            </h2>
            <p style={{ fontFamily: MONO, fontSize: isMobile ? 12 : 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              {entry.org}
            </p>
            {entry.location && (
              <p style={{ fontFamily: MONO, fontSize: isMobile ? 10 : 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                {entry.location}
              </p>
            )}
            <p style={{ fontFamily: MONO, fontSize: isMobile ? 10 : 12, color: "rgba(255,255,255,0.28)", margin: 0 }}>
              {entry.period} · {entry.duration}
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {entry.tech.map((t, i) => (
              <span key={i} style={{
                fontFamily: MONO, fontSize: isMobile ? 10 : 11,
                padding: isMobile ? "2px 8px" : "3px 10px",
                borderRadius: 4, letterSpacing: "0.1em",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.38)",
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content panel ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: isMobile ? 0 : "50vw", position: "relative", overflow: "hidden" }}>

        {/* Scrollable inner — centred when short, scrolls when tall */}
        <div
          ref={scrollRef}
          data-scroll-passthrough
          onScroll={checkFade}
          style={{
            position:  "absolute", inset: 0,
            overflowY: "auto",
          }}
        >
          <div style={{
            minHeight:     "100%",
            display:       "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding:       pad,
            gap:           isMobile ? 10 : 30,
          }}>

            {/* Categorised sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 24 }}>
              {entry.sections.map((sec, si) => (
                <div key={si}>
                  <p style={{
                    fontFamily: MONO, fontSize: isMobile ? 8 : 10,
                    letterSpacing: "0.28em", textTransform: "uppercase",
                    color: entry.accent, opacity: 0.8,
                    margin: `0 0 ${isMobile ? 4 : 8}px`,
                  }}>
                    {sec.heading}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: isMobile ? 4 : 9 }}>
                    {sec.points.map((pt, pi) => (
                      <li key={pi} style={{
                        fontFamily: MONO, fontSize: isMobile ? 10 : 13,
                        color: "rgba(255,255,255,0.55)", lineHeight: isMobile ? 1.5 : 1.7,
                        paddingLeft: 18, position: "relative",
                      }}>
                        <span style={{ position: "absolute", left: 0, color: entry.accent, opacity: 0.6 }}>›</span>
                        {hl(pt, entry.accent)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Metrics */}
            {entry.metrics && (
              <div style={{ display: "flex", gap: isMobile ? 8 : 12, flexWrap: "wrap" }}>
                {entry.metrics.map((m, i) => (
                  <div key={i} style={{
                    textAlign: "center",
                    background: `color-mix(in srgb, ${entry.accent} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${entry.accent} 35%, transparent)`,
                    borderRadius: 10, padding: isMobile ? "8px 18px" : "12px 28px",
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: isMobile ? 20 : 26, fontWeight: 700, color: entry.accent }}>
                      {m.value}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Links */}
            {entry.links && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 8 : 10 }}>
                {entry.links.map((lk, i) => (
                  <a key={i} href={lk.url} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: MONO, fontSize: isMobile ? 10 : 11,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: entry.accent,
                    border: `1px solid ${entry.accent}55`,
                    background: `${entry.accent}0d`,
                    padding: isMobile ? "4px 12px" : "5px 16px",
                    borderRadius: 4, textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}>
                    {lk.label} ↗
                  </a>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Fade mask + scroll hint — visible only when content overflows and not at bottom */}
        <div style={{
          position:   "absolute", bottom: 0, left: 0, right: 0,
          height:     isMobile ? 64 : 88,
          background: `linear-gradient(to bottom, transparent, #07070f)`,
          pointerEvents: "none",
          display:    "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: isMobile ? 8 : 14,
          opacity:    showFade ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          <span style={{
            fontFamily: MONO, fontSize: isMobile ? 10 : 12,
            color: entry.accent, opacity: 0.55,
            animation: "exp-bounce 1.4s ease-in-out infinite",
            letterSpacing: "0.1em",
          }}>
            ↓
          </span>
        </div>

      </div>
    </div>
  )
}
