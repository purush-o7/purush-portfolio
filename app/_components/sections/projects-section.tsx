"use client"

import Image                       from "next/image"
import { useState, useEffect }     from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useScrollProgress }       from "../../_hooks/use-scroll-progress"
import { useViewport }             from "../../_hooks/use-viewport"
import { SNAP_EDU, SNAP_PROJECTS } from "../../_hooks/snap-map"
import { KovilBento }              from "../kovil/KovilBento"
import { KovilChapters }           from "../kovil/KovilChapters"
import { IMAGES, MONO }            from "../kovil/data"

/**
 * KovilLens — scroll window 2vh → 4vh.
 * Laptop: project bento. Phone: chapter cards. The live 3D lives on its own
 * full-space page (/kovil-lens), opened from either layout.
 */
export function ProjectsSection() {
  const { width } = useViewport()
  const isMobile  = width < 768

  // Slides in over the Education card (scrollY 1vh → 2vh), leaves as Skills arrives (2vh → 3vh)
  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? SNAP_EDU * window.innerHeight : 800,
  )
  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? SNAP_PROJECTS * window.innerHeight : 1600,
  )

  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightbox])

  return (
    <div
      className="fixed inset-0 z-20 bg-[#07070f] overflow-hidden"
      style={{
        visibility: p > 0 && exit < 1 ? "visible" : "hidden",
        transform:  `translateY(${(1 - p) * 100}vh)`,
        willChange: "transform",
      }}
    >
      {width > 0 && (isMobile
        ? <KovilChapters onPhoto={setLightbox} />
        : <KovilBento    onPhoto={setLightbox} />
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            data-no-scroll-snap="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/88"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="relative w-[92vw] max-w-5xl"
              style={{ aspectRatio: "16/9" }}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={IMAGES[lightbox].src} alt={IMAGES[lightbox].alt} fill className="object-contain rounded-sm" sizes="92vw" />
            </motion.div>

            {/* prev / next */}
            {([-1, 1] as const).map(d => (
              <button
                key={d}
                aria-label={d < 0 ? "Previous photo" : "Next photo"}
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + d + IMAGES.length) % IMAGES.length) }}
                style={{
                  position: "absolute", top: "50%", [d < 0 ? "left" : "right"]: 12, transform: "translateY(-50%)",
                  width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff", fontSize: 18, cursor: "pointer",
                }}
              >
                {d < 0 ? "‹" : "›"}
              </button>
            ))}

            <p className="absolute bottom-6 left-0 right-0 text-center text-white/45 px-4"
               style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {IMAGES[lightbox].alt} · {lightbox + 1}/{IMAGES.length} · tap outside to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
