"use client"

import { useEffect, useRef, useState } from "react"
import { type ExperienceEntry }        from "./data"
import { RoleContent, MONO }           from "./RoleContent"

type Mode = "enter" | "half" | "full" | "exit"

// translateY as a fraction of the sheet's own height
const OFFSET: Record<Mode, number> = { enter: 1, exit: 1, half: 0.46, full: 0 }

interface Props {
  entry:   ExperienceEntry
  onClose: () => void
}

/**
 * Phone bottom sheet with two stops (half / full). Drag the header to move it,
 * tap the header to toggle, drag down past ~70% or tap the backdrop / Esc to close.
 * `data-no-scroll-snap` keeps the page snap engine out of every gesture on it.
 */
export function RoleSheet({ entry, onClose }: Props) {
  const sheetRef  = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drag      = useRef({ active: false, startY: 0, base: 0, moved: false, y: 0 })
  const modeRef   = useRef<Mode>("enter")
  const [mode, setMode] = useState<Mode>("enter")

  function place(m: Mode) {
    modeRef.current = m
    setMode(m)
    const el = sheetRef.current
    if (!el) return
    el.style.transition = ""
    el.style.transform  = `translateY(${OFFSET[m] * 100}%)`
  }

  function close() {
    place("exit")
    timerRef.current = setTimeout(onClose, 340)
  }

  // Slide in on mount (setState happens inside the rAF callback, not the effect body)
  useEffect(() => {
    const id = requestAnimationFrame(() => place("half"))
    return () => {
      cancelAnimationFrame(id)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Hide the floating section arrows while the sheet is open so they can't cover it or navigate away
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-section-nav]")
    if (!nav) return
    nav.style.opacity       = "0"
    nav.style.pointerEvents = "none"
    return () => { nav.style.opacity = ""; nav.style.pointerEvents = "" }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") close() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = sheetRef.current
    if (!el) return
    drag.current = { active: true, startY: e.clientY, base: OFFSET[modeRef.current] * el.offsetHeight, moved: false, y: 0 }
    el.style.transition = "none"
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d  = drag.current
    const el = sheetRef.current
    if (!d.active || !el) return
    const dy = e.clientY - d.startY
    if (Math.abs(dy) > 4) d.moved = true
    d.y = Math.max(0, Math.min(d.base + dy, el.offsetHeight))
    el.style.transform = `translateY(${d.y}px)`
  }

  function onPointerUp() {
    const d  = drag.current
    const el = sheetRef.current
    if (!d.active || !el) return
    d.active = false
    if (!d.moved) { place(modeRef.current === "full" ? "half" : "full"); return }
    const r = d.y / el.offsetHeight
    if (r > 0.72)      close()
    else if (r < 0.23) place("full")
    else               place("half")
  }

  const shown = mode === "half" || mode === "full"

  return (
    <div
      data-no-scroll-snap="true"
      role="dialog"
      aria-modal="true"
      aria-label={`${entry.role} details`}
      style={{ position: "absolute", inset: 0, zIndex: 40 }}
    >
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0, background: "rgba(3,4,10,0.62)",
          opacity: shown ? 1 : 0, transition: "opacity 0.3s ease",
        }}
      />

      <div
        ref={sheetRef}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: "88%",
          transform: "translateY(100%)",
          transition: "transform 0.38s cubic-bezier(.3,.8,.3,1)",
          background: "#0d0f22",
          borderTop: `1px solid ${entry.accent}55`,
          borderRadius: "22px 22px 0 0",
          boxShadow: "0 -20px 50px -20px rgba(0,0,0,0.8)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* drag zone */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ flexShrink: 0, padding: "10px 20px 14px", cursor: "grab", touchAction: "none" }}
        >
          <div aria-hidden style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)", margin: "0 auto 14px" }} />
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: entry.accent }}>
            {entry.tag}
          </span>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: "#fff", margin: "6px 0 4px", lineHeight: 1.15 }}>
            {entry.role}
          </h3>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "rgba(255,255,255,0.62)", margin: 0, lineHeight: 1.5 }}>
            {entry.org}<br />{entry.period} · {entry.duration}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {entry.tech.slice(0, 6).map(t => (
              <span key={t} style={{
                fontFamily: MONO, fontSize: 11, padding: "2px 8px", borderRadius: 4,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)",
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* content — scrolls only at the full stop */}
        <div
          data-scroll-passthrough
          onWheel={e => { e.currentTarget.scrollTop += e.deltaY }}
          style={{
            flex: 1, minHeight: 0, padding: "4px 20px calc(28px + env(safe-area-inset-bottom, 0px))",
            overflowY: mode === "full" ? "auto" : "hidden", overscrollBehavior: "contain",
          }}
        >
          <RoleContent entry={entry} compact />
        </div>
      </div>
    </div>
  )
}
