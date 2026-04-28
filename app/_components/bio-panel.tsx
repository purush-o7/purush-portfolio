export function BioPanel() {
  return (
    <div className="flex flex-col justify-center h-full px-10 py-16 gap-8">
      {/* eyebrow */}
      <p className="text-xs font-mono tracking-[0.3em] uppercase text-white/35">
        Portfolio
      </p>

      {/* name */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-5xl font-semibold leading-[1.1] tracking-tight text-white">
          Purushottam
        </h1>
        <h2 className="font-heading text-5xl font-light leading-[1.1] tracking-tight text-white/50">
          Reddy
        </h2>
      </div>

      {/* divider */}
      <div className="w-10 h-px bg-white/20" />

      {/* role */}
      <p className="text-sm font-mono tracking-widest uppercase text-white/40">
        Software Engineer
      </p>

      {/* bio */}
      <p className="text-base leading-7 text-white/55 max-w-[26ch]">
        CS engineer turning complex systems into elegant, purposeful software.
      </p>
    </div>
  )
}
