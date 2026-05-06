"use client"

import { type ExperienceEntry } from "./data"

interface Props {
  entry:    ExperienceEntry
  index:    number
  total:    number
  isMobile: boolean
}

const MONO = "var(--font-geist-mono)"

export function ExperienceCard({ entry, index, total, isMobile }: Props) {
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

        {/* Gradient base */}
        <div style={{
          position:   "absolute", inset: 0,
          background: `radial-gradient(ellipse 200% 90% at 0% 50%, ${entry.accent}cc 0%, ${entry.accent}33 55%, transparent 75%)`,
          pointerEvents: "none",
        }} />

        {/* Content card */}
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

          {/* Counter */}
          <span style={{
            fontFamily: MONO, fontSize: isMobile ? 10 : 11,
            letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)",
          }}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>

          {/* Tag */}
          <span style={{
            fontFamily: MONO, fontSize: isMobile ? 10 : 11,
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: entry.accent, opacity: 0.9,
          }}>
            {entry.tag}
          </span>

          {/* Role + org */}
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 5 : 8 }}>
            <h2 style={{
              fontSize: isMobile ? 22 : 38, fontWeight: 800,
              color: "#fff", lineHeight: 1.1, margin: 0,
            }}>
              {entry.role}
            </h2>
            <p style={{
              fontFamily: MONO, fontSize: isMobile ? 12 : 14,
              color: "rgba(255,255,255,0.5)", margin: 0,
            }}>
              {entry.org}
            </p>
            {entry.location && (
              <p style={{
                fontFamily: MONO, fontSize: isMobile ? 10 : 12,
                color: "rgba(255,255,255,0.3)", margin: 0,
              }}>
                {entry.location}
              </p>
            )}
            <p style={{
              fontFamily: MONO, fontSize: isMobile ? 10 : 12,
              color: "rgba(255,255,255,0.28)", margin: 0,
            }}>
              {entry.period} · {entry.duration}
            </p>
          </div>

          {/* Tech chips */}
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
      <div style={{
        flex:          1,
        minWidth:      isMobile ? 0 : "50vw",
        padding:       isMobile ? "14px 16px 16px 20px" : "56px 60px 56px 52px",
        display:       "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap:           isMobile ? 16 : 30,
        overflow:      "hidden",
      }}>

        {/* Bullets */}
        <ul style={{
          listStyle: "none", padding: 0, margin: 0,
          display: "flex", flexDirection: "column", gap: isMobile ? 12 : 18,
        }}>
          {entry.bullets.map((b, i) => (
            <li key={i} style={{
              fontFamily: MONO, fontSize: isMobile ? 12 : 14,
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
                borderRadius: 10, padding: isMobile ? "8px 18px" : "12px 28px",
              }}>
                <div style={{
                  fontFamily: MONO, fontSize: isMobile ? 20 : 26,
                  fontWeight: 700, color: entry.accent,
                }}>
                  {m.value}
                </div>
                <div style={{
                  fontFamily: MONO, fontSize: 10,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)", marginTop: 4,
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
