"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame }                   from "@react-three/fiber"
import * as THREE                     from "three"
import { type CableParams }           from "../config"
import { CORE_VERT, CORE_FRAG }      from "./shaders"

interface Props {
  angle:       number
  cp:          CableParams
  progressRef: React.MutableRefObject<number>
  timeRef:     React.MutableRefObject<number>
}

const BODY_PTS = 30

export function Cable({ angle, cp, progressRef, timeRef }: Props) {
  const coreRef = useRef<THREE.Mesh>(null)

  const [coreGeo, coreMat] = useMemo(() => {
    const { rStart, height: H, waist: rMin, twist, arch, armAngle } = cp
    const TWIST  = twist * Math.PI
    const halfH  = H / 2
    const tiltR  = (armAngle * Math.PI) / 180
    const phiBot = angle
    const phiTop = angle + TWIST

    const p3 = (r: number, y: number, phi: number) =>
      new THREE.Vector3(r * Math.cos(phi), y, r * Math.sin(phi))

    // Junction radius (where arm meets the arch) and arm-tip offset
    const jR    = rMin + arch
    const tipR  = jR + rStart * Math.cos(tiltR)
    const tipDY = rStart * Math.sin(tiltR)

    // Full cable: tip → junction → helix body → junction → tip
    const pts = [
      p3(tipR, -halfH - arch - tipDY, phiBot),        // bottom arm tip
      p3(jR,   -halfH - arch,         phiBot),        // bottom junction
      ...Array.from({ length: BODY_PTS }, (_, k) => { // helical body
        const t = k / (BODY_PTS - 1)
        return p3(rMin, -halfH + t * H, phiBot + TWIST * t)
      }),
      p3(jR,    halfH + arch,         phiTop),        // top junction
      p3(tipR,  halfH + arch + tipDY, phiTop),        // top arm tip
    ]

    const cG = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts), 1500, 0.018, 7, false,
    )
    const cM = new THREE.ShaderMaterial({
      uniforms: {
        uP:        { value: 0 },
        uTime:     { value: 0 },
        uGlow:     { value: cp.glowMult },
        uNeonColor:{ value: new THREE.Color(cp.neonColor) },
      },
      vertexShader: CORE_VERT, fragmentShader: CORE_FRAG,
      transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.DoubleSide,
    })
    return [cG, cM] as const
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle, cp.rStart, cp.height, cp.waist, cp.twist, cp.arch, cp.armAngle,
      cp.neonColor, cp.glowMult])

  useEffect(() => {
    if (!coreRef.current) return
    const m = coreRef.current.material as THREE.ShaderMaterial
    m.uniforms.uNeonColor.value = new THREE.Color(cp.neonColor)
    m.uniforms.uGlow.value      = cp.glowMult
  }, [cp.neonColor, cp.glowMult])

  useFrame(() => {
    if (!coreRef.current) return
    const m = coreRef.current.material as THREE.ShaderMaterial
    m.uniforms.uP.value    = progressRef.current
    m.uniforms.uTime.value = timeRef.current
  })

  return <mesh ref={coreRef} geometry={coreGeo} material={coreMat} />
}
