"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame }       from "@react-three/fiber"
import { EffectComposer, Bloom }  from "@react-three/postprocessing"
import * as THREE                  from "three"

// ── param types ───────────────────────────────────────────────────────────────
interface GalaxyParams {
  count: number; branches: number; radius: number; spin: number
  randomness: number; randomnessPower: number
  innerColor: string; outerColor: string
  size: number; rotationSpeed: number; tilt: number
}
interface CableParams {
  count: number; rStart: number; height: number
  waist: number; twist: number; arch: number; armAngle: number
  neonColor: string; haloColor: string; glowMult: number
}
interface BloomParams {
  intensity: number; threshold: number; smoothing: number; radius: number
}

const DEF_GALAXY: GalaxyParams = {
  count: 140000, branches: 3, radius: 35.5, spin: 2.05,
  randomness: 0.80, randomnessPower: 4.10,
  innerColor: "#ffd8a8", outerColor: "#1a3aff",
  size: 5, rotationSpeed: 0.01, tilt: 9,
}
const DEF_CABLE: CableParams = {
  count: 24, rStart: 100, height: 15.5,
  waist: 1.35, twist: 0, arch: 2.55, armAngle: 26,
  neonColor: "#00f5ff", haloColor: "#800dff", glowMult: 3.7,
}
const DEF_BLOOM: BloomParams = {
  intensity: 0.20, threshold: 0.00, smoothing: 0.00, radius: 0.20,
}

// ── galaxy shaders ────────────────────────────────────────────────────────────
const GAL_VERT = /* glsl */`
  attribute float aScale; attribute vec3 aRandomness; attribute vec3 aColor;
  uniform float uTime, uSize, uRotSpeed;
  varying vec3 vColor;
  void main() {
    vec4 mp = modelMatrix * vec4(position, 1.0);
    float a = atan(mp.z, mp.x), d = length(mp.xz);
    a += (1.0 / (d + 0.1)) * uTime * uRotSpeed;
    mp.x = cos(a)*d; mp.z = sin(a)*d; mp.xyz += aRandomness;
    vec4 vp = viewMatrix * mp;
    gl_Position = projectionMatrix * vp;
    gl_PointSize = uSize * aScale;
    vColor = aColor;
  }
`
const GAL_FRAG = /* glsl */`
  varying vec3 vColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float s = pow(max(1.0 - d * 2.0, 0.0), 8.0);
    if (s < 0.005) discard;
    gl_FragColor = vec4(vColor, s);
  }
`

// ── cable shaders ─────────────────────────────────────────────────────────────
const CORE_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const CORE_FRAG = /* glsl */`
  uniform float uP, uTime, uGlow;
  uniform vec3  uNeonColor;
  varying vec2  vUv;
  void main() {
    float t = vUv.y;
    float i = clamp(0.80 + exp(-pow(abs(t-uP),2.0)*28.0)*2.6
                       + pow(max(0.0,sin((t-uTime*0.42)*3.14159*18.0)),5.0)*0.45, 0.0, 2.5);
    gl_FragColor = vec4(uNeonColor * i * uGlow, 1.0);
  }
`
const HALO_VERT = /* glsl */`
  varying vec3 vNormal, vViewDir;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vec4 mv  = modelViewMatrix * vec4(position,1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const HALO_FRAG = /* glsl */`
  uniform vec3 uHaloColor;
  varying vec3 vNormal, vViewDir;
  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vViewDir)), 1.6);
    gl_FragColor = vec4(uHaloColor * rim * 3.0, rim * 0.65);
  }
`

// ── Galaxy ────────────────────────────────────────────────────────────────────
function Galaxy({ p }: { p: GalaxyParams }) {
  const ref = useRef<THREE.Points>(null)

  const { geo, mat } = useMemo(() => {
    const { count, branches, radius, spin, randomness, randomnessPower,
            innerColor, outerColor, size, rotationSpeed } = p
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3)
    const sca = new Float32Array(count),     rnd = new Float32Array(count * 3)
    const ic = new THREE.Color(innerColor),  oc = new THREE.Color(outerColor)
    for (let i = 0; i < count; i++) {
      const r = Math.random() * radius, ba = (i % branches) / branches * Math.PI * 2
      const rp = (pow: number) => Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1)
      pos[i*3] = Math.cos(ba + spin * r) * r; pos[i*3+1] = 0; pos[i*3+2] = Math.sin(ba + spin * r) * r
      rnd[i*3] = rp(randomnessPower)*randomness*r; rnd[i*3+1] = rp(randomnessPower)*randomness*r*0.35; rnd[i*3+2] = rp(randomnessPower)*randomness*r
      const mc = ic.clone().lerp(oc, r/radius); col[i*3] = mc.r; col[i*3+1] = mc.g; col[i*3+2] = mc.b
      sca[i] = Math.random()
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
    // slow tilt oscillation: −10° → +10° over ~42 s period
    ref.current.rotation.x = Math.sin(t * 0.15) * (10 * Math.PI / 180)
  })

  return <points ref={ref} geometry={geo} material={mat} renderOrder={-1} />
}

// ── Cable ─────────────────────────────────────────────────────────────────────
function Cable({ angle, cp, progressRef, timeRef }: {
  angle: number; cp: CableParams
  progressRef: React.MutableRefObject<number>
  timeRef:     React.MutableRefObject<number>
}) {
  const coreRef = useRef<THREE.Mesh>(null)

  const [coreGeo, coreMat] = useMemo(() => {
    const { rStart, height: H, waist: rMin, twist, arch, armAngle } = cp
    const TWIST = twist * Math.PI

    // CurvePath: LineCurve3 arms + CubicBezierCurve3 corners + CatmullRomCurve3 body.
    // Each segment type handles its own tangents — no CatmullRom kinks at junctions.
    const halfH    = H / 2
    const armLen   = Math.max(rStart, 1)
    const bendR    = Math.max(arch, 0.1)
    const armTiltR = (armAngle * Math.PI) / 180
    // Bezier handle length for a clean quarter-circle approximation
    const bezH     = bendR * 0.552

    const phiBot = angle
    const phiTop = angle + TWIST

    // Helper: world-space point at polar (r, y) and azimuth phi
    const p3 = (r: number, y: number, phi: number) =>
      new THREE.Vector3(r * Math.cos(phi), y, r * Math.sin(phi))

    const jR = rMin + bendR  // radius at arm-corner junction

    // ── junction anchors ──────────────────────────────────────────────
    const botJunc = p3(jR,   -halfH - bendR, phiBot)
    const botBody = p3(rMin, -halfH,         phiBot)
    const topBody = p3(rMin,  halfH,         phiTop)
    const topJunc = p3(jR,    halfH + bendR, phiTop)

    const botTip = p3(jR   + armLen * Math.cos(armTiltR), -halfH - bendR - armLen * Math.sin(armTiltR), phiBot)
    const topTip = p3(jR   + armLen * Math.cos(armTiltR),  halfH + bendR + armLen * Math.sin(armTiltR), phiTop)

    // ── arms: perfectly straight LineCurve3 ──────────────────────────
    const botArm = new THREE.LineCurve3(botTip,  botJunc)
    const topArm = new THREE.LineCurve3(topJunc, topTip)

    // ── corners: CubicBezierCurve3 with tangent-matched handles ──────
    // Bottom — arm arrives inward+tilted, body departs upward:
    //   P1 nudges along arm-arrival direction  (-cos, +sin)
    //   P2 nudges below body-start along body-departure direction (0, -1)
    const botCorner = new THREE.CubicBezierCurve3(
      botJunc,
      p3(jR   - bezH * Math.cos(armTiltR), -halfH - bendR + bezH * Math.sin(armTiltR), phiBot),
      p3(rMin,                              -halfH - bezH,                               phiBot),
      botBody,
    )
    // Top — body arrives upward, arm departs outward+tilted:
    //   P1 nudges above body-end along body-arrival direction (0, +1)
    //   P2 nudges along arm-departure direction (-cos, -sin) from junction
    const topCorner = new THREE.CubicBezierCurve3(
      topBody,
      p3(rMin,                              halfH + bezH,                                phiTop),
      p3(jR   - bezH * Math.cos(armTiltR),  halfH + bendR - bezH * Math.sin(armTiltR),  phiTop),
      topJunc,
    )

    // ── body: CatmullRomCurve3 cylinder / helix ───────────────────────
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

    // ── assemble CurvePath → TubeGeometry ────────────────────────────
    // TubeGeometry accepts any Curve<Vector3>; CurvePath extends Curve<Vector3>.
    // Segments are distributed by arc-length, so corners always get enough samples
    // regardless of how long the arms are.
    const path = new THREE.CurvePath<THREE.Vector3>()
    path.add(botArm)
    path.add(botCorner)
    path.add(bodyCurve)
    path.add(topCorner)
    path.add(topArm)

    const cG = new THREE.TubeGeometry(path, 1500, 0.018, 7, false)
    const nc = new THREE.Color(cp.neonColor)
    const cM = new THREE.ShaderMaterial({
      uniforms: { uP:{value:0}, uTime:{value:0}, uGlow:{value:cp.glowMult},
                  uNeonColor:{value:nc} },
      vertexShader: CORE_VERT, fragmentShader: CORE_FRAG,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })
    return [cG, cM] as const
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle, cp.rStart, cp.height, cp.waist, cp.twist, cp.arch, cp.armAngle,
      cp.neonColor, cp.haloColor, cp.glowMult])

  // live-update color + glow without geometry rebuild
  useEffect(() => {
    if (!coreRef.current) return
    const cm = coreRef.current.material as THREE.ShaderMaterial
    cm.uniforms.uNeonColor.value = new THREE.Color(cp.neonColor)
    cm.uniforms.uGlow.value      = cp.glowMult
  }, [cp.neonColor, cp.glowMult])

  useFrame(() => {
    if (!coreRef.current) return
    const m = coreRef.current.material as THREE.ShaderMaterial
    m.uniforms.uP.value    = progressRef.current
    m.uniforms.uTime.value = timeRef.current
  })

  return <mesh ref={coreRef} geometry={coreGeo} material={coreMat} />
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ galaxy, cable }: { galaxy: GalaxyParams; cable: CableParams }) {
  const progressRef = useRef(0)
  const timeRef     = useRef(0)
  const cableGroupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    function onScroll() {
      const vh = window.innerHeight
      progressRef.current = Math.max(0, Math.min((window.scrollY - 3*vh)/vh, 1))
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
          <Cable key={i} angle={(2*Math.PI*i)/cable.count}
                 cp={cable} progressRef={progressRef} timeRef={timeRef} />
        ))}
      </group>
    </>
  )
}

// ── exported canvas ───────────────────────────────────────────────────────────
export function CylinderScene() {
  return (
    <div style={{ width:"100%", height:"100%", position:"relative" }}>
      <Canvas
        camera={{ position:[0,0,22], fov:50 }}
        gl={{ antialias:true, alpha:false }}
        dpr={[1,2]}
        style={{ width:"100%", height:"100%" }}
      >
        <color attach="background" args={[0,0,0]} />
        <Scene galaxy={DEF_GALAXY} cable={DEF_CABLE} />
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom intensity={DEF_BLOOM.intensity} luminanceThreshold={DEF_BLOOM.threshold}
                 luminanceSmoothing={DEF_BLOOM.smoothing} radius={DEF_BLOOM.radius} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
