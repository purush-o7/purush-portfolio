"use client"

import dynamic                        from "next/dynamic"
import Image                           from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence }     from "framer-motion"
import { useScrollProgress }           from "../../_hooks/use-scroll-progress"

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const TempleViewer = dynamic(
  () => import("../temple-viewer").then((m) => m.TempleViewer),
  { ssr: false },
)


const IMAGES = [
  { src: "/projects/kovil-lens/aerial-view.webp",   alt: "Moovar Kovil — aerial view" },
  { src: "/projects/kovil-lens/hololens-demo.webp", alt: "HoloLens 2 demo at Moovar Kovil" },
  { src: "/projects/kovil-lens/screenshot-1.webp",  alt: "KovilLens — guided storytelling mode" },
  { src: "/projects/kovil-lens/screenshot-2.webp",  alt: "KovilLens — interactive analysis mode" },
  { src: "/projects/kovil-lens/screenshot-3.webp",  alt: "KovilLens — temple reconstruction" },
  { src: "/projects/kovil-lens/site-visit-1.jpg",   alt: "Site visit — Moovar Kovil" },    // already optimal as JPEG
  { src: "/projects/kovil-lens/site-visit-2.jpg",   alt: "Site visit — temple complex" },  // already optimal as JPEG
  { src: "/projects/kovil-lens/tooltips.webp",      alt: "KovilLens — UI tooltips" },
]
const INTERVAL = 3000

export function ProjectsSection() {
  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? 2 * window.innerHeight : 1600,
  )

  const [slide,      setSlide]      = useState(0)
  const [hovered,    setHovered]    = useState<number | null>(null)
  const [lightbox,   setLightbox]   = useState<number | null>(null)
  const [doiHovered, setDoiHovered] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stripRef    = useRef<HTMLDivElement>(null)
  const btnRefs     = useRef<(HTMLButtonElement | null)[]>([])

  // Start / restart the auto-advance interval
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(
      () => setSlide((s) => (s + 1) % IMAGES.length),
      INTERVAL,
    )
  }, [])

  // Pause while hovering, run otherwise
  useEffect(() => {
    if (hovered !== null) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    startInterval()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [hovered, startInterval])

  // Navigate with modulo wrap; resets the interval so it doesn't fire immediately after
  const goTo = useCallback((idx: number) => {
    setSlide(((idx % IMAGES.length) + IMAGES.length) % IMAGES.length)
    startInterval()
  }, [startInterval])

  const handlePrev = useCallback(() => goTo(slide - 1), [goTo, slide])
  const handleNext = useCallback(() => goTo(slide + 1), [goTo, slide])

  // Smooth-scroll strip to center the active image
  useEffect(() => {
    const btn   = btnRefs.current[slide]
    const strip = stripRef.current
    if (!btn || !strip) return
    strip.scrollTo({
      left: btn.offsetLeft - strip.offsetWidth / 2 + btn.offsetWidth / 2,
      behavior: "smooth",
    })
  }, [slide])

  return (
    <div
      className="fixed inset-0 z-20 bg-[#07070f] flex overflow-hidden"
      style={{
        transform:  `translateY(${(1 - p) * 100}vh) scale(${0.97 + p * 0.03})`,
        opacity:    p,
        willChange: "transform, opacity",
      }}
    >
      {/* ── Left: project info (40%) ──────────────────────────────────────── */}
      <div className="w-2/5 h-full relative flex flex-col justify-center px-12 gap-7
                      border-r border-white/[0.06] shrink-0 overflow-hidden">

        {/* Hover image overlay */}
        <AnimatePresence>
          {hovered !== null && (
            <motion.div
              key={hovered}
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={IMAGES[hovered].src}
                alt={IMAGES[hovered].alt}
                fill
                className="object-cover"
                sizes="40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070f] via-[#07070f]/20 to-transparent" />
              <motion.p
                className="absolute bottom-8 left-8 right-8 font-mono text-xs
                           tracking-widest uppercase text-white/45 line-clamp-1"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
              >
                {IMAGES[hovered].alt}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project info — fades on image hover */}
        <motion.div
          className="relative z-0 flex flex-col gap-7"
          animate={{ opacity: hovered !== null ? 0 : 1 }}
          transition={{ duration: 0.22 }}
        >
          <p className="font-mono text-sm tracking-[0.35em] uppercase text-white/30">
            Final Year Research · IEEE Published
          </p>

          <h2 className="font-heading leading-[0.88] tracking-tight">
            <span className="block text-7xl font-bold text-white">Kovil</span>
            <span className="block text-7xl font-bold text-white/40">Lens</span>
          </h2>

          <div className="w-8 h-px bg-white/20" />

          <p className="font-mono text-sm text-white/50 leading-[1.8] max-w-[300px]">
            Mixed Reality on Microsoft HoloLens&nbsp;2 for digital preservation of Moovar
            Kovil — a 9th-century Chola temple complex in Tamil Nadu.
          </p>

          <div className="flex flex-col gap-3">
            <Row label="Published" value="IEEE ICVR 2025 · Wageningen" />
            <Row label="Role"      value="Research Assistant · Feb – May 2023" />
            <Row label="Impact"    value="~15 fps → 60 fps optimisation" />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["HoloLens 2", "Unity", "C#", "MRTK", "Mixed Reality"].map((t) => (
              <span key={t} className="font-mono text-xs tracking-widest uppercase
                                       text-white/30 border border-white/10 px-2 py-0.5 rounded-sm">
                {t}
              </span>
            ))}
          </div>

          <motion.a
            href="https://ieeexplore.ieee.org/abstract/document/11172645"
            target="_blank" rel="noopener noreferrer"
            className="relative inline-flex items-center overflow-hidden
                       font-mono text-xs tracking-widest uppercase w-fit focus:outline-none"
            onHoverStart={() => setDoiHovered(true)}
            onHoverEnd={() => setDoiHovered(false)}
            animate={{
              color: doiHovered
                ? "rgba(255,255,255,0.75)"
                : ["rgba(255,255,255,0.25)", "rgba(255,255,255,0.42)", "rgba(255,255,255,0.25)"],
            }}
            transition={{
              color: doiHovered
                ? { duration: 0.2 }
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <motion.span
              key={doiHovered ? "doi-hover" : "doi-idle"}
              aria-hidden
              className="absolute inset-y-0 w-[55%] pointer-events-none"
              style={{
                background: doiHovered
                  ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.32) 50%, transparent)"
                  : "linear-gradient(90deg, transparent, rgba(255,255,255,0.16) 50%, transparent)",
                left: 0,
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "220%" }}
              transition={doiHovered
                ? { duration: 0.48, ease: "easeInOut" }
                : { duration: 0.7, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.4 }
              }
            />
            DOI 10.1109/ICVR66534.2025.11172645&nbsp;
            <motion.span
              className="inline-block"
              animate={doiHovered ? { x: 2, y: -2 } : { x: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              ↗
            </motion.span>
          </motion.a>
        </motion.div>
      </div>

      {/* ── Right: canvas 70% + strip 30% (60% total) ─────────────────────── */}
      <div className="w-3/5 h-full flex flex-col">

        <div className="relative" style={{ height: "70%" }}>
          <TempleViewer />
          <p className="absolute bottom-3 left-0 right-0 text-center font-mono text-xs
                         tracking-[0.3em] uppercase text-white/15 pointer-events-none select-none">
            Drag · Scroll to zoom · Pan
          </p>
        </div>

        <div className="h-px bg-white/[0.06] shrink-0" />

        {/* Image strip + arrows */}
        <div className="relative" style={{ height: "30%" }}>

          {/* Left arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-0 top-0 bottom-0 z-10 px-3 flex items-center
                       bg-gradient-to-r from-[#07070f]/90 to-transparent
                       hover:from-[#07070f] transition-all duration-200 focus:outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/50 hover:text-white/90 transition-colors">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Scrollable strip */}
          <div
            ref={stripRef}
            className="flex overflow-x-auto overflow-y-hidden h-full"
            style={{ scrollbarWidth: "none" } as React.CSSProperties}
          >
            {IMAGES.map((img, i) => (
              <button
                key={img.src}
                ref={(el) => { btnRefs.current[i] = el }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setLightbox(i)}
                className="relative shrink-0 h-full overflow-hidden focus:outline-none bg-[#07070f]"
                style={{ aspectRatio: "16/9" }}
                aria-label={img.alt}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className={`object-contain transition-all duration-500 ${
                    slide === i ? "brightness-100 scale-100" : "brightness-45 hover:brightness-75"
                  }`}
                  sizes="220px"
                />
                {slide === i && (
                  <motion.div
                    layoutId="strip-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/60"
                    transition={{ type: "spring", stiffness: 380, damping: 36 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-0 top-0 bottom-0 z-10 px-3 flex items-center
                       bg-gradient-to-l from-[#07070f]/90 to-transparent
                       hover:from-[#07070f] transition-all duration-200 focus:outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/50 hover:text-white/90 transition-colors">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/88"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="relative w-[90vw] max-w-5xl"
              style={{ aspectRatio: "16/9" }}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={IMAGES[lightbox].src}
                alt={IMAGES[lightbox].alt}
                fill
                className="object-contain rounded-sm"
                sizes="90vw"
              />
            </motion.div>
            <p className="absolute bottom-6 left-0 right-0 text-center font-mono text-xs
                           tracking-widest uppercase text-white/35">
              {IMAGES[lightbox].alt} · click outside to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-xs tracking-widest uppercase text-white/25 w-24 shrink-0">
        {label}
      </span>
      <span className="font-mono text-sm text-white/55">{value}</span>
    </div>
  )
}
