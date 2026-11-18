"use client"

import { ALL_ENTRIES }               from "./data"
import { LANES, stopStatus, type Stop } from "./stops"
import { RoleContent, MONO }         from "./RoleContent"

const SANS = "var(--font-sans)"

/** "Present" (green, live dot) for the current job, "Ended" (muted) for the rest. */
export function StatusPill({ stop }: { stop: Stop }) {
  const st = stopStatus(stop)
  if (!st) return null
  const live = st === "present"
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 12, padding: "2px 9px", borderRadius: 999,
      fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", verticalAlign: "middle",
      color: live ? "#34d399" : "rgba(255,255,255,0.5)",
      border: `1px solid ${live ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.18)"}`,
      background: live ? "rgba(52,211,153,0.08)" : "transparent",
    }}>
      {live && <i aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />}
      {live ? "Present" : "Ended"}
    </span>
  )
}

/** Progression chips, e.g. Associate SWE → Software Engineer → Team Lead. */
function Steps({ steps, color }: { steps: string[]; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
      {steps.map((s, i) => (
        <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: i === steps.length - 1 ? color : "rgba(255,255,255,0.6)" }}>
          {i > 0 && <span aria-hidden style={{ color: "rgba(255,255,255,0.3)" }}>→</span>}{s}
        </span>
      ))}
    </div>
  )
}

/** One page of the experience line — a full role (bullets, metrics, links) or a short milestone. */
export function StopPage({ stop }: { stop: Stop }) {
  const entry  = stop.entry !== undefined ? ALL_ENTRIES[stop.entry] : null
  const accent = entry?.accent ?? LANES[stop.lane].color

  return (
    <>
      <header style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, paddingBottom: "clamp(16px, 3vh, 28px)" }}>
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: accent }}>
          {entry ? `${entry.period} · ${entry.duration}` : `${LANES[stop.lane].name} · ${stop.period}`}
          <StatusPill stop={stop} />
        </span>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(34px, 5.2vh, 46px)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, letterSpacing: "-0.02em" }}>
          {entry ? entry.role : stop.title}
        </h3>
        {stop.steps && <Steps steps={stop.steps} color={accent} />}
        <p style={{ fontFamily: SANS, fontSize: 17, color: "rgba(255,255,255,0.62)", margin: 0 }}>
          {entry ? `${entry.org}${entry.location ? ` · ${entry.location}` : ""}` : stop.org}
        </p>
        {entry && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {entry.tech.slice(0, 6).map(t => (
              <span key={t} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", padding: "4px 11px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.68)" }}>{t}</span>
            ))}
          </div>
        )}
      </header>

      <div style={{ flex: "0 1 auto", minHeight: 0, overflowY: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
        {entry ? <RoleContent entry={entry} /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontFamily: SANS, fontSize: "clamp(18px, 2.6vh, 22px)", lineHeight: 1.5, color: "rgba(255,255,255,0.82)", margin: 0, maxWidth: "36ch" }}>{stop.line}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {stop.facts.map(f => (
                <span key={f} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.06em", padding: "6px 14px", borderRadius: 8, color: "#fff", background: `color-mix(in srgb, ${accent} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)` }}>{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
