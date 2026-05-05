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
    const TWIST    = twist * Math.PI
    const halfH    = H / 2
    const armLen   = Math.max(rStart, 1)
    const bendR    = Math.max(arch, 0.1)
    const armTiltR = (armAngle * Math.PI) / 180
    const bezH     = bendR * 0.552

    const phiBot = angle
    const phiTop = angle + TWIST

    const p3 = (r: number, y: number, phi: number) =>
      new THREE.Vector3(r * Math.cos(phi), y, r * Math.sin(phi))

    const jR      = rMin + bendR
    const botJunc = p3(jR,   -halfH - bendR, phiBot)
    const botBody = p3(rMin, -halfH,         phiBot)
    const topBody = p3(rMin,  halfH,         phiTop)
    const topJunc = p3(jR,    halfH + bendR, phiTop)
    const botTip  = p3(jR + armLen * Math.cos(armTiltR), -halfH - bendR - armLen * Math.sin(armTiltR), phiBot)
    const topTip  = p3(jR + armLen * Math.cos(armTiltR),  halfH + bendR + armLen * Math.sin(armTiltR), phiTop)

    const botArm    = new THREE.LineCurve3(botTip, botJunc)
    const topArm    = new THREE.LineCurve3(topJunc, topTip)
    const botCorner = new THREE.CubicBezierCurve3(
      botJunc,
      p3(jR   - bezH * Math.cos(armTiltR), -halfH - bendR + bezH * Math.sin(armTiltR), phiBot),
      p3(rMin,                              -halfH - bezH,                               phiBot),
      botBody,
    )
    const topCorner = new THREE.CubicBezierCurve3(
      topBody,
      p3(rMin,                              halfH + bezH,                                phiTop),
      p3(jR   - bezH * Math.cos(armTiltR),  halfH + bendR - bezH * Math.sin(armTiltR),  phiTop),
      topJunc,
    )
    const bodyCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 60 }, (_, j) => {
        const s = j / 59
        return new THREE.Vector3(
          rMin * Math.cos(angle + TWIST * s),
          -halfH + s * H,
          rMin * Math.sin(angle + TWIST * s),
        )
      }),
    )

    const path = new THREE.CurvePath<THREE.Vector3>()
    path.add(botArm)
    path.add(botCorner)
    path.add(bodyCurve)
    path.add(topCorner)
    path.add(topArm)

    const cG = new THREE.TubeGeometry(path, 1500, 0.018, 7, false)
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
