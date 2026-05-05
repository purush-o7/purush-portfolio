export const CORE_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`

export const CORE_FRAG = /* glsl */`
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
