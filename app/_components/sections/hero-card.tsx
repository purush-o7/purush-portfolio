"use client"

import { useScrollProgress }   from "../../_hooks/use-scroll-progress"
import { useMobile }           from "../../_hooks/use-mobile"
import { CanvasWrapper }       from "../canvas-wrapper"
import { HintOverlay }         from "./hint-overlay"
import { HeroOverlay }         from "./hero-overlay"

/**
 * Hero — a full-bleed particle portrait with the name set huge over it (HeroOverlay).
 * Laptop: portrait sits right of centre at full height. Phone: portrait on top, name and facts below it.
 */
export function HeroCard() {
  const p        = useScrollProgress()
  const isMobile = useMobile()

  return (
    <div
      className="fixed inset-0 z-20 bg-[#07070f] overflow-hidden"
      style={{
        transform:  `translateY(-${p * 100}vh)`,
        willChange: "transform",
      }}
    >
      {/* Portrait — the canvas fills the whole hero so particles fly in from every edge and corner;
          the camera places the face right of centre (laptop) or in the top 64% (phone). */}
      <div className="absolute inset-0">
        <CanvasWrapper focus={isMobile ? { x: 0.5, y: 0.4, k: 0.8 } : { x: 0.64, y: 0.5, k: 1 }} />
      </div>
      <section
        className={isMobile ? "absolute inset-x-0 top-0 h-[70%]" : "absolute inset-y-0 right-0 left-[26%]"}
      >
        <HintOverlay />
      </section>

      <HeroOverlay ready mobile={isMobile} />   {/* text and links never wait for the portrait */}
    </div>
  )
}
