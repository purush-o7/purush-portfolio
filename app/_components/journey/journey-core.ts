// The Journey — projects showcase.
// One gravity-well fabric, seven colour-coded project masses. Enter through a
// gateway → wormhole; cinematic camera flights between projects; the same
// wormhole exits back to the gate. Vanilla Three.js driven by page scrollY
// via setTarget() — the site's scroll-snap engine owns navigation.

import * as THREE from "three"
import { DEMO_CARDS, WEIGHT_COLORS } from "./data"

export interface JourneyOpts {
  onProjectClick?: (title: string) => void
  navToSnap?: (snapIdx: number) => void   // dots / home → page scroll snaps
}

export interface JourneyAPI {
  setTarget: (projectIdx: number) => void // -1 = gate, 0..6 = project
  dispose: () => void
}

const MONO = "var(--font-geist-mono)"
const DISP = "var(--font-heading)"
const GATE_SNAP = 10                      // page snap index of the gateway

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const smoothstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }

function glowTexture(size = 128): THREE.CanvasTexture {
  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")!
  const h = size / 2
  const g = ctx.createRadialGradient(h, h, 0, h, h, h)
  g.addColorStop(0.0, "rgba(255,255,255,1)")
  g.addColorStop(0.22, "rgba(255,255,255,0.65)")
  g.addColorStop(0.55, "rgba(255,255,255,0.18)")
  g.addColorStop(1.0, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

interface Weight {
  x: number; z: number
  col: THREE.Color
  mass: number; massBase: number; r: number
  spr: THREE.Sprite
  base: number
  award: boolean
}

export function initJourney(container: HTMLElement, opts: JourneyOpts = {}): JourneyAPI {
  // ── renderer / scene / camera ─────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x05060a, 1)
  renderer.domElement.style.display = "block"
  container.appendChild(renderer.domElement)
  const canvas = renderer.domElement

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x05060a, 0.006)
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 800)
  camera.position.set(0, 24, 74)

  scene.add(new THREE.AmbientLight(0x203048, 0.7))
  const warpLight = new THREE.PointLight(0xffffff, 0, 70)   // rides the camera through the tunnel → metallic glints
  scene.add(warpLight)

  const glow = glowTexture()

  const _v = new THREE.Vector3()
  function project3(p: THREE.Vector3) {
    _v.copy(p).project(camera)
    return { x: (_v.x * 0.5 + 0.5) * container.clientWidth, y: (-_v.y * 0.5 + 0.5) * container.clientHeight, inFront: _v.z < 1 }
  }

  // ── weights on ONE fabric ─────────────────────────────
  const GOLD = Math.PI * (3 - Math.sqrt(5))
  const weights: Weight[] = DEMO_CARDS.map((p, i) => {
    const r = Math.sqrt(i + 0.6) * 13 * (1 + (i % 2) * 0.14)   // generous spread — projects feel distant
    const a = i * GOLD
    const award = p.accent === "#FBBF24"
    const col = new THREE.Color(WEIGHT_COLORS[i % WEIGHT_COLORS.length])
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
    scene.add(spr)
    const mass = award ? 4.8 : 3.2
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, col, mass, massBase: mass, r: 4.4, spr, base: award ? 3.4 : 2.9, award }
  })

  const isMobile = container.clientWidth < 768
  const W = 160                                              // vast — the sheet reads as endless
  const N = isMobile ? 80 : 116                              // lighter fabric on mobile
  const plane = new THREE.PlaneGeometry(W, W, N, N)
  plane.rotateX(-Math.PI / 2)
  const pos = plane.attributes.position as THREE.BufferAttribute
  const base = Float32Array.from(pos.array as Float32Array)
  // radial horizon fade — the fabric dissolves into darkness in a circle, so it
  // never shows a hard square edge (precomputed: zero per-frame cost)
  const edgeFade = new Float32Array(pos.count)
  const liveIdx: number[] = []                               // vertices inside the horizon — the only ones worth animating
  for (let k = 0; k < pos.count; k++) {
    const d = Math.hypot(base[k * 3], base[k * 3 + 2])
    edgeFade[k] = 1 - smoothstep(W * 0.275, W * 0.49, d)
    if (edgeFade[k] > 0.004) liveIdx.push(k)
  }
  const colArr = new Float32Array(pos.count * 3)
  plane.setAttribute("color", new THREE.BufferAttribute(colArr, 3))
  scene.add(new THREE.Points(plane, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, map: glowTexture(64), sizeAttenuation: true })))

  function fieldY(x: number, z: number, t: number) {
    let tot = 0
    for (const w of weights) { const dx = x - w.x, dz = z - w.z; tot += w.mass / (1 + (dx * dx + dz * dz) / (w.r * w.r)) }
    return -tot + Math.sin(Math.hypot(x, z) * 0.28 - t * 1.1) * 0.14
  }

  // ── starfield ─────────────────────────────────────────
  const starN = 900, sPos = new Float32Array(starN * 3)
  for (let i = 0; i < starN; i++) sPos.set([(Math.random() - 0.5) * 260, (Math.random() - 0.5) * 160, -Math.random() * 420 + 40], i * 3)
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#28344e", size: 0.4, transparent: true, opacity: 0.7, depthWrite: false })))
  // abyss stars — BELOW the sheet, seen through the weave when looking down at a project
  const underN = 520, uPos = new Float32Array(underN * 3)
  for (let i = 0; i < underN; i++) uPos.set([(Math.random() - 0.5) * 300, -18 - Math.random() * 120, (Math.random() - 0.5) * 300], i * 3)
  const underGeo = new THREE.BufferGeometry()
  underGeo.setAttribute("position", new THREE.BufferAttribute(uPos, 3))
  scene.add(new THREE.Points(underGeo, new THREE.PointsMaterial({ color: "#2b3252", size: 0.38, transparent: true, opacity: 0.65, depthWrite: false })))

  // ── cosmic silk ribbons — barely-seen layers drifting high above ──
  // Twisting strip meshes with a bright core fading to transparent edges,
  // plus a dusting of sparkles riding each ribbon. Palette stays on the site's
  // violet/deep-cyan so the ribbons read as weather, not a third voice.
  // Each ribbon lives in its own Y-rotated group so together they sweep the
  // WHOLE sky (0° / 120° / 240° azimuths), not just one side.
  interface RibbonCfg { col: string; y0: number; z0: number; amp: number; freq: number; sp: number; halfW: number; phase: number; op: number; rotY: number }
  // ordered so the mobile slice still gets a mix of above- and below-sheet silk
  const RIBBONS: RibbonCfg[] = [
    { col: "#2e7fb8", y0: 60, z0: -115, amp: 10, freq: 1.6, sp: 0.10, halfW: 7, phase: 0, op: 0.09, rotY: 0 },
    { col: "#4a3f8f", y0: -58, z0: -125, amp: 12, freq: 1.3, sp: -0.09, halfW: 9, phase: 1.2, op: 0.08, rotY: 1.05 },   // twilight beneath the sheet
    { col: "#6b5bd6", y0: 78, z0: -165, amp: 13, freq: 1.2, sp: -0.07, halfW: 9, phase: 2.1, op: 0.08, rotY: 2.09 },
    { col: "#1f6f8a", y0: -82, z0: -150, amp: 14, freq: 1.1, sp: 0.06, halfW: 10, phase: 3.3, op: 0.07, rotY: 3.14 },   // deeper abyss band
    { col: "#2f8a7d", y0: 70, z0: -140, amp: 11, freq: 1.4, sp: 0.08, halfW: 8, phase: 4.0, op: 0.075, rotY: 4.19 },
  ]
  const RIB_SEGS = 200, RIB_SPAN = 560, RIB_SPARKS = 90
  const ribbons = RIBBONS.slice(0, isMobile ? 3 : 5).map((cfg) => {
    const S = RIB_SEGS + 1
    const geo = new THREE.BufferGeometry()
    const p = new Float32Array(S * 3 * 3)                     // 3 rows: edge / core / edge
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3))
    const c = new Float32Array(S * 3 * 3)
    const col = new THREE.Color(cfg.col)
    for (let i = 0; i < S; i++) {
      const u = i / RIB_SEGS
      const endFade = Math.min(1, Math.min(u, 1 - u) / 0.18)  // soft ends
      c.set([col.r * endFade, col.g * endFade, col.b * endFade], (S + i) * 3)  // core row bright, edge rows stay black
    }
    geo.setAttribute("color", new THREE.BufferAttribute(c, 3))
    const idx: number[] = []
    for (let r = 0; r < 2; r++)
      for (let i = 0; i < RIB_SEGS; i++) {
        const v = r * S + i
        idx.push(v, v + 1, v + S, v + 1, v + S + 1, v + S)
      }
    geo.setIndex(idx)
    const grp = new THREE.Group()
    grp.rotation.y = cfg.rotY
    scene.add(grp)
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: cfg.op, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }))
    grp.add(mesh)
    // sparkles riding the ribbon
    const sparkGeo = new THREE.BufferGeometry()
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RIB_SPARKS * 3), 3))
    const sparkU = new Float32Array(RIB_SPARKS), sparkJ = new Float32Array(RIB_SPARKS * 2)
    for (let i = 0; i < RIB_SPARKS; i++) { sparkU[i] = Math.random(); sparkJ[i * 2] = (Math.random() - 0.5) * cfg.halfW * 1.6; sparkJ[i * 2 + 1] = (Math.random() - 0.5) * 3 }
    grp.add(new THREE.Points(sparkGeo, new THREE.PointsMaterial({ map: glow, color: col.clone().lerp(new THREE.Color("#ffffff"), 0.55), size: 1.15, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false })))
    return { cfg, geo, sparkGeo, sparkU, sparkJ }
  })

  // ── shooting stars — rare thin streaks crossing the deep sky ──
  const METEORS = 5, MTRAIL = 12
  interface Meteor { line: THREE.Line; mat: THREE.LineBasicMaterial; active: boolean; t0: number; dur: number; nextAt: number; from: THREE.Vector3; dir: THREE.Vector3; speed: number }
  const meteors: Meteor[] = []
  for (let m = 0; m < METEORS; m++) {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MTRAIL * 3), 3))
    const mc = new Float32Array(MTRAIL * 3)
    for (let i = 0; i < MTRAIL; i++) { const b = Math.pow(1 - i / (MTRAIL - 1), 1.6); mc.set([b * 0.85, b, b], i * 3) }  // cyan-white head → black tail
    g.setAttribute("color", new THREE.BufferAttribute(mc, 3))
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    const line = new THREE.Line(g, mat)
    scene.add(line)
    meteors.push({ line, mat, active: false, t0: 0, dur: 1, nextAt: 1 + m * 1.4 + Math.random() * 2.5, from: new THREE.Vector3(), dir: new THREE.Vector3(), speed: 100 })
  }

  // ── thin threads — the gravity well woven as a proper grid ──
  // vertex-coloured so the threads dissolve at the same circular horizon as the dots
  const GRID_STEP = 2
  const threadMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })
  const threadCol = new THREE.Color("#35648a")
  const gridLines: Array<{ geo: THREE.BufferGeometry; ks: number[] }> = []
  const SIDE = N + 1
  function addGridLine(ks: number[]) {
    const g = new THREE.BufferGeometry()
    const p = new Float32Array(ks.length * 3)
    const c = new Float32Array(ks.length * 3)
    ks.forEach((k, i) => {
      p[i * 3] = base[k * 3]; p[i * 3 + 1] = 0; p[i * 3 + 2] = base[k * 3 + 2]
      const f = edgeFade[k]
      c[i * 3] = threadCol.r * f; c[i * 3 + 1] = threadCol.g * f; c[i * 3 + 2] = threadCol.b * f
    })
    g.setAttribute("position", new THREE.BufferAttribute(p, 3))
    g.setAttribute("color", new THREE.BufferAttribute(c, 3))
    scene.add(new THREE.Line(g, threadMat))
    gridLines.push({ geo: g, ks })
  }
  for (let j = 0; j < SIDE; j += GRID_STEP) addGridLine(Array.from({ length: SIDE }, (_, i) => j * SIDE + i))
  for (let i = 0; i < SIDE; i += GRID_STEP) addGridLine(Array.from({ length: SIDE }, (_, j) => j * SIDE + i))

  // ── the Gateway ───────────────────────────────────────
  const gatePos = new THREE.Vector3(0, 24, 56)
  const gateCam = new THREE.Vector3(0, 24, 74)
  const gate = new THREE.Group()
  gate.position.copy(gatePos)
  scene.add(gate)
  const gateCol = new THREE.Color("#8bf0ff")
  gate.add(new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.07, 12, 96), new THREE.MeshBasicMaterial({ color: gateCol, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending })))
  gate.add(new THREE.Mesh(new THREE.TorusGeometry(6.85, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: gateCol, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })))
  const ticks = new THREE.Group()
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 2, big = k % 3 === 0
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.cos(a) * 5.55, Math.sin(a) * 5.55, 0),
      new THREE.Vector3(Math.cos(a) * (big ? 5.0 : 5.3), Math.sin(a) * (big ? 5.0 : 5.3), 0)])
    ticks.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: gateCol, transparent: true, opacity: big ? 0.75 : 0.35, blending: THREE.AdditiveBlending })))
  }
  gate.add(ticks)
  const dashPts = new THREE.EllipseCurve(0, 0, 4.4, 4.4).getPoints(120).map((p) => new THREE.Vector3(p.x, p.y, 0))
  const dashRing = new THREE.Line(new THREE.BufferGeometry().setFromPoints(dashPts), new THREE.LineDashedMaterial({ color: gateCol, dashSize: 0.5, gapSize: 0.42, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }))
  dashRing.computeLineDistances()
  gate.add(dashRing)
  // Omnitrix core — two chevrons ("> <") that slam together when the gate activates
  const chevMat = new THREE.LineBasicMaterial({ color: gateCol, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending })
  function makeChevron(dir: 1 | -1): THREE.Group {
    const grp = new THREE.Group()
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(dir * 1.15, -1.35, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(dir * 1.15, 1.35, 0),
    ]), chevMat))
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(dir * 1.5, -1.75, 0), new THREE.Vector3(dir * 0.35, 0, 0), new THREE.Vector3(dir * 1.5, 1.75, 0),
    ]), chevMat))
    gate.add(grp)
    return grp
  }
  const chevL = makeChevron(-1)   // ">" on the left, apex toward centre
  const chevR = makeChevron(1)    // "<" on the right — together: the hourglass
  let chevOff = 1, chevTarget = 1, ringBoost = 0, dashPhase = 0, tickPhase = 0, gateActivating = false
  for (let k = 0; k < 7; k++) {
    const z = 2.5 + k * 2.2, s = 0.5 - k * 0.05
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-s, -2.6, z), new THREE.Vector3(s, -2.6, z)])
    gate.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: gateCol, transparent: true, opacity: 0.5 - k * 0.055, blending: THREE.AdditiveBlending })))
  }

  // ── inverted-cone spotlight (tip on the mass) ─────────
  // Vertical falloff: full brightness from the mass up to card level (~45% of
  // the beam), then gradually diminishes to nothing by ~88% — the light has a
  // visible, controlled end instead of extending past the screen.
  const SPOT_H = 11, SPOT_R = 8.5   // wide splay — beam spans the card's width at card level
  const FADE_START = 0.4, FADE_END = 0.64   // gone just above card level — never reaches the screen top
  const spot = new THREE.Group()
  scene.add(spot)
  const coneGeo = new THREE.ConeGeometry(SPOT_R, SPOT_H, 48, 24, true)
  {
    const cp = coneGeo.attributes.position as THREE.BufferAttribute
    const cc = new Float32Array(cp.count * 3)
    for (let i = 0; i < cp.count; i++) {
      const s = (SPOT_H / 2 - cp.getY(i)) / SPOT_H          // 0 at the tip (mass) → 1 at the top
      const b = 1 - smoothstep(FADE_START, FADE_END, s)     // bright → gone, gradually
      cc[i * 3] = cc[i * 3 + 1] = cc[i * 3 + 2] = b
    }
    coneGeo.setAttribute("color", new THREE.BufferAttribute(cc, 3))
  }
  const spotMat = new THREE.MeshBasicMaterial({ color: "#fff", vertexColors: true, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
  const cone = new THREE.Mesh(coneGeo, spotMat)
  cone.rotation.x = Math.PI
  cone.position.y = SPOT_H / 2
  spot.add(cone)
  const pool = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: "#fff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
  pool.scale.setScalar(6)
  spot.add(pool)

  // ── wormhole — thin vibrant METALLIC rings, 7 colours cycling ──
  const ringMats = WEIGHT_COLORS.map((c) => new THREE.MeshStandardMaterial({
    color: c, metalness: 0.92, roughness: 0.24,
    emissive: new THREE.Color(c), emissiveIntensity: 0.5,
  }))
  const railMat = new THREE.LineBasicMaterial({ color: "#9fb9d8", transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending })
  const shellMat = new THREE.MeshBasicMaterial({ color: 0x020409, side: THREE.BackSide })  // seals gaps between rings
  const WHITE = new THREE.Color("#fff")
  let tunnel: THREE.Group | null = null
  let curve: THREE.CatmullRomCurve3 | null = null
  const tunnelRings: THREE.Mesh[] = []                       // for camera-proximity culling during rides
  const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _Z = new THREE.Vector3(0, 0, 1), _tan = new THREE.Vector3()
  const endSpark = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: "#fff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }))
  endSpark.visible = false
  scene.add(endSpark)

  function buildTunnel(a: THREE.Vector3, b: THREE.Vector3) {
    if (tunnel) {
      tunnel.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose() })
      scene.remove(tunnel)
    }
    const pts = [a.clone()], n = 7
    for (let k = 1; k < n; k++) {
      const tt = k / n
      const p = a.clone().lerp(b, tt)
      p.x += Math.sin(tt * Math.PI * 2) * 7.5
      p.y += 5 + Math.cos(tt * Math.PI * 1.5) * 4
      pts.push(p)
    }
    pts.push(b.clone())
    curve = new THREE.CatmullRomCurve3(pts, false, "centripetal")
    tunnel = new THREE.Group()
    tunnel.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 4.7, 28, false), shellMat))
    const len = curve.getLength()
    const nR = clamp(Math.round(len / 2.6), 26, 80)
    const ringGeo = new THREE.TorusGeometry(4.05, 0.05, 12, 84)   // thin, smooth
    tunnelRings.length = 0
    for (let i = 0; i <= nR; i++) {
      const u = i / nR
      curve.getPointAt(u, _p)
      curve.getTangentAt(u, _tan)
      const m = new THREE.Mesh(ringGeo, ringMats[i % ringMats.length])
      m.position.copy(_p)
      m.quaternion.copy(_q.setFromUnitVectors(_Z, _tan))
      m.scale.setScalar(i % ringMats.length === 0 ? 1.1 : 1)
      tunnel.add(m)
      tunnelRings.push(m)
    }
    const fr = curve.computeFrenetFrames(60, false)
    for (let r = 0; r < 8; r++) {
      const ang = (r / 8) * Math.PI * 2
      const rp: THREE.Vector3[] = []
      for (let s = 0; s <= 60; s++) {
        curve.getPointAt(s / 60, _p)
        rp.push(new THREE.Vector3().copy(_p)
          .addScaledVector(fr.normals[Math.min(s, 59)], Math.cos(ang) * 4)
          .addScaledVector(fr.binormals[Math.min(s, 59)], Math.sin(ang) * 4))
      }
      tunnel.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rp), railMat))
    }
    tunnel.visible = false
    scene.add(tunnel)
  }

  // ── HTML overlay ──────────────────────────────────────
  const els: HTMLElement[] = []
  const mk = (css: string, html = "") => {
    const e = document.createElement("div")
    e.style.cssText = css
    e.innerHTML = html
    container.appendChild(e)
    els.push(e)
    return e
  }
  const flash = mk("position:absolute;inset:0;pointer-events:none;z-index:6;opacity:0;mix-blend-mode:screen;transform-origin:50% 50%;")
  const guide = mk(`position:absolute;inset:0;pointer-events:none;z-index:4;transition:opacity .5s;font-family:${MONO};`)
  guide.innerHTML =
    `<div style="position:absolute;left:6%;right:70%;top:50%;height:1px;background:linear-gradient(90deg,transparent,rgba(139,240,255,.4))"></div>` +
    `<div style="position:absolute;left:70%;right:6%;top:50%;height:1px;background:linear-gradient(90deg,rgba(139,240,255,.4),transparent)"></div>` +
    `<div style="position:absolute;top:9%;bottom:76%;left:50%;width:1px;background:linear-gradient(180deg,transparent,rgba(139,240,255,.4))"></div>` +
    `<div style="position:absolute;top:76%;bottom:9%;left:50%;width:1px;background:linear-gradient(180deg,rgba(139,240,255,.4),transparent)"></div>` +
    `<div style="position:absolute;left:50%;top:50%;transform:translate(-260px,-190px);font-size:9.5px;letter-spacing:.22em;color:rgba(139,240,255,.75)">GATE 01 · PROJECTS</div>` +
    `<div style="position:absolute;left:50%;top:50%;transform:translate(160px,-190px);font-size:9.5px;letter-spacing:.22em;color:rgba(139,240,255,.55)">ALIGN ▸ OK</div>` +
    `<div style="position:absolute;left:50%;top:50%;transform:translate(-260px,176px);font-size:9.5px;letter-spacing:.22em;color:rgba(139,240,255,.55)">Σ mᵢ/(1+(d/rᵢ)²)</div>` +
    `<div style="position:absolute;left:50%;top:50%;transform:translate(160px,176px);font-size:9.5px;letter-spacing:.22em;color:rgba(139,240,255,.75)">MASSES · ONE FABRIC</div>`
  // HUD-styled intro panel — mono, uppercase, bracket corners; terminal, not landing page
  const intro = mk(`position:absolute;left:50%;top:36px;transform:translateX(-50%);z-index:5;max-width:${isMobile ? 420 : 560}px;width:calc(100% - 64px);text-align:center;pointer-events:none;transition:opacity .5s;background:rgba(5,8,14,.58);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.08);border-radius:4px;padding:${isMobile ? "14px 16px 15px" : "20px 30px 22px"};`)
  intro.innerHTML =
    `<i style="position:absolute;top:-1px;left:-1px;width:10px;height:10px;border-top:1px solid rgba(139,240,255,.65);border-left:1px solid rgba(139,240,255,.65)"></i>` +
    `<i style="position:absolute;top:-1px;right:-1px;width:10px;height:10px;border-top:1px solid rgba(139,240,255,.65);border-right:1px solid rgba(139,240,255,.65)"></i>` +
    `<i style="position:absolute;bottom:-1px;left:-1px;width:10px;height:10px;border-bottom:1px solid rgba(139,240,255,.65);border-left:1px solid rgba(139,240,255,.65)"></i>` +
    `<i style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;border-bottom:1px solid rgba(139,240,255,.65);border-right:1px solid rgba(139,240,255,.65)"></i>` +
    `<div style="display:flex;align-items:center;justify-content:center;gap:12px">` +
    `<span style="height:1px;width:${isMobile ? 20 : 38}px;background:linear-gradient(90deg,transparent,rgba(139,240,255,.5))"></span>` +
    `<span style="font-family:${MONO};font-size:${isMobile ? 8.5 : 10}px;letter-spacing:.34em;text-transform:uppercase;color:#8bf0ff">Gateway · Projects</span>` +
    `<span style="height:1px;width:${isMobile ? 20 : 38}px;background:linear-gradient(270deg,transparent,rgba(139,240,255,.5))"></span>` +
    `</div>` +
    `<div style="font-family:${DISP};font-weight:600;font-size:${isMobile ? 14 : 21}px;letter-spacing:${isMobile ? ".16em" : ".24em"};text-transform:uppercase;color:#fff;margin:${isMobile ? "10px 0 8px" : "14px 0 11px"};text-shadow:0 0 26px rgba(0,229,255,.25)">Projects · One Fabric</div>` +
    `<div style="font-family:${MONO};font-size:${isMobile ? 8.5 : 10.5}px;letter-spacing:.14em;line-height:2;color:#8a9cb5;text-transform:uppercase">Every project bends the same spacetime<br>One wormhole in · one out · cinematic flight between</div>`
  const proj = mk(`position:absolute;left:0;top:0;z-index:5;width:min(300px,calc(100vw - 48px));pointer-events:none;font-family:${DISP};opacity:0;background:rgba(6,9,16,.78);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:15px 17px;box-shadow:0 24px 70px -24px #000;`)
  // desktop corner annotations — quiet HUD text while parked at a project
  const cornerTL = isMobile ? null : mk(`position:absolute;top:20px;left:22px;z-index:5;pointer-events:none;font-family:${MONO};opacity:0;transition:opacity .5s;border-left:2px solid transparent;padding-left:11px;`)
  const cornerTR = isMobile ? null : mk(`position:absolute;top:20px;right:22px;z-index:5;pointer-events:none;font-family:${MONO};opacity:0;transition:opacity .5s;text-align:right;max-width:310px;border-right:2px solid transparent;padding-right:11px;`)
  const hint = mk(`position:absolute;left:50%;bottom:${isMobile ? 56 : 100}px;transform:translateX(-50%);z-index:5;pointer-events:none;font-family:${MONO};font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:#c3cede;transition:opacity .4s;white-space:nowrap;background:rgba(5,8,14,.55);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:7px 14px;`)

  // ── nav — desktop: glass dock (D3) · mobile: edge rail (M4) · tooltips: HUD callout (T3) ──
  // ── gate status line — "AWAITING TRAVELLER / AUTHENTICATING… / ACCESS
  // GRANTED / GATE SEALED", centred low inside the ring, fade+tracking reveal ──
  const gateKf = document.createElement("style")
  gateKf.textContent =
    "@keyframes jgdot{0%,60%,100%{opacity:.15}30%{opacity:1}}" +
    "@keyframes jgbreathe{0%,100%{opacity:.5}50%{opacity:1}}"
  container.appendChild(gateKf)
  els.push(gateKf as unknown as HTMLElement)
  const gateText = mk(`position:absolute;left:0;top:0;z-index:5;pointer-events:none;font-family:${MONO};font-size:${isMobile ? 9 : 11}px;text-transform:uppercase;color:#8bf0ff;white-space:nowrap;opacity:0;letter-spacing:.6em;transform:translate(-50%,-50%);text-shadow:0 0 12px rgba(139,240,255,.35);transition:opacity .45s,letter-spacing .45s,color .3s,text-shadow .3s,transform .3s;`)
  let gateTextCur = ""
  function setGateText(txt: string, color: string, breathe: boolean, strong = false) {
    if (gateTextCur === txt) return
    gateTextCur = txt
    gateText.style.animation = "none"
    gateText.innerHTML = txt === "AUTHENTICATING"
      ? `AUTHENTICATING<span style="animation:jgdot 1.1s infinite 0s">.</span><span style="animation:jgdot 1.1s infinite .18s">.</span><span style="animation:jgdot 1.1s infinite .36s">.</span>`
      : txt
    gateText.style.color = color
    gateText.style.transition = "none"                       // restart the fade+tracking reveal
    gateText.style.opacity = "0"
    gateText.style.letterSpacing = ".6em"
    void gateText.offsetHeight
    gateText.style.transition = "opacity .45s,letter-spacing .45s,color .3s,text-shadow .3s,transform .3s"
    gateText.style.opacity = "1"
    gateText.style.letterSpacing = ".3em"
    gateText.style.transform = strong ? "translate(-50%,-50%) scale(1.08)" : "translate(-50%,-50%)"
    gateText.style.textShadow = strong ? "0 0 20px rgba(223,252,255,.85)" : "0 0 12px rgba(139,240,255,.35)"
    if (breathe) gateText.style.animation = "jgbreathe 2.6s ease-in-out .5s infinite"
  }
  function placeGateText() {
    const gs = project3(_gt.set(gatePos.x, gatePos.y - 3.3, gatePos.z))
    gateText.style.left = `${gs.x}px`
    gateText.style.top = `${gs.y}px`
  }
  function hideGateText() {
    if (gateTextCur === "") return
    gateTextCur = ""
    gateText.style.animation = "none"
    gateText.style.opacity = "0"
  }
  const _gt = new THREE.Vector3()

  const dots = mk(isMobile
    ? "position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:5;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:auto;"
    : "position:absolute;left:50%;bottom:34px;transform:translateX(-50%);z-index:5;display:flex;align-items:center;gap:5px;padding:8px 12px;border-radius:18px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(12px);pointer-events:auto;")
  const railLabel = isMobile
    ? mk(`position:absolute;right:36px;top:50%;transform:translateY(-50%);z-index:5;pointer-events:none;text-align:right;font-family:${MONO};font-size:10px;letter-spacing:.15em;text-transform:uppercase;line-height:1.6;opacity:0;transition:opacity .3s,top .4s;`)
    : null

  // T3 — targeting-bracket callout with a connector line down to the control
  let hintSuppressed = false                                 // hide the hint while a callout is open (same zone)
  function addHudTip(btn: HTMLButtonElement, col: string, label: string): HTMLDivElement | null {
    if (isMobile) return null
    btn.style.position = "relative"
    const tip = document.createElement("div")
    tip.style.cssText = "position:absolute;bottom:130%;left:50%;transform:translate(-50%,6px);display:flex;flex-direction:column;align-items:center;opacity:0;transition:opacity .16s,transform .16s;pointer-events:none;"
    tip.innerHTML =
      `<span style="position:relative;white-space:nowrap;font-family:${MONO};font-size:10px;letter-spacing:.18em;text-transform:uppercase;padding:6px 12px;background:rgba(6,9,16,.9);color:${col}">` +
      `<i style="position:absolute;top:-1px;left:-1px;width:8px;height:8px;border-top:1px solid ${col};border-left:1px solid ${col}"></i>` +
      `<i style="position:absolute;top:-1px;right:-1px;width:8px;height:8px;border-top:1px solid ${col};border-right:1px solid ${col}"></i>` +
      `<i style="position:absolute;bottom:-1px;left:-1px;width:8px;height:8px;border-bottom:1px solid ${col};border-left:1px solid ${col}"></i>` +
      `<i style="position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;border-bottom:1px solid ${col};border-right:1px solid ${col}"></i>` +
      `${label}</span>` +
      `<span style="display:block;width:1px;height:13px;background:linear-gradient(180deg,${col},transparent)"></span>`
    btn.appendChild(tip)
    btn.addEventListener("pointerenter", () => { tip.style.opacity = "1"; tip.style.transform = "translate(-50%,0)"; hintSuppressed = true })
    btn.addEventListener("pointerleave", () => { tip.style.opacity = "0"; tip.style.transform = "translate(-50%,6px)"; hintSuppressed = false })
    return tip
  }

  const home = document.createElement("button")
  home.textContent = "⌂"
  home.setAttribute("aria-label", "Back to the gateway")
  home.style.cssText = isMobile
    ? "width:20px;height:20px;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#9fb0c8;cursor:pointer;font-size:10px;line-height:1;margin-bottom:2px;transition:border-color .2s,color .2s;"
    : "width:28px;height:28px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#9fb0c8;cursor:pointer;font-size:13px;line-height:1;flex-shrink:0;transition:border-color .2s,color .2s;"
  home.onclick = () => { paintDots(-1); opts.navToSnap?.(GATE_SNAP) }   // nav acknowledges instantly
  addHudTip(home, "#8bf0ff", "⌂ · Gateway")
  home.addEventListener("pointerenter", () => { home.style.borderColor = "#8bf0ff"; home.style.color = "#8bf0ff" })
  home.addEventListener("pointerleave", () => { home.style.borderColor = "rgba(255,255,255,.25)"; home.style.color = "#9fb0c8" })
  dots.appendChild(home)
  if (!isMobile) {
    const div = document.createElement("span")
    div.style.cssText = "width:1px;height:18px;background:rgba(255,255,255,.1);margin:0 4px;flex-shrink:0;"
    dots.appendChild(div)
  }

  interface NavItem { btn: HTMLButtonElement; dia?: HTMLSpanElement; nm?: HTMLSpanElement; tip: HTMLDivElement | null }
  const navItems: NavItem[] = []
  weights.forEach((w, i) => {
    const col = WEIGHT_COLORS[i]
    const b = document.createElement("button")
    b.setAttribute("aria-label", DEMO_CARDS[i].title)
    b.onclick = () => { paintDots(i); opts.navToSnap?.(GATE_SNAP + 1 + i) }   // nav acknowledges instantly
    if (isMobile) {
      // M4 — edge-rail dot
      b.style.cssText = "width:12px;height:12px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:transparent;cursor:pointer;padding:0;transition:all .3s;"
      navItems.push({ btn: b, tip: null })
    } else {
      // D3 — dock segment: diamond that unfolds into a named pill when active
      b.style.cssText = "position:relative;display:flex;align-items:center;height:32px;padding:0 9px;border-radius:12px;border:1px solid transparent;background:transparent;cursor:pointer;transition:background .3s,border-color .3s;"
      const dia = document.createElement("span")
      dia.style.cssText = `display:block;width:9px;height:9px;transform:rotate(45deg);border:1px solid ${col};background:transparent;transition:all .3s;flex-shrink:0;`
      const nm = document.createElement("span")
      nm.style.cssText = `font-family:${MONO};font-size:11px;letter-spacing:.12em;white-space:nowrap;overflow:hidden;max-width:0;margin-left:0;transition:max-width .35s ease,margin-left .35s ease;color:${col};`
      nm.textContent = DEMO_CARDS[i].title + (w.award ? " ★" : "")
      b.append(dia, nm)
      const tip = addHudTip(b, col, `0${i + 1} · ${DEMO_CARDS[i].title}${w.award ? " ★" : ""}`)
      navItems.push({ btn: b, dia, nm, tip })
    }
    dots.appendChild(b)
  })

  let activeDot = -1
  function paintDots(active: number) {
    activeDot = active
    navItems.forEach((it, i) => {
      const on = i === active, col = WEIGHT_COLORS[i]
      if (isMobile) {
        it.btn.style.borderColor = on ? col : "rgba(255,255,255,.28)"
        it.btn.style.background = on ? col : "transparent"
        it.btn.style.boxShadow = on ? `0 0 10px ${col}` : "none"
        it.btn.style.transform = on ? "scale(1.3)" : "scale(1)"
      } else {
        it.dia!.style.background = on ? col : "transparent"
        it.dia!.style.boxShadow = on ? `0 0 10px ${col}` : "none"
        it.nm!.style.maxWidth = on ? "150px" : "0"
        it.nm!.style.marginLeft = on ? "8px" : "0"
        it.btn.style.background = on ? col + "14" : "transparent"
        it.btn.style.borderColor = on ? col + "44" : "transparent"
        if (it.tip) it.tip.style.visibility = on ? "hidden" : "visible"   // active shows its name inline
      }
    })
    if (railLabel) {
      if (active >= 0) {
        const col = WEIGHT_COLORS[active]
        railLabel.innerHTML = `<span style="color:${col}">${DEMO_CARDS[active].title}${weights[active].award ? " ★" : ""}</span><br><span style="color:#79839a;font-size:9px">0${active + 1} / 0${weights.length}</span>`
        const r = navItems[active].btn.getBoundingClientRect(), c = container.getBoundingClientRect()
        railLabel.style.top = `${r.top - c.top + r.height / 2}px`
        railLabel.style.opacity = "1"
      } else railLabel.style.opacity = "0"
    }
  }

  function paintProj(i: number) {
    const p = DEMO_CARDS[i], ac = WEIGHT_COLORS[i], hasLink = p.link && p.link !== "#"
    proj.innerHTML =
      `<div style="font-family:${MONO};font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:${ac};margin-bottom:8px">Project ${i + 1} / ${weights.length} · ${p.tag}</div>` +
      `<div style="font-size:25px;font-weight:600;color:#fff;margin-bottom:8px">${p.title}${weights[i].award ? ` <span style="color:${ac}">★</span>` : ""}</div>` +
      `<div style="font-size:12.5px;line-height:1.55;color:#c2cadb;margin-bottom:11px">${p.desc}</div>` +
      `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:${hasLink ? "12px" : "0"}">${p.tech.map((t) => `<span style="font-family:${MONO};font-size:9.5px;padding:3px 8px;border:1px solid rgba(255,255,255,.14);border-radius:20px;color:#9fb0c8">${t}</span>`).join("")}</div>` +
      (hasLink ? `<a href="${p.link}" target="_blank" rel="noopener noreferrer" style="pointer-events:auto;display:inline-block;font-family:${MONO};font-size:10.5px;letter-spacing:.18em;color:${ac};text-decoration:none;border-bottom:1px solid ${ac}55;padding-bottom:2px">VIEW PROJECT ↗</a>` : "")
    const a = proj.querySelector("a")
    if (a) a.addEventListener("click", () => opts.onProjectClick?.(p.title))
    if (cornerTL) {
      cornerTL.style.borderLeftColor = ac + "88"
      cornerTL.innerHTML =
        `<div style="font-size:9px;letter-spacing:.3em;color:#79839a;text-transform:uppercase;margin-bottom:5px">Now viewing</div>` +
        `<div style="font-size:12px;letter-spacing:.18em;color:${ac};text-transform:uppercase">0${i + 1} · ${p.title}</div>` +
        `<div style="font-size:9px;letter-spacing:.2em;color:rgba(233,237,246,.5);text-transform:uppercase;margin-top:4px">${p.tag}</div>`
    }
    if (cornerTR) {
      cornerTR.style.borderRightColor = ac + "55"
      const note = p.points[0].length > 120 ? p.points[0].slice(0, 117) + "…" : p.points[0]
      cornerTR.innerHTML =
        `<div style="font-size:9px;letter-spacing:.3em;color:#79839a;text-transform:uppercase;margin-bottom:5px">Field note</div>` +
        `<div style="font-size:10px;line-height:1.7;color:rgba(233,237,246,.55)">${note}</div>`
    }
    paintDots(i)
  }

  // ── state machine ─────────────────────────────────────
  type State = "gate" | "warp" | "fly" | "idle" | "retreat"
  let state: State = "gate", focus = -1, desired = -1, T = 0, grow = 0, focusT0 = 0
  let dragging = false, lastPX = 0, lastPY = 0, yaw = 0, pitch = 0, engagedUntil = 0
  let warpT = 0, warpDur = 0, warpTarget = 0, swappedIn = false, swappedOut = false
  let flyT = 0, flyDur = 2.8, flyTarget = 0
  let retT = 0, retDur = 3.0, lockReleaseAt = 0
  const retFrom = new THREE.Vector3(), retCtrl = new THREE.Vector3(), retLook = new THREE.Vector3()
  const camStart = new THREE.Vector3(), diveTarget = new THREE.Vector3(), camAhead = new THREE.Vector3()
  const flyFrom = new THREE.Vector3(), flyCtrl = new THREE.Vector3(), flyToV = new THREE.Vector3()
  const lookFrom = new THREE.Vector3(), lookTo = new THREE.Vector3(), _look = new THREE.Vector3(), _b1 = new THREE.Vector3(), _b2 = new THREE.Vector3()
  const settleFrom = new THREE.Vector3(), settleLook = new THREE.Vector3(), lastLook = new THREE.Vector3(0, 0, -1)
  const handFrom = new THREE.Vector3(), handLook = new THREE.Vector3()
  const px = { x: 0, y: 0 }, mtgt = { x: 0, y: 0 }

  const ORBIT_R = 12
  const wWorld = (i: number) => new THREE.Vector3(weights[i].x, fieldY(weights[i].x, weights[i].z, T) + 0.6, weights[i].z)
  // camera heights are anchored to the fabric at the ORBIT RING (the rim),
  // never the well bottom — a deepening well must not drag the camera under the sheet
  function vantage(i: number) {
    const w = weights[i], a = Math.atan2(w.z, w.x)
    const ox = w.x + Math.cos(a) * ORBIT_R, oz = w.z + Math.sin(a) * ORBIT_R
    return new THREE.Vector3(ox, fieldY(ox, oz, T) + 6.5, oz)
  }

  function warpTo(tf: number) {
    if (state === "warp") return
    gateActivating = false
    if (tf === -1) chevTarget = 1                            // heading home — chevrons part for the arrival
    warpTarget = tf; state = "warp"; warpT = 0; swappedIn = false; swappedOut = false; yaw = 0; pitch = 0
    paintDots(tf === -1 ? -1 : tf)                           // nav leads, the camera follows
    warpDur = 4.2 + Math.random() * 1.4
    const c = tf === -1 ? new THREE.Color("#8bf0ff") : weights[tf].col.clone()
    endSpark.material.color.copy(c).lerp(WHITE, 0.5)
    flash.style.background = `radial-gradient(circle at 50% 50%, #fff 0%, #${c.getHexString()} 42%, transparent 70%)`
    camStart.copy(camera.position)
    if (tf === -1) { diveTarget.copy(wWorld(focus)).add(new THREE.Vector3(0, 2.2, 0)); buildTunnel(diveTarget, gateCam) }
    else { diveTarget.copy(gatePos); buildTunnel(gatePos, vantage(tf)) }
    intro.style.opacity = "0"; guide.style.opacity = "0"; hint.style.opacity = "0"
  }

  function flyTo(tf: number) {
    if (state !== "idle" && state !== "fly") return
    if (state === "idle" && tf === focus) return
    const retarget = state === "fly"                          // redirect mid-flight from wherever we are
    flyTarget = tf; state = "fly"; flyT = 0; yaw = 0; pitch = 0
    paintDots(tf)                                             // nav leads, the camera follows
    flyFrom.copy(camera.position); flyToV.copy(vantage(tf))
    lookFrom.copy(retarget ? lastLook : wWorld(focus)); lookTo.copy(wWorld(tf))
    flyDur = clamp(2.2 + flyFrom.distanceTo(flyToV) * 0.028, 2.5, 3.9)
    flyCtrl.copy(flyFrom).lerp(flyToV, 0.5)
    flyCtrl.y += 7 + flyFrom.distanceTo(flyToV) * 0.16
    const perp = _b1.copy(flyToV).sub(flyFrom).cross(camera.up).normalize()
    flyCtrl.addScaledVector(perp, (tf % 2 === 0 ? 1 : -1) * 5)
  }

  // Exit is NOT a wormhole: the camera rises far away — the whole field
  // shrinking below — then settles at the gate porch, where the gate LOCKS
  // (chevrons slam) and eases open again, ready for the next entry.
  function retreatTo() {
    if (state !== "idle") return
    state = "retreat"; retT = 0; yaw = 0; pitch = 0
    paintDots(-1)
    retFrom.copy(camera.position)
    retLook.copy(wWorld(focus))
    retCtrl.copy(retFrom).lerp(gateCam, 0.45)
    retCtrl.y = Math.max(retFrom.y, gateCam.y) + 34          // high above the field
    retDur = 2.6 + retFrom.distanceTo(gateCam) * 0.006
    intro.style.opacity = "0"; hint.style.opacity = "0"
  }

  // controller: reconcile scroll-driven target with the state machine.
  // Gate departures get a PRE-LAUNCH phase: the chevron slam plays fully at the
  // gate (~650ms) before the wormhole ignites — identical for scroll and click.
  let preLaunchAt = 0
  function reconcile() {
    if (state === "gate" && desired >= 0) {
      if (preLaunchAt === 0) {
        preLaunchAt = performance.now()
        chevTarget = 0
        ringBoost = Math.max(ringBoost, 1.7)
      } else if (performance.now() - preLaunchAt > 650) {
        preLaunchAt = 0
        warpTo(desired)
      }
    }
    else if (state === "gate" && desired === -1 && preLaunchAt !== 0) { preLaunchAt = 0; chevTarget = 1 }
    else if (state === "idle") {
      if (desired === -1) retreatTo()
      else if (desired !== focus) flyTo(desired)
    } else if (state === "fly" && desired >= 0 && desired !== flyTarget) {
      flyTo(desired)                                          // direct redirect — no A→B→C chaining
    }
  }

  // ── input: drag orbits the focused weight (page snap engine owns scroll) ──
  const ray = new THREE.Raycaster()
  const mouse = new THREE.Vector2(-2, -2)
  const onMM = (e: PointerEvent) => {
    const b = container.getBoundingClientRect()
    mouse.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1)
    mtgt.x = ((e.clientX - b.left) / b.width - 0.5) * 2
    mtgt.y = ((e.clientY - b.top) / b.height - 0.5) * 2
    if (dragging && state === "idle") {
      yaw += (e.clientX - lastPX) * 0.005
      pitch = clamp(pitch + (e.clientY - lastPY) * 0.0035, -0.45, 0.9)
      engagedUntil = performance.now() + 450
    }
    lastPX = e.clientX; lastPY = e.clientY
  }
  // Omnitrix activation (click): slam starts NOW and plays during the page
  // scroll; reconcile's pre-launch gate holds the warp until the slam has run.
  function activateGate() {
    if (gateActivating || state !== "gate") return
    gateActivating = true
    chevTarget = 0
    ringBoost = Math.max(ringBoost, 1.7)
    preLaunchAt = performance.now()
    paintDots(0)
    opts.navToSnap?.(GATE_SNAP + 1)
  }

  // click = press + release without travel (≥8px means drag/swipe — never a click)
  let downX = 0, downY = 0, downWeight = -1, clickArmed = false
  const onDown = (e: PointerEvent) => {
    lastPX = e.clientX; lastPY = e.clientY
    clickArmed = false
    if ((e.target as HTMLElement | null)?.closest("button,a")) return   // UI elements own their clicks
    if (state !== "idle" && state !== "gate") return
    downX = e.clientX; downY = e.clientY; clickArmed = true
    const b = container.getBoundingClientRect()                          // fresh NDC — touch taps have no prior move
    mouse.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1)
    ray.setFromCamera(mouse, camera)
    const hit = ray.intersectObjects(weights.map((w) => w.spr))[0]
    downWeight = hit ? weights.findIndex((w) => w.spr === hit.object) : -1
    if (state === "idle" && downWeight === -1) dragging = true
  }
  const onUp = (e: PointerEvent) => {
    dragging = false
    if (!clickArmed) return
    clickArmed = false
    if (Math.hypot(e.clientX - downX, e.clientY - downY) >= 8) return
    if (state !== "idle" && state !== "gate") return
    if (downWeight >= 0) {                                               // click/tap a mass → travel to it
      paintDots(downWeight); opts.navToSnap?.(GATE_SNAP + 1 + downWeight)
    } else if (state === "gate") {                                       // click/tap the gate → Omnitrix activation → enter
      activateGate()
    }
  }
  // touch: horizontal drag orbits; vertical swipes fall through to the page snap engine
  let tX = 0, tY = 0, touchMode: "look" | "pass" | null = null
  const onTS = (e: TouchEvent) => {
    const t0 = e.touches[0]
    if (!t0) return
    tX = t0.clientX; tY = t0.clientY; lastPX = tX; lastPY = tY; touchMode = null
  }
  const onTM = (e: TouchEvent) => {
    const t0 = e.touches[0]
    if (!t0 || state !== "idle") return
    if (touchMode === null && (Math.abs(t0.clientX - tX) > 10 || Math.abs(t0.clientY - tY) > 10))
      touchMode = Math.abs(t0.clientX - tX) > Math.abs(t0.clientY - tY) ? "look" : "pass"
    if (touchMode === "look") {
      yaw += (t0.clientX - lastPX) * 0.006
      pitch = clamp(pitch + (t0.clientY - lastPY) * 0.004, -0.45, 0.9)
      engagedUntil = performance.now() + 450
    }
    lastPX = t0.clientX; lastPY = t0.clientY
  }
  const onTE = () => { touchMode = null; dragging = false }
  container.addEventListener("pointermove", onMM)
  container.addEventListener("pointerdown", onDown)
  window.addEventListener("pointerup", onUp)
  container.addEventListener("touchstart", onTS, { passive: true })
  container.addEventListener("touchmove", onTM, { passive: true })
  container.addEventListener("touchend", onTE, { passive: true })

  const onResize = () => {
    renderer.setSize(container.clientWidth, container.clientHeight)
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
  }
  window.addEventListener("resize", onResize)

  // ── render loop ───────────────────────────────────────
  const clock = new THREE.Clock()
  let elapsed = 0, raf = 0, running = true

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsed += dt
    const t = elapsed
    T = t
    px.x += (mtgt.x - px.x) * 0.05
    px.y += (mtgt.y - px.y) * 0.05
    // counter-rotating rings (gears) — the dashed ring runs anticlockwise, the
    // tick ring clockwise; activation spins both up hard
    ringBoost *= 0.95
    dashPhase += dt * (0.3 + ringBoost * 7)
    tickPhase += dt * (0.16 + ringBoost * 5)
    dashRing.rotation.z = dashPhase
    ticks.rotation.z = -tickPhase
    chevOff += (chevTarget - chevOff) * 0.16
    chevL.position.x = -(0.14 + chevOff * 1.5)
    chevR.position.x = (0.14 + chevOff * 1.5)
    chevMat.opacity = clamp(0.55 + Math.sin(t * 2.1) * 0.15 + ringBoost * 0.5, 0, 1)
    reconcile()

    if (state === "gate") {
      camera.up.set(0, 1, 0)
      camera.position.set(gateCam.x + px.x * 2.4, gateCam.y + px.y * 1.4, gateCam.z)
      camera.lookAt(gatePos.x, gatePos.y - 0.6, gatePos.z - 8)
      if (lockReleaseAt !== 0 && performance.now() > lockReleaseAt) { lockReleaseAt = 0; if (preLaunchAt === 0) chevTarget = 1 }
      placeGateText()
      if (preLaunchAt !== 0) {
        if (performance.now() - preLaunchAt > 470) setGateText("ACCESS GRANTED", "#dffcff", false, true)
        else setGateText("AUTHENTICATING", "#8bf0ff", false)
      } else setGateText("AWAITING TRAVELLER", "#8bf0ff", true)
      intro.style.opacity = "1"; guide.style.opacity = "1"
      hint.style.opacity = hintSuppressed ? "0" : "0.9"; hint.textContent = isMobile ? "Swipe or tap to enter ↓" : "Scroll or click to enter ↓"
      warpLight.intensity = 0                                 // (dots painted at travel start — no per-frame reset)
    } else if (state === "warp") {
      warpT += dt
      const p = clamp(warpT / warpDur, 0, 1)
      let fa = 0, fs = 1
      if (p < 0.16) fa = p / 0.16
      else if (p < 0.3) fa = 1 - (p - 0.16) / 0.14
      else if (p < 0.72) fa = 0
      else if (p < 0.87) { fa = (p - 0.72) / 0.15; fs = 0.1 + ((p - 0.72) / 0.15) * 3.2 }
      else { fa = 1 - (p - 0.87) / 0.13; fs = 3.3 }
      flash.style.opacity = fa.toFixed(3)
      flash.style.transform = `scale(${fs.toFixed(3)})`
      if (warpTarget >= 0 && p < 0.2 && gateTextCur !== "") {
        // ACCESS GRANTED dissolves in lockstep with the flood
        placeGateText()
        gateText.style.transition = "letter-spacing .45s,color .3s,text-shadow .3s,transform .3s"
        gateText.style.opacity = clamp(1 - fa * 1.15, 0, 1).toFixed(3)
        if (fa >= 0.86) { gateTextCur = ""; gateText.style.animation = "none"; gateText.style.opacity = "0" }
      } else hideGateText()

      if (p < 0.16) {
        camera.position.lerpVectors(camStart, diveTarget, easeInOut(p / 0.16))
        camera.lookAt(warpTarget === -1 ? diveTarget : _b2.set(gatePos.x, gatePos.y, gatePos.z - 12))
        canvas.style.filter = "none"
        warpLight.intensity = 0
      } else if (p < 0.87 && curve) {
        if (!swappedIn) { swappedIn = true; if (tunnel) tunnel.visible = true; endSpark.visible = true; gate.visible = warpTarget === -1 }
        const fly = (p - 0.16) / 0.71
        if (warpTarget === -1) {
          // REVERSE ride — being pulled back out: camera faces backward so the
          // rings recede; launches fast, decelerates; blur clears along the way
          const u = clamp(1 - Math.pow(1 - fly, 1.38), 0.001, 0.999)
          curve.getPointAt(u, camera.position)
          curve.getPointAt(Math.max(0.001, u - 0.01), camAhead)
          camera.lookAt(camAhead)
          lastLook.copy(camAhead)
          curve.getPointAt(0.001, endSpark.position)              // the world you're leaving, shrinking away
          const dE = camera.position.distanceTo(endSpark.position)
          endSpark.material.opacity = clamp(1 - dE / 60, 0, 1)
          endSpark.scale.setScalar(clamp(28 / Math.max(dE, 1), 1.2, 28))
          canvas.style.filter = `blur(${(Math.pow(1 - fly, 1.6) * 5).toFixed(2)}px)`
        } else {
          // FORWARD ride — accelerating toward the point of light
          const u = clamp(Math.pow(fly, 1.38), 0, 0.999)
          curve.getPointAt(u, camera.position)
          curve.getPointAt(Math.min(0.999, u + 0.01), camAhead)
          camera.lookAt(camAhead)
          lastLook.copy(camAhead)
          curve.getPointAt(0.999, endSpark.position)
          const dE = camera.position.distanceTo(endSpark.position)
          endSpark.material.opacity = clamp(1 - dE / 52, 0, 1)
          endSpark.scale.setScalar(clamp(28 / Math.max(dE, 1), 1.5, 28))
          canvas.style.filter = `blur(${(fly * fly * 5).toFixed(2)}px)`
        }
        // hide rings sweeping through the camera plane — kills the edge-on
        // "dissection" flash (only visible when facing them on the reverse ride)
        for (const rg of tunnelRings) rg.visible = rg.position.distanceToSquared(camera.position) > 6.5
        warpLight.position.copy(camera.position)                       // metallic glints on the rings
        warpLight.intensity = 2.6
      } else {
        if (!swappedOut) {
          swappedOut = true
          if (tunnel) tunnel.visible = false
          endSpark.visible = false; gate.visible = true
          handFrom.copy(camera.position); handLook.copy(lastLook)
          if (warpTarget === -1) { focus = -1; paintDots(-1) }
          else { focus = warpTarget; focusT0 = t; paintProj(focus) }
        }
        canvas.style.filter = `blur(${(clamp(1 - (p - 0.87) / 0.09, 0, 1) * 4).toFixed(2)}px)`
        warpLight.intensity = 0
        const q = easeInOut(clamp((p - 0.87) / 0.13, 0, 1))
        if (focus === -1) {
          camera.position.lerpVectors(handFrom, gateCam, q)
          camera.lookAt(_b2.set(gatePos.x, gatePos.y - 0.6, gatePos.z - 8).multiplyScalar(q).addScaledVector(handLook, 1 - q))
        } else {
          const w = weights[focus], A = Math.atan2(w.z, w.x)
          const ox = w.x + Math.cos(A) * ORBIT_R, oz = w.z + Math.sin(A) * ORBIT_R
          _b1.set(ox, fieldY(ox, oz, t) + 6.5, oz)
          camera.position.lerpVectors(handFrom, _b1, q)
          camera.lookAt(_b2.set(w.x, fieldY(w.x, w.z, t) + 2.6, w.z).multiplyScalar(q).addScaledVector(handLook, 1 - q))
        }
        lastLook.copy(_b2)
      }
      if (p >= 1) {
        state = focus === -1 ? "gate" : "idle"
        if (focus === -1) { chevTarget = 1; gateActivating = false }   // gate rests open again
        flash.style.opacity = "0"; flash.style.transform = "scale(1)"; canvas.style.filter = "none"
        focusT0 = t; settleFrom.copy(camera.position); settleLook.copy(lastLook)
      }
    } else if (state === "fly") {
      flyT += dt
      const p = easeInOut(clamp(flyT / flyDur, 0, 1))
      _b1.copy(flyFrom).lerp(flyCtrl, p)
      _b2.copy(flyCtrl).lerp(flyToV, p)
      camera.position.copy(_b1.lerp(_b2, p))
      const lb = easeInOut(clamp((clamp(flyT / flyDur, 0, 1) - 0.18) / 0.6, 0, 1))
      _look.copy(lookFrom).lerp(lookTo, lb)
      camera.up.set(Math.sin(p * Math.PI) * (flyTarget % 2 === 0 ? 0.08 : -0.08), 1, 0).normalize()
      camera.lookAt(_look)
      lastLook.copy(_look)
      warpLight.intensity = 0
      if (flyT >= flyDur) {
        state = "idle"; focus = flyTarget; focusT0 = t; paintProj(focus); camera.up.set(0, 1, 0)
        settleFrom.copy(camera.position); settleLook.copy(lastLook)
      }
    } else if (state === "retreat") {
      // rising farewell — the field shrinks below, then the gate porch
      retT += dt
      const p = easeInOut(clamp(retT / retDur, 0, 1))
      _b1.copy(retFrom).lerp(retCtrl, p); _b2.copy(retCtrl).lerp(gateCam, p)
      camera.position.copy(_b1.lerp(_b2, p))
      camera.position.x += px.x * 2.4 * p; camera.position.y += px.y * 1.4 * p   // blends into the gate pose
      const l1 = easeInOut(clamp(p / 0.5, 0, 1))              // weight → field centre
      const l2 = easeInOut(clamp((p - 0.55) / 0.45, 0, 1))    // field centre → gate
      const cx = retLook.x * (1 - l1), cy = retLook.y * (1 - l1) - 2 * l1, cz = retLook.z * (1 - l1)
      _look.set(cx + (gatePos.x - cx) * l2, cy + (gatePos.y - 0.6 - cy) * l2, cz + (gatePos.z - 8 - cz) * l2)
      camera.up.set(0, 1, 0)
      camera.lookAt(_look)
      lastLook.copy(_look)
      warpLight.intensity = 0
      hideGateText()
      if (retT >= retDur) {
        state = "gate"; focus = -1
        preLaunchAt = 0; gateActivating = false
        chevTarget = 0; ringBoost = Math.max(ringBoost, 1.3)  // GATE LOCK — slams shut behind you…
        lockReleaseAt = performance.now() + 950               // …then eases open, ready again
      }
    } else {
      // idle — parked at a weight
      const w = weights[focus]
      const settle = easeInOut(clamp((t - focusT0) / 1.8, 0, 1))
      const push = easeInOut(clamp((t - focusT0 - 0.5) / 1.8, 0, 1))
      camera.up.set(0, 1, 0)
      const A = Math.atan2(w.z, w.x) + yaw + Math.sin(t * 0.3) * 0.1
      const ox = w.x + Math.cos(A) * ORBIT_R, oz = w.z + Math.sin(A) * ORBIT_R
      const EL = clamp(6.5 + pitch * 9, 3.4, 15)               // rim-anchored — never dips under the sheet
      _b1.set(ox + px.x * 1.2, fieldY(ox, oz, t) + EL - push * 1.0, oz)
      camera.position.lerpVectors(settleFrom, _b1, settle)
      _look.set(w.x, fieldY(w.x, w.z, t) + 2.6, w.z)
      camera.lookAt(_b2.lerpVectors(settleLook, _look, settle))
      intro.style.opacity = "0"; guide.style.opacity = "0"
      hint.style.opacity = hintSuppressed ? "0" : "0.85"
      hint.textContent = focus < weights.length - 1 ? "Scroll → next project" : "Scroll → continue"
      warpLight.intensity = 0
    }

    ray.setFromCamera(mouse, camera)
    container.style.cursor = dragging ? "grabbing"
      : ((state === "idle" || state === "gate") && ray.intersectObjects(weights.map((w) => w.spr)).length) ? "pointer"
        : state === "idle" ? "grab" : "default"

    // the active project is HEAVIER — its well slowly deepens and the mass
    // settles lower while you're parked with it (eases back on departure)
    weights.forEach((w, i) => {
      const tgt = i === focus && state === "idle" ? w.massBase * 1.6 : w.massBase
      w.mass += (tgt - w.mass) * 0.035
    })

    // fabric — only the vertices inside the horizon are animated (dead zone is invisible)
    const arr = pos.array as Float32Array
    for (const k of liveIdx) {
      const x = base[k * 3], z = base[k * 3 + 2]
      let tot = 0, cr = 0, cg = 0, cb = 0
      for (const w of weights) {
        const dx = x - w.x, dz = z - w.z
        const inf = w.mass / (1 + (dx * dx + dz * dz) / (w.r * w.r))
        tot += inf; cr += inf * w.col.r; cg += inf * w.col.g; cb += inf * w.col.b
      }
      arr[k * 3 + 1] = -tot + Math.sin(Math.hypot(x, z) * 0.28 - t * 1.1) * 0.14
      const b = Math.pow(clamp(tot / 6, 0, 1), 0.62) * edgeFade[k], inv = tot > 0 ? 1 / tot : 0
      colArr[k * 3] = cr * inv * b; colArr[k * 3 + 1] = cg * inv * b; colArr[k * 3 + 2] = cb * inv * b
    }
    pos.needsUpdate = true
    ;(plane.attributes.color as THREE.BufferAttribute).needsUpdate = true

    // thread grid follows the fabric (reads the heights just computed — no extra math)
    for (const gl of gridLines) {
      const gp = gl.geo.attributes.position as THREE.BufferAttribute
      const ga = gp.array as Float32Array
      for (let i = 0; i < gl.ks.length; i++) ga[i * 3 + 1] = arr[gl.ks[i] * 3 + 1]
      gp.needsUpdate = true
    }

    // cosmic silk ribbons — undulating, twisting, drifting slowly
    for (const rb of ribbons) {
      const { cfg } = rb
      const S = RIB_SEGS + 1
      const rp = rb.geo.attributes.position as THREE.BufferAttribute
      const ra = rp.array as Float32Array
      for (let i = 0; i < S; i++) {
        const u = i / RIB_SEGS
        const cx = (u - 0.5) * RIB_SPAN
        const cy = cfg.y0 + Math.sin(u * cfg.freq * 6.28 + t * cfg.sp + cfg.phase) * cfg.amp
          + Math.sin(u * cfg.freq * 16.6 + t * cfg.sp * 1.7) * cfg.amp * 0.3
        const cz = cfg.z0 + Math.cos(u * cfg.freq * 8.1 + t * cfg.sp * 0.8 + cfg.phase) * cfg.amp * 0.8
        const tw = u * Math.PI * 2.5 + t * 0.12 + cfg.phase          // silk twist
        const oy = Math.cos(tw) * cfg.halfW, oz = Math.sin(tw) * cfg.halfW
        ra[i * 3] = cx; ra[i * 3 + 1] = cy - oy; ra[i * 3 + 2] = cz - oz               // edge
        ra[(S + i) * 3] = cx; ra[(S + i) * 3 + 1] = cy; ra[(S + i) * 3 + 2] = cz       // core
        ra[(2 * S + i) * 3] = cx; ra[(2 * S + i) * 3 + 1] = cy + oy; ra[(2 * S + i) * 3 + 2] = cz + oz  // edge
      }
      rp.needsUpdate = true
      const sp2 = rb.sparkGeo.attributes.position as THREE.BufferAttribute
      const sa = sp2.array as Float32Array
      for (let i = 0; i < RIB_SPARKS; i++) {
        const u = rb.sparkU[i]
        sa[i * 3] = (u - 0.5) * RIB_SPAN
        sa[i * 3 + 1] = cfg.y0 + Math.sin(u * cfg.freq * 6.28 + t * cfg.sp + cfg.phase) * cfg.amp + rb.sparkJ[i * 2]
        sa[i * 3 + 2] = cfg.z0 + Math.cos(u * cfg.freq * 8.1 + t * cfg.sp * 0.8 + cfg.phase) * cfg.amp * 0.8 + rb.sparkJ[i * 2 + 1]
      }
      sp2.needsUpdate = true
    }

    // shooting stars — spawn on a wide ring, streak diagonally down, fade in/out
    for (const mt of meteors) {
      if (!mt.active) {
        if (t >= mt.nextAt) {
          mt.active = true; mt.t0 = t; mt.dur = 0.9 + Math.random() * 0.8
          const a = Math.random() * Math.PI * 2, r = 130 + Math.random() * 90
          const below = Math.random() < 0.4                   // some streak beneath the sheet
          mt.from.set(Math.cos(a) * r, below ? -(25 + Math.random() * 70) : 55 + Math.random() * 55, Math.sin(a) * r)
          const da = a + Math.PI / 2 + (Math.random() - 0.5) * 0.8
          mt.dir.set(Math.cos(da), -(0.25 + Math.random() * 0.35), Math.sin(da)).normalize()
          mt.speed = 90 + Math.random() * 70
        }
      } else {
        const pr = (t - mt.t0) / mt.dur
        if (pr >= 1) { mt.active = false; mt.mat.opacity = 0; mt.nextAt = t + 1.2 + Math.random() * 3.5 }
        else {
          mt.mat.opacity = Math.sin(pr * Math.PI) * 0.75
          const mp = mt.line.geometry.attributes.position as THREE.BufferAttribute
          const ma = mp.array as Float32Array
          for (let i = 0; i < MTRAIL; i++) {
            const d = mt.speed * (pr * mt.dur) - i * 1.6
            ma[i * 3] = mt.from.x + mt.dir.x * d
            ma[i * 3 + 1] = mt.from.y + mt.dir.y * d
            ma[i * 3 + 2] = mt.from.z + mt.dir.z * d
          }
          mp.needsUpdate = true
        }
      }
    }

    // weights
    weights.forEach((w, i) => {
      w.spr.position.set(w.x, fieldY(w.x, w.z, t) + 0.6, w.z)
      const foc = i === focus && state === "idle"
      const target = foc ? w.base * 1.24 + Math.sin(t * 3) * 0.1 : (focus >= 0 && state === "idle" ? w.base * 0.72 : w.base)
      w.spr.scale.lerp(_b1.set(target, target, target), 0.15)
      ;(w.spr.material as THREE.SpriteMaterial).opacity = (focus >= 0 && state === "idle" && !foc) ? 0.5 : 1
    })

    // spotlight + card (staged: beam forms, then card emerges toward screen middle)
    const engaged = dragging || performance.now() < engagedUntil
    const gOn = state === "idle" && focus >= 0 && !engaged
    grow += ((gOn ? 1 : 0) - grow) * (gOn ? 0.035 : 0.08)
    if (focus >= 0 && grow > 0.004) {
      const w = weights[focus], wy = fieldY(w.x, w.z, t)
      const gSpot = easeInOut(clamp(grow / 0.72, 0, 1))
      const gCard = easeInOut(clamp((grow - 0.55) / 0.45, 0, 1))
      spot.visible = true
      spot.position.set(w.x, wy + 0.7, w.z)
      const sx = 0.7 + 0.3 * gSpot
      spot.scale.set(sx, 0.55 + 0.45 * gSpot, sx)
      const breathe = 1 + Math.sin(t * 1.7) * 0.09
      spotMat.color.copy(w.col); spotMat.opacity = 0.11 * gSpot * breathe
      pool.material.color.copy(w.col); pool.material.opacity = 0.4 * gSpot * breathe
      pool.scale.setScalar((5.6 + Math.sin(t * 2) * 0.35) / sx)
      const s = project3(_b2.set(w.x, wy + 0.7 + SPOT_H * 0.45, w.z))
      const ch = container.clientHeight
      const cy = clamp(s.y, ch * 0.4, ch * 0.6)                        // card rides the middle of the screen
      if (railLabel) railLabel.style.opacity = gCard > 0.25 ? "0" : "1"  // rail label yields to the card
      if (cornerTL) cornerTL.style.opacity = gCard.toFixed(2)
      if (cornerTR) cornerTR.style.opacity = gCard.toFixed(2)
      proj.style.opacity = gCard.toFixed(3)
      proj.style.transform = `translate(${s.x}px, ${cy + (1 - gCard) * 30}px) translate(-50%,-50%) scale(${(0.9 + gCard * 0.1).toFixed(3)})`
      proj.style.pointerEvents = gCard > 0.6 ? "auto" : "none"
    } else {
      spot.visible = false
      if (state !== "warp") proj.style.opacity = "0"
      proj.style.pointerEvents = "none"
      if (cornerTL) cornerTL.style.opacity = "0"
      if (cornerTR) cornerTR.style.opacity = "0"
    }

    renderer.render(scene, camera)
  }
  frame()

  // ── API ───────────────────────────────────────────────
  return {
    setTarget(i: number) { desired = clamp(i, -1, weights.length - 1) },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointerup", onUp)
      container.removeEventListener("pointermove", onMM)
      container.removeEventListener("pointerdown", onDown)
      container.removeEventListener("touchstart", onTS)
      container.removeEventListener("touchmove", onTM)
      container.removeEventListener("touchend", onTE)
      if (tunnel) tunnel.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose() })
      els.forEach((e) => e.remove())
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined
        if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((mm) => {
          const tex = (mm as THREE.MeshBasicMaterial).map
          if (tex) tex.dispose()
          mm.dispose()
        })
      })
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
