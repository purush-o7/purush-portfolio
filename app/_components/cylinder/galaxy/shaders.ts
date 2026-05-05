export const GAL_VERT = /* glsl */`
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

export const GAL_FRAG = /* glsl */`
  varying vec3 vColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float s = pow(max(1.0 - d * 2.0, 0.0), 8.0);
    if (s < 0.005) discard;
    gl_FragColor = vec4(vColor, s);
  }
`
