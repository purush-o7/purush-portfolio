"use client"

import { useEffect, useState, useCallback } from "react"
import { useScrollProgress }                from "../../_hooks/use-scroll-progress"
import { useMobile }                        from "../../_hooks/use-mobile"
import { SNAP_PROJECTS, SNAP_SKILLS }       from "../../_hooks/snap-map"
import { EditorPanel }                      from "./EditorPanel"
import { TerminalPanel }                    from "./TerminalPanel"
import { ChatPanel }                        from "./ChatPanel"
import { ACCENT, MONO }                     from "./data"
import { AmoebaBg }                         from "./AmoebaBg"
import { ActivityBar }                      from "./ActivityBar"
import { VsTitleBar, VsStatusBar }          from "./VsChrome"
import { MobileSkills }                     from "./MobileSkills"

type Phase     = 0 | 1 | 2 | 3

export function SkillsSection() {
  const isMobile = useMobile()
  const [phase,       setPhase]       = useState<Phase>(0)
  const [chatVersion, setChatVersion] = useState(0)

  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight     : 800,
    typeof window !== "undefined" ? SNAP_PROJECTS * window.innerHeight : 1600,
  )
  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight     : 800,
    typeof window !== "undefined" ? SNAP_SKILLS * window.innerHeight : 2400,
  )

  useEffect(() => {
    if (p >= 0.92 && phase === 0) setPhase(isMobile ? 3 : 1)
  }, [p, phase, isMobile])

  // Reset only when scrolling back up toward KovilLens (p drops below threshold).
  // Coming from Experience does NOT reset — animations stay completed.
  useEffect(() => {
    if (p < 0.08) setPhase(0)
  }, [p])

  useEffect(() => {
    const el = document.createElement("style")
    el.textContent = `
      @keyframes sk-blink  { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes sk-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
    `
    document.head.appendChild(el)
    return () => { document.head.removeChild(el) }
  }, [])

  const onEditorDone   = useCallback(() => setPhase(prev => Math.max(prev, 2) as Phase), [])
  const onTerminalDone = useCallback(() => setPhase(prev => Math.max(prev, 3) as Phase), [])
  const handleClear    = useCallback(() => setChatVersion(v => v + 1), [])

  const isVisible = p > 0 && exit < 1

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 20,
      visibility: isVisible ? "visible" : "hidden",
      transform:  `translateY(${((1 - p) - exit) * 100}vh)`,
      willChange: "transform",
      padding:    isMobile ? "10px" : "16px",
    }}>

      <AmoebaBg />

      <div style={{
        position: "relative", height: "100%",
        background: "#07070f",
        borderRadius: isMobile ? "12px" : "18px",
        display: "flex", flexDirection: "column",
        overflow: "hidden", fontFamily: MONO,
      }}>

        {isMobile ? (
          /* ── Mobile: VS Code explorer tree + terminal / chat from the bottom bar ── */
          <MobileSkills chatVersion={chatVersion} onClear={handleClear} />
        ) : (
          /* ── Desktop: editor+terminal left | chat right ─────────────────── */
          <>
          <VsTitleBar />
          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
            <ActivityBar />
            {/* Left: editor + terminal */}
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              minWidth: 0,
            }}>
              <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
                <EditorPanel active={phase >= 1} onComplete={onEditorDone} />
              </div>
              <div style={{ height: "34%", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
                <TerminalPanel active={phase >= 2} onComplete={onTerminalDone} />
              </div>
            </div>

            {/* Right: chat — always visible */}
            <div style={{ width: "36%", flexShrink: 0, overflow: "hidden" }}>
              <ChatPanel active={phase >= 1} clearTrigger={chatVersion} onClear={handleClear} />
            </div>
          </div>
          </>
        )}

        {/* ── Status bar ──────────────────────────────────────────────────── */}
        {isMobile ? (
          <div style={{
            height: 22, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 12px", flexShrink: 0,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 8, color: "#07070f", letterSpacing: "0.08em" }}>dev_profile.py · claude-agent v3.1</span>
            <span style={{ fontFamily: MONO, fontSize: 8, color: "#07070f", letterSpacing: "0.08em" }}>✓ Skills</span>
          </div>
        ) : (
          <VsStatusBar />
        )}

      </div>
    </div>
  )
}
