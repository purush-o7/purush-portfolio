"use client"

import { useRef, useMemo, Suspense, useCallback } from "react"
import { Canvas, useFrame, useThree }                        from "@react-three/fiber"
import { useGLTF, useTexture, Sky }                          from "@react-three/drei"
import { EffectComposer, Bloom }                             from "@react-three/postprocessing"
import * as THREE                                            from "three"

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
  templeGroupRef, worldGroupRef, dbg,
}: {
  templeGroupRef: React.RefObject<THREE.Group | null>
  worldGroupRef:  React.RefObject<THREE.Group | null>
  dbg: { womanPos: V3; personScale: number }
}) {
  const { scene } = useGLTF("/models/person_with_hololens.glb")
  const cloned    = useMemo(() => scene.clone(true), [scene])
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
      data-no-scroll-snap="true"
      style={{ position: "relative", width: "100%", height: "100%", cursor: activeGroup.current ? "grabbing" : "default" }}
      onPointerMove={e => {
        if (!activeGroup.current) return
        const dx = e.clientX - dragStart.current.x
        const dy = e.clientY - dragStart.current.y
        activeGroup.current.rotation.y = dragStart.current.rotY + dx * 0.008
        // Vertical drag lifts/lowers the camera — clamped so sky and ground floor stay visible
        cameraElevRef.current = Math.max(0.2, Math.min(5.0, dragStart.current.camY - dy * 0.005))
      }}
      onPointerUp={() => { activeGroup.current = null }}
      onPointerLeave={() => { activeGroup.current = null }}
      onWheel={e => {
        cameraDistRef.current = Math.max(5, Math.min(15, cameraDistRef.current + e.deltaY * 0.01))
      }}
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
              dbg={{ womanPos: [-2.640, -0.500, 0.710], personScale: 0.280 }}
            />
          </Suspense>
        </group>

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

      {/* View preset buttons */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-1.5">
        {([
          { label: "Front", angle: 0 },
          { label: "Side",  angle: Math.PI / 2 },
          { label: "Back",  angle: Math.PI },
        ] as const).map(({ label, angle }) => (
          <button
            key={label}
            onClick={() => { cameraAngleRef.current = angle }}
            className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1
                       bg-[#07070f]/70 border border-white/15 text-white/40
                       hover:text-white/75 hover:border-white/35
                       transition-colors duration-150 rounded-sm backdrop-blur-sm"
          >
            {label}
          </button>
        ))}
      </div>

    </div>
  )
}
