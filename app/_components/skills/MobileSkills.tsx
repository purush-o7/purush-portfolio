"use client"

import { memo } from "react"

import { useState }        from "react"
import { Codicon }         from "./Codicon"
import { TerminalPanel }   from "./TerminalPanel"
import { ChatPanel }       from "./ChatPanel"
import { SKILL_CATEGORIES, ACCENT, MONO } from "./data"

type Tab = "explorer" | "terminal" | "chat"

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "explorer", label: "Explorer", icon: "files" },
  { id: "terminal", label: "Terminal", icon: "terminal" },
  { id: "chat",     label: "Chat",     icon: "comment-discussion" },
]

interface Props {
  chatVersion: number
  onClear:     () => void
}

/**
 * Phone Skills — VS Code's Explorer as a tree: each domain is a folder, each skill a file.
 * One folder is open at a time so the whole tree fits the screen (no nested scrolling).
 * Terminal and Chat open from the bottom bar, like VS Code's panel.
 */
function MobileSkillsImpl({ chatVersion, onClear }: Props) {
  const [tab,  setTab]  = useState<Tab>("explorer")
  const [open, setOpen] = useState(0)
  const [sel,  setSel]  = useState<string>(SKILL_CATEGORIES[0].skills[0])

  const cat = SKILL_CATEGORIES.find(c => c.skills.includes(sel)) ?? SKILL_CATEGORIES[0]

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#080816" }}>

      {/* title bar */}
      <div style={{
        height: 34, flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "0 12px",
        background: "#03030b", borderBottom: "1px solid rgba(255,255,255,0.05)",
        fontFamily: "var(--font-sans)", fontSize: 12.5, color: "rgba(255,255,255,0.6)",
      }}>
        <Codicon name="vscode" size={15} color="#3B9BF0" />
        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          dev_profile.py — Visual Studio Code
        </span>
        {tab === "chat" && (
          <button onClick={onClear} aria-label="Clear chat" style={{ all: "unset", cursor: "pointer", display: "grid", placeItems: "center", width: 28, height: 28 }}>
            <Codicon name="clear-all" size={16} color="rgba(255,255,255,0.5)" />
          </button>
        )}
      </div>

      {/* body */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {tab === "explorer" && (
          <>
            <div style={{
              padding: "10px 14px 6px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
            }}>
              Explorer · purush-portfolio
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              {SKILL_CATEGORIES.map((c, i) => {
                const isOpen = open === i
                return (
                  <div key={c.label}>
                    <button
                      onClick={() => { setOpen(isOpen ? -1 : i); if (!isOpen) setSel(c.skills[0]) }}
                      aria-expanded={isOpen}
                      style={{
                        all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", minHeight: 42,
                        display: "flex", alignItems: "center", gap: 8, padding: "0 14px",
                        fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.88)",
                      }}
                    >
                      <Codicon name={isOpen ? "chevron-down" : "chevron-right"} size={16} color="rgba(255,255,255,0.5)" />
                      <Codicon name={isOpen ? "folder-opened" : "folder"} size={18} color={c.color} />
                      <span style={{ flex: 1 }}>{c.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{c.skills.length}</span>
                    </button>

                    {isOpen && c.skills.map(k => {
                      const on = k === sel
                      return (
                        <button
                          key={k}
                          onClick={() => setSel(k)}
                          style={{
                            all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", minHeight: 36,
                            display: "flex", alignItems: "center", gap: 9, padding: "0 14px 0 44px",
                            fontFamily: "var(--font-sans)", fontSize: 14.5, color: on ? "#fff" : "rgba(255,255,255,0.62)",
                            background: on ? "rgba(0,255,255,0.09)" : "transparent",
                            borderLeft: `2px solid ${on ? ACCENT : "transparent"}`,
                          }}
                        >
                          <Codicon name="symbol-field" size={15} color="#75BEFF" />
                          {k}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* peek — the selection as a line of code */}
            <div style={{
              flexShrink: 0, margin: "6px 66px 10px 10px", padding: "10px 12px", borderRadius: 8,
              background: "#0a0c1c", border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: MONO, fontSize: 12.5, lineHeight: 1.65, fontVariantLigatures: "contextual",
            }}>
              <span style={{ color: "#4B5563" }}># {cat.label}</span><br />
              <span style={{ color: cat.color }}>{cat.varName}</span>
              <span style={{ color: "#4B5563" }}> = [</span>
              <span style={{ color: "#86EFAC" }}>&quot;{sel}&quot;</span>
              <span style={{ color: "#4B5563" }}>, …]</span>
            </div>
          </>
        )}

        {tab === "terminal" && <TerminalPanel active compact />}
        {tab === "chat"     && <ChatPanel active clearTrigger={chatVersion} onClear={onClear} compact />}
      </div>

      {/* bottom bar — VS Code's activity bar, laid horizontally */}
      <div style={{
        flexShrink: 0, display: "flex", background: "#04040d", borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingRight: 70,   // clear of the floating section arrows
      }}>
        {TABS.map(t => {
          const on = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={on ? "page" : undefined}
              style={{
                all: "unset", boxSizing: "border-box", cursor: "pointer", flex: 1, minHeight: 52,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em",
                color: on ? "#fff" : "rgba(255,255,255,0.4)",
                borderTop: `2px solid ${on ? ACCENT : "transparent"}`, marginTop: -1,
              }}
            >
              <Codicon name={t.icon} size={20} />
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const MobileSkills = memo(MobileSkillsImpl)
