"use client"

import { Codicon } from "./Codicon"

const TOP = [
  { title: "Explorer",       icon: "files",          active: true  },
  { title: "Search",         icon: "search",         active: false },
  { title: "Source Control", icon: "source-control", active: false, badge: "1" },
  { title: "Run and Debug",  icon: "debug-alt",      active: false },
  { title: "Extensions",     icon: "extensions",     active: false },
]
const BOTTOM = [
  { title: "Accounts", icon: "account"       },
  { title: "Manage",   icon: "settings-gear" },
]

/** VS Code activity bar — decorative icon strip using the real codicons. */
export function ActivityBar() {
  return (
    <div style={{
      width: 48, flexShrink: 0, background: "#04040d", borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", paddingBlock: 4,
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {TOP.map(it => (
          <div key={it.title} title={it.title} style={{
            position: "relative", width: 48, height: 48, display: "grid", placeItems: "center",
            color: it.active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.38)",
            borderLeft: `2px solid ${it.active ? "#00FFFF" : "transparent"}`,
          }}>
            <Codicon name={it.icon} size={24} />
            {it.badge && (
              <span style={{
                position: "absolute", right: 7, bottom: 8, minWidth: 15, height: 15, borderRadius: 8, padding: "0 4px",
                background: "#00b8c4", color: "#04141a", fontFamily: "var(--font-geist-mono)", fontSize: 10, fontWeight: 600,
                display: "grid", placeItems: "center", lineHeight: 1,
              }}>{it.badge}</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {BOTTOM.map(it => (
          <div key={it.title} title={it.title} style={{ width: 48, height: 44, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.38)" }}>
            <Codicon name={it.icon} size={22} />
          </div>
        ))}
      </div>
    </div>
  )
}
