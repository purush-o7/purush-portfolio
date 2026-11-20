"use client"

import { usePageScroll } from "../_hooks/use-page-scroll"
import { useSnapMap }    from "../_hooks/snap-map"

/** Renders the page's scroll budget (one 100vh spacer per screen, length depends on the device) and runs the small page-scroll hook. */
export function PageScroll() {
  const { total } = useSnapMap()
  usePageScroll()
  return <>{Array.from({ length: total }, (_, i) => <div key={i} style={{ height: "100vh" }} />)}</>
}
