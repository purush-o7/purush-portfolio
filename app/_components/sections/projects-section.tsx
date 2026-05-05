"use client"

import dynamic                        from "next/dynamic"
import Image                           from "next/image"
import { useState } from "react"
import { motion, AnimatePresence }     from "framer-motion"
import { useScrollProgress }           from "../../_hooks/use-scroll-progress"
import { useMobile }                   from "../../_hooks/use-mobile"

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
  { src: "/projects/kovil-lens/site-visit-1.jpg",   alt: "Site visit — Moovar Kovil" },
  { src: "/projects/kovil-lens/site-visit-2.jpg",   alt: "Site visit — temple complex" },
  { src: "/projects/kovil-lens/tooltips.webp",      alt: "KovilLens — UI tooltips" },
]

export function ProjectsSection() {
  const isMobile = useMobile()

  // Entry: slides up into view during scroll 2vh → 3vh
  const p = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? 2 * window.innerHeight : 1600,
  )
  // Exit: slides up off the top during scroll 3vh → 4vh, revealing cable scene behind
  const exit = useScrollProgress(
    typeof window !== "undefined" ? window.innerHeight : 800,
    typeof window !== "undefined" ? 3 * window.innerHeight : 2400,
  )

  const [hovered,    setHovered]    = useState<number | null>(null)
  const [lightbox,   setLightbox]   = useState<number | null>(null)
  const [doiHovered, setDoiHovered] = useState(false)
  const [stripPaused, setStripPaused] = useState(false)

  return (
    <div
      className="fixed inset-0 z-20 bg-[#07070f] overflow-hidden"
      style={{
        transform:  `translateY(${((1 - p) - exit) * 100}vh) scale(${0.97 + p * 0.03})`,
        opacity:    p,
        willChange: "transform, opacity",
        display:    "flex",
        flexDirection: isMobile ? "column-reverse" : "row",
      }}
    >
      {/* ── Info panel — bottom 40% on mobile, left 2/5 on desktop ─────────── */}
      <div
        className="relative flex flex-col justify-center overflow-hidden shrink-0"
        style={{
          width:        isMobile ? "100%" : "40%",
          height:       isMobile ? "40%" : "100%",
          padding:      isMobile ? "16px 20px" : "56px 48px",
          gap:          isMobile ? 12 : 28,
          borderTop:    isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
          borderRight:  isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
        }}
      >

        {/* Hover image overlay — desktop only */}
        {!isMobile && (
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
        )}

        {/* Project info */}
        <motion.div
          className="relative z-0 flex flex-col"
          style={{ gap: isMobile ? 10 : 28 }}
          animate={{ opacity: (!isMobile && hovered !== null) ? 0 : 1 }}
          transition={{ duration: 0.22 }}
        >
          <p className="font-mono tracking-[0.35em] uppercase text-white/30"
             style={{ fontSize: isMobile ? 9 : 14 }}>
            Final Year Research · IEEE Published
          </p>

          <h2 className="font-heading leading-[0.88] tracking-tight">
            <span className="block font-bold text-white"
                  style={{ fontSize: isMobile ? 40 : 72 }}>Kovil</span>
            <span className="block font-bold text-white/40"
                  style={{ fontSize: isMobile ? 40 : 72 }}>Lens</span>
          </h2>

          {!isMobile && <div className="w-8 h-px bg-white/20" />}

          <p className="font-mono text-white/50 leading-[1.8]"
             style={{ fontSize: isMobile ? 11 : 14, maxWidth: isMobile ? "none" : 300 }}>
            Mixed Reality on Microsoft HoloLens&nbsp;2 for digital preservation of Moovar
            Kovil — a 9th-century Chola temple complex in Tamil Nadu.
          </p>

          {!isMobile && (
            <div className="flex flex-col gap-3">
              <Row label="Published" value="IEEE ICVR 2025 · Wageningen" />
              <Row label="Role"      value="Research Assistant · Feb – May 2023" />
              <Row label="Impact"    value="~15 fps → 60 fps optimisation" />
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {["HoloLens 2", "Unity", "C#", "MRTK", "Mixed Reality"].map((t) => (
              <span key={t} className="font-mono tracking-widest uppercase
                                       text-white/30 border border-white/10 px-2 py-0.5 rounded-sm"
                    style={{ fontSize: isMobile ? 8 : 12 }}>
                {t}
              </span>
            ))}
          </div>

          <motion.a
            href="https://ieeexplore.ieee.org/abstract/document/11172645"
            target="_blank" rel="noopener noreferrer"
            className="relative inline-flex items-center overflow-hidden
                       font-mono tracking-widest uppercase w-fit focus:outline-none"
            style={{ fontSize: isMobile ? 9 : 12 }}
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

      {/* ── Canvas + gallery — top 60% on mobile, right 3/5 on desktop ─────── */}
      <div
        className="flex flex-col"
        style={{
          width:  isMobile ? "100%" : "60%",
          height: isMobile ? "60%" : "100%",
          flex:   isMobile ? "none" : 1,
        }}
      >
        {/* 3D canvas — fills available space */}
        <div className="relative flex-1">
          <TempleViewer />
          <p className="absolute bottom-3 left-0 right-0 text-center font-mono text-xs
                         tracking-[0.3em] uppercase text-white/15 pointer-events-none select-none">
            {isMobile ? "Drag · Pinch to zoom" : "Drag · Scroll to zoom · Pan"}
          </p>
        </div>

        <div className="h-px bg-white/[0.06] shrink-0" />

        {/* Infinite right-to-left gallery */}
        <div
          className="relative overflow-hidden shrink-0"
          style={{
            height: isMobile ? "32%" : "30%",
            background: "radial-gradient(ellipse 120% 80% at 60% 50%, #1a0a2e 0%, #0d0520 30%, #060412 60%, #07070f 100%)",
          }}
          data-no-scroll-snap="true"
        >
          <style>{`
            @keyframes gallery-rtl {
              from { transform: translateX(0); }
              to   { transform: translateX(-50%); }
            }
          `}</style>

          {/* Nebula core glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 50% 60% at 55% 40%, rgba(120,60,220,0.12) 0%, transparent 70%), radial-gradient(ellipse 30% 40% at 30% 60%, rgba(60,120,220,0.08) 0%, transparent 60%)",
          }} />

          {/* Deep-space edge fades */}
          <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none
                          bg-gradient-to-r from-[#07070f] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none
                          bg-gradient-to-l from-[#07070f] to-transparent" />

          {/* Animated track */}
          <div
            className="flex items-center gap-3 h-full"
            style={{
              width: "max-content",
              animation: "gallery-rtl 38s linear infinite",
              animationPlayState: stripPaused ? "paused" : "running",
            }}
            onMouseEnter={() => setStripPaused(true)}
            onMouseLeave={() => { setStripPaused(false); setHovered(null) }}
          >
            {[...IMAGES, ...IMAGES].map((img, i) => (
              <button
                key={i}
                onMouseEnter={() => setHovered(i % IMAGES.length)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setLightbox(i % IMAGES.length)}
                aria-label={img.alt}
                className="relative shrink-0 overflow-hidden focus:outline-none
                           rounded-xl transition-transform duration-300 hover:scale-[1.04]"
                style={{
                  height: "calc(100% - 20px)",
                  aspectRatio: "16/9",
                  background: "#06060f",
                  padding: "3px",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.7)",
                }}
              >
                <div className="relative w-full h-full rounded-[9px] overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover brightness-75 hover:brightness-100 transition-all duration-500"
                    sizes="220px"
                  />
                </div>
              </button>
            ))}
          </div>
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
