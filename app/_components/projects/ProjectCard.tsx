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
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 14, padding: 12, borderRadius: 22, background: "#0d1026", border: "1px solid #2a3157", boxShadow: "0 -14px 32px rgba(0,0,0,0.6)" }}>
      <style>{`@media (max-height: 620px){.pc-pts{display:none !important}}`}</style>

      {/* top: the picture */}
      <div style={{ position: "relative", flex: "0 0 clamp(150px, 38%, 300px)", borderRadius: 14, overflow: "hidden", background: photo ? "#090b1a" : "#0a0d1d" }}
        role={!photo ? "img" : undefined} aria-label={!photo ? `${p.title}: illustration` : undefined}>
        <Picture p={p} photo={photo} />
      </div>

      {/* bottom: what it is */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 10, padding: "2px 4px 4px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>{pad2(i + 1)} / {pad2(total)} · {p.tag}</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, lineHeight: 1, letterSpacing: "-0.04em", color: p.color }}>{c.fig}</div>
        <h3 style={{ margin: 0, fontFamily: HEAD, fontWeight: 700, fontSize: 22, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff" }}>{p.title}</h3>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.45, color: "rgba(255,255,255,0.88)" }}>{c.line}</p>
        <ul className="pc-pts" style={{ listStyle: "none", margin: "2px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {c.pts.filter(Boolean).map(t => (
            <li key={t} style={{ position: "relative", paddingLeft: 16, fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.4, color: "rgba(255,255,255,0.8)" }}>
              <span aria-hidden style={{ position: "absolute", left: 0, top: "0.75em", width: 8, height: 2, background: p.color }} />
              {t}
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto" }}>
          {p.tech.slice(0, 4).map(t => (
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
