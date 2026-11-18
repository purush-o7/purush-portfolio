"use client"

import { useScrollSnap } from "../_hooks/use-scroll-snap"
import { useSnapMap }    from "../_hooks/snap-map"

/** Runs the scroll engine and renders the page's scroll budget: one 100vh spacer per snap (length depends on the device). */
export function ScrollSnap() {
  const { total } = useSnapMap()
  useScrollSnap(total)
  return <>{Array.from({ length: total }, (_, i) => <div key={i} style={{ height: "100vh" }} />)}</>
}
