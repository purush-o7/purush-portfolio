"use client"

import { useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame }          from "@react-three/fiber"
import { useGLTF, OrbitControls }    from "@react-three/drei"
import * as THREE                    from "three"

function TempleModel() {
  const { scene } = useGLTF("/models/Temple.glb")
  const ref = useRef<THREE.Group>(null)

  // Clone so multiple mounts don't share the same scene graph
  const cloned = useMemo(() => scene.clone(true), [scene])

  const { s, offset } = useMemo(() => {
    const box    = new THREE.Box3().setFromObject(cloned)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const s      = maxDim > 0 ? 3 / maxDim : 1
    return { s, offset: center.multiplyScalar(-s) }
  }, [cloned])

  return (
    <group ref={ref} scale={s} position={offset}>
      <primitive object={cloned} />
    </group>
  )
}

function Fallback() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1a1a2e" wireframe />
    </mesh>
  )
}

// Preload so it starts fetching before the section is scrolled to
useGLTF.preload("/models/Temple.glb")

export function TempleViewer() {
  return (
    <div data-no-scroll-snap="true" style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 1.2, 5], fov: 52 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 10, 5]}  intensity={1.6} color="#fff6e0" castShadow />
        <directionalLight position={[-5, 4, -4]} intensity={0.5} color="#b0c8ff" />
        <pointLight       position={[0, -1, 2]}  intensity={0.4} color="#ff9944" />

        <Suspense fallback={<Fallback />}>
          <TempleModel />
        </Suspense>

        <OrbitControls
          autoRotate
          autoRotateSpeed={1.2}
          enableZoom={true}
          enablePan={true}
          enableDamping
          dampingFactor={0.06}
          minPolarAngle={0}
          maxPolarAngle={Math.PI * 0.72}
          rotateSpeed={0.7}
          panSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={2}
          maxDistance={12}
        />
      </Canvas>
    </div>
  )
}
