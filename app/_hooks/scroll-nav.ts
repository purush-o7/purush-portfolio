"use client"

// Section start snap indices — must match page.tsx scroll positions
// Each index = the snap where the section is FULLY visible
import { snapMapNow } from "./snap-map"

/** Section start snaps for this device: hero, education, projects, skills, experience, journey gate, footer. */
export const sectionStarts = () => snapMapNow().starts

let _goTo:      ((idx: number) => void) | null = null
let _getCurrent: (() => number) | null         = null

export function registerNav(
  goTo:       (idx: number) => void,
  getCurrent: () => number,
) {
  _goTo       = goTo
  _getCurrent = getCurrent
}

// Jump straight to a snap index (used by the Journey dots / gate button)
export function navToIndex(idx: number) {
  if (_goTo) _goTo(idx)
}

export function navSection(dir: 1 | -1) {
  if (!_goTo || !_getCurrent) return
  const cur = _getCurrent()

  if (dir > 0) {
    const next = sectionStarts().find(s => s > cur)
    if (next !== undefined) _goTo(next)
  } else {
    const prev = [...sectionStarts()].reverse().find(s => s < cur)
    if (prev !== undefined) _goTo(prev)
  }
}
