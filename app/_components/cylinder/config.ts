export interface GalaxyParams {
  count: number; branches: number; radius: number; spin: number
  randomness: number; randomnessPower: number
  innerColor: string; outerColor: string
  size: number; rotationSpeed: number; tilt: number
}

export interface CableParams {
  count: number; rStart: number; height: number
  waist: number; twist: number; arch: number; armAngle: number
  neonColor: string; haloColor: string; glowMult: number
}

export interface BloomParams {
  intensity: number; threshold: number; smoothing: number; radius: number
}

export const DEF_GALAXY: GalaxyParams = {
  count: 140000, branches: 3, radius: 35.5, spin: 2.05,
  randomness: 0.80, randomnessPower: 4.10,
  innerColor: "#ffd8a8", outerColor: "#1a3aff",
  size: 5, rotationSpeed: 0.01, tilt: 9,
}

export const DEF_CABLE: CableParams = {
  count: 24, rStart: 100, height: 15.5,
  waist: 1.35, twist: 0.75, arch: 2.55, armAngle: 26,
  neonColor: "#00f5ff", haloColor: "#800dff", glowMult: 3.7,
}

export const DEF_BLOOM: BloomParams = {
  intensity: 0.20, threshold: 0.00, smoothing: 0.00, radius: 0.20,
}
