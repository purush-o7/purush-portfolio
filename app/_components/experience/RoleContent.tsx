"use client"

import { type ExperienceEntry } from "./data"

export const MONO = "var(--font-geist-mono)"

/** Renders **bold** spans from the data strings in the role's accent colour. */
export function hl(text: string, accent: string) {
  return text.split(/\*\*(.+?)\*\*/).map((p, i) =>
    i % 2 === 1
      ? <span key={i} style={{ color: accent, fontWeight: 600 }}>{p}</span>
      : p
  )
}

interface Props {
  entry:    ExperienceEntry
  compact?: boolean
}

/** Section bullets, metric tiles and links for one role. Shared by the laptop split and the phone sheet. */
export function RoleContent({ entry, compact = false }: Props) {
  const { accent } = entry
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 20 : "clamp(18px, 3.2vh, 32px)" }}>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: compact ? 14 : "clamp(12px, 2.2vh, 20px)" }}>
        {entry.highlights.map((pt, i) => (
          <li key={i} style={{
            position: "relative", paddingLeft: compact ? 22 : 28,
            fontFamily: "var(--font-sans)", fontSize: compact ? 15 : "clamp(15px, 2.15vh, 18px)", lineHeight: 1.5, letterSpacing: "-0.005em",
            color: "rgba(255,255,255,0.82)",
          }}>
            <span aria-hidden style={{
              position: "absolute", left: 0, top: compact ? "0.62em" : "0.68em", width: compact ? 10 : 14, height: 2, borderRadius: 1, background: accent,
            }} />
            {hl(pt, accent)}
          </li>
        ))}
      </ul>

      {entry.metrics && (
        <div style={{ display: "flex", gap: compact ? 8 : 12, flexWrap: "wrap" }}>
          {entry.metrics.map((m, i) => (
            <div key={i} style={{
              textAlign: "center",
              background: `color-mix(in srgb, ${accent} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accent} 35%, transparent)`,
              borderRadius: 10, padding: compact ? "8px 16px" : "12px 26px",
            }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: compact ? 22 : 30, fontWeight: 700, color: accent }}>{m.value}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {entry.links && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 8 : 10 }}>
          {entry.links.map((lk, i) => (
            <a key={i} href={lk.url} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: MONO, fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: accent, border: `1px solid ${accent}55`, background: `${accent}0d`,
              padding: compact ? "6px 12px" : "5px 16px",
              borderRadius: 4, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              {lk.label} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
