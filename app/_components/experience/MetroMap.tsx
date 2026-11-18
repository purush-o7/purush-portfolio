"use client"

import { LANES, STOPS, MONTHS, T_START, type Today } from "./stops"
import { MONO } from "./RoleContent"

const HEAD = "var(--font-heading)"
const W = 360
const AX = 40                          // ruler x
const LX = (l: number) => 94 + l * 27  // lane x
const LABEL_X = 232

/**
 * The career as a metro map on a real time scale. Time runs down the ruler (years and months, up to
 * the current month); each line is a track; each stop is a numbered station. Stops after the current
 * one are dimmed, so scrolling "walks" the line.
 */
/** y of each stop's station in the map's own coordinates, for a given height (so a parent can tell which stop is nearest). */
export function stopYs(H: number, today: Today): number[] {
  const span = today.end - T_START
  return STOPS.map(s => 20 + ((s.from - T_START) / span) * (H - 40))
}

export function MetroMap({ sel, onSel, today, H = 540, gap = 38, big = false, dimFuture = true }: {
  sel: number; onSel: (i: number) => void; today: Today
  H?: number; gap?: number; big?: boolean; dimFuture?: boolean      // tall mode: more room between labels, larger type
}) {
  const span = today.end - T_START
  const tp   = (t: number) => 20 + ((t - T_START) / span) * (H - 40)
  const n    = STOPS.length

  // labels sit in a column on the right; spread so none overlap
  const labelY: number[] = []
  const order = STOPS.map((_, i) => i).sort((a, b) => tp(STOPS[a].from) - tp(STOPS[b].from))
  let prev = -99
  order.forEach(i => { const y = Math.max(tp(STOPS[i].from), prev + gap); labelY[i] = y; prev = y })
  const over = labelY[order[n - 1]] - (H - 14)
  if (over > 0) for (let k = n - 1, lim = H - 14; k >= 0; k--) { labelY[order[k]] = Math.min(labelY[order[k]], lim); lim = labelY[order[k]] - gap }

  const ticks: React.ReactNode[] = []
  for (let y = T_START; y <= Math.ceil(today.end); y++) {
    for (let m = 0; m < 12; m++) {
      const t = y + m / 12
      if (t > today.end + 0.001) break
      const p = tp(t), major = m === 0, q = m % 3 === 0
      ticks.push(
        <g key={`${y}-${m}`}>
          <line x1={AX} y1={p} x2={AX + (major ? 12 : q ? 7 : 4)} y2={p} stroke={major ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.28)"} />
          {major && <text x={AX - 7} y={p + 4} textAnchor="end" fill="#e8ecf5" style={{ font: `700 12.5px ${MONO}` }}>{y}</text>}
          {!major && q && <text x={AX + 12} y={p + 3.5} fill="#7f87a6" style={{ font: `500 9.5px ${MONO}` }}>{MONTHS[m]}</text>}
        </g>
      )
    }
  }

  const s0 = STOPS[sel]
  const sc = LANES[s0.lane].color
  const nowY = tp(today.now)
  const end  = (s: (typeof STOPS)[number]) => (s.ongoing ? today.now : s.to)   // ongoing stints run up to today

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label="Career timeline on a real time scale"
      style={{ width: "100%", height: "100%", display: "block", userSelect: "none" }}>

      <style>{`@keyframes mm-pulse{0%{r:11;opacity:.8}100%{r:24;opacity:0}} @media (prefers-reduced-motion:reduce){*{animation:none!important}}`}</style>

      {/* lane guides */}
      {LANES.map((l, i) => <line key={l.name} x1={LX(i)} y1={12} x2={LX(i)} y2={H - 8} stroke="rgba(255,255,255,0.07)" strokeDasharray="2 5" />)}

      {/* ruler */}
      <line x1={AX} y1={tp(T_START)} x2={AX} y2={tp(today.end)} stroke="rgba(255,255,255,0.45)" />
      {ticks}

      {/* now */}
      <line x1={AX} y1={nowY} x2={W - 6} y2={nowY} stroke="#fff" strokeOpacity={0.3} strokeDasharray="3 4" />
      <rect x={AX + 22} y={nowY - 9} width={104} height={18} rx={9} fill="#fff" />
      <text x={AX + 74} y={nowY + 4} textAnchor="middle" fill="#07070f" style={{ font: `700 10px ${MONO}` }}>NOW · {today.label.toUpperCase()}</text>
      <circle cx={AX} cy={nowY} r={4} fill="#fff" />

      {/* selected stint → its span on the ruler + a guide across */}
      <line x1={AX} y1={tp(s0.from)} x2={LX(s0.lane)} y2={tp(s0.from)} stroke={sc} strokeOpacity={0.6} strokeDasharray="2 4" />
      <line x1={AX} y1={tp(s0.from)} x2={AX} y2={tp(Math.max(end(s0), s0.from + 0.04))} stroke={sc} strokeWidth={5} strokeLinecap="round" />

      {/* stint bars */}
      {STOPS.map((s, i) => end(s) > s.from && (
        <line key={i} x1={LX(s.lane)} y1={tp(s.from)} x2={LX(s.lane)} y2={tp(end(s))} stroke={LANES[s.lane].color} strokeWidth={7} strokeLinecap="round"
          opacity={!dimFuture || i <= sel ? 1 : 0.35} style={{ transition: "opacity .3s" }} />
      ))}

      {/* stations */}
      {STOPS.map((s, i) => {
        const x = LX(s.lane), y = tp(s.from), c = LANES[s.lane].color
        const on = i === sel, reached = !dimFuture || i <= sel
        return (
          <g
            key={i} role="button" tabIndex={0} aria-label={`${i + 1}. ${s.title}, ${s.period}`} aria-current={on ? "step" : undefined}
            onClick={() => onSel(i)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSel(i) } }}
            style={{ cursor: "pointer", outline: "none", opacity: reached ? 1 : 0.5, transition: "opacity .3s" }}
          >
            <polyline points={`${x + 13},${y} 214,${y} 222,${labelY[i]}`} fill="none" stroke="rgba(255,255,255,0.14)" />
            {on && <circle cx={x} cy={y} r={11} fill="none" stroke={c} strokeWidth={2} style={{ animation: "mm-pulse 1.8s ease-out infinite" }} />}
            <circle cx={x} cy={y} r={12} fill={on ? c : "#07070f"} stroke={c} strokeWidth={3} />
            <text x={x} y={y + 4} textAnchor="middle" fill={on ? "#06121a" : "#fff"} style={{ font: `700 11px ${MONO}` }}>{i + 1}</text>
            <text x={LABEL_X} y={labelY[i] - 1} fill={on ? "#fff" : "#c9cfe3"} style={{ font: `${on ? 700 : 600} ${big ? 17 : 15}px ${HEAD}` }}>{s.short}</text>
            <text x={LABEL_X} y={labelY[i] + (big ? 16 : 14)} fill="#a0a7c0" style={{ font: `500 ${big ? 13 : 11.5}px ${MONO}` }}>{s.when}</text>
            <circle cx={x} cy={y} r={20} fill="transparent" />
            <rect x={LABEL_X - 4} y={labelY[i] - 17} width={122} height={36} fill="transparent" />
          </g>
        )
      })}
    </svg>
  )
}

export function LaneKey() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
      {LANES.map(l => (
        <span key={l.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
          <i style={{ width: 12, height: 4, borderRadius: 2, background: l.color, display: "inline-block" }} />{l.name}
        </span>
      ))}
    </div>
  )
}
