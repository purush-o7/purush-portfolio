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

    const jR    = rMin + arch
    const tipR  = jR + rStart * Math.cos(tiltR)
    const tipDY = rStart * Math.sin(tiltR)

    // Physical model: thread constrained at 4 rings.
    // Arms attach at ring angles; twist distributes evenly between the four rings.
    //
    //   bottom arm tip
    //   bottom junction (jR)
    //   bottom ring      <- thread enters cylinder at phiBot, no twist yet
    //   lower bangle     <- h/4,  twisted TWIST * 0.25
    //   upper bangle     <- 3h/4, twisted TWIST * 0.75
    //   top ring         <- thread exits cylinder at phiTop
    //   top junction (jR)
    //   top arm tip

    const pts = [
      p3(tipR, -halfH - arch - tipDY, phiBot),              // bottom arm tip
      p3(jR,   -halfH - arch,         phiBot),              // bottom junction
      p3(rMin, -halfH,                phiBot),              // bottom ring
      p3(rMin, -halfH + H * 0.25,     phiBot + TWIST * 0.25), // lower bangle (h/4)
      p3(rMin, -halfH + H * 0.75,     phiBot + TWIST * 0.75), // upper bangle (3h/4)
      p3(rMin,  halfH,                phiTop),              // top ring
      p3(jR,    halfH + arch,         phiTop),              // top junction
      p3(tipR,  halfH + arch + tipDY, phiTop),              // top arm tip
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
