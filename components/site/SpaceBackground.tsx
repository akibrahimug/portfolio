import React, { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'

/* -------------------------------------------------------------------------- */
/* Decorative dark-mode backdrop: a realistic starfield plus a few planets     */
/* that drift up through the side margins as you scroll. No sun, no UI — the    */
/* hero's boxed globe stays the focus.                                          */
/* -------------------------------------------------------------------------- */

type PlanetKind = 'mars' | 'jupiter' | 'saturn' | 'neptune'

interface PlanetDef {
  kind: PlanetKind
  position: [number, number, number]
  radius: number
  tilt: number
  spin: number
  rings?: { inner: number; outer: number; color: string }
}

/** Camera pans this many world units over a full-page scroll. */
const PAN = 23

// x positions keep each body out in the side gutter / off the edge so it drifts
// past as a crescent rather than sitting under the centred text column.
const PLANETS: PlanetDef[] = [
  { kind: 'mars', position: [-4.0, -4.1, -1.0], radius: 0.58, tilt: 0.45, spin: 0.12 },
  { kind: 'jupiter', position: [4.8, -9.6, -2.0], radius: 1.2, tilt: 0.05, spin: 0.2 },
  {
    kind: 'saturn',
    position: [-4.7, -15.0, -1.6],
    radius: 0.8,
    tilt: 0.47,
    spin: 0.18,
    rings: { inner: 1.4, outer: 2.25, color: '#d8c9a3' },
  },
  { kind: 'neptune', position: [4.4, -20.6, -1.6], radius: 0.72, tilt: 0.3, spin: 0.16 },
]

/* ---- procedural planet surfaces (generated once, client-side) ------------ */
function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, ctx: c.getContext('2d')! }
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function bands(ctx: CanvasRenderingContext2D, w: number, h: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  for (const [o, col] of stops) g.addColorStop(o, col)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function speckle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  n: number,
  fill: () => string,
  rMax: number,
) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = fill()
    ctx.beginPath()
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * rMax + 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function surfaceTexture(kind: PlanetKind): THREE.Texture {
  const w = 1024
  const h = 512
  const { c, ctx } = makeCanvas(w, h)

  if (kind === 'mars') {
    bands(ctx, w, h, [
      [0, '#c06a3f'],
      [0.5, '#b1502c'],
      [1, '#8f3c22'],
    ])
    speckle(ctx, w, h, 1400, () => (Math.random() < 0.5 ? 'rgba(120,52,30,0.4)' : 'rgba(214,150,110,0.35)'), 3)
    for (const top of [true, false]) {
      const g = ctx.createLinearGradient(0, top ? 0 : h, 0, top ? 48 : h - 48)
      g.addColorStop(0, 'rgba(238,234,228,0.9)')
      g.addColorStop(1, 'rgba(238,234,228,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, top ? 0 : h - 48, w, 48)
    }
  } else if (kind === 'jupiter') {
    const palette = ['#c8a87a', '#e6d4b0', '#a9743f', '#d9c19a', '#8a5a36', '#e8dcc4']
    let y = 0
    while (y < h) {
      const bh = 8 + Math.random() * 26
      ctx.fillStyle = palette[Math.floor(y / 18 + (Math.random() < 0.3 ? 1 : 0)) % palette.length]
      ctx.fillRect(0, y, w, bh + 1)
      y += bh
    }
    speckle(ctx, w, h, 600, () => 'rgba(255,255,255,0.04)', 30)
    const sx = w * 0.32
    const sy = h * 0.62
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 46)
    g.addColorStop(0, '#b5482f')
    g.addColorStop(0.7, 'rgba(168,72,47,0.8)')
    g.addColorStop(1, 'rgba(168,72,47,0)')
    ctx.fillStyle = g
    ctx.save()
    ctx.translate(sx, sy)
    ctx.scale(1.5, 1)
    ctx.beginPath()
    ctx.arc(0, 0, 42, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  } else if (kind === 'saturn') {
    const palette = ['#e5d6b0', '#d8c49a', '#efe4c8', '#cdb488']
    let y = 0
    while (y < h) {
      const bh = 14 + Math.random() * 30
      ctx.fillStyle = palette[Math.floor(y / 24) % palette.length]
      ctx.fillRect(0, y, w, bh + 1)
      y += bh
    }
    speckle(ctx, w, h, 400, () => 'rgba(255,255,255,0.05)', 26)
  } else {
    bands(ctx, w, h, [
      [0, '#3f6fe0'],
      [0.5, '#2949c9'],
      [1, '#1f3aa8'],
    ])
    speckle(ctx, w, h, 500, () => 'rgba(255,255,255,0.05)', 18)
    const sx = w * 0.6
    const sy = h * 0.62
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 34)
    g.addColorStop(0, 'rgba(20,28,70,0.95)')
    g.addColorStop(1, 'rgba(20,28,70,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(sx, sy, 32, 0, Math.PI * 2)
    ctx.fill()
  }
  return toTexture(c)
}

/** Concentric ring bands so they map cleanly onto ringGeometry's planar UVs. */
function ringTexture(color: string, innerFrac: number): THREE.Texture {
  const s = 256
  const { c, ctx } = makeCanvas(s, s)
  const cx = s / 2
  const img = ctx.createImageData(s, s)
  const col = new THREE.Color(color)
  const cr = Math.round(col.r * 255)
  const cg = Math.round(col.g * 255)
  const cb = Math.round(col.b * 255)
  const innerR = innerFrac * cx
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const dist = Math.hypot(x - cx, y - cx)
      const i = (y * s + x) * 4
      img.data[i] = cr
      img.data[i + 1] = cg
      img.data[i + 2] = cb
      if (dist < innerR || dist > cx) {
        img.data[i + 3] = 0
        continue
      }
      const t = (dist - innerR) / (cx - innerR)
      const band = 0.4 + 0.4 * Math.sin(t * 46) * Math.sin(t * 11)
      const gap = t > 0.58 && t < 0.63 ? 0.05 : t > 0.27 && t < 0.3 ? 0.25 : 1
      img.data[i + 3] = Math.min(230, Math.max(0, band) * gap * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ---- Stars: round, soft, varied size + brightness, faint twinkle --------- */
const STAR_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uTwinkle;
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    vColor = aColor;
    float tw = 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(uTime * 1.6 + aPhase));
    vTw = tw;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float px = aSize * uPixelRatio * (150.0 / -mv.z) * (0.7 + 0.3 * tw);
    gl_PointSize = clamp(px, 0.0, 6.0 * uPixelRatio);
    gl_Position = projectionMatrix * mv;
  }
`
const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    // crisp round dot: solid core with just a thin anti-aliased rim (no blur)
    float alpha = 1.0 - smoothstep(0.42, 0.5, d);
    if (alpha <= 0.0) discard;
    gl_FragColor = vec4(vColor * (0.55 + 0.45 * vTw), alpha);
  }
`

function Stars({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const { gl } = useThree()

  const { geometry, material } = useMemo(() => {
    const N = 2200
    const pos = new Float32Array(N * 3)
    const col = new Float32Array(N * 3)
    const size = new Float32Array(N)
    const phase = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = 20 + Math.random() * 24
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi)
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      // white stars — only brightness varies, no coloured tints
      const b = 0.55 + Math.random() * 0.45
      col[i * 3] = b
      col[i * 3 + 1] = b
      col[i * 3 + 2] = b
      // small dots; a rare few only slightly larger
      size[i] = 0.35 + Math.pow(Math.random(), 6) * 2.0
      phase[i] = Math.random() * Math.PI * 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uTwinkle: { value: reduced ? 0 : 0.35 },
      },
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry: g, material: m }
  }, [reduced])

  useEffect(() => {
    material.uniforms.uPixelRatio.value = gl.getPixelRatio()
  }, [gl, material])

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    if (!reduced && ref.current) ref.current.rotation.y += delta * 0.006
  })

  return <points ref={ref} geometry={geometry} material={material} />
}

/* ---- A drifting background planet ---------------------------------------- */
function Planet({ def, reduced }: { def: PlanetDef; reduced: boolean }) {
  const spin = useRef<THREE.Group>(null)
  const map = useMemo(() => surfaceTexture(def.kind), [def.kind])
  const ringMap = useMemo(
    () => (def.rings ? ringTexture(def.rings.color, def.rings.inner / def.rings.outer) : null),
    [def.rings],
  )
  useFrame((_, delta) => {
    if (!reduced && spin.current) spin.current.rotation.y += delta * def.spin
  })
  return (
    <group position={def.position} rotation={[0, 0, def.tilt]}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[def.radius, 64, 64]} />
          <meshStandardMaterial map={map} metalness={0} roughness={0.95} />
        </mesh>
      </group>
      {def.rings && ringMap && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[def.radius * def.rings.inner, def.radius * def.rings.outer, 128]} />
          <meshBasicMaterial map={ringMap} side={THREE.DoubleSide} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

/* ---- Scene: scroll pans the camera; stars follow, planets stay in world --- */
function Scene({ reduced }: { reduced: boolean }) {
  const { camera } = useThree()
  const sky = useRef<THREE.Group>(null)
  const scroll = useRef(0)
  const camY = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      scroll.current = Math.min(1, Math.max(0, window.scrollY / max))
    }
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5
      pointer.current.y = e.clientY / window.innerHeight - 0.5
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05)
    const targetY = -scroll.current * PAN
    camY.current = reduced ? targetY : camY.current + (targetY - camY.current) * Math.min(1, d * 4)
    camera.position.set(0, camY.current, 7)
    camera.lookAt(0, camY.current, 0)
    // pointer parallax drifts only the stars
    const px = reduced ? 0 : pointer.current.x
    const py = reduced ? 0 : pointer.current.y
    if (sky.current) sky.current.position.set(px * 0.5, camY.current - py * 0.3, 0)
  })

  return (
    <>
      <directionalLight position={[4, 3, 5]} intensity={2.4} color='#e7eeff' />
      <ambientLight intensity={0.5} />
      <group ref={sky}>
        <Stars reduced={reduced} />
      </group>
      <Suspense fallback={null}>
        {PLANETS.map((def, i) => (
          <Planet key={i} def={def} reduced={reduced} />
        ))}
      </Suspense>
    </>
  )
}

export default function SpaceBackground() {
  const reduced = useReducedMotion() ?? false
  return (
    <div className='pointer-events-none fixed inset-0 z-0' aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  )
}
