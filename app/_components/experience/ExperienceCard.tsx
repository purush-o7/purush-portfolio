"use client"

import { type ExperienceEntry } from "./data"

interface Props {
  entry:    ExperienceEntry
  index:    number
  total:    number
  isMobile: boolean
}

export function ExperienceCard({ entry, index, total, isMobile }: Props) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      background: "#07070f",
    }}>
      {/* Left accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        width: 5, background: entry.accent,
        zIndex: 2, pointerEvents: "none",
      }} />
      {/* Top bar — fades right so no hard cut when next card slides in */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 5,
        background: `linear-gradient(90deg, ${entry.accent} 0%, ${entry.accent}00 40%)`,
        zIndex: 2, pointerEvents: "none",
      }} />
      {/* Bottom bar — same */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 5,
        background: `linear-gradient(90deg, ${entry.accent} 0%, ${entry.accent}00 40%)`,
        zIndex: 2, pointerEvents: "none",
      }} />


      {/* ── Identity panel — top 40% on mobile, left 42% on desktop ──────── */}
      <div style={{
        width:        isMobile ? "100%" : "42%",
        height:       isMobile ? "40%" : "auto",
        minWidth:     isMobile ? 0 : "42vw",
        flexShrink:   0,
        padding:      isMobile ? "16px 16px 12px 20px" : "56px 56px",
        display:      "flex",
        flexDirection: "column",
        justifyContent: isMobile ? "center" : "center",
        gap:          isMobile ? 8 : 20,
        borderRight:  isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
        borderBottom: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
        whiteSpace:   "normal",
        overflow:     "hidden",
      }}>
        {/* Counter */}
        <span style={{
          fontFamily: "monospace", fontSize: isMobile ? 8 : 9, letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.2)",
        }}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>

        {/* Tag */}
        <span style={{
          fontFamily: "monospace", fontSize: isMobile ? 8 : 9, letterSpacing: "0.3em",
          textTransform: "uppercase", color: entry.accent, opacity: 0.9,
        }}>
          {entry.tag}
        </span>

        {/* Role + org */}
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 4 : 6 }}>
          <h2 style={{ fontSize: isMobile ? 20 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: 0 }}>
            {entry.role}
          </h2>
          <p style={{ fontFamily: "monospace", fontSize: isMobile ? 11 : 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            {entry.org}
          </p>
          {entry.location && (
            <p style={{ fontFamily: "monospace", fontSize: isMobile ? 9 : 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              {entry.location}
            </p>
          )}
          <p style={{ fontFamily: "monospace", fontSize: isMobile ? 9 : 11, color: "rgba(255,255,255,0.28)", margin: 0 }}>
            {entry.period} · {entry.duration}
          </p>
        </div>

        {/* Tech chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {entry.tech.map((t, i) => (
            <span key={i} style={{
              fontFamily: "monospace", fontSize: isMobile ? 8 : 9,
              padding: isMobile ? "2px 7px" : "3px 10px",
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

      {/* ── Content panel — bottom 60% on mobile, right 58% on desktop ──────── */}
      <div style={{
        flex:          1,
        minWidth:      isMobile ? 0 : "50vw",
        padding:       isMobile ? "14px 16px 16px 20px" : "56px 60px 56px 52px",
        display:       "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap:           isMobile ? 14 : 28,
        overflow:      "hidden",
      }}>
        {/* Bullets */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: isMobile ? 10 : 16 }}>
          {entry.bullets.map((b, i) => (
            <li key={i} style={{
              fontFamily: "monospace", fontSize: isMobile ? 11 : 13,
              color: "rgba(255,255,255,0.55)", lineHeight: 1.75,
              paddingLeft: 22, position: "relative",
            }}>
              <span style={{ position: "absolute", left: 0, color: entry.accent, opacity: 0.7 }}>›</span>
              {b}
            </li>
          ))}
        </ul>

        {/* Metrics */}
        {entry.metrics && (
          <div style={{ display: "flex", gap: isMobile ? 8 : 12, flexWrap: "wrap" }}>
            {entry.metrics.map((m, i) => (
              <div key={i} style={{
                textAlign: "center",
                background: `color-mix(in srgb, ${entry.accent} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${entry.accent} 35%, transparent)`,
                borderRadius: 10, padding: isMobile ? "8px 16px" : "12px 28px",
              }}>
                <div style={{ fontFamily: "monospace", fontSize: isMobile ? 18 : 26, fontWeight: 700, color: entry.accent }}>
                  {m.value}
                </div>
                <div style={{
                  fontFamily: "monospace", fontSize: isMobile ? 7 : 8, letterSpacing: "0.18em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 4,
                }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
