"use client"

import { useSyncExternalStore } from "react"

/**
 * Where each section sits in the page's scroll budget (one snap = 100vh).
 * hero 0 · education 1 · projects(KovilLens) 2 · skills 3 · experience · projects reel · footer.
 * Two stages measure themselves and report their length, so the page is exactly as long as its content:
 *  - experience: a laptop walks the stops column; a phone shows one tall timeline (as tall as its labels need, at least 2 screens)
 *  - the reel: the project clips slide sideways while the page scrolls down
 */
export const SNAP_EDU       = 1
export const SNAP_PROJECTS  = 2
export const SNAP_SKILLS    = 3
export const EXP_START_SNAP = 4

export interface SnapMap {
  mobile:    boolean
  expStops:  number      // snaps in the experience stage
  expEnd:    number      // last experience snap
  reelStart: number      // first snap of the projects reel
  reelSnaps: number      // length of the reel stage, in snaps
  reelEnd:   number      // last snap of the reel stage (the footer arrives after it)
  total:     number      // snaps in the whole page
  starts:    number[]    // section starts, for the arrows / analytics
}

function build(mobile: boolean, laptopStops: number, reelSnaps: number, phoneStops = 2): SnapMap {
  const expStops  = mobile ? phoneStops : laptopStops
  const expEnd    = EXP_START_SNAP + expStops - 1
  const reelStart = expEnd + 1
  const reelEnd   = reelStart + reelSnaps
  const total     = reelEnd + 2
  return { mobile, expStops, expEnd, reelStart, reelSnaps, reelEnd, total, starts: [0, SNAP_EDU, SNAP_PROJECTS, SNAP_SKILLS, EXP_START_SNAP, reelStart, total - 1] }
}

// Maps are cached per (device, lengths) so snapshots stay referentially stable.
const cache = new Map<string, SnapMap>()
let laptopStops = 9
let phoneStops  = 2
let reelSnaps   = 6
const get = (mobile: boolean): SnapMap => {
  const key = `${mobile}-${laptopStops}-${reelSnaps}-${phoneStops}`
  let m = cache.get(key)
  if (!m) { m = build(mobile, laptopStops, reelSnaps, phoneStops); cache.set(key, m) }
  return m
}
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())

export function setLaptopExpStops(n: number) {
  n = Math.max(2, Math.min(16, Math.round(n)))
  if (n === laptopStops) return
  laptopStops = n; emit()
}
/** The phone timeline is as many screens tall as its labels need (at least two). */
export function setPhoneExpStops(n: number) {
  n = Math.max(2, Math.min(8, Math.round(n)))
  if (n === phoneStops) return
  phoneStops = n; emit()
}
export function setReelSnaps(n: number) {
  n = Math.max(2, Math.min(16, Math.round(n)))
  if (n === reelSnaps) return
  reelSnaps = n; emit()
}

/** The map for this device, read at call time (client only; the server assumes a laptop). */
export const snapMapNow = (): SnapMap => get(typeof window !== "undefined" && window.innerWidth < 768)

const subscribe = (cb: () => void) => { window.addEventListener("resize", cb); listeners.add(cb); return () => { window.removeEventListener("resize", cb); listeners.delete(cb) } }
const serverMap = build(false, 9, 6)
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
