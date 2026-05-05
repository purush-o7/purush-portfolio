"use client"

import { useScrollSnap } from "../_hooks/use-scroll-snap"

export function ScrollSnap({ sections }: { sections: number }) {
  useScrollSnap(sections)
  return null
}
