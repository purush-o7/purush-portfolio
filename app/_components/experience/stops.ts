"use client"

import { useSyncExternalStore } from "react"

export const LANES = [
  { name: "Study",       color: "#3B82F6" },
  { name: "Internships", color: "#10B981" },
  { name: "Research",    color: "#8B5CF6" },
  { name: "Teaching",    color: "#F59E0B" },
  { name: "Work",        color: "#22E5F0" },
] as const

export interface Stop {
  short: string; title: string; org: string; year: string; period: string
  lane: number; line: string; facts: string[]
  from: number; to: number; when: string     // decimal years (2022.17 = Mar 2022); `when` = start label
  /** Index into ALL_ENTRIES for stops that have a full role page. */
  entry?: number
  /** Title progression within one job, oldest → newest. */
  steps?: string[]
  /** Still happening: the bar runs up to today. */
  ongoing?: boolean
}

/** The career, in order. One stop per experience snap. */
export const STOPS: Stop[] = [
  { short: "B.Tech begins",  title: "B.Tech begins",                 org: "Amrita Vishwa Vidyapeetham",        year: "2020", period: "2020",                lane: 0, line: "Four years of Computer Science and Engineering at Amritapuri, Kerala.",                  facts: ["Amritapuri, Kerala"],                      from: 2020.6,  to: 2024.4,  when: "2020" },
  { short: "Cloud Intern",   title: "Cloud Computing Intern",        org: "FutureSkills Prime · Azure",         year: "2022", period: "Mar – Jun 2022",      lane: 1, line: "Shipped talkToLocals, a cloud-native platform on five Azure services.",                  facts: ["+30% guide-match efficiency", "5 Azure services"], from: 2022.167, to: 2022.5,  when: "Mar 2022", entry: 4 },
  { short: "Dev Intern",     title: "Software Developer Intern",     org: "ICTS, Amrita School of Computing",   year: "2022", period: "Dec 2022 – May 2023", lane: 1, line: "Built a neonatal care app and a natural-language-to-SQL system for clinicians.",         facts: ["3× faster queries", "~40% faster diagnosis"],      from: 2022.917, to: 2023.417, when: "Dec 2022", entry: 2 },
  { short: "Research Asst.", title: "University Research Assistant",  org: "Amrita Centre for Wireless Networks", year: "2023", period: "Feb – May 2023",     lane: 2, line: "Built KovilLens, a HoloLens 2 heritage platform for a 9th-century Chola temple.",         facts: ["15 → 60 fps", "HoloLens 2"],                      from: 2023.083, to: 2023.417, when: "Feb 2023", entry: 3 },
  { short: "Teaching Asst.", title: "Teaching Assistant",            org: "Amrita School of Computing",         year: "2023", period: "Nov 2023 – Mar 2024", lane: 3, line: "Supported Python and DSA courses and mentored students one-on-one every week.",         facts: ["Green++ top grade", "Weekly 1:1 mentoring"],       from: 2023.833, to: 2024.25, when: "Nov 2023", entry: 1 },
  { short: "B.Tech done",    title: "B.Tech completed",              org: "Amrita Vishwa Vidyapeetham",         year: "2024", period: "2024",                lane: 0, line: "Graduated with a B.Tech in Computer Science and Engineering.",                            facts: ["CGPA 7.96 / 10"],                          from: 2024.4,  to: 2024.4,  when: "2024" },
  { short: "Associate SWE",  title: "Associate Software Engineer",   org: "MaTrack Inc.",                       year: "2024", period: "Mar 2024 – Jan 2026", lane: 4, line: "Led a 5-person team building a multi-tenant CRM for U.S. fleet dealerships.",             facts: ["+40% efficiency", "−60% manual comms"],           from: 2024.167, to: 2026.083, when: "Mar 2024", entry: 0, steps: ["Associate SWE", "Software Engineer", "Team Lead"] },
  { short: "IEEE ICVR",      title: "IEEE ICVR 2025",                org: "Published · Wageningen",             year: "2025", period: "2025",                lane: 2, line: "Presented the KovilLens paper at ICVR 2025 in Wageningen.",                              facts: ["Peer-reviewed", "Wageningen"],             from: 2025.5,  to: 2025.5,  when: "2025" },
  { short: "TalkingLands",   title: "AI Full Stack Engineer",        org: "TalkingLands · Bengaluru",           year: "2026", period: "Jul 2026 – Present",  lane: 4, line: "Working as an AI Full Stack Engineer at TalkingLands in Bengaluru.",                      facts: ["Bengaluru", "Current role"],               from: 2026.5,  to: 2026.5,  when: "Jul 2026", ongoing: true },
]

// ── Time ──────────────────────────────────────────────────────────────────────
/** "present" for the current job, "ended" for every other stint, null for single-moment milestones. */
export function stopStatus(s: Stop): "present" | "ended" | null {
  return s.ongoing ? "present" : s.to > s.from ? "ended" : null
}

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
export const T_START = 2020

export interface Today { now: number; end: number; label: string }

const noSub = () => () => {}
/** Today from the client clock; the server snapshot is fixed so hydration matches. */
export function useToday(): Today {
  const k = useSyncExternalStore(
    noSub,
    () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` },
    () => "2026-11-18",
  )
  const [y, m, d] = k.split("-").map(Number)
  return { now: y + (m - 1 + d / 31) / 12, end: Math.max(y + m / 12, 2026.1), label: `${MONTHS[m - 1]} ${y}` }
}
