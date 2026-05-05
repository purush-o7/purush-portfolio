"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { useScrollProgress } from "../../_hooks/use-scroll-progress"

// ── Mouse color-trail canvas ───────────────────────────────────────────────────

function useColorTrail(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    let hue = 160   // start at teal
    let animId = 0

    type Particle = { x: number; y: number; hue: number; size: number; alpha: number }
    let particles: Particle[] = []

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      canvas!.width  = rect.width
      canvas!.height = rect.height
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      // Scatter 4 brush dots around pointer
      for (let k = 0; k < 4; k++) {
        const scatter = 14
        particles.push({
          x:     mx + (Math.random() - 0.5) * scatter,
          y:     my + (Math.random() - 0.5) * scatter,
          hue,
          size:  18 + Math.random() * 16,
          alpha: 0.55 + Math.random() * 0.30,
        })
      }
      hue = (hue + 4) % 360
      if (particles.length > 600) particles.splice(0, 100)
    }

    function render() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      for (const p of particles) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        g.addColorStop(0, `hsla(${p.hue},100%,55%,${p.alpha})`)
        g.addColorStop(1, `hsla(${p.hue},100%,55%,0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        p.alpha *= 0.968   // slow fade
      }
      particles = particles.filter(p => p.alpha > 0.004)

      animId = requestAnimationFrame(render)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    canvas.addEventListener("mousemove", onMouseMove)
    render()

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove)
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [canvasRef])
}

// ── Icon components ───────────────────────────────────────────────────────────

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

// ── Section ───────────────────────────────────────────────────────────────────

const LINKS = [
  { label: "GitHub",   href: "https://github.com/purush-o7",                      icon: <GithubIcon />   },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/purush-o7/",             icon: <LinkedInIcon /> },
  { label: "Email",    href: "mailto:dev.coreops26@gmail.com",                     icon: <MailIcon />     },
]

interface Props { triggerVh: number }

export function FooterSection({ triggerVh }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useColorTrail(canvasRef)

  const p = useScrollProgress(
    typeof window !== "undefined" ? (triggerVh - 1) * window.innerHeight + 10 : 99999,
    typeof window !== "undefined" ?  triggerVh      * window.innerHeight - 10 : 99999,
  )

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        zIndex:    13,
        opacity:   p,
        pointerEvents: p > 0.05 ? "auto" : "none",
      }}
    >
      <div className="flex h-full">

        {/* ── Left: peacock image + color-trail canvas ──────────────────── */}
        <div className="relative w-[55%] h-full bg-white overflow-hidden">
          <Image
            src="/peacock.png"
            alt="Peacock line art"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            draggable={false}
          />
          {/* Canvas sits above image; multiply blend = colors paint the white areas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ mixBlendMode: "multiply", cursor: "crosshair" }}
          />
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2
                        font-mono text-[10px] tracking-[0.28em] uppercase
                        text-black/25 select-none pointer-events-none">
            hover to paint
          </p>
        </div>

        {/* ── Right: footer content ─────────────────────────────────────── */}
        <div className="w-[45%] h-full bg-[#07070f] flex flex-col justify-center px-14 gap-8">

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/30">
              available for opportunities
            </p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Let&apos;s build<br />
              <span className="text-transparent bg-clip-text
                               bg-gradient-to-r from-cyan-400 to-violet-400">
                something great.
              </span>
            </h2>
          </div>

          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Full-stack developer &amp; ML engineer. I blend systems thinking
            with creative interfaces — reach out if you&apos;d like to
            collaborate.
          </p>

          <div className="flex flex-col gap-3">
            {LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-3 group w-fit"
              >
                <span className="text-white/30 group-hover:text-cyan-400 transition-colors duration-200">
                  {icon}
                </span>
                <span className="font-mono text-xs tracking-[0.2em] uppercase
                                 text-white/40 group-hover:text-white/80
                                 transition-colors duration-200">
                  {label}
                </span>
              </a>
            ))}
          </div>

          <div className="mt-4 pt-6 border-t border-white/[0.07]">
            <p className="font-mono text-[10px] tracking-widest uppercase text-white/20">
              Purushottam Reddy Chinthakuntla · 2025
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
