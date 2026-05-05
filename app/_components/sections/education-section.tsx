import { CampusArt } from "./campus-parallax"

const N = 14   // number of chevron teeth
const V = 32   // tooth depth in px

function zigzagFillPoints(): string {
  const pts = Array.from({ length: N * 2 + 1 }, (_, i) => {
    const y = ((i / (N * 2)) * 100).toFixed(4)
    return `${i % 2 === 0 ? V : 0},${y}`
  })
  return [...pts, "9999,100", "9999,0"].join(" ")
}

function zigzagStrokePoints(): string {
  return Array.from({ length: N * 2 + 1 }, (_, i) => {
    const y = ((i / (N * 2)) * 100).toFixed(4)
    return `${i % 2 === 0 ? V : 0},${y}`
  }).join(" ")
}

export function EducationSection() {
  return (
    <div className="relative w-full h-full">
      <CampusArt />

      {/*
        Zigzag border — lives inside the campus art container (z-10) so it
        never covers the right panel components (z-11+). Arms sit at the
        container's right edge (60%vw); tips bite V px into the campus art.
        The black polygon extends far right with overflow:visible so the
        teeth visually cover the border area.
      */}
      {/* Hidden on mobile — horizontal zigzag lives in EducationRightCard instead */}
      <div
        className="hidden md:block"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: `${V}px`,
        }}
      >
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}
          viewBox={`0 0 ${V} 100`}
          preserveAspectRatio="none"
        >
          {/* Black filled teeth covering from zigzag edge rightward */}
          <polygon
            points={zigzagFillPoints()}
            fill="#07070f"
          />
          {/* Thin white edge for definition */}
          <polyline
            points={zigzagStrokePoints()}
            stroke="rgba(255,255,255,0.20)"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}
