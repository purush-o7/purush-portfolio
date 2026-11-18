"use client"

// Section start snap indices — must match page.tsx scroll positions
// Each index = the snap where the section is FULLY visible
import { SNAP_EDU, SNAP_PROJECTS, SNAP_SKILLS, EXP_START_SNAP, GATE_SNAP } from "./snap-map"

// Hero, Education, Projects, Skills, Experience, Journey gateway, Footer (footer = last snap)
export const SECTION_STARTS = [0, SNAP_EDU, SNAP_PROJECTS, SNAP_SKILLS, EXP_START_SNAP, GATE_SNAP, GATE_SNAP + 8]

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
    const next = SECTION_STARTS.find(s => s > cur)
    if (next !== undefined) _goTo(next)
  } else {
    const prev = [...SECTION_STARTS].reverse().find(s => s < cur)
    if (prev !== undefined) _goTo(prev)
  }
}
