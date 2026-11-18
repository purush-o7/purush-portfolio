"use client"

import { useSyncExternalStore } from "react"
import { DEMO_CARDS } from "../_components/journey/data"

/**
 * Where each section sits in the page's scroll budget (one snap = 100vh).
 * hero 0 · education 1 · projects 2 · skills 3 · experience · journey gate · its projects · footer.
 * The experience stage is the only part whose length depends on the device: a laptop walks nine stops (one screen each);
 * a phone shows the whole timeline as one tall page, so it needs just two screens of scroll.
 */
export const SNAP_EDU       = 1
export const SNAP_PROJECTS  = 2
export const SNAP_SKILLS    = 3
export const EXP_START_SNAP = 4

export interface SnapMap {
  mobile:   boolean
  expStops: number      // snaps in the experience stage
  expEnd:   number      // last experience snap
  gate:     number      // journey gateway
  total:    number      // snaps in the whole page
  starts:   number[]    // section starts, for the arrows / analytics
}

function build(mobile: boolean): SnapMap {
  const expStops = mobile ? 2 : 9
  const expEnd   = EXP_START_SNAP + expStops - 1
  const gate     = expEnd + 1
  const total    = gate + 1 + DEMO_CARDS.length + 1
  return { mobile, expStops, expEnd, gate, total, starts: [0, SNAP_EDU, SNAP_PROJECTS, SNAP_SKILLS, EXP_START_SNAP, gate, total - 1] }
}
const DESKTOP = build(false)
const PHONE   = build(true)

/** The map for this device, read at call time (client only; the server assumes a laptop). */
export const snapMapNow = (): SnapMap => (typeof window !== "undefined" && window.innerWidth < 768 ? PHONE : DESKTOP)

const subscribe = (cb: () => void) => { window.addEventListener("resize", cb); return () => window.removeEventListener("resize", cb) }
export const useSnapMap = (): SnapMap => useSyncExternalStore(subscribe, snapMapNow, () => DESKTOP)
