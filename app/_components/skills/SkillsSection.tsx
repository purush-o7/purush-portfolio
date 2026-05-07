"use client"

import { useEffect, useState, useCallback } from "react"
import { useScrollProgress }                from "../../_hooks/use-scroll-progress"
import { useMobile }                        from "../../_hooks/use-mobile"
import { EditorPanel }                      from "./EditorPanel"
import { TerminalPanel }                    from "./TerminalPanel"
import { ChatPanel }                        from "./ChatPanel"
import { ACCENT, MONO }                     from "./data"
import { AmoebaBg }                         from "./AmoebaBg"

type Phase     = 0 | 1 | 2 | 3
type MobTab    = "code" | "chat"

export function SkillsSection() {
  const isMobile = useMobile()
  const [phase,       setPhase]       = useState<Phase>(0)
  const [mobTab,      setMobTab]      = useState<MobTab>("code")
  const [chatVersion, setChatVersion] = useState(0)

  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight     : 800,
    typeof window !== "undefined" ? 3 * window.innerHeight : 2400,
  )
  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight     : 800,
    typeof window !== "undefined" ? 4 * window.innerHeight : 3200,
  )

  useEffect(() => {
    if (p >= 0.92 && phase === 0) setPhase(1)
  }, [p, phase])

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
          /* ── Mobile: tab bar + switched body ───────────────────────────── */
          <>
            {/* Tab bar */}
            <div style={{
              display: "flex", alignItems: "stretch",
              height: 38, flexShrink: 0,
              background: "#04040d",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              {(["code", "chat"] as MobTab[]).map(tab => {
                const active    = mobTab === tab
                const chatGlow  = tab === "chat" && !active && phase >= 1
                return (
                  <button
                    key={tab}
                    onClick={() => setMobTab(tab)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "0 14px",
                      fontFamily: MONO, fontSize: 10, letterSpacing: "0.04em",
                      color:        active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.28)",
                      background:   active ? "#07070f" : "transparent",
                      border:       "none",
                      borderBottom: active ? `1px solid ${ACCENT}` : "1px solid transparent",
                      cursor:       "pointer",
                    }}
                  >
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: tab === "code" ? "#3B82F6" : "#D97706",
                      opacity:    active ? 1 : chatGlow ? 1 : 0.35,
                      boxShadow:  chatGlow ? "0 0 6px #D97706" : "none",
                      animation:  chatGlow ? "sk-blink 1.8s ease-in-out infinite" : "none",
                      transition: "opacity 0.3s, box-shadow 0.3s",
                    }} />
                    {tab}
                  </button>
                )
              })}

              {/* Clear — only when chat tab active */}
              {mobTab === "chat" && (
                <button
                  onClick={handleClear}
                  style={{
                    marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
                    padding: "0 12px", fontFamily: MONO, fontSize: 9,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)", background: "transparent",
                    border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)" }}
                >
                  <span style={{ fontSize: 12, lineHeight: 1 }}>↺</span>
                </button>
              )}
            </div>

            {/* Switched body */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
              {mobTab === "code" ? (
                <>
                  <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
                    <EditorPanel active={phase >= 1} onComplete={onEditorDone} compact />
                  </div>
                  <div style={{ height: "38%", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
                    <TerminalPanel active={phase >= 2} onComplete={onTerminalDone} compact />
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <ChatPanel active={phase >= 1} clearTrigger={chatVersion} onClear={handleClear} compact />
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Desktop: editor+terminal left | chat right ─────────────────── */
          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
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
        )}

        {/* ── Status bar ──────────────────────────────────────────────────── */}
        <div style={{
          height: isMobile ? 22 : 26,
          background: ACCENT,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px", flexShrink: 0,
        }}>
          <span style={{ fontFamily: MONO, fontSize: isMobile ? 8 : 9, color: "#07070f", letterSpacing: "0.08em" }}>
            {isMobile ? "dev_profile.py · claude-agent v3.1" : "dev_profile.py · UTF-8 · claude-agent v3.1"}
          </span>
          <span style={{ fontFamily: MONO, fontSize: isMobile ? 8 : 9, color: "#07070f", letterSpacing: "0.08em" }}>
            {isMobile ? "✓ Skills" : "Ln 34  Col 1  ✓ Skills Loaded"}
          </span>
        </div>

      </div>
    </div>
  )
}
