"use client"

import { useLayoutEffect, useRef } from "react"

const HEAD = "var(--font-heading)"

/**
 * The bottom bar: the project names in a row. The current one is centred, enlarged and in its own colour; the rest stay
 * small and fade out towards the edges. Picking a name (or pressing ← →) calls onPick; the strip then glides so the new name sits in the middle.
 */
export function NameDial({ names, colors, cur, onPick, phone }: { names: string[]; colors: string[]; cur: number; onPick: (i: number) => void; phone: boolean }) {
  const box   = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const btn   = useRef<(HTMLButtonElement | null)[]>([])

  useLayoutEffect(() => {
    const place = () => {
      const b = box.current, s = strip.current, a = btn.current[cur]
      if (!b || !s || !a) return
      s.style.transform = `translate3d(${(b.clientWidth / 2 - (a.offsetLeft + a.offsetWidth / 2)).toFixed(1)}px,-50%,0)`
    }
    place()
    const ro = new ResizeObserver(place)
    if (box.current) ro.observe(box.current)
    document.fonts?.ready.then(place)
    return () => ro.disconnect()
  }, [cur, phone])

  const scale = phone ? 1.85 : 2.3
  const pad   = phone ? 46 : 74
  return (
    <div
      ref={box} role="group" aria-label="Projects" className="dial"
      onKeyDown={e => {
        if (e.key === "ArrowRight") { e.preventDefault(); onPick(Math.min(names.length - 1, cur + 1)) }
        if (e.key === "ArrowLeft")  { e.preventDefault(); onPick(Math.max(0, cur - 1)) }
      }}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)", maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)" }}
    >
      <style>{`
        .dial-strip{position:absolute;left:0;top:50%;display:flex;align-items:center;gap:${phone ? 26 : 44}px;transition:transform .7s cubic-bezier(.22,1,.36,1);will-change:transform}
        .dial-btn{all:unset;cursor:pointer;white-space:nowrap;font-family:${HEAD};font-weight:700;font-size:${phone ? 14 : 18}px;color:#8a93bd;transition:transform .7s cubic-bezier(.22,1,.36,1),color .5s;transform-origin:center}
        .dial-btn:hover{color:#cfd4e6}
        .dial-btn:focus-visible{outline:2px solid #22e5f0;outline-offset:4px;border-radius:4px}
        @media (prefers-reduced-motion: reduce){.dial-strip,.dial-btn{transition:none}}
      `}</style>
      <div ref={strip} className="dial-strip">
        {names.map((n, i) => (
          <button
            key={n} ref={el => { btn.current[i] = el }} type="button" className="dial-btn" onClick={() => onPick(i)}
            aria-current={i === cur ? "true" : undefined}
            style={i === cur ? { transform: `scale(${scale})`, color: colors[i], margin: `0 ${pad}px` } : undefined}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
