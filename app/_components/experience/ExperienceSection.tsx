"use client"

import { useRef, useEffect }     from "react"
import { useScrollProgress }     from "../../_hooks/use-scroll-progress"
import { useMobile }             from "../../_hooks/use-mobile"
import { ExperienceCard }        from "./ExperienceCard"
import { ALL_ENTRIES }           from "./data"

const N           = ALL_ENTRIES.length  // 5
const PEEK        = 10                  // desktop: 2× border width
const PEEK_MOBILE = 4                   // mobile: just enough to show accent bar

export function ExperienceSection() {
  const isMobile    = useMobile()
  const isMobileRef = useRef(false)
  useEffect(() => { isMobileRef.current = isMobile }, [isMobile])

  const visible = useScrollProgress(
    typeof window !== "undefined" ? 10 : 10,
    typeof window !== "undefined" ? 4 * window.innerHeight - 10 : 3190,
  )

  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? 9 * window.innerHeight : 7200,
  )

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    function update() {
      const h    = window.innerHeight
      const W    = window.innerWidth
      const peek = isMobileRef.current ? PEEK_MOBILE : PEEK

      // cp: 0 → N-1 as scrollY goes from 5vh to (5+N-1)vh
      const cp         = Math.max(0, Math.min((window.scrollY - 5 * h) / h, N - 1))
      const fullPlaced = Math.floor(cp)
      const incomingT  = cp - fullPlaced

      cardRefs.current.forEach((el, i) => {
        if (!el) return

        const mob = isMobileRef.current

        if (i < fullPlaced) {
          // ── Peek strip ────────────────────────────────────────────────────
          el.style.left         = `${i * peek}px`
          el.style.right        = "auto"
          el.style.width        = `${peek}px`
          el.style.borderRadius = "0"
          el.style.overflow     = "hidden"
          el.style.top          = "0"
          el.style.bottom       = "0"
          el.style.transform    = "none"
          el.style.opacity      = "1"

        } else if (i === fullPlaced) {
          // ── Active card — fades out as next card slides in ────────────────
          el.style.left         = `${fullPlaced * peek}px`
          el.style.right        = "0"
          el.style.top          = "0"
          el.style.bottom       = "0"
          el.style.width        = "auto"
          el.style.borderRadius = "0"
          el.style.overflow     = "hidden"
          el.style.transform    = "none"
          el.style.opacity      = "1"

        } else if (i === fullPlaced + 1) {
          // ── Incoming card — full width, slides in via transform (no reflow/wrap) ──
          const targetLeft = (fullPlaced + 1) * peek
          el.style.left         = `${targetLeft}px`
          el.style.right        = "0"
          el.style.top          = "0"
          el.style.bottom       = "0"
          el.style.width        = "auto"
          el.style.borderRadius = "0"
          el.style.overflow     = "hidden"
          el.style.transform    = `translateX(${(1 - incomingT) * 100}%)`
          el.style.opacity      = String(incomingT)

        } else {
          // ── Not yet placed ────────────────────────────────────────────────
          el.style.left         = "0"
          el.style.right        = "0"
          el.style.top          = "0"
          el.style.bottom       = "0"
          el.style.width        = "auto"
          el.style.borderRadius = "0"
          el.style.overflow     = "hidden"
          el.style.transform    = "translateX(100%)"
          el.style.opacity      = "0"
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
          <ExperienceCard entry={entry} index={i} total={N} isMobile={isMobile} />
        </div>
      ))}
    </div>
  )
}
