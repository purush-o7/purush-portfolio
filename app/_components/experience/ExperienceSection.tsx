"use client"

import { useRef, useEffect }     from "react"
import { useScrollProgress }     from "../../_hooks/use-scroll-progress"
import { ExperienceCard }        from "./ExperienceCard"
import { ALL_ENTRIES }           from "./data"

const N    = ALL_ENTRIES.length  // 5
const PEEK = 10                  // 2× border width (border = 5px)

export function ExperienceSection() {
  const visible = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? 3 * window.innerHeight - 10 : 2390,
  )

  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? 8 * window.innerHeight : 6400,
  )

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    function update() {
      const h  = window.innerHeight
      const W  = window.innerWidth
      // cp: 0 → N-1 as scrollY goes from 4vh to (4+N-1)vh
      // Starts at 4vh so card 0 has one full snap alone before card 1 slides in
      const cp          = Math.max(0, Math.min((window.scrollY - 4 * h) / h, N - 1))
      const fullPlaced  = Math.floor(cp)             // index of current active card
      const incomingT   = cp - fullPlaced            // 0→1 progress of next card

      cardRefs.current.forEach((el, i) => {
        if (!el) return

        if (i < fullPlaced) {
          // ── Peek strip: card is covered, shows left edge only ────────────
          el.style.left         = `${i * PEEK}px`
          el.style.right        = "auto"
          el.style.width        = `${PEEK}px`
          el.style.borderRadius = "12px 4px 4px 12px"
          el.style.overflow     = "hidden"
          el.style.top          = "0"
          el.style.bottom       = "0"
          el.style.transform    = "none"

        } else if (i === fullPlaced) {
          // ── Active card ───────────────────────────────────────────────────
          el.style.left         = `${fullPlaced * PEEK}px`
          el.style.right        = "0"
          el.style.top          = "0"
          el.style.bottom       = "0"
          el.style.width        = "auto"
          el.style.borderRadius = "16px 0 0 16px"
          el.style.overflow     = "hidden"
          el.style.transform    = "none"

        } else if (i === fullPlaced + 1) {
          // ── Incoming card ─────────────────────────────────────────────────
          const targetLeft      = (fullPlaced + 1) * PEEK
          const currentLeft     = targetLeft + (1 - incomingT) * (W - targetLeft)
          el.style.left         = `${currentLeft}px`
          el.style.right        = "0"
          el.style.top          = "0"
          el.style.bottom       = "0"
          el.style.width        = "auto"
          el.style.borderRadius = "16px 0 0 16px"
          el.style.overflow     = "hidden"
          el.style.transform    = "none"

        } else {
          // ── Not yet placed ────────────────────────────────────────────────
          el.style.left         = `${W}px`
          el.style.right        = "0"
          el.style.top          = "0"
          el.style.bottom       = "0"
          el.style.width        = "auto"
          el.style.borderRadius = "0"
          el.style.overflow     = "hidden"
          el.style.transform    = "none"
        }
      })
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <div
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     15,
        overflow:   "hidden",
        visibility: visible >= 1 ? "visible" : "hidden",
        transform:  `translateY(${-exit * 100}vh)`,
        willChange: "transform",
      }}
    >
      {ALL_ENTRIES.map((entry, i) => (
        <div
          key={i}
          ref={el => { cardRefs.current[i] = el }}
          style={{
            position:   "absolute",
            top:        0,
            right:      0,
            bottom:     0,
            left:       i === 0 ? 0 : 9999,
            zIndex:     i + 1,
            overflow:   "hidden",
            willChange: "left, width",
          }}
        >
          <ExperienceCard entry={entry} index={i} total={N} />
        </div>
      ))}
    </div>
  )
}
