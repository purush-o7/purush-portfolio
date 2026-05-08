"use client"

import { useEffect, useRef, useState } from "react"
import { useMobile }                    from "../../_hooks/use-mobile"

const MONO = "var(--font-geist-mono)"

export function HintOverlay() {
  const isMobile          = useMobile()
  const [visible, setVisible] = useState(false)
  const dismissed         = useRef(false)

  function dismiss() {
    if (dismissed.current) return
    dismissed.current = true
    setVisible(false)
  }

  useEffect(() => {
    // Inject keyframes
    const el = document.createElement("style")
    el.textContent = `
      @keyframes hint-pulse {
        0%,100% { transform: scale(0.85); opacity: 0.55; }
        50%      { transform: scale(1.25); opacity: 0.15; }
      }
      @keyframes hint-ring2 {
        0%,100% { transform: scale(1.0);  opacity: 0.3; }
        50%      { transform: scale(1.6);  opacity: 0;   }
      }
    `
    document.head.appendChild(el)

    // Appear after particle formation (~2.6s)
    const show = setTimeout(() => {
      if (!dismissed.current) setVisible(true)
    }, 2700)

    // Mobile: dismiss on first touch anywhere on canvas
    window.addEventListener("touchstart", dismiss, { once: true, passive: true })

    return () => {
      clearTimeout(show)
      window.removeEventListener("touchstart", dismiss)
      document.head.removeChild(el)
    }
  }, [])

  return (
    <div
      onMouseEnter={dismiss}
      onMouseMove={dismiss}
      style={{
        position:      "absolute", inset: 0,
        pointerEvents: visible ? "auto" : "none",
        zIndex:        10,
        cursor:        "none",
      }}
    >
      <div style={{
        position:  "absolute",
        left:      "50%",
        top:       isMobile ? "75%" : "72%",
        transform: "translate(-50%, -50%)",
        display:   "flex",
        flexDirection: "column",
        alignItems: "center",
        gap:       14,
        opacity:   visible ? 1 : 0,
        transition: "opacity 0.7s ease",
      }}>

        {/* Pulsing rings */}
        <div style={{ position: "relative", width: 60, height: 60 }}>
          {/* Outer expanding ring */}
          <div style={{
            position:     "absolute", inset: 0,
            borderRadius: "50%",
            border:       "1px solid rgba(0,255,255,0.4)",
            animation:    visible ? "hint-ring2 2s ease-out infinite" : "none",
          }} />
          {/* Inner pulsing ring */}
          <div style={{
            position:     "absolute", inset: 0,
            borderRadius: "50%",
            border:       "1px solid rgba(255,255,255,0.45)",
            animation:    visible ? "hint-pulse 2s ease-in-out infinite" : "none",
          }} />
          {/* Centre dot */}
          <div style={{
            position:     "absolute",
            top: "50%", left: "50%",
            transform:    "translate(-50%,-50%)",
            width:        4, height: 4,
            borderRadius: "50%",
            background:   "rgba(255,255,255,0.5)",
          }} />
        </div>

        {/* Label */}
        <span style={{
          fontFamily:    MONO,
          fontSize:      10,
          color:         "rgba(255,255,255,0.4)",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}>
          {isMobile ? "drag me" : "hover me"}
        </span>

      </div>
    </div>
  )
}
