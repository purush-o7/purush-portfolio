"use client"

// Section start snap indices — must match page.tsx scroll positions
export const SECTION_STARTS = [0, 1, 2, 4, 9, 17]

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
