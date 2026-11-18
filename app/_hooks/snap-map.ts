/**
 * Where each section sits in the page's scroll budget (one snap = 100vh).
 * hero 0 · education 1 · projects 2 · skills 3 · experience (one snap per stop) · journey gate · its projects · footer
 */
export const SNAP_EDU        = 1
export const SNAP_PROJECTS   = 2
export const SNAP_SKILLS     = 3
export const EXP_START_SNAP  = 4
export const EXP_STOPS       = 9                              // metro stations — must equal STOPS.length in experience/stops.ts
export const EXP_END_SNAP    = EXP_START_SNAP + EXP_STOPS - 1 // last experience snap
export const GATE_SNAP       = EXP_END_SNAP + 1               // journey gateway
