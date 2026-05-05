"use client"

import { useRef, useEffect }     from "react"
import { useScrollProgress }     from "../../_hooks/use-scroll-progress"
import { ExperienceCard }        from "./ExperienceCard"
import { ALL_ENTRIES }           from "./data"

const N = ALL_ENTRIES.length  // 5 cards

export function ExperienceSection() {
  // Visible once KovilLens exits at scroll = 3vh
  const visible = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? 3 * window.innerHeight - 10 : 2390,
  )

  // Exits during snap 8 → 9vh (slides up, revealing CylinderSection below)
  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? 8 * window.innerHeight : 6400,
  )

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Scroll-driven card reveals: card i slides in during snap (3+i) → (4+i)
  useEffect(() => {
    function update() {
      const h  = window.innerHeight
      // Goes 0 → N as scrollY goes from 3vh to (3+N)vh
      const cp = Math.max(0, Math.min((window.scrollY - 3 * h) / h, N))

      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const slideIn = Math.max(0, Math.min(cp - i, 1))
        el.style.transform = `translateX(${(1 - slideIn) * 100}%)`
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
            inset:      0,
            zIndex:     i + 1,        // MaTrack (i=4) is on top
            transform:  "translateX(100%)",  // all start off-screen right
            willChange: "transform",
          }}
        >
          <ExperienceCard entry={entry} index={i} total={N} />
        </div>
      ))}
    </div>
  )
}
