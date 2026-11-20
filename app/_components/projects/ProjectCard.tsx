import { trackProjectClick } from "../../_lib/analytics"
import type { Project }      from "./data"
import { COPY, Picture }     from "./ProjectWindow"

const HEAD = "var(--font-heading)"
const MONO = "var(--font-geist-mono)"
const pad2 = (n: number) => String(n).padStart(2, "0")

/** The phone's project card: a tall picture on top, then the name, the one figure, one line, the stack. It fills the card's full height. */
export function ProjectCard({ p, i, total, photo }: { p: Project; i: number; total: number; photo?: string }) {
  const c = COPY[p.title]
  const hasLink = p.link && p.link !== "#"
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 12, padding: 12, borderRadius: 22, background: "#0d1026", border: "1px solid #2a3157", boxShadow: "0 -14px 32px rgba(0,0,0,0.6)" }}>
      <div style={{ position: "relative", flex: 1, minHeight: 0, borderRadius: 14, overflow: "hidden", background: `radial-gradient(120% 90% at 0% 0%, ${p.color}30, #090b1a 62%)` }}
        role={!photo ? "img" : undefined} aria-label={!photo ? `${p.title}: illustration` : undefined}>
        {photo ? (
          <>
            <Picture p={p} photo={photo} />
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,8,20,0.92), rgba(7,8,20,0) 55%)" }} />
            <div style={{ position: "absolute", left: 16, bottom: 14, fontFamily: HEAD, fontWeight: 700, fontSize: 46, lineHeight: 1, letterSpacing: "-0.04em", color: p.color, textShadow: `0 0 30px ${p.color}66` }}>{c.fig}</div>
          </>
        ) : (
          <>
            <div style={{ position: "absolute", left: 16, top: 14, fontFamily: HEAD, fontWeight: 700, fontSize: 46, lineHeight: 1, letterSpacing: "-0.04em", color: p.color }}>{c.fig}</div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, aspectRatio: "16 / 10", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 22%)", maskImage: "linear-gradient(to bottom, transparent, #000 22%)" }}><Picture p={p} /></div>
          </>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 4px 4px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>{pad2(i + 1)} / {pad2(total)} · {p.tag}</div>
        <h3 style={{ margin: 0, fontFamily: HEAD, fontWeight: 700, fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff" }}>{p.title}</h3>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.45, color: "rgba(255,255,255,0.88)" }}>{c.line}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {p.tech.slice(0, 3).map(t => (
            <span key={t} style={{ fontFamily: MONO, fontSize: 11, padding: "2px 8px", borderRadius: 4, border: `1px solid ${p.color}88`, color: "rgba(255,255,255,0.9)" }}>{t}</span>
          ))}
        </div>
        {hasLink && (
          <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={() => trackProjectClick(p.title)}
            style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", minHeight: 44, fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: p.color, textDecoration: "none", borderBottom: "1px solid currentColor" }}>
            View project →
          </a>
        )}
      </div>
    </div>
  )
}
