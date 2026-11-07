import React, { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useReducedMotion } from 'framer-motion'
import { TECH_HUBS } from '@/lib/tech-facts'
import { latLngToVector3 } from '@/lib/geo'

export type GlobeBridge = {
  screen: { x: number; y: number; visible: boolean }[]
  frozen: boolean
}

const RADIUS = 1
const HUB_COLOR = '#fb5b4d'
const SUN_POS = new THREE.Vector3(2.7, 1.85, 1.5)
// canvas is 360px and the globe reads ~131px radius at z=4; 1.153× adds ~20px per side
const GLOBE_SCALE = 1.153

/* ---- Earth, lit by the sun (day side bright, night side dim) ------------- */
function Earth() {
  const tex = useLoader(THREE.TextureLoader, '/textures/earth-blue.jpg')
  // latLngToVector3 already matches three's equirectangular UV mapping → no rotation needed.
  return (
    <mesh>
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <meshStandardMaterial map={tex} metalness={0} roughness={0.92} />
    </mesh>
  )
}

/** Radial gradient on a canvas → used as the soft glow sprite. */
function radialGlowTexture(stops: [number, string][]): THREE.Texture {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  for (const [o, col] of stops) g.addColorStop(o, col)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ---- Atmosphere: a camera-facing halo that's bright at the limb and fades
   smoothly to nothing (no hard edge). The globe occludes its centre, so only
   the soft outer ring shows. Sized to fully fade inside the canvas box. ----- */
function AtmosphereGlow() {
  const tex = useMemo(
    () =>
      radialGlowTexture([
        [0, 'rgba(150,198,255,0)'],
        [0.7, 'rgba(150,198,255,0)'],
        [0.77, 'rgba(165,205,255,0.95)'], // bright at the (now larger) globe limb
        [0.83, 'rgba(120,178,255,0.4)'],
        [0.88, 'rgba(110,168,255,0)'], // faded to nothing before the edge
        [1, 'rgba(110,168,255,0)'],
      ]),
    [],
  )
  return (
    <sprite position={[0, 0, 0]} scale={[3.0, 3.0, 1]}>
      <spriteMaterial
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  )
}

function Hubs({ positions }: { positions: THREE.Vector3[] }) {
  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.018, 14, 14]} />
            <meshBasicMaterial color={HUB_COLOR} toneMapped={false} />
          </mesh>
          <mesh scale={2.2}>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshBasicMaterial color={HUB_COLOR} transparent opacity={0.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---- Drag-to-orbit (three's OrbitControls, no drei dependency) ----------- */
function Controls() {
  const { camera, gl } = useThree()
  const ref = useRef<OrbitControls>()
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement)
    c.enableZoom = false
    c.enablePan = false
    c.enableDamping = true
    c.dampingFactor = 0.08
    c.rotateSpeed = 0.35
    ref.current = c
    return () => c.dispose()
  }, [camera, gl])
  useFrame(() => ref.current?.update())
  return null
}

function Rig({
  reduced,
  bridge,
  positions,
}: {
  reduced: boolean
  bridge: React.MutableRefObject<GlobeBridge>
  positions: THREE.Vector3[]
}) {
  const group = useRef<THREE.Group>(null)
  const { camera, size } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const toCam = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    if (!reduced && !bridge.current.frozen) g.rotation.y += delta * 0.14
    g.updateMatrixWorld()
    for (let i = 0; i < positions.length; i++) {
      tmp.copy(positions[i]).applyMatrix4(g.matrixWorld)
      // visible when the marker faces the camera (not behind the globe). The
      // globe is centred at the group origin, so tmp doubles as the surface
      // normal; this stays correct even if the globe is dragged/orbited.
      toCam.copy(camera.position).sub(tmp)
      const front = tmp.dot(toCam) > 0
      tmp.project(camera)
      bridge.current.screen[i] = {
        x: (tmp.x * 0.5 + 0.5) * size.width,
        y: (-tmp.y * 0.5 + 0.5) * size.height,
        visible: front,
      }
    }
  })

  return (
    <group ref={group} scale={GLOBE_SCALE}>
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      <Hubs positions={positions} />
    </group>
  )
}

export default function HeroGlobe({ bridge }: { bridge: React.MutableRefObject<GlobeBridge> }) {
  const reduced = useReducedMotion() ?? false
  const positions = useMemo(
    () =>
      TECH_HUBS.map((h) => {
        const v = latLngToVector3(h.lat, h.lng, RADIUS + 0.006)
        return new THREE.Vector3(v.x, v.y, v.z)
      }),
    [],
  )
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      {/* directional light (the sun's light) + soft fill so the night side still reads */}
      <directionalLight position={SUN_POS} intensity={2.8} color='#fff2dd' />
      <ambientLight intensity={0.5} />
      <Controls />
      <Rig reduced={reduced} bridge={bridge} positions={positions} />
      <AtmosphereGlow />
    </Canvas>
  )
}
