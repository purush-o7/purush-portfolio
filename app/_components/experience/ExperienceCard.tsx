"use client"

import { type ExperienceEntry } from "./data"

interface Props {
  entry: ExperienceEntry
  index: number
  total: number
}

export function ExperienceCard({ entry, index, total }: Props) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex",
      background: "#07070f",
    }}>
      {/* Accent left bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${entry.accent} 0%, transparent 100%)`,
        zIndex: 1,
      }} />

      {/* Right-edge shadow — hints at the card underneath */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 60,
        background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.45))",
        zIndex: 1, pointerEvents: "none",
      }} />

      {/* ── Left panel — identity (42%) ─────────────────────────── */}
      <div style={{
        width: "42%", flexShrink: 0,
        padding: "56px 56px",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 20,
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Counter */}
        <span style={{
          fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.2)",
        }}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>

        {/* Tag */}
        <span style={{
          fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em",
          textTransform: "uppercase", color: entry.accent, opacity: 0.9,
        }}>
          {entry.tag}
        </span>

        {/* Role + org */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: 0 }}>
            {entry.role}
          </h2>
          <p style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            {entry.org}
          </p>
          {entry.location && (
            <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              {entry.location}
            </p>
          )}
          <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.28)", margin: 0 }}>
            {entry.period} · {entry.duration}
          </p>
        </div>

        {/* Tech chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {entry.tech.map((t, i) => (
            <span key={i} style={{
              fontFamily: "monospace", fontSize: 9, padding: "3px 10px",
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

      {/* ── Right panel — content (58%) ─────────────────────────── */}
      <div style={{
        flex: 1, padding: "56px 60px 56px 52px",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 28,
      }}>
        {/* Bullets */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {entry.bullets.map((b, i) => (
            <li key={i} style={{
              fontFamily: "monospace", fontSize: 13,
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
          <div style={{ display: "flex", gap: 12 }}>
            {entry.metrics.map((m, i) => (
              <div key={i} style={{
                textAlign: "center",
                background: `color-mix(in srgb, ${entry.accent} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${entry.accent} 35%, transparent)`,
                borderRadius: 10, padding: "12px 28px",
              }}>
                <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 700, color: entry.accent }}>
                  {m.value}
                </div>
                <div style={{
                  fontFamily: "monospace", fontSize: 8, letterSpacing: "0.18em",
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
