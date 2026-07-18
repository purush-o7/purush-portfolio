"use client"

import { navSection }      from "../_hooks/scroll-nav"
import { trackNavArrow }   from "../_lib/analytics"

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
        onClick={() => { trackNavArrow("up", Math.round(window.scrollY / window.innerHeight)); navSection(-1) }}
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
        {/* double chevron — jumps a whole section, not one step */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7.5 L7 3.5 L11 7.5" />
          <path d="M3 11.5 L7 7.5 L11 11.5" />
        </svg>
      </button>

      {/* Down */}
      <button
        aria-label="Next section"
        onClick={() => { trackNavArrow("down", Math.round(window.scrollY / window.innerHeight)); navSection(1) }}
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
        {/* double chevron — jumps a whole section, not one step */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2.5 L7 6.5 L11 2.5" />
          <path d="M3 6.5 L7 10.5 L11 6.5" />
        </svg>
      </button>
    </div>
  )
}
