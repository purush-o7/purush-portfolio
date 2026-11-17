"use client"

import { useRef, useState }   from "react"
import { navToIndex }         from "../../_hooks/scroll-nav"
import { ALL_ENTRIES }        from "./data"
import { RoleContent, MONO }  from "./RoleContent"
import { EXP_START_SNAP, startYear, useExpProgress } from "./use-exp-progress"

const N = ALL_ENTRIES.length

/**
 * Laptop layout — sticky split index.
 * Left: fixed identity + role index (click to jump). Right: a strip of role
 * pages that slides with the page snaps; each page scrolls its own content.
 */
export function ExperienceSplit() {
  const pageRefs  = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)

  useExpProgress(cp => {
    // Roles crossfade in place with a small slide — no empty stretch between them while scrolling.
    pageRefs.current.forEach((el, i) => {
      if (!el) return
      const d = i - cp
      const o = Math.max(0, Math.min(1, 1 - (Math.abs(d) - 0.12) * 2.6))   // near-complete at rest, almost no overlap mid-change
      el.style.opacity       = String(o)
      el.style.transform     = `translateY(${d * 72}px)`
      el.style.pointerEvents = o > 0.5 ? "auto" : "none"
    })
    setActive(Math.round(cp))
  })

  const accent = ALL_ENTRIES[active].accent

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", background: "#07070f" }}>

      {/* ── Left: identity + index ─────────────────────────────────────────── */}
      <aside style={{
        width: "34%", minWidth: 320, maxWidth: 480, flexShrink: 0,
        position: "relative", overflow: "hidden",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        padding: "56px 48px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {ALL_ENTRIES.map((e, i) => (
          <div key={i} aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 120% 55% at 0% 0%, ${e.accent}2e 0%, transparent 70%)`,
            opacity: i === active ? 1 : 0, transition: "opacity 0.6s ease",
          }} />
        ))}

        <div style={{ position: "relative" }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: accent, transition: "color 0.4s" }}>
            Experience
          </span>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 34, fontWeight: 700, color: "#fff", margin: "14px 0 0", lineHeight: 1.05, letterSpacing: "-0.015em" }}>
            Purushottam Reddy
          </h2>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: "10px 0 0" }}>
            Full-stack · ML engineer
          </p>
        </div>

        <nav aria-label="Roles" style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4 }}>
          {ALL_ENTRIES.map((e, i) => {
            const on = i === active
            return (
              <button
                key={i}
                onClick={() => navToIndex(EXP_START_SNAP + i)}
                aria-current={on ? "true" : undefined}
                style={{
                  all: "unset", boxSizing: "border-box", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14, padding: "9px 0",
                  fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: on ? 600 : 500,
                  color: on ? "#fff" : "rgba(255,255,255,0.42)", transition: "color 0.3s",
                }}
              >
                <span aria-hidden style={{
                  display: "block", height: 2, borderRadius: 1, flexShrink: 0,
                  width: on ? 40 : 16, background: on ? e.accent : "rgba(255,255,255,0.28)",
                  transition: "width 0.35s cubic-bezier(.3,.8,.3,1), background 0.3s",
                }} />
                <span style={{ flex: 1 }}>{e.short}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: on ? e.accent : "rgba(255,255,255,0.28)" }}>
                  {startYear(e.period)}
                </span>
              </button>
            )
          })}
        </nav>

        <div style={{ position: "relative", fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          2022 → 2026 · {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
        </div>
      </aside>

      {/* ── Right: role pages ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>
          {ALL_ENTRIES.map((e, i) => (
            <div
              key={i}
              ref={el => { pageRefs.current[i] = el }}
              style={{
                position: "absolute", inset: 0, willChange: "transform, opacity",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "clamp(20px, 4.4vh, 40px) 72px clamp(20px, 4.4vh, 40px) 64px", opacity: i === 0 ? 1 : 0,
              }}
            >
              <header style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, paddingBottom: "clamp(16px, 3vh, 28px)" }}>
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: e.accent }}>
                  {e.period} · {e.duration}
                </span>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(34px, 5.2vh, 46px)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, letterSpacing: "-0.02em" }}>
                  {e.role}
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 17, color: "rgba(255,255,255,0.62)", margin: 0 }}>
                  {e.org}{e.location ? ` · ${e.location}` : ""}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {e.tech.slice(0, 6).map(t => (
                    <span key={t} style={{
                      fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", padding: "4px 11px", borderRadius: 4,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.68)",
                    }}>{t}</span>
                  ))}
                </div>
              </header>

              <div
                style={{
                  flex: "0 1 auto", minHeight: 0, overflowY: "auto",
                  paddingBottom: 8, scrollbarWidth: "none",
                }}
              >
                <RoleContent entry={e} />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
