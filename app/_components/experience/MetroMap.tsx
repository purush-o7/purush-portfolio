"use client"

import { LANES, STOPS, MONTHS, T_START, monthYear, type Today } from "./stops"
import { MONO } from "./RoleContent"

const HEAD = "var(--font-heading)"
const W = 360
const AX = 40                          // ruler x
const LX = (l: number) => 94 + l * 27  // lane x
const LABEL_X = 232
/** Break a label onto lines of at most `max` characters, at spaces. */
const wrap = (t: string, max = 14) => t.split(" ").reduce<string[]>((ls, w) => { const l = ls[ls.length - 1]; if (l !== undefined && (l + " " + w).length <= max) ls[ls.length - 1] = l + " " + w; else ls.push(w); return ls }, [])

// Every station and every promotion is a mark on its line. Labels sit in a column on the right.
interface Mark { key: string; stop: number; t: number; lane: number; title: string; co?: string; sub: string; promo?: boolean }
const MARKS: Mark[] = []
STOPS.forEach((st, i) => {
  MARKS.push({ key: `s${i}`, stop: i, t: st.from, lane: st.lane, title: st.short, co: st.co, sub: st.when })
  st.steps?.forEach((step, k) => { if (k > 0 && st.stepFrom) MARKS.push({ key: `p${i}-${k}`, stop: i, t: st.stepFrom[k], lane: st.lane, title: step, sub: monthYear(st.stepFrom[k]), promo: true }) })
})

/** Label geometry: a label is its title (one or two lines), then an optional company line, then the date. */
function geom(big: boolean) {
  const titleLH = big ? 18 : 16, coLH = big ? 15 : 13, subLH = big ? 15 : 13
  const showCo  = (m: Mark) => !m.promo && !!m.co && (big || m.lane === 4)         // laptop is tighter: companies only on the Work line there
  const linesOf = (m: Mark) => (m.promo ? [m.title] : wrap(m.title))
  const above   = (m: Mark) => (linesOf(m).length - 1) * titleLH
  const below   = (m: Mark) => (showCo(m) ? coLH : 0) + subLH
  const need    = (p: Mark, n: Mark) => below(p) + titleLH + above(n) + 5          // least distance between two title baselines
  return { titleLH, coLH, subLH, showCo, linesOf, above, below, need }
}

/**
 * The time scale. Linear by default (laptop). With `baseH` it is elastic (phone): each stretch of time between two marks gets
 * its natural share of `baseH`, or the room its two labels need if that is more. So the map grows only where marks crowd together.
 */
function stretches(today: Today, baseH: number, big: boolean) {
  const span = today.end - T_START, g = geom(big)
  const ord = [...MARKS].sort((a, b) => a.t - b.t)
  const ts = [T_START, ...ord.map(m => m.t), today.end]
  const lens: number[] = []
  for (let k = 0; k < ts.length - 1; k++) {
    const dt = ts[k + 1] - ts[k]
    const nat = ((baseH - 40) * dt) / span
    const req = k >= 1 && k <= ord.length - 1 && dt > 0.001 ? g.need(ord[k - 1], ord[k]) : 0
    lens.push(Math.max(nat, req))
  }
  return { ts, lens, total: lens.reduce((a, b) => a + b, 0) }
}

/** Height (map units) an elastic map needs so every label has room. */
export function elasticHeight(today: Today, baseH: number, big: boolean): number {
  return Math.ceil(stretches(today, baseH, big).total + 40)
}

/** time → y, for a map of height H. */
export function makeScale(today: Today, H: number, big = false, baseH?: number): (t: number) => number {
  const span = today.end - T_START
  if (!baseH) return t => 20 + ((t - T_START) / span) * (H - 40)
  const { ts, lens, total } = stretches(today, baseH, big)
  const f = (H - 40) / total
  const start: number[] = []
  lens.reduce((acc, l, k) => { start[k] = acc; return acc + l }, 0)
  return t => {
    let k = ts.length - 2
    for (let i = 0; i < ts.length - 1; i++) if (t <= ts[i + 1]) { k = i; break }
    const dt = ts[k + 1] - ts[k]
    const u = dt > 0 ? Math.max(0, Math.min(1, (t - ts[k]) / dt)) : 0
    return 20 + f * (start[k] + lens[k] * u)
  }
}

/**
 * The career as a metro map on a real time scale. Time runs down the ruler (years and months, up to
 * the current month); each line is a track; each stop is a numbered station. Stops after the current
 * one are dimmed, so scrolling "walks" the line.
 */
/** y of each stop's station in the map's own coordinates, for a given height (so a parent can tell which stop is nearest). */
export function stopYs(H: number, today: Today, big = false, baseH?: number): number[] {
  const tp = makeScale(today, H, big, baseH)
  return STOPS.map(st => tp(st.from))
}

export function MetroMap({ sel, onSel, today, H = 540, big = false, dimFuture = true, baseH }: {
  sel: number; onSel: (i: number) => void; today: Today
  H?: number; big?: boolean; dimFuture?: boolean; baseH?: number      // tall mode: more room between labels, larger type; baseH makes the time scale elastic
}) {
  const tp   = makeScale(today, H, big, baseH)

  const marks = MARKS
  const { titleLH, coLH, subLH, showCo, linesOf, above, below, need } = geom(big)
  // Place the labels as close to their marks as possible while keeping every label clear of its neighbours. Promotion labels
  // are weighted heavily so they stay level with their diamonds; the other labels give way first (weighted isotonic fit).
  const labelY: number[] = []
  const order = marks.map((_, i) => i).sort((a, b) => tp(marks[a].t) - tp(marks[b].t))
  const cum: number[] = [0]
  for (let k = 1; k < order.length; k++) cum[k] = cum[k - 1] + need(marks[order[k - 1]], marks[order[k]])
  const blocks: { w: number; s: number; n: number }[] = []
  order.forEach((mi, k) => {
    const w = marks[mi].promo ? 40 : 1
    blocks.push({ w, s: w * (tp(marks[mi].t) - cum[k]), n: 1 })
    while (blocks.length > 1) {
      const q = blocks[blocks.length - 1], p = blocks[blocks.length - 2]
      if (p.s / p.w <= q.s / q.w) break
      blocks.splice(blocks.length - 2, 2, { w: p.w + q.w, s: p.s + q.s, n: p.n + q.n })
    }
  })
  let at = 0
  blocks.forEach(bl => { for (let j = 0; j < bl.n; j++, at++) labelY[order[at]] = bl.s / bl.w + cum[at] })
  const firstI = order[0], lastI = order[order.length - 1]
  const lo = 14 + above(marks[firstI]), hi = H - 6 - below(marks[lastI])
  const lift = Math.max(0, lo - labelY[firstI])                                   // keep inside the top edge
  order.forEach(i => { labelY[i] += lift })
  const drop = Math.max(0, labelY[lastI] - hi)                                    // and inside the bottom edge
  order.forEach(i => { labelY[i] -= drop })

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

      {/* stations and promotion milestones */}
      {marks.map((mk, i) => {
        const st = STOPS[mk.stop]
        const x = LX(mk.lane), y = tp(mk.t), c = LANES[mk.lane].color
        const on = mk.stop === sel, reached = !dimFuture || mk.stop <= sel
        const lines = linesOf(mk)
        const top = labelY[i] - 1 - above(mk)
        const co  = showCo(mk)
        const coY = labelY[i] + coLH, subY = labelY[i] + (co ? coLH + subLH : subLH)
        return (
          <g
            key={mk.key} role="button" tabIndex={0} aria-label={mk.promo ? `${mk.title}, ${mk.sub}, at ${st.co}` : `${mk.stop + 1}. ${st.title}, ${st.co}, ${st.period}`} aria-current={on && !mk.promo ? "step" : undefined}
            onClick={() => onSel(mk.stop)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSel(mk.stop) } }}
            style={{ cursor: "pointer", outline: "none", opacity: reached ? 1 : 0.5, transition: "opacity .3s" }}
          >
            <polyline points={`${x + (mk.promo ? 8 : 13)},${y} 214,${y} 222,${labelY[i]}`} fill="none" stroke="rgba(255,255,255,0.14)" />
            {mk.promo ? (
              <>
                <rect x={x - 6.5} y={y - 6.5} width={13} height={13} rx={2} transform={`rotate(45 ${x} ${y})`} fill={c} stroke="#07070f" strokeWidth={2} />
              </>
            ) : (
              <>
                {on && <circle cx={x} cy={y} r={11} fill="none" stroke={c} strokeWidth={2} style={{ animation: "mm-pulse 1.8s ease-out infinite" }} />}
                <circle cx={x} cy={y} r={12} fill={on ? c : "#07070f"} stroke={c} strokeWidth={3} />
                <text x={x} y={y + 4} textAnchor="middle" fill={on ? "#06121a" : "#fff"} style={{ font: `700 11px ${MONO}` }}>{mk.stop + 1}</text>
              </>
            )}
            <text x={LABEL_X} y={top} fill={on ? "#fff" : "#c9cfe3"} style={{ font: `${on && !mk.promo ? 700 : 600} ${mk.promo ? (big ? 15 : 13) : big ? 17 : 15}px ${HEAD}` }}>
              {lines.map((ln, k) => <tspan key={k} x={LABEL_X} dy={k === 0 ? 0 : titleLH}>{ln}</tspan>)}
            </text>
            {co && <text x={LABEL_X} y={coY} fill={c} fillOpacity={on ? 1 : 0.85} style={{ font: `600 ${big ? 12.5 : 11}px ${MONO}`, letterSpacing: "0.02em" }}>{mk.co}</text>}
            <text x={LABEL_X} y={subY} fill="#a0a7c0" style={{ font: `500 ${big ? 13 : 11.5}px ${MONO}` }}>{mk.sub}</text>
            <circle cx={x} cy={y} r={20} fill="transparent" />
            <rect x={LABEL_X - 4} width={122} height={above(mk) + 18 + below(mk)} y={labelY[i] - 17 - above(mk)} fill="transparent" />
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
