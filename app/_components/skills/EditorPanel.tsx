"use client"

import { memo } from "react"

import { useEffect, useRef, useState } from "react"
import { SKILL_CATEGORIES }            from "./data"
import { Codicon, FileIcon }          from "./Codicon"
import { useViewport }                from "../../_hooks/use-viewport"

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

function EditorPanelImpl({ active, onComplete, compact = false }: Props) {
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

  const { width: vw } = useViewport()
  const showMap = !compact && vw >= 1400            // the minimap only when there is room for it
  const fs   = compact ? 11 : 13.5
  const lh   = compact ? 18 : 24
  const bc   = getBreadcrumb(visible)
  const sep  = <Codicon name="chevron-right" size={13} color="rgba(255,255,255,0.3)" style={{ margin: "0 2px" }} />

  return (
    <div style={{ height: "100%", background: "#080816", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "stretch",
        height: compact ? 30 : 38,
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
          {compact
            ? <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
            : <FileIcon kind="py" size={15} />}
          <span style={{ fontFamily: compact ? MONO : "var(--font-sans)", fontSize: compact ? 10 : 13, color: "rgba(255,255,255,0.82)", whiteSpace: "nowrap" }}>
            dev_profile.py
          </span>
          {compact
            ? <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>×</span>
            : <Codicon name="close" size={14} color="rgba(255,255,255,0.4)" style={{ marginLeft: 8 }} />}
        </div>
        {!compact && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 14px", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
            <FileIcon kind="json" size={15} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>skills.json</span>
            <Codicon name="close" size={14} color="rgba(255,255,255,0.22)" style={{ marginLeft: 8 }} />
          </div>
        )}
      </div>

      {/* ── Breadcrumb bar ───────────────────────────────────────────────────── */}
      {!compact && (
        <div style={{
          height: 30, flexShrink: 0,
          display: "flex", alignItems: "center",
          padding: "0 14px",
          background: "#080816",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          fontFamily: "var(--font-sans)", fontSize: 12.5,
          overflow: "hidden", whiteSpace: "nowrap",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)" }}><FileIcon kind="py" size={13} />{bc.file}</span>
          {bc.cls && <>{sep}<span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.5)" }}><Codicon name="symbol-class" size={14} color="#EE9D28" />{bc.cls}</span></>}
          {bc.member && (
            <>
              {sep}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#00FFFF" }}><Codicon name="symbol-field" size={14} color="#75BEFF" />{bc.member}</span>
            </>
          )}
        </div>
      )}

      {/* ── Editor body ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex" }}>
      <div data-scroll-passthrough style={{ flex: 1, display: "flex", overflow: "auto", overscrollBehavior: "contain" }}>

        {/* Line numbers */}
        <div style={{
          width: compact ? 32 : 52, flexShrink: 0,
          paddingTop: 14, paddingRight: 12,
          textAlign: "right",
          fontFamily: MONO, fontSize: compact ? 10 : 13,
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
        <div style={{ flex: 1, padding: compact ? "14px 16px 14px 8px" : showMap ? "14px 76px 14px 8px" : "14px 16px 14px 8px", fontFamily: MONO, fontSize: fs, lineHeight: `${lh}px`, fontVariantLigatures: "contextual", fontFeatureSettings: '"liga" 1, "calt" 1' }}>
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
      {showMap && <Minimap visible={visible} />}
      </div>
    </div>
  )
}

/** VS Code-style minimap — each visible line as a row of tiny coloured bars. */
function Minimap({ visible }: { visible: number }) {
  return (
    <div aria-hidden style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: 64, pointerEvents: "none",
      background: "rgba(4,4,14,0.55)", borderLeft: "1px solid rgba(255,255,255,0.04)", padding: "14px 6px",
      display: "flex", flexDirection: "column", gap: 3, overflow: "hidden",
    }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 6, height: "55%", background: "rgba(255,255,255,0.045)" }} />
      {CODE_LINES.slice(0, visible).map((line, i) => (
        <div key={i} style={{ display: "flex", height: 3, gap: 0, minHeight: 3 }}>
          {line.map((tok, ti) => (
            <span key={ti} style={{ width: Math.min(tok.text.length, 60) * 0.7, background: tok.color, opacity: 0.7, borderRadius: 1, display: "block" }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export const EditorPanel = memo(EditorPanelImpl)
