"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame }                   from "@react-three/fiber"
import * as THREE                     from "three"
import { type GalaxyParams }          from "../config"
import { GAL_VERT, GAL_FRAG }        from "./shaders"

export function Galaxy({ p }: { p: GalaxyParams }) {
  const ref = useRef<THREE.Points>(null)

  const { geo, mat } = useMemo(() => {
    const { count, branches, radius, spin, randomness, randomnessPower,
            innerColor, outerColor, size, rotationSpeed } = p
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3)
    const sca = new Float32Array(count),     rnd = new Float32Array(count * 3)
    const ic  = new THREE.Color(innerColor), oc  = new THREE.Color(outerColor)

    for (let i = 0; i < count; i++) {
      const r  = Math.random() * radius
      const ba = (i % branches) / branches * Math.PI * 2
      const rp = (pow: number) =>
        Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1)

      pos[i*3]   = Math.cos(ba + spin * r) * r
      pos[i*3+1] = 0
      pos[i*3+2] = Math.sin(ba + spin * r) * r
      rnd[i*3]   = rp(randomnessPower) * randomness * r
      rnd[i*3+1] = rp(randomnessPower) * randomness * r * 0.35
      rnd[i*3+2] = rp(randomnessPower) * randomness * r

      const mc   = ic.clone().lerp(oc, r / radius)
      col[i*3]   = mc.r; col[i*3+1] = mc.g; col[i*3+2] = mc.b
      sca[i]     = Math.random()
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute("position",    new THREE.BufferAttribute(pos, 3))
    g.setAttribute("aColor",      new THREE.BufferAttribute(col, 3))
    g.setAttribute("aScale",      new THREE.BufferAttribute(sca, 1))
    g.setAttribute("aRandomness", new THREE.BufferAttribute(rnd, 3))

    const m = new THREE.ShaderMaterial({
      vertexShader: GAL_VERT, fragmentShader: GAL_FRAG,
      uniforms: { uTime: {value:0}, uSize: {value:size}, uRotSpeed: {value:rotationSpeed} },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.count, p.branches, p.radius, p.spin, p.randomness, p.randomnessPower,
      p.innerColor, p.outerColor, p.size, p.rotationSpeed])

  useEffect(() => {
    mat.uniforms.uSize.value     = p.size
    mat.uniforms.uRotSpeed.value = p.rotationSpeed
  }, [mat, p.size, p.rotationSpeed])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ;(ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t
    ref.current.rotation.x = Math.sin(t * 0.15) * (10 * Math.PI / 180)
    ref.current.rotation.y = t * 0.03
  })

  return <points ref={ref} geometry={geo} material={mat} renderOrder={-1} />
}
