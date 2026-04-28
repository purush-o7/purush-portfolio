import { CanvasWrapper } from "./_components/canvas-wrapper"
import { BioPanel } from "./_components/bio-panel"

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#07070f]">
      {/* LEFT — 2/3 canvas */}
      <section className="relative w-2/3 h-full">
        <CanvasWrapper />
      </section>

      {/* divider */}
      <div className="w-px h-full bg-white/[0.06] shrink-0" />

      {/* RIGHT — 1/3 bio */}
      <section className="w-1/3 h-full overflow-y-auto">
        <BioPanel />
      </section>
    </main>
  )
}
