"use client"

import { useRef, useEffect }  from "react"
import { useFrame }           from "@react-three/fiber"
import * as THREE             from "three"
import { type GalaxyParams, type CableParams } from "./config"
import { Galaxy }             from "./galaxy/Galaxy"
import { Cable }              from "./cable/Cable"
import { HelixCards }         from "./cards/HelixCards"

interface Props {
  galaxy:   GalaxyParams
  cable:    CableParams
  onExpand: (i: number) => void
}

export function Scene({ galaxy, cable, onExpand }: Props) {
  const progressRef    = useRef(0)
  const timeRef        = useRef(0)
  const cableGroupRef  = useRef<THREE.Group>(null)
  const galaxyGroupRef = useRef<THREE.Group>(null)

  // Raw + smoothed mouse in normalised -1..1 range
  const mouseRaw    = useRef({ x: 0, y: 0 })
  const mouseSmooth = useRef({ x: 0, y: 0 })

  // Constant-speed rotation — scroll only flips direction
  const ROT_SPEED   = 0.003          // radians/frame, fixed forever
  const rotDir      = useRef(1)      // +1 or -1
  const lastScrollY = useRef(0)
  const rotY        = useRef(0)

  useEffect(() => {
    lastScrollY.current = window.scrollY
    function onScroll() {
      const vh = window.innerHeight
      const dy = window.scrollY - lastScrollY.current
      lastScrollY.current = window.scrollY
      if (dy > 0) rotDir.current =  1            // scroll down → forward
      if (dy < 0) rotDir.current = -1            // scroll up   → backward
      progressRef.current = Math.max(0, Math.min((window.scrollY - 8 * vh) / vh, 1))
    }
    function onMouse(e: MouseEvent) {
      mouseRaw.current.x =  (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRaw.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("mousemove", onMouse, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("mousemove", onMouse)
    }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    timeRef.current = t

    // Smooth mouse with low-pass filter
    const s = mouseSmooth.current
    const r = mouseRaw.current
    s.x += (r.x - s.x) * 0.04
    s.y += (r.y - s.y) * 0.04

    // Cable group: constant-speed rotation, direction set by scroll
    if (cableGroupRef.current) {
      rotY.current += ROT_SPEED * rotDir.current
      cableGroupRef.current.rotation.y = rotY.current
      cableGroupRef.current.position.x = s.x * 0.6
      cableGroupRef.current.position.y = s.y * 0.6
    }

    // Galaxy group: deeper parallax — moves more, opposite direction
    // gives clear depth separation from the cables
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.position.x = -s.x * 2.2
      galaxyGroupRef.current.position.y = -s.y * 2.2
    }
  })

  return (
    <>
      <group ref={galaxyGroupRef}>
        <Galaxy p={galaxy} />
      </group>
      <group ref={cableGroupRef}>
        {Array.from({ length: cable.count }, (_, i) => (
          <Cable
            key={i}
            angle={(2 * Math.PI * i) / cable.count}
            cp={cable}
            progressRef={progressRef}
            timeRef={timeRef}
          />
        ))}
      </group>
      <HelixCards onExpand={onExpand} />
    </>
  )
}
