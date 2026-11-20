import Image from "next/image"
import type { CSSProperties, ReactNode } from "react"
import type { Project } from "./data"
import { ART } from "./project-art"

const HEAD = "var(--font-heading)"
const MONO = "var(--font-geist-mono)"
const SANS = "var(--font-sans)"

/** The one figure to remember, a short line, and two points for each project (short wording written for the window). */
export const COPY: Record<string, { fig: string; line: string; pts: [string, string]; art?: string }> = {
  "KovilLens":     { fig: "15 → 60 fps", line: "A 9th-century Chola temple preserved on HoloLens 2.", pts: ["", ""] },
  "Sapota AI":     { fig: "~88%", line: "Fruit ripeness and bruises from two cameras.", pts: ["Custom CNN, three-class ripeness detection", "Hybrid SVM + MobileNet bruise detection, +15% precision"], art: "sapota" },
  "RecordVault":   { fig: "Team of 4", line: "A CRM for record labels on a 3NF PostgreSQL schema.", pts: ["Transaction-safe CRUD with commit and rollback", "Role-based access for admins and standard users"], art: "db" },
  "code@Amrita":   { fig: "On Azure", line: "A learning path for competitive-programming beginners.", pts: ["Problem sets, learning paths and contest guides", "React front end with a custom domain"], art: "cp" },
  "SSR Club":      { fig: "Full stack", line: "A platform for a club's initiatives, events and outreach.", pts: ["", ""], art: "club" },
  "VisionAssist":  { fig: "IEEE", line: "Voice guidance and hazard detection for visually impaired users.", pts: ["", ""], art: "vision" },
  "Access Denied": { fig: "1st prize", line: "Anokha 2023: circuits, troubleshooting and coding under pressure.", pts: ["", ""], art: "circuit" },
}
/** Which of the four window layouts each project uses */
const LAYOUT: Record<string, "A" | "B" | "C" | "D"> = {
  "KovilLens": "C", "Sapota AI": "B", "RecordVault": "B", "code@Amrita": "B", "SSR Club": "A", "VisionAssist": "A", "Access Denied": "D",
}

const tag: CSSProperties  = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.78)" }
const line: CSSProperties = { fontFamily: SANS, fontSize: "clamp(12px, 1.6cqw, 15px)", lineHeight: 1.45, color: "rgba(255,255,255,0.9)" }
const fill: CSSProperties = { position: "absolute", inset: 0 }

function Chips({ p }: { p: Project }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {p.tech.slice(0, 4).map(t => (
        <span key={t} style={{ fontFamily: MONO, fontSize: 11, padding: "2px 9px", borderRadius: 4, border: `1px solid ${p.color}88`, color: "rgba(255,255,255,0.92)", background: "rgba(9,11,26,0.6)" }}>{t}</span>
      ))}
    </div>
  )
}

function Fig({ p, size = "clamp(24px, 5cqw, 56px)" }: { p: Project; size?: string }) {
  return <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: "-0.035em", color: p.color }}>{COPY[p.title].fig}</div>
}

/** The picture: the real photo when there is one, otherwise the drawing */
export function Picture({ p, photo, fit = "cover" }: { p: Project; photo?: string; fit?: "cover" | "contain" }): ReactNode {
  if (photo) return <Image src={photo} alt={`${p.title} — photo`} fill sizes="(max-width: 900px) 70vw, 50vw" style={{ objectFit: fit }} />
  const a = COPY[p.title].art
  if (!a) return null
  return <div aria-hidden style={{ ...fill, background: "#090b1a" }} dangerouslySetInnerHTML={{ __html: ART[a](p.color).replace("<svg ", '<svg style="display:block;width:100%;height:100%" ') }} />
}

export function ProjectWindow({ p, photo }: { p: Project; photo?: string }) {
  const k = LAYOUT[p.title] ?? "A"
  const c = COPY[p.title]
  const alt = !photo && c.art ? `${p.title}: illustration` : undefined

  if (k === "A") {
    return (
      <div style={{ ...fill, background: "#090b1a" }} role={alt ? "img" : undefined} aria-label={alt}>
        <div style={{ ...fill, bottom: "12cqw" }}><Picture p={p} photo={photo} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "3cqw 5cqw", background: "#0b0d1f", borderTop: "1px solid #2a3157", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "3cqw" }}>
          <div><div style={tag}>{p.tag}</div><div style={{ marginTop: "0.8cqw" }}><Fig p={p} /></div></div>
          <div style={{ ...line, maxWidth: "38ch" }}>{c.line}</div>
        </div>
      </div>
    )
  }

  if (k === "B") {
    return (
      <div style={{ ...fill, display: "grid", gridTemplateColumns: "58% 1fr", background: "#0b0d1f" }}>
        <div style={{ position: "relative", background: "#090b1a" }} role={alt ? "img" : undefined} aria-label={alt}><Picture p={p} photo={photo} /></div>
        <div style={{ padding: "4cqw", display: "flex", flexDirection: "column", gap: "1.8cqw", minWidth: 0, overflow: "hidden" }}>
          <div style={tag}>{p.tag}</div>
          <Fig p={p} />
          {c.pts.filter(Boolean).map(t => (
            <div key={t} style={{ ...line, position: "relative", paddingLeft: "2.2cqw" }}>
              <span aria-hidden style={{ position: "absolute", left: 0, top: "0.7em", width: "1.2cqw", minWidth: 8, height: 2, background: p.color }} />
              {t}
            </div>
          ))}
          <div style={{ marginTop: "auto" }}><Chips p={p} /></div>
        </div>
      </div>
    )
  }

  if (k === "C") {
    return (
      <div style={{ ...fill, background: "#090b1a" }}>
        <div style={{ ...fill, opacity: 0.5 }} role={alt ? "img" : undefined} aria-label={alt}><Picture p={p} photo={photo} /></div>
        <div aria-hidden style={{ ...fill, background: "radial-gradient(90% 90% at 0% 100%, rgba(7,8,20,0.94), rgba(7,8,20,0.35) 70%)" }} />
        <div style={{ ...fill, padding: "5cqw", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={tag}>{p.tag}</div>
          <div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(40px, 11cqw, 130px)", lineHeight: 0.9, letterSpacing: "-0.05em", color: p.color, textShadow: `0 0 40px ${p.color}66` }}>{c.fig}</div>
            <div style={{ ...line, margin: "1.6cqw 0 2cqw", maxWidth: "34ch" }}>{c.line}</div>
            <Chips p={p} />
          </div>
        </div>
      </div>
    )
  }

  // D: the picture on a small screen with the figure as a badge
  return (
    <div style={{ ...fill, background: `radial-gradient(100% 100% at 50% 0%, ${p.color}38, #090b1a 70%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.6cqw", padding: "4cqw" }}>
      <div style={{ position: "relative", width: "58%", aspectRatio: "16 / 10", borderRadius: "1.6cqw", border: `2px solid ${p.color}`, boxShadow: "0 0 0 .8cqw rgba(255,255,255,.04), 0 2.4cqw 6cqw rgba(0,0,0,.6)", background: "#090b1a" }}>
        <div style={{ ...fill, overflow: "hidden", borderRadius: "1.4cqw" }} role={alt ? "img" : undefined} aria-label={alt}><Picture p={p} photo={photo} /></div>
        <span style={{ position: "absolute", right: "-2.6cqw", top: "-1.8cqw", background: p.color, color: "#07070f", borderRadius: 999, padding: "0.8cqw 2cqw", fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(14px, 2.4cqw, 24px)" }}>{c.fig}</span>
      </div>
      <div style={{ ...line, textAlign: "center", fontWeight: 500 }}>{c.line}</div>
      <Chips p={p} />
    </div>
  )
}
