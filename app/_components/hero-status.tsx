"use client"

import { useEffect, useState } from "react"
import { trackContactClick }   from "../_lib/analytics"

const LINKS = [
  { label: "GitHub",        href: "https://github.com/purush-o7",                          track: "GitHub"   as const },
  { label: "LinkedIn",      href: "https://www.linkedin.com/in/purush-o7/",                 track: "LinkedIn" as const },
  { label: "IEEE Xplore",   href: "https://ieeexplore.ieee.org/abstract/document/11172645", track: null },
]

function useIstClock() {
  const [t, setT] = useState("")
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  return t
}

const row   = "flex items-baseline gap-4 border-t border-white/10 py-3"
const label = "w-20 shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-white/35"

/** Hero facts — availability, base and links, set as a quiet ruled list (no boxes). */
export function HeroStatus() {
  const clock = useIstClock()
  return (
    <dl className="m-0 w-full max-w-[26rem] text-[15px] text-white/70">
      <div className={row}>
        <dt className={label}>Status</dt>
        <dd className="m-0 flex items-center gap-2.5">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Open to full-stack roles
        </dd>
      </div>

      <div className={`${row} max-md:hidden`}>
        <dt className={label}>Based in</dt>
        <dd className="m-0">
          Nandyal, India
          {clock && <span className="ml-2 font-mono text-[13px] text-white/40 tabular-nums">· {clock} IST</span>}
        </dd>
      </div>

      <div className={`${row} border-b max-md:border-b-0`}>
        <dt className={`${label} max-md:hidden`}>Elsewhere</dt>
        <dd className="m-0 flex flex-wrap gap-x-5 gap-y-1">
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { if (l.track) trackContactClick(l.track) }}
              className="text-white/70 underline decoration-white/25 underline-offset-[5px] transition-colors hover:text-white hover:decoration-white/70"
            >
              {l.label}
            </a>
          ))}
        </dd>
      </div>
    </dl>
  )
}
