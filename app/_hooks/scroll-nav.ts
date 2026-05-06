"use client"

// Section start snap indices — must match page.tsx scroll positions
// Each index = the snap where the section is FULLY visible
// Hero=0, Education=1, Projects=3 (entry runs 2→3), Experience=4, Cylinder=9, Footer=17
export const SECTION_STARTS = [0, 1, 3, 4, 9, 17]

let _goTo:      ((idx: number) => void) | null = null
let _getCurrent: (() => number) | null         = null

export function registerNav(
  goTo:       (idx: number) => void,
  getCurrent: () => number,
) {
  _goTo       = goTo
  _getCurrent = getCurrent
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
