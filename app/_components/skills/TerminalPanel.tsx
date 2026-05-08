"use client"

import { useEffect, useRef, useState }  from "react"
import { TriangleAlert, Info, CircleX } from "lucide-react"
import { TERMINAL_LINES, OUTPUT_LINES, PROBLEM_LINES } from "./data"

const MONO       = "var(--font-geist-mono)"
const LINE_DELAY = 170
const ACCENT     = "#00FFFF"

type PanelTab = "TERMINAL" | "OUTPUT" | "PROBLEMS"

const TAB_CFG: { id: PanelTab }[] = [
  { id: "TERMINAL" },
  { id: "OUTPUT" },
  { id: "PROBLEMS" },
]

function OutputBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 16, height: 16, borderRadius: "50%",
      background: "rgba(96,165,250,0.15)",
      border: "1px solid rgba(96,165,250,0.35)",
      fontFamily: MONO, fontSize: 8, fontWeight: 600,
      color: "#60A5FA", lineHeight: 1, flexShrink: 0,
    }}>
      13
    </span>
  )
}

function ProblemsBadge() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
        <TriangleAlert size={11} color="#FBBF24" />
        <span style={{ fontFamily: MONO, fontSize: 8, color: "#FBBF24" }}>3</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
        <Info size={11} color="#60A5FA" />
        <span style={{ fontFamily: MONO, fontSize: 8, color: "#60A5FA" }}>4</span>
      </span>
    </span>
  )
}

interface Props {
  active:      boolean
  onComplete?: () => void
  compact?:    boolean
}

export function TerminalPanel({ active, onComplete, compact = false }: Props) {
  const [activeTab, setActiveTab] = useState<PanelTab>("TERMINAL")
  const [visible,   setVisible]   = useState(0)
  const doneRef       = useRef(false)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  // Terminal typewriter — only for TERMINAL tab content
  useEffect(() => {
    if (!active) { setVisible(0); doneRef.current = false; return }
    if (doneRef.current) return
    let count = 0
    const id = setInterval(() => {
      count++
      setVisible(count)
      if (count >= TERMINAL_LINES.length) {
        clearInterval(id)
        doneRef.current = true
        onCompleteRef.current?.()
      }
    }, LINE_DELAY)
    return () => clearInterval(id)
  }, [active])

  const fs = compact ? 10 : 12
  const lh = compact ? "17px" : "20px"

  return (
    <div style={{ height: "100%", background: "#040410", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── VS Code panel tab strip ──────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "stretch",
        height: compact ? 28 : 32,
        background: "#03030b",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}>
        {TAB_CFG.map(({ id }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: compact ? 5 : 6,
                padding: compact ? "0 10px" : "0 14px",
                fontFamily: MONO, fontSize: compact ? 9 : 10,
                letterSpacing: "0.08em",
                color:        isActive ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.22)",
                background:   "transparent",
                border:       "none",
                borderBottom: isActive ? `1px solid ${ACCENT}` : "1px solid transparent",
                cursor:       "pointer",
                whiteSpace:   "nowrap",
              }}
            >
              {id}
              {id === "OUTPUT"   && <OutputBadge />}
              {id === "PROBLEMS" && <ProblemsBadge />}
            </button>
          )
        })}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingRight: compact ? 8 : 12, gap: compact ? 8 : 10 }}>
          {["+", "⊟", "×"].map(icon => (
            <span key={icon} style={{ fontFamily: MONO, fontSize: compact ? 11 : 13, color: "rgba(255,255,255,0.15)", cursor: "default", lineHeight: 1 }}>
              {icon}
            </span>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div data-scroll-passthrough style={{ flex: 1, overflow: "auto", overscrollBehavior: "contain", padding: compact ? "8px 12px" : "10px 14px" }}>

        {activeTab === "TERMINAL" && (
          <>
            {TERMINAL_LINES.slice(0, visible).map((line, i) => (
              <div key={i} style={{ fontFamily: MONO, fontSize: fs, lineHeight: lh, color: line.color ?? "rgba(255,255,255,0.55)", minHeight: lh, whiteSpace: "pre" }}>
                {line.text}
              </div>
            ))}
            {active && visible > 0 && visible < TERMINAL_LINES.length && (
              <span style={{ color: ACCENT, fontFamily: MONO, fontSize: fs, animation: "sk-blink 1s step-end infinite" }}>▌</span>
            )}
          </>
        )}

        {activeTab === "OUTPUT" && (
          <>
            {OUTPUT_LINES.map((line, i) => (
              <div key={i} style={{ fontFamily: MONO, fontSize: fs, lineHeight: lh, color: line.color ?? "rgba(255,255,255,0.55)", minHeight: lh, whiteSpace: "pre" }}>
                {line.text}
              </div>
            ))}
          </>
        )}

        {activeTab === "PROBLEMS" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {PROBLEM_LINES.map((line, i) => {
              const isWarn = line.text.includes("⚠")
              const isHint = line.text.includes("ℹ")
              const clean  = line.text.replace(/⚠|ℹ/g, "").trimEnd()
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: MONO, fontSize: compact ? 9 : 11,
                  lineHeight: lh, color: line.color ?? "rgba(255,255,255,0.55)",
                  minHeight: lh, whiteSpace: "pre",
                }}>
                  {isWarn && <TriangleAlert size={compact ? 9 : 11} color="#FBBF24" style={{ flexShrink: 0 }} />}
                  {isHint && <Info         size={compact ? 9 : 11} color="#60A5FA" style={{ flexShrink: 0 }} />}
                  {!isWarn && !isHint && <span style={{ display: "inline-block", width: compact ? 9 : 11, flexShrink: 0 }} />}
                  {clean}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
