"use client"

import { useRef, useMemo, Suspense, useCallback, useEffect, useState } from "react"
import { Canvas, useFrame, useThree }                        from "@react-three/fiber"
import { useGLTF, useTexture, Sky }                          from "@react-three/drei"
import { EffectComposer, Bloom }                             from "@react-three/postprocessing"
import * as THREE                                            from "three"
import { useMobile }                                         from "../_hooks/use-mobile"
import { trackProjectClick }                                 from "../_lib/analytics"

type V3 = [number, number, number]

// ── Temple ─────────────────────────────────────────────────────────────────────
function TempleModel() {
  const { scene } = useGLTF("/models/Temple.glb")
  const cloned    = useMemo(() => scene.clone(true), [scene])

  const { s, offset } = useMemo(() => {
    const box    = new THREE.Box3().setFromObject(cloned)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s      = Math.max(size.x, size.y, size.z) > 0 ? 3 / Math.max(size.x, size.y, size.z) : 1
    return { s, offset: center.multiplyScalar(-s) }
  }, [cloned])

  return (
    <group scale={s} position={offset}>
      <primitive object={cloned} />
    </group>
  )
}

// ── Ground ─────────────────────────────────────────────────────────────────────
function Ground() {
  const [diff, arm, nor] = useTexture([
    "/textures/rocky-trail/diff.jpg",
    "/textures/rocky-trail/arm.jpg",
    "/textures/rocky-trail/nor.jpg",
  ])

  useMemo(() => {
    ;[diff, arm, nor].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(8, 8)
    })
  }, [diff, arm, nor])

  const alphaMap = useMemo(() => {
    const s = 512, half = s / 2
    const c = document.createElement("canvas")
    c.width = c.height = s
    const ctx = c.getContext("2d")!
    const g = ctx.createRadialGradient(half, half, half * 0.52, half, half, half * 1.05)
    g.addColorStop(0, "white")
    g.addColorStop(1, "black")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.65, 0]}>
      <planeGeometry args={[40, 40, 128, 128]} />
      <meshStandardMaterial
        map={diff}
        aoMap={arm}
        roughnessMap={arm}
        metalnessMap={arm}
        normalMap={nor}
        normalScale={new THREE.Vector2(1.4, 1.4)}
        displacementMap={diff}
        displacementScale={0.06}
        alphaMap={alphaMap}
        transparent
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

// ── Person (head + HoloLens combined) — looks at the temple group dynamically ──
function PersonModel({
  templeGroupRef, worldGroupRef, dbg, eyeRef,
}: {
  templeGroupRef: React.RefObject<THREE.Group | null>
  worldGroupRef:  React.RefObject<THREE.Group | null>
  dbg: { womanPos: V3; personScale: number }
  eyeRef: React.RefObject<THREE.Group | null>
}) {
  const { scene } = useGLTF("/models/person_with_hololens.glb")
  // Clone and put person on layer 1 so the POV camera (layer 0 only) skips it
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(node => { node.layers.set(1) })
    return c
  }, [scene])
  const pivotRef  = useRef<THREE.Group>(null)

  // Normalise the combined model to 1.2 units tall, centred at origin
  const { s, offset } = useMemo(() => {
    const box    = new THREE.Box3().setFromObject(cloned)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s      = 1.2 / Math.max(size.x, size.y, size.z)
    return { s, offset: center.multiplyScalar(-s) }
  }, [cloned])

  const _tp = useMemo(() => new THREE.Vector3(), [])
  const _pp = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    if (!pivotRef.current) return
    const t = clock.getElapsedTime()

    if (templeGroupRef.current && worldGroupRef.current) {
      templeGroupRef.current.getWorldPosition(_tp)
      pivotRef.current.getWorldPosition(_pp)
      const dx = _tp.x - _pp.x
      const dz = _tp.z - _pp.z
      const worldAngle = Math.atan2(dx, dz)
      const localAngle = worldAngle - worldGroupRef.current.rotation.y
      pivotRef.current.rotation.y = localAngle + Math.sin(t * 0.22) * 0.04
    }

    pivotRef.current.rotation.x = -0.18 + Math.sin(t * 0.16) * 0.03
  })

  return (
    <group position={dbg.womanPos} scale={dbg.personScale}>
      <group ref={pivotRef}>
        <group ref={eyeRef} position={[0, 0.22, 0.05]} />
        <group scale={s} position={offset}>
          <primitive object={cloned} />
        </group>
      </group>
    </group>
  )
}

function Fallback() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1,1,1]} />
      <meshStandardMaterial color="#1a1a2e" wireframe />
    </mesh>
  )
}

// ── Camera: zoom + elevation + orbital angle ──────────────────────────────────
function ZoomSync({
  distRef, elevRef, angleRef,
}: {
  distRef:  React.RefObject<number>
  elevRef:  React.RefObject<number>
  angleRef: React.RefObject<number>
}) {
  const camera    = useThree(s => s.camera)
  const animAngle = useRef(0)   // smoothly animated toward angleRef target

  useFrame(() => {
    // Shortest-path angle lerp so transitions arc around the scene, not through it
    let da = angleRef.current - animAngle.current
    if (da >  Math.PI) da -= 2 * Math.PI
    if (da < -Math.PI) da += 2 * Math.PI
    animAngle.current += da * 0.05

    const dist = distRef.current
    const tx   = Math.sin(animAngle.current) * dist
    const tz   = Math.cos(animAngle.current) * dist
    camera.position.x += (tx            - camera.position.x) * 0.08
    camera.position.y += (elevRef.current - camera.position.y) * 0.08
    camera.position.z += (tz            - camera.position.z) * 0.08
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ── 3D arrow indicators (cylinder shaft + cone head) ─────────────────────────
function PersonArrows({ pos, onMove }: { pos: V3; onMove: (delta: number) => void }) {
  const fwdRef = useRef<THREE.Group>(null)
  const bwdRef = useRef<THREE.Group>(null)
  const yAngle = Math.atan2(-pos[0], -pos[2])

  const CYL_R  = 0.008   // shaft radius — long and thin
  const CYL_L  = 0.24    // shaft length
  const CONE_R = 0.030   // arrowhead base radius
  const CONE_H = 0.072   // arrowhead height
  const START  = 0.06    // gap between person centre and arrow start

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const bob = Math.sin(t * 2.2) * 0.014
    if (fwdRef.current) fwdRef.current.position.y =  bob
    if (bwdRef.current) bwdRef.current.position.y = -bob
  })

  return (
    <group position={[pos[0], pos[1] - 0.13, pos[2]]} rotation={[0, yAngle, 0]}>

      {/* Forward — toward temple, cyan glow */}
      <group ref={fwdRef}
        onPointerDown={e => { e.stopPropagation(); onMove(0.25) }}
        onPointerOver={() => { document.body.style.cursor = "pointer" }}
        onPointerOut={() => { document.body.style.cursor = "" }}
      >
        {/* shaft — cylinder rotated to lie along +Z */}
        <mesh position={[0, 0, START + CYL_L / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[CYL_R, CYL_R, CYL_L, 8]} />
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
        {/* head — cone tip pointing in +Z */}
        <mesh position={[0, 0, START + CYL_L + CONE_H / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[CONE_R, CONE_H, 8]} />
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
      </group>

      {/* Backward — away from temple, rotated 180° so it extends in −Z, slate */}
      <group ref={bwdRef} rotation={[0, Math.PI, 0]}
        onPointerDown={e => { e.stopPropagation(); onMove(-0.25) }}
        onPointerOver={() => { document.body.style.cursor = "pointer" }}
        onPointerOut={() => { document.body.style.cursor = "" }}
      >
        <mesh position={[0, 0, START + CYL_L / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[CYL_R, CYL_R, CYL_L, 8]} />
          <meshStandardMaterial color="#94a3b8" emissive="#64748b" emissiveIntensity={0.25} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, START + CYL_L + CONE_H / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[CONE_R, CONE_H, 8]} />
          <meshStandardMaterial color="#94a3b8" emissive="#64748b" emissiveIntensity={0.25} roughness={0.5} />
        </mesh>
      </group>

    </group>
  )
}

// ── POV constants ──────────────────────────────────────────────────────────────
const POV_W = 480
const POV_H = 300

// ── POVRenderer: owns ALL rendering for the canvas ────────────────────────────
// Consolidates POV render, main scene render, and overlay into one useFrame so
// the orthographic overlay camera is computed fresh from the actual size every
// frame — fixes the fullscreen misalignment bug.
function POVRenderer({
  rt, eyeRef, templeRef, dbgRef,
}: {
  rt:        THREE.WebGLRenderTarget
  eyeRef:    React.RefObject<THREE.Group | null>
  templeRef: React.RefObject<THREE.Group | null>
  dbgRef:    React.RefObject<{ px:number; py:number; pz:number; lx:number; ly:number; lz:number; fov:number }>
}) {
  const { gl, scene, camera } = useThree()

  // POV perspective camera — skips layer 1 (person model) so it doesn't film itself
  const povCam = useMemo(() => {
    const c = new THREE.PerspectiveCamera(68, POV_W / POV_H, 0.01, 200)
    c.layers.set(0)
    return c
  }, [])

  // Orthographic overlay camera: fixed NDC frustum [-1,1] so no resize logic needed
  const ortho = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10), [])

  // Overlay scene holds just the POV pane mesh
  const overlayScene = useMemo(() => new THREE.Scene(), [])
  const paneMesh = useMemo(() => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false, depthTest: false }),
    )
    return m
  }, [rt])
  useEffect(() => {
    overlayScene.add(paneMesh)
    return () => { overlayScene.remove(paneMesh) }
  }, [overlayScene, paneMesh])

  // Main camera must see all layers (person is on layer 1)
  useEffect(() => { camera.layers.enableAll() }, [camera])

  const _t = useMemo(() => new THREE.Vector3(), [])

  // Priority 1: fill the POV render target before EffectComposer renders the main scene.
  // Runs AFTER priority-0 PersonModel look-at (pivot already facing temple),
  // so eye world position is always current when we sample it.
  useFrame(({ gl, scene }) => {
    if (!eyeRef.current || !templeRef.current) return
    const d = dbgRef.current

    // Force the whole scene's world matrices to be fresh so getWorldPosition
    // picks up the drag rotation that was set synchronously by onPointerMove
    scene.updateMatrixWorld()

    eyeRef.current.getWorldPosition(povCam.position)
    povCam.position.x += d.px
    povCam.position.y += d.py
    povCam.position.z += d.pz

    templeRef.current.getWorldPosition(_t)
    _t.x += d.lx
    _t.y += d.ly
    _t.z += d.lz

    if (povCam.fov !== d.fov) { povCam.fov = d.fov; povCam.updateProjectionMatrix() }
    povCam.lookAt(_t)

    gl.setRenderTarget(rt)
    gl.render(scene, povCam)
    gl.setRenderTarget(null)
  }, 1)

  // Priority 2: draw the overlay AFTER EffectComposer (priority 1) has written Bloom to the framebuffer
  useFrame(({ gl, size }) => {
    const sa   = size.width / size.height
    const w    = 0.58
    const h    = w * sa / (POV_W / POV_H)
    const padX = 32 / size.width
    const padY = 32 / size.height
    paneMesh.scale.set(w, h, 1)
    paneMesh.position.set(1 - w / 2 - padX, -(1 - h / 2 - padY), -0.5)

    gl.autoClear = false
    gl.clearDepth()
    gl.render(overlayScene, ortho)
    gl.autoClear = true
  }, 2)

  return null
}

// ── Preloader ──────────────────────────────────────────────────────────────────
useGLTF.preload("/models/Temple.glb")
useGLTF.preload("/models/person_with_hololens.glb")


// ── Main export ────────────────────────────────────────────────────────────────
export function TempleViewer() {
  // Groups
  const templeGroupRef = useRef<THREE.Group>(null)
  const worldGroupRef  = useRef<THREE.Group>(null)

  // Drag state
  const activeGroup = useRef<THREE.Group | null>(null)
  const dragStart   = useRef({ x: 0, rotY: 0, y: 0, camY: 2 })

  // Camera targets — all lerped in ZoomSync
  const cameraDistRef  = useRef(8)
  const cameraElevRef  = useRef(2)
  const cameraAngleRef = useRef(0)  // 0 = front, π/2 = side, π = back

  // POV feed
  const eyeRef = useRef<THREE.Group>(null)
  const rt     = useMemo(() => new THREE.WebGLRenderTarget(POV_W, POV_H), [])
  useEffect(() => () => rt.dispose(), [rt])

  const povDbg = useRef({ px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0, fov: 68 })

  // Person position — controlled by arrow clicks
  const [personPos, setPersonPos] = useState<V3>([-2.640, -0.500, 0.710])
  const movePersonBy = useCallback((delta: number) => {
    setPersonPos(prev => {
      const dist = Math.sqrt(prev[0] ** 2 + prev[2] ** 2)
      const newDist = Math.max(1.5, Math.min(5.0, dist - delta))
      const scale = newDist / dist
      return [prev[0] * scale, prev[1], prev[2] * scale] as V3
    })
  }, [])

  const isMobile = useMobile()

  // Fullscreen toggle
  const [isFullscreen, setIsFullscreen] = useState(false)
  // 3D controls stay locked behind an explicit "tap to explore" mask — until
  // then every gesture (scroll, swipe) belongs to the page, not the temple.
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsFullscreen(false); setArmed(false) } }
    // Auto-exit 3D when the user scrolls to another section (KovilLens sits at
    // snap 3 of the page scroll budget — see page.tsx). Half a viewport away = gone.
    const onScroll = () => {
      if (Math.abs(window.scrollY - 3 * window.innerHeight) > window.innerHeight * 0.5) setArmed(false)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // Pinch-to-zoom refs
  const pinchDistRef       = useRef<number | null>(null)
  const pinchStartCamDist  = useRef(8)

  const handleGroupDown = useCallback((
    e: { clientX: number; clientY: number; stopPropagation: () => void },
    groupRef: React.RefObject<THREE.Group | null>,
  ) => {
    e.stopPropagation()
    if (!groupRef.current) return
    activeGroup.current = groupRef.current
    dragStart.current   = { x: e.clientX, rotY: groupRef.current.rotation.y, y: e.clientY, camY: cameraElevRef.current }
  }, [])


  return (
    <div
      data-no-scroll-snap={armed ? "true" : undefined}
      style={{
        position:    isFullscreen ? "fixed" : "relative",
        inset:       isFullscreen ? 0 : "auto",
        zIndex:      isFullscreen ? 50 : "auto",
        width:       "100%",
        height:      "100%",
        cursor:      activeGroup.current ? "grabbing" : "default",
        background:  "#07070f",
        touchAction: armed ? "none" : "auto",
      }}
      onPointerMove={e => {
        if (!activeGroup.current) return
        const dx = e.clientX - dragStart.current.x
        const dy = e.clientY - dragStart.current.y
        activeGroup.current.rotation.y = dragStart.current.rotY + dx * 0.008
        cameraElevRef.current = Math.max(0.2, Math.min(5.0, dragStart.current.camY - dy * 0.005))
      }}
      onPointerUp={() => { activeGroup.current = null }}
      onPointerLeave={() => { activeGroup.current = null }}
      onWheel={e => {
        if (!armed) return
        cameraDistRef.current = Math.max(5, Math.min(15, cameraDistRef.current + e.deltaY * 0.01))
      }}
      onTouchStart={e => {
        if (!armed) return
        if (e.touches.length === 2) {
          activeGroup.current = null  // cancel single-finger drag when second finger arrives
          const dx = e.touches[0].clientX - e.touches[1].clientX
          const dy = e.touches[0].clientY - e.touches[1].clientY
          pinchDistRef.current      = Math.sqrt(dx * dx + dy * dy)
          pinchStartCamDist.current = cameraDistRef.current
        }
      }}
      onTouchMove={e => {
        if (!armed) return
        if (e.touches.length !== 2 || pinchDistRef.current === null) return
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const d  = Math.sqrt(dx * dx + dy * dy)
        cameraDistRef.current = Math.max(5, Math.min(15, pinchStartCamDist.current * (pinchDistRef.current / d)))
      }}
      onTouchEnd={() => { pinchDistRef.current = null }}
    >
      <Canvas
        camera={{ position: [0, 2, 8], fov: 56 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        {/* Exponential fog fades ground edges into the sky horizon, creating an infinite-ground feel */}
        <fogExp2 attach="fog" args={["#b8cfd8", 0.038]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 20, 100]} intensity={2.2} color="#fff4d0" castShadow />
        <directionalLight position={[-4, 6, -8]}    intensity={0.3} color="#b0d0ff" />
        <pointLight       position={[0, -0.5, 3]}   intensity={0.25} color="#ff9944" />

        {/* Temple group — drag to rotate temple independently */}
        <group
          ref={templeGroupRef}
          position={[0, 0, 0]}
          onPointerDown={e => handleGroupDown(e, templeGroupRef)}
        >
          <Suspense fallback={<Fallback />}>
            <TempleModel />
          </Suspense>
        </group>

        {/* World group — drag to rotate person + ground together */}
        <group
          ref={worldGroupRef}
          position={[0, 0, 0]}
          onPointerDown={e => handleGroupDown(e, worldGroupRef)}
        >
          <Suspense fallback={null}><Ground /></Suspense>
          <Suspense fallback={null}>
            <PersonModel
              templeGroupRef={templeGroupRef}
              worldGroupRef={worldGroupRef}
              dbg={{ womanPos: personPos, personScale: 0.280 }}
              eyeRef={eyeRef}
            />
          </Suspense>
          <PersonArrows pos={personPos} onMove={movePersonBy} />
        </group>

        <POVRenderer rt={rt} eyeRef={eyeRef} templeRef={templeGroupRef} dbgRef={povDbg} />
        <ZoomSync distRef={cameraDistRef} elevRef={cameraElevRef} angleRef={cameraAngleRef} />

        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={0.45} luminanceSmoothing={0.85} radius={0.6} />
        </EffectComposer>
      </Canvas>

      {/* Edge vignette — fades canvas edges to create the infinite-ground illusion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 75% 65% at 50% 55%, transparent 40%, rgba(7,7,15,0.82) 100%)",
        }}
      />

      {/* HoloLens POV frame — decorative overlay aligned with the Hud plane */}
      <div
        className="absolute pointer-events-none z-10"
        style={{ bottom: 16, right: 16, width: "29%", aspectRatio: `${POV_W}/${POV_H}` }}
      >
        {/* Outer glow border */}
        <div className="absolute inset-0 rounded-sm border border-cyan-400/25"
          style={{ boxShadow: "0 0 18px rgba(0,200,255,0.10), inset 0 0 18px rgba(0,200,255,0.04)" }} />
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/55" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/55" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/55" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/55" />
        {/* Labels */}
        <span className="absolute top-1.5 left-2.5 font-mono text-[8px] tracking-widest uppercase text-cyan-400/60 select-none">
          ◉ HoloLens POV
        </span>
        <span className="absolute bottom-1.5 right-2 font-mono text-[8px] tracking-widest uppercase text-cyan-300/30 select-none">
          AR · Live
        </span>
        {/* Scan lines */}
        <div className="absolute inset-0" style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)",
        }} />
      </div>

      {/* HoloLens explainer — top-left, plain words. Survives mask AND 3D mode. */}
      <p
        className="absolute z-[45] pointer-events-none font-mono leading-relaxed text-left text-white/55 select-none
                   bg-[#07070f]/70 backdrop-blur-sm border border-white/10 rounded-sm px-2.5 py-2"
        style={{ top: 12, left: 12, maxWidth: isMobile ? 200 : 265, fontSize: isMobile ? 8 : 9 }}
      >
        See the tiny figure? They&apos;re wearing a{" "}
        <span className="text-cyan-300/90">Microsoft HoloLens&nbsp;2</span> headset —
        the small screen at the bottom-right shows the temple exactly as they see it,{" "}
        <span className="text-cyan-300/90">through their eyes</span>.
      </p>

      {/* Real-demo CTA — bottom-left, stacked above the description/presets block */}
      <div
        className="absolute z-[45] pointer-events-none"
        style={{
          left:   16,
          bottom: isMobile ? "calc(max(16px, env(safe-area-inset-bottom, 16px)) + 44px)" : 132,
        }}
      >
        <a
          href="https://drive.google.com/file/d/1lllf3tCQryNS4RoeqSIFmSF3VF5SIgCL/view"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackProjectClick("KovilLens · Real Demo")}
          className="pointer-events-auto relative inline-flex items-center gap-2 font-mono tracking-[0.18em]
                     uppercase font-medium rounded-sm text-[#07070f] bg-[#FBBF24]
                     hover:bg-[#ffd34d] hover:scale-[1.04] transition-all duration-150"
          style={{
            fontSize: isMobile ? 9 : 10,
            padding:  isMobile ? "7px 12px" : "8px 14px",
            boxShadow: "0 0 26px rgba(251,191,36,0.35)",
          }}
        >
          <span className="absolute -inset-1 rounded-sm border border-[#FBBF24]/60 animate-pulse pointer-events-none" />
          <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor"><path d="M0 0l9 5-9 5z" /></svg>
          Watch the real demo
        </a>
      </div>

      {/* Mobile fullscreen exit — large pill at top-right, above safe area */}
      {isMobile && isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          aria-label="Exit fullscreen"
          className="absolute z-20 flex items-center gap-2 font-mono text-[11px] tracking-widest
                     uppercase text-white/70 bg-[#07070f]/85 border border-white/20
                     backdrop-blur-sm rounded-sm px-3"
          style={{
            top:    "max(20px, env(safe-area-inset-top, 20px))",
            right:  16,
            height: 44,  // iOS minimum tap target
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="1" y1="1" x2="9" y2="9" />
            <line x1="9" y1="1" x2="1" y2="9" />
          </svg>
          Exit
        </button>
      )}

      {/* Description + view preset buttons + fullscreen toggle */}
      <div
        className="absolute left-4 z-10 flex flex-col gap-2 items-start max-w-[280px]"
        style={{
          bottom: isFullscreen && isMobile
            ? "max(16px, env(safe-area-inset-bottom, 16px))"
            : 16,
        }}
      >
        {!isMobile && (
          <p className="font-mono text-[9px] leading-relaxed text-white/30 select-none">
            Consider this the trailer. The actual KovilLens experience layers gesture
            controls, animated AR overlays, and game-like exploration onto a real
            9th-century Chola temple — through a HoloLens&nbsp;2, with your bare hands.
          </p>
        )}
      <div className="flex gap-1.5 items-center">
        {([
          { label: "Front", angle: 0 },
          { label: "Side",  angle: Math.PI / 2 },
          { label: "Back",  angle: Math.PI },
        ] as const).map(({ label, angle }) => (
          <button
            key={label}
            onClick={() => {
              // Offset by the temple's current Y rotation so the view is always relative to it
              cameraAngleRef.current = (templeGroupRef.current?.rotation.y ?? 0) + angle
            }}
            className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1
                       bg-[#07070f]/70 border border-white/15 text-white/40
                       hover:text-white/75 hover:border-white/35
                       transition-colors duration-150 rounded-sm backdrop-blur-sm"
          >
            {label}
          </button>
        ))}

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* Desktop fullscreen toggle — on mobile the top-right Exit button handles this */}
        {!isMobile && (
          <button
            onClick={() => setIsFullscreen(f => !f)}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="p-1.5 bg-[#07070f]/70 border border-white/15 text-white/40
                       hover:text-white/75 hover:border-white/35
                       transition-colors duration-150 rounded-sm backdrop-blur-sm"
          >
            {isFullscreen ? (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 1v3H1M8 1v3h3M4 11v-3H1M8 11v-3h3" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 4V1h3M8 1h3v3M11 8v3H8M3 11H1V8" />
              </svg>
            )}
          </button>
        )}

        {/* Mobile fullscreen enter button (exit is the top-right pill) */}
        {isMobile && !isFullscreen && (
          <button
            onClick={() => setIsFullscreen(true)}
            aria-label="Enter fullscreen"
            className="p-1.5 bg-[#07070f]/70 border border-white/15 text-white/40
                       hover:text-white/75 hover:border-white/35
                       transition-colors duration-150 rounded-sm backdrop-blur-sm"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 4V1h3M8 1h3v3M11 8v3H8M3 11H1V8" />
            </svg>
          </button>
        )}
      </div>
      </div>

      {/* Activation mask — the page owns every gesture until the user opts in */}
      {!armed && (
        <button
          onClick={() => setArmed(true)}
          aria-label="Activate 3D controls"
          className="absolute inset-0 z-40 flex items-center justify-center cursor-pointer group"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(7,7,15,.10), rgba(7,7,15,.55))" }}
        >
          <span className="relative flex flex-col items-center gap-1.5 px-6 py-4 bg-[#07070f]/75 backdrop-blur-sm
                           transition-transform duration-200 group-hover:scale-[1.04]">
            <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-cyan-400/70" />
            <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-cyan-400/70" />
            <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-cyan-400/70" />
            <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-cyan-400/70" />
            <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-cyan-300/90 animate-pulse">
              {isMobile ? "Tap to explore in 3D" : "Click to explore in 3D"}
            </span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-white/40">
              drag · rotate&nbsp;&nbsp;—&nbsp;&nbsp;{isMobile ? "pinch" : "scroll"} · zoom
            </span>
          </span>
        </button>
      )}

      {/* Exit 3D — hands the gestures back to the page (top-right; caption owns top-left) */}
      {armed && !isFullscreen && (
        <button
          onClick={() => setArmed(false)}
          aria-label="Exit 3D controls"
          className="absolute top-3 right-3 z-40 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5
                     bg-[#07070f]/70 border border-white/15 text-white/45
                     hover:text-white/80 hover:border-white/35
                     transition-colors duration-150 rounded-sm backdrop-blur-sm"
        >
          ✕ Exit 3D
        </button>
      )}

    </div>
  )
}
