import { CampusArt } from "./campus-parallax"

export function EducationSection() {
  return (
    <section className="flex h-screen w-screen bg-[#07070f] overflow-hidden">

      {/* ── LEFT — campus line art ───────────────────────────────────────── */}
      <div className="relative w-3/5 h-full">
        <CampusArt />
      </div>

      {/* ── RIGHT — education details ────────────────────────────────────── */}
      <div className="flex flex-col justify-center w-2/5 h-full px-10 py-16 gap-8">

        <p className="font-mono text-xs tracking-[0.3em] uppercase text-white/35">
          Education
        </p>

        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-white">
            Amrita
          </h2>
          <h3 className="font-heading text-4xl font-light leading-[1.1] tracking-tight text-white/50">
            Vishwa Vidyapeetham
          </h3>
        </div>

        <div className="w-10 h-px bg-white/20" />

        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-widest uppercase text-white/40">
            B.Tech · Computer Science & Engineering
          </p>
          <p className="font-mono text-xs tracking-widest uppercase text-white/30">
            Amritapuri, Kerala
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between max-w-[200px]">
            <span className="font-mono text-xs text-white/35 uppercase tracking-widest">Period</span>
            <span className="text-sm text-white/70">2020 – 2024</span>
          </div>
          <div className="flex items-baseline justify-between max-w-[200px]">
            <span className="font-mono text-xs text-white/35 uppercase tracking-widest">CGPA</span>
            <span className="text-sm text-white/70">7.96 / 10</span>
          </div>
        </div>

      </div>
    </section>
  )
}
