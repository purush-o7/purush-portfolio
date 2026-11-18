"use client"

import { ALL_ENTRIES, type ExperienceEntry } from "./data"
import { LANES, type Stop } from "./stops"
import { RoleSheet } from "./RoleSheet"

/** Bottom sheet (shadcn Drawer) for any stop: the full role for jobs, a short summary for milestones. */
export function StopSheet({ stop, onClose }: { stop: Stop; onClose: () => void }) {
  const lane = LANES[stop.lane]
  const entry: ExperienceEntry = stop.entry !== undefined
    ? ALL_ENTRIES[stop.entry]
    : {
        role: stop.title, short: stop.short, org: stop.org, period: stop.period, duration: "", tag: lane.name, accent: lane.color,
        highlights: [stop.line, ...stop.facts], tech: [], sections: [],
      }
  return <RoleSheet entry={entry} onClose={onClose} />
}
