"use client"

import { memo } from "react"

import { Codicon } from "./Codicon"
import { ACCENT, MONO } from "./data"

/** macOS-style VS Code title bar: traffic lights, file · workspace — Visual Studio Code. */
function VsTitleBarImpl() {
  return (
    <div style={{
      height: 34, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 14px",
      background: "#03030b", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative",
    }}>
      <div style={{ display: "flex", gap: 7 }} aria-hidden>
        {["#FF5F57", "#FEBC2E", "#28C840"].map(c => <i key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }} />)}
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, textAlign: "center", pointerEvents: "none",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        fontFamily: "var(--font-sans)", fontSize: 12.5, color: "rgba(255,255,255,0.55)",
      }}>
        <Codicon name="vscode" size={15} color="#3B9BF0" />
        dev_profile.py <span style={{ opacity: 0.4 }}>—</span> purush-portfolio <span style={{ opacity: 0.4 }}>—</span> Visual Studio Code
      </div>
    </div>
  )
}

const item: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "0 8px", height: "100%", whiteSpace: "nowrap" }

/** VS Code status bar for the desktop window. */
function VsStatusBarImpl() {
  return (
    <div style={{
      height: 26, flexShrink: 0, background: ACCENT, color: "#07070f", display: "flex", alignItems: "stretch", justifyContent: "space-between",
      fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
    }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <span style={{ ...item, background: "#00a7b3", padding: "0 10px" }} title="Visual Studio Code"><Codicon name="remote" size={14} /></span>
        <span style={item}><Codicon name="git-branch" size={14} />main</span>
        <span style={item}><Codicon name="sync" size={13} /></span>
        <span style={item}><Codicon name="error" size={13} />0 <Codicon name="warning" size={13} style={{ marginLeft: 6 }} />3</span>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", fontFamily: MONO, fontSize: 11.5 }}>
        <span style={item}>Ln 34, Col 1</span>
        <span style={item}>Spaces: 4</span>
        <span style={item}>UTF-8</span>
        <span style={item}>Python 3.12</span>
        <span style={item}><Codicon name="check" size={13} />Skills Loaded</span>
        <span style={item}><Codicon name="bell" size={13} /></span>
      </div>
    </div>
  )
}

export const VsTitleBar = memo(VsTitleBarImpl)

export const VsStatusBar = memo(VsStatusBarImpl)
