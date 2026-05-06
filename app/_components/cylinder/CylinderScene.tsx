"use client"

import { useState, useCallback }   from "react"
import { Canvas }                   from "@react-three/fiber"
import { EffectComposer, Bloom }    from "@react-three/postprocessing"
import { DEF_GALAXY, DEF_CABLE, DEF_BLOOM } from "./config"
import { Scene }                    from "./Scene"
import { ProjectOverlay }           from "./cards/ProjectOverlay"
import { DEMO_CARDS }               from "./cards/data"

export function CylinderScene() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const handleClose = useCallback(() => setExpandedIdx(null), [])

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 22], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={[0, 0, 0]} />
        <Scene galaxy={DEF_GALAXY} cable={DEF_CABLE} onExpand={setExpandedIdx} />
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom
            intensity={DEF_BLOOM.intensity}
            luminanceThreshold={DEF_BLOOM.threshold}
            luminanceSmoothing={DEF_BLOOM.smoothing}
            radius={DEF_BLOOM.radius}
          />
        </EffectComposer>
      </Canvas>

      <ProjectOverlay
        card={expandedIdx !== null ? DEMO_CARDS[expandedIdx] : null}
        onClose={handleClose}
      />
    </div>
  )
}
