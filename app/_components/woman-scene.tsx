"use client"

import { useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame }          from "@react-three/fiber"
import { useGLTF }                   from "@react-three/drei"
import { EffectComposer, Bloom }     from "@react-three/postprocessing"
import * as THREE                    from "three"

useGLTF.preload("/models/female_head.glb")
useGLTF.preload("/models/hololens.glb")

function HeadWithHoloLens() {
  const head  = useGLTF("/models/female_head.glb")
  const lens  = useGLTF("/models/hololens.glb")
  const pivot = useRef<THREE.Group>(null)

  const headScene = useMemo(() => head.scene.clone(true), [head.scene])
  const lensScene = useMemo(() => lens.scene.clone(true), [lens.scene])

  // Normalise head to 2 units tall, centred at origin
  const { hS, hCenter } = useMemo(() => {
    const box    = new THREE.Box3().setFromObject(headScene)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const hS     = Math.max(size.x, size.y, size.z) > 0 ? 2 / Math.max(size.x, size.y, size.z) : 1
    return { hS, hCenter: center }
  }, [headScene])

  // Normalise HoloLens to ~1.4 units wide (fits across the head)
  const lS = useMemo(() => {
    const box  = new THREE.Box3().setFromObject(lensScene)
    const size = box.getSize(new THREE.Vector3())
    return size.x > 0 ? 1.4 / size.x : 1
  }, [lensScene])

  // Gentle idle: slight look-right + slow nod
  useFrame(({ clock }) => {
    if (!pivot.current) return
    const t = clock.getElapsedTime()
    pivot.current.rotation.y = -0.35 + Math.sin(t * 0.25) * 0.06   // mostly facing right
    pivot.current.rotation.x =  0.04 + Math.sin(t * 0.18) * 0.03   // slight nod
  })

  // Head centre offset so the group is centred at origin
  const hOffset = new THREE.Vector3(
    -hCenter.x * hS,
    -hCenter.y * hS,
    -hCenter.z * hS,
  )

  return (
    <group ref={pivot}>
      {/* Head */}
      <group scale={hS} position={hOffset}>
        <primitive object={headScene} />
      </group>

      {/* HoloLens — at eye-level, in front of face */}
      <primitive
        object={lensScene}
        scale={lS}
        position={[0, 0.22, 0.52]}
        rotation={[0, 0, 0]}
      />
    </group>
  )
}

export function WomanScene() {
  return (
    <Canvas
      camera={{ position: [0.4, 0.25, 2.8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Warm key light from upper-right, cool fill from left */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 4, 3]}   intensity={1.4} color="#fff0e0" />
      <directionalLight position={[-3, 1, -2]} intensity={0.5} color="#99bbff" />
      <pointLight       position={[0, -1, 2]}  intensity={0.3} color="#ff9944" />

      <Suspense fallback={null}>
        <HeadWithHoloLens />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.55} luminanceSmoothing={0.9} radius={0.5} />
      </EffectComposer>
    </Canvas>
  )
}
