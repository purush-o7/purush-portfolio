"use client"

import { navGo } from "../_hooks/scroll-nav"

export function SectionNav() {
  return (
    <div style={{
      position:   "fixed",
      bottom:     32,
      right:      28,
      zIndex:     100,
      display:    "flex",
      flexDirection: "column",
      gap:        10,
    }}>
      {/* Up */}
      <button
        aria-label="Previous section"
        onClick={() => navGo(-1)}
        style={{
          width:          40,
          height:         40,
          borderRadius:   "50%",
          background:     "rgba(255,255,255,0.06)",
          border:         "1px solid rgba(255,255,255,0.15)",
          color:          "rgba(255,255,255,0.7)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          cursor:         "pointer",
          backdropFilter: "blur(8px)",
          transition:     "background 0.2s, border-color 0.2s, color 0.2s",
          fontSize:       16,
          lineHeight:     1,
        }}
        onMouseEnter={e => {
          const b = e.currentTarget
          b.style.background   = "rgba(255,255,255,0.14)"
          b.style.borderColor  = "rgba(255,255,255,0.35)"
          b.style.color        = "#fff"
        }}
        onMouseLeave={e => {
          const b = e.currentTarget
          b.style.background   = "rgba(255,255,255,0.06)"
          b.style.borderColor  = "rgba(255,255,255,0.15)"
          b.style.color        = "rgba(255,255,255,0.7)"
        }}
      >
        ↑
      </button>

      {/* Down */}
      <button
        aria-label="Next section"
        onClick={() => navGo(1)}
        style={{
          width:          40,
          height:         40,
          borderRadius:   "50%",
          background:     "rgba(255,255,255,0.06)",
          border:         "1px solid rgba(255,255,255,0.15)",
          color:          "rgba(255,255,255,0.7)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          cursor:         "pointer",
          backdropFilter: "blur(8px)",
          transition:     "background 0.2s, border-color 0.2s, color 0.2s",
          fontSize:       16,
          lineHeight:     1,
        }}
        onMouseEnter={e => {
          const b = e.currentTarget
          b.style.background   = "rgba(255,255,255,0.14)"
          b.style.borderColor  = "rgba(255,255,255,0.35)"
          b.style.color        = "#fff"
        }}
        onMouseLeave={e => {
          const b = e.currentTarget
          b.style.background   = "rgba(255,255,255,0.06)"
          b.style.borderColor  = "rgba(255,255,255,0.15)"
          b.style.color        = "rgba(255,255,255,0.7)"
        }}
      >
        ↓
      </button>
    </div>
  )
}
