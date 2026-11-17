"use client"

import { useEffect, useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { type ExperienceEntry } from "./data"
import { RoleContent, MONO }    from "./RoleContent"

const SNAPS = [0.6, 1] as const

interface Props {
  entry:   ExperienceEntry
  onClose: () => void
}

/**
 * Phone role details — the shadcn Drawer (vaul) with two snap points (60% / full).
 * Drag the handle, tap the backdrop or press Esc to dismiss. `data-no-scroll-snap`
 * keeps the page snap engine out of every gesture on it.
 */
export function RoleSheet({ entry, onClose }: Props) {
  const [open, setOpen] = useState(true)
  const [snap, setSnap] = useState<number | string | null>(SNAPS[0])

  // Hide the floating section arrows while the sheet is open so they can't cover it or navigate away
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-section-nav]")
    if (!nav) return
    nav.style.opacity       = "0"
    nav.style.pointerEvents = "none"
    return () => { nav.style.opacity = ""; nav.style.pointerEvents = "" }
  }, [])

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      onAnimationEnd={o => { if (!o) onClose() }}
      snapPoints={[...SNAPS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      noBodyStyles
    >
      <DrawerContent
        data-no-scroll-snap="true"
        className="h-full max-h-[96%] border-white/10 bg-[#0d0f22] text-white"
        style={{ borderTopColor: `${entry.accent}66` }}
      >
        <div className="shrink-0 px-5 pb-3 pt-3">
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: entry.accent }}>
            {entry.tag}
          </span>
          <DrawerTitle
            style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, lineHeight: 1.15, margin: "6px 0 4px", color: "#fff" }}
          >
            {entry.role}
          </DrawerTitle>
          <DrawerDescription style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.62)" }}>
            {entry.org} · {entry.period}
          </DrawerDescription>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {entry.tech.slice(0, 6).map(t => (
              <span key={t} style={{
                fontFamily: MONO, fontSize: 11, padding: "2px 8px", borderRadius: 4,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)",
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Details — scrolls once the sheet is at its full snap point */}
        <div
          data-scroll-passthrough
          onWheel={e => { e.currentTarget.scrollTop += e.deltaY }}
          className="min-h-0 flex-1 px-5"
          style={{
            overflowY: snap === SNAPS[SNAPS.length - 1] ? "auto" : "hidden",
            overscrollBehavior: "contain",
            paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <RoleContent entry={entry} compact />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
