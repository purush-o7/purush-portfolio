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
  const progressRef   = useRef(0)
  const timeRef       = useRef(0)
  const cableGroupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    function onScroll() {
      const vh = window.innerHeight
      progressRef.current = Math.max(0, Math.min((window.scrollY - 8 * vh) / vh, 1))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime()
    if (cableGroupRef.current)
      cableGroupRef.current.rotation.y = clock.getElapsedTime() * 0.08
  })

  return (
    <>
      <Galaxy p={galaxy} />
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
