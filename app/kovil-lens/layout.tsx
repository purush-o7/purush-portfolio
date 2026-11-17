import type { Metadata } from "next"

export const metadata: Metadata = {
  title:       "KovilLens — 3D Explorer",
  description: "Explore KovilLens, a mixed-reality preservation of Moovar Kovil — a 9th-century Chola temple — in full-screen 3D, with the HoloLens 2 point of view.",
  alternates:  { canonical: "/kovil-lens" },
}

// A dedicated full-space route: no shared chrome, the page owns the whole viewport.
export default function KovilLensLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
