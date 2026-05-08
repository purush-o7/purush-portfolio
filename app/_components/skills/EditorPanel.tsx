"use client"

import { useEffect, useRef, useState } from "react"
import { SKILL_CATEGORIES }            from "./data"

const MONO       = "var(--font-geist-mono)"
const LINE_DELAY = 85

type Token    = { text: string; color: string }
type CodeLine = Token[]

const C = {
  comment: "#4B5563",
  keyword: "#C084FC",
  cls:     "#FBBF24",
  string:  "#86EFAC",
  punct:   "#4B5563",
}

function buildLines(): CodeLine[] {
  const blank: CodeLine = []
  const lines: CodeLine[] = [
    [{ text: "# dev_profile.py", color: C.comment }],
    [{ text: "# Loaded by: claude-agent v3.1", color: C.comment }],
    blank,
    [
      { text: "class ",           color: C.keyword },
      { text: "PurushottamReddy", color: C.cls },
      { text: ":",                color: C.punct },
    ],
    [{ text: '    """Full Stack · ML Engineer · Problem Solver"""', color: C.comment }],
    blank,
  ]

  SKILL_CATEGORIES.forEach(cat => {
    const row: Token[] = [
      { text: `    ${cat.varName.padEnd(11)}`, color: cat.color },
      { text: "= [",                           color: C.punct },
    ]
    cat.skills.forEach((s, i) => {
      if (i > 0) row.push({ text: ", ", color: C.punct })
      row.push({ text: `"${s}"`, color: C.string })
    })
    row.push({ text: "]", color: C.punct })
    lines.push(row)
    lines.push(blank)
  })

  return lines
}

const CODE_LINES   = buildLines()
const CLASS_LINE   = 3   // line index of "class PurushottamReddy:"
const FIRST_CAT    = 6   // line index of first category

function getBreadcrumb(visible: number): { file: string; cls?: string; member?: string } {
  if (visible <= CLASS_LINE)     return { file: "dev_profile.py" }
  if (visible <= FIRST_CAT)      return { file: "dev_profile.py", cls: "PurushottamReddy" }
  const catIdx = Math.min(Math.floor((visible - FIRST_CAT) / 2), SKILL_CATEGORIES.length - 1)
  return {
    file:   "dev_profile.py",
    cls:    "PurushottamReddy",
    member: SKILL_CATEGORIES[Math.max(0, catIdx)].varName,
  }
}

interface Props {
  active:      boolean
  onComplete?: () => void
  compact?:    boolean
}

export function EditorPanel({ active, onComplete, compact = false }: Props) {
  const [visible, setVisible] = useState(0)
  const doneRef       = useRef(false)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    if (!active) { setVisible(0); doneRef.current = false; return }
    if (doneRef.current) return
    let count = 0
    const id = setInterval(() => {
      count++
      setVisible(count)
      if (count >= CODE_LINES.length) {
        clearInterval(id)
        doneRef.current = true
        onCompleteRef.current?.()
      }
    }, LINE_DELAY)
    return () => clearInterval(id)
  }, [active])

  const fs   = compact ? 11 : 13
  const lh   = compact ? 18 : 22
  const bc   = getBreadcrumb(visible)
  const sep  = <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>›</span>

  return (
    <div style={{ height: "100%", background: "#080816", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "stretch",
        height: compact ? 30 : 34,
        background: "#04040e",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: compact ? 5 : 6,
          padding: compact ? "0 12px" : "0 16px",
          background: "#080816",
          borderBottom: "1px solid #00FFFF",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ width: compact ? 7 : 8, height: compact ? 7 : 8, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
          <span style={{ fontFamily: MONO, fontSize: compact ? 10 : 11, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>
            dev_profile.py
          </span>
          <span style={{ fontFamily: MONO, fontSize: compact ? 9 : 10, color: "rgba(255,255,255,0.2)", marginLeft: compact ? 4 : 6 }}>×</span>
        </div>
        {!compact && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 14px", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", opacity: 0.5 }} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.22)" }}>skills.json</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.12)", marginLeft: 4 }}>×</span>
          </div>
        )}
      </div>

      {/* ── Breadcrumb bar ───────────────────────────────────────────────────── */}
      {!compact && (
        <div style={{
          height: 26, flexShrink: 0,
          display: "flex", alignItems: "center",
          padding: "0 14px",
          background: "#080816",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          fontFamily: MONO, fontSize: 11,
          overflow: "hidden", whiteSpace: "nowrap",
        }}>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>{bc.file}</span>
          {bc.cls && <>{sep}<span style={{ color: "rgba(255,255,255,0.35)" }}>{bc.cls}</span></>}
          {bc.member && (
            <>
              {sep}
              <span style={{ color: "#00FFFF", opacity: 0.8 }}>{bc.member}</span>
            </>
          )}
        </div>
      )}

      {/* ── Editor body ──────────────────────────────────────────────────────── */}
      <div data-scroll-passthrough style={{ flex: 1, display: "flex", overflow: "auto", overscrollBehavior: "contain" }}>

        {/* Line numbers */}
        <div style={{
          width: compact ? 32 : 42, flexShrink: 0,
          paddingTop: 14, paddingRight: 10,
          textAlign: "right",
          fontFamily: MONO, fontSize: compact ? 10 : 12,
          lineHeight: `${lh}px`,
          userSelect: "none",
        }}>
          {CODE_LINES.slice(0, visible).map((_, i) => (
            <div key={i} style={{ color: i === visible - 1 && !doneRef.current ? "rgba(255,255,255,0.45)" : "#252538" }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code area */}
        <div style={{ flex: 1, padding: `14px 16px 14px 8px`, fontFamily: MONO, fontSize: fs, lineHeight: `${lh}px` }}>
          {CODE_LINES.slice(0, visible).map((line, li) => {
            const isActive = li === visible - 1 && active && !doneRef.current
            return (
              <div
                key={li}
                style={{
                  whiteSpace: compact ? "pre-wrap" : "pre",
                  minHeight: `${lh}px`,
                  background: isActive ? "rgba(255,255,255,0.03)" : "transparent",
                  borderRadius: 2,
                }}
              >
                {line.map((tok, ti) => (
                  <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
                ))}
                {/* Cursor inline at end of current line */}
                {isActive && (
                  <span style={{ color: "#00FFFF", animation: "sk-blink 1s step-end infinite" }}>▌</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
