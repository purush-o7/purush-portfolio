"use client"

import { useMobile } from "../../_hooks/use-mobile"

// ── Horizontal zigzag ─────────────────────────────────────────────────────────
const N_H = 10, V_H = 24

function hFillPoints() {
  const pts = Array.from({ length: N_H * 2 + 1 }, (_, i) => {
    const x = ((i / (N_H * 2)) * 100).toFixed(4)
    return `${x},${i % 2 === 0 ? 0 : V_H}`
  })
  return [...pts, "100,9999", "0,9999"].join(" ")
}
function hStrokePoints() {
  return Array.from({ length: N_H * 2 + 1 }, (_, i) => {
    const x = ((i / (N_H * 2)) * 100).toFixed(4)
    return `${x},${i % 2 === 0 ? 0 : V_H}`
  }).join(" ")
}

// ── Data ──────────────────────────────────────────────────────────────────────
const EVENTS = [
  { year: "2020", accent: "#3B82F6", title: "B.Tech begins",      sub: "Amrita · Computer Science" },
  { year: "2022", accent: "#3B82F6", title: "Cloud Intern",        sub: "FutureSkills Prime · Azure ML" },
  { year: "2023", accent: "#8B5CF6", title: "Research Intern",     sub: "KovilLens · HoloLens 2" },
  { year: "2023", accent: "#10B981", title: "SWE Intern",          sub: "Amrita ICTS · Healthcare AI" },
  { year: "2024", accent: "#F59E0B", title: "Teaching Assistant",  sub: "Amrita · Python & DSA" },
  { year: "2024", accent: "#00FFFF", title: "Associate SWE",       sub: "MaTrack Inc." },
  { year: "2025", accent: "#8B5CF6", title: "IEEE Published",      sub: "ICVR 2025 · Wageningen" },
]

// ── Component ─────────────────────────────────────────────────────────────────
export function CareerTimeline() {
  const isMobile = useMobile()

  if (!isMobile) {
    /* ── Desktop: right 40% panel, full height ── */
    /* Zigzag border is rendered by EducationSection on its right edge — no duplicate here */
    return (
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: "auto", width: "40%", zIndex: 10, overflow: "hidden", background: "#07070f" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 48px", gap: 0, overflow: "hidden" }}>
          <Content isMobile={false} />
        </div>
      </div>
    )
  }

  /* ── Mobile: inset:0 outer, content pinned to bottom 50% ── */
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10, overflow: "hidden" }}>

      {/* Top 50% — transparent, campus art shows through */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%" }}>
        {/* Horizontal zigzag at the boundary */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: V_H, pointerEvents: "none" }}>
          <svg viewBox={`0 0 100 ${V_H}`} preserveAspectRatio="none"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
            <polygon  points={hFillPoints()}  fill="#07070f" />
            <polyline points={hStrokePoints()} stroke="rgba(255,255,255,0.20)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>

      {/* Bottom 50% — opaque panel with timeline content */}
      <div style={{
        position: "absolute", top: "50%", left: 0, right: 0, bottom: 0,
        background: "#07070f",
        display: "flex", flexDirection: "column",
        padding: "12px 20px 16px", gap: 0, overflow: "hidden",
      }}>
        <Content isMobile={true} />
      </div>
    </div>
  )
}

// ── Shared content ────────────────────────────────────────────────────────────
function Content({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <p style={{
        fontFamily: "monospace", fontSize: 10, letterSpacing: "0.3em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
        margin: 0, marginBottom: isMobile ? 10 : 24,
      }}>
        Career · Timeline
      </p>

      {EVENTS.map((e, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>

          {/* Spine */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14, flexShrink: 0 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: e.accent,
              flexShrink: 0, marginTop: 3, boxShadow: `0 0 7px ${e.accent}99`,
            }} />
            {i < EVENTS.length - 1 && (
              <div style={{
                width: 1, minHeight: isMobile ? 14 : 20, flex: 1,
                background: `linear-gradient(to bottom, ${e.accent}55, ${EVENTS[i + 1].accent}33)`,
              }} />
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: i < EVENTS.length - 1 ? (isMobile ? 6 : 12) : 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "monospace", fontSize: 9, color: e.accent, opacity: 0.85, flexShrink: 0 }}>
                {e.year}
              </span>
              <span style={{
                fontFamily: "monospace", fontSize: isMobile ? 11 : 13, fontWeight: 600,
                color: "rgba(255,255,255,0.85)", flex: 1, minWidth: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {e.title}
              </span>
            </div>
            <p style={{
              fontFamily: "monospace", fontSize: 9,
              color: "rgba(255,255,255,0.38)", margin: "2px 0 0", lineHeight: 1.4,
            }}>
              {e.sub}
            </p>
          </div>

        </div>
      ))}
    </>
  )
}
