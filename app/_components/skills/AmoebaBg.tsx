"use client"

import { useEffect, useRef } from "react"

const SZ    = "80%"
const BLEND = "hard-light" as const

const BLOBS = [
  {
    color: "0, 210, 255",
    anim:  "sk-vert 30s ease infinite",
    origin: "center center",
    top:  `calc(50% - ${SZ}/2)`,
    left: `calc(50% - ${SZ}/2)`,
  },
  {
    color: "0, 90, 255",
    anim:  "sk-circ 20s reverse infinite",
    origin: "calc(50% - 400px)",
    top:  `calc(50% - ${SZ}/2)`,
    left: `calc(50% - ${SZ}/2)`,
  },
  {
    color: "0, 220, 180",
    anim:  "sk-circ 40s linear infinite",
    origin: "calc(50% + 400px)",
    top:  `calc(50% - ${SZ}/2 + 200px)`,
    left: `calc(50% - ${SZ}/2 - 500px)`,
  },
  {
    color: "70, 0, 200",
    anim:  "sk-horiz 40s ease infinite",
    origin: "calc(50% - 200px)",
    top:  `calc(50% - ${SZ}/2)`,
    left: `calc(50% - ${SZ}/2)`,
    opacity: 0.7,
  },
  {
    color: "0, 160, 255",
    anim:  "sk-circ 20s ease infinite",
    origin: `calc(50% - 800px) calc(50% + 200px)`,
    top:  `calc(50% - ${SZ})`,
    left: `calc(50% - ${SZ})`,
    size: `calc(${SZ} * 2)`,
  },
]

export function AmoebaBg() {
  const interRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = document.createElement("style")
    el.textContent = `
      @keyframes sk-vert  {
        0%   { transform: translateY(-50%); }
        50%  { transform: translateY(50%);  }
        100% { transform: translateY(-50%); }
      }
      @keyframes sk-circ  {
        0%   { transform: rotate(0deg);   }
        50%  { transform: rotate(180deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes sk-horiz {
        0%   { transform: translateX(-50%) translateY(-10%); }
        50%  { transform: translateX(50%)  translateY(10%);  }
        100% { transform: translateX(-50%) translateY(-10%); }
      }
    `
    document.head.appendChild(el)
    return () => { document.head.removeChild(el) }
  }, [])

  useEffect(() => {
    const el = interRef.current
    if (!el) return
    let curX = 0, curY = 0, tgX = 0, tgY = 0, raf = 0

    function move() {
      curX += (tgX - curX) / 20
      curY += (tgY - curY) / 20
      el!.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`
      raf = requestAnimationFrame(move)
    }
    function onMouse(e: MouseEvent) { tgX = e.clientX; tgY = e.clientY }

    window.addEventListener("mousemove", onMouse)
    move()
    return () => {
      window.removeEventListener("mousemove", onMouse)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div style={{
      position:   "absolute", inset: 0,
      overflow:   "hidden",
      background: "linear-gradient(40deg, #000a18, #07070f)",
    }}>
      {/* SVG goo filter — blurs blobs then sharpens edges to create organic merging */}
      <svg style={{ display: "none" }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="sk-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Blob container — goo filter + soft outer blur */}
      <div style={{ filter: "url(#sk-goo) blur(40px)", width: "100%", height: "100%" }}>
        {BLOBS.map((b, i) => (
          <div key={i} style={{
            position:        "absolute",
            background:      `radial-gradient(circle at center, rgba(${b.color}, 0.8) 0, rgba(${b.color}, 0) 50%) no-repeat`,
            mixBlendMode:    BLEND,
            width:           b.size ?? SZ,
            height:          b.size ?? SZ,
            top:             b.top,
            left:            b.left,
            transformOrigin: b.origin,
            animation:       b.anim,
            opacity:         b.opacity ?? 1,
          }} />
        ))}

        {/* Interactive blob — follows cursor */}
        <div
          ref={interRef}
          style={{
            position:     "absolute",
            background:   "radial-gradient(circle at center, rgba(0,255,255,0.8) 0, rgba(0,255,255,0) 50%) no-repeat",
            mixBlendMode: BLEND,
            width:        "100%",
            height:       "100%",
            top:          "-50%",
            left:         "-50%",
            opacity:      0.7,
          }}
        />
      </div>
    </div>
  )
}
