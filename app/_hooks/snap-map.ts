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

function build(mobile: boolean, laptopStops = 9): SnapMap {
  const expStops = mobile ? 2 : laptopStops
  const expEnd   = EXP_START_SNAP + expStops - 1
  const gate     = expEnd + 1
  const total    = gate + 1 + DEMO_CARDS.length + 1
  return { mobile, expStops, expEnd, gate, total, starts: [0, SNAP_EDU, SNAP_PROJECTS, SNAP_SKILLS, EXP_START_SNAP, gate, total - 1] }
}
const PHONE = build(true)
const serverMap = build(false)
// On a laptop the experience stage is as long as its content (so the column moves 1:1 with the wheel); the stage
// measures itself and reports its length here. Maps are cached per length so snapshots stay referentially stable.
const laptopMaps = new Map<number, SnapMap>()
let laptopStops = 9
const laptop = (): SnapMap => { let m = laptopMaps.get(laptopStops); if (!m) { m = build(false, laptopStops); laptopMaps.set(laptopStops, m) } return m }
const listeners = new Set<() => void>()
export function setLaptopExpStops(n: number) {
  n = Math.max(2, Math.min(16, Math.round(n)))
  if (n === laptopStops) return
  laptopStops = n
  listeners.forEach(l => l())
}

/** The map for this device, read at call time (client only; the server assumes a laptop). */
export const snapMapNow = (): SnapMap => (typeof window !== "undefined" && window.innerWidth < 768 ? PHONE : laptop())

const subscribe = (cb: () => void) => { window.addEventListener("resize", cb); listeners.add(cb); return () => { window.removeEventListener("resize", cb); listeners.delete(cb) } }
export const useSnapMap = (): SnapMap => useSyncExternalStore(subscribe, snapMapNow, () => serverMap)

// Where each stop sits along the laptop experience stage, as a 0–1 fraction (published by the stage once measured)
let stopFractions: number[] | null = null
export function setStopFractions(f: number[]) { stopFractions = f }
/** Smoothly scroll the laptop timeline so stop `i` is in the middle. */
export function scrollToStop(i: number) {
  const m = snapMapNow()
  const f = stopFractions?.[i] ?? 0
  window.scrollTo({ top: (EXP_START_SNAP + f * (m.expStops - 1)) * window.innerHeight, behavior: "smooth" })
}
