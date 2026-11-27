import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { GROUND, PARKING, TRACK_Z, TRACK_X, SHED, ROOM, BUILDING, DOORS } from './layout'

const SKY = '#b7d3ec'

// 같은 모양을 여러 개 그릴 때 (침목, 울타리 기둥 등) 한 번에 그려서 가볍게
function Many({ positions, size, color, ...m }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    positions.forEach((p, i) => {
      o.position.set(p[0], p[1], p[2])
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [positions])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} {...m} />
    </instancedMesh>
  )
}

function Flat({ x0, x1, z0, z1, y = 0, color, ...m }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, y, (z0 + z1) / 2]} receiveShadow>
      <planeGeometry args={[x1 - x0, z1 - z0]} />
      <meshStandardMaterial color={color} roughness={0.95} {...m} />
    </mesh>
  )
}

// 햇빛: 그림자 범위가 넓은 바깥 전체를 덮을 수 없어서 플레이어 주변을 따라다니게 함
function Sun() {
  const light = useRef()
  const { camera } = useThree()
  useFrame(() => {
    const l = light.current
    if (!l) return
    const { x, z } = camera.position
    l.position.set(x + 15, 30, z + 10)
    l.target.position.set(x, 0, z)
    l.target.updateMatrixWorld()
  })
  return (
    <directionalLight
      ref={light}
      intensity={1.5}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-28}
      shadow-camera-right={28}
      shadow-camera-top={28}
      shadow-camera-bottom={-28}
      shadow-camera-near={1}
      shadow-camera-far={90}
      shadow-bias={-0.0005}
    />
  )
}

function Tracks() {
  const len = TRACK_X[1] - TRACK_X[0]
  const cx = (TRACK_X[0] + TRACK_X[1]) / 2
  const sleepers = useMemo(() => {
    const out = []
    for (const z of TRACK_Z) for (let x = TRACK_X[0] + 0.3; x < TRACK_X[1]; x += 0.65) out.push([x, 0.05, z])
    return out
  }, [])
  return (
    <>
      {TRACK_Z.map((z) => (
        <group key={z}>
          <Flat x0={TRACK_X[0]} x1={TRACK_X[1]} z0={z - 1.7} z1={z + 1.7} y={0.004} color="#7d7268" />
          {[-0.7175, 0.7175].map((dz) => (
            <mesh key={dz} position={[cx, 0.125, z + dz]} castShadow receiveShadow>
              <boxGeometry args={[len, 0.05, 0.07]} />
              <meshStandardMaterial color="#9a9a9a" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      <Many positions={sleepers} size={[0.25, 0.1, 2.4]} color="#5a4a3a" />
    </>
  )
}

// 정비고: 철골 기둥 + 위쪽 외벽 + 지붕 (아래쪽 3m는 뚫려 있어서 걸어 들어갈 수 있음)
function Shed() {
  const { x0, x1, z0, z1, h } = SHED
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const cols = []
  for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 5) for (const z of [z0, z1]) cols.push([x, h / 2, z])
  const trusses = []
  for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 5) trusses.push(x)
  const lamps = []
  for (let x = x0 + 4; x < x1; x += 6) for (const z of TRACK_Z) lamps.push([x, h - 0.6, z])
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid">
        {cols.map((p, i) => (
          <mesh key={i} position={p} castShadow>
            <boxGeometry args={[0.5, h, 0.5]} />
            <meshStandardMaterial color="#4f6a7a" metalness={0.4} />
          </mesh>
        ))}
      </RigidBody>
      {/* 옆면 외벽 (높이 3m 위로) */}
      {[z0, z1].map((z) => (
        <mesh key={z} position={[cx, (3 + h) / 2, z]}>
          <boxGeometry args={[x1 - x0, h - 3, 0.2]} />
          <meshStandardMaterial color="#b8c2c8" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* 양쪽 끝 윗부분 (간판이 붙는 자리) */}
      {[x0, x1].map((x) => (
        <mesh key={x} position={[x, (6.6 + h) / 2, cz]}>
          <boxGeometry args={[0.2, h - 6.6, z1 - z0]} />
          <meshStandardMaterial color="#b8c2c8" />
        </mesh>
      ))}
      <mesh position={[cx, h + 0.15, cz]}>
        <boxGeometry args={[x1 - x0 + 1, 0.3, z1 - z0 + 1]} />
        <meshStandardMaterial color="#6d7b85" />
      </mesh>
      {trusses.map((x) => (
        <mesh key={x} position={[x, h - 0.3, cz]}>
          <boxGeometry args={[0.25, 0.4, z1 - z0]} />
          <meshStandardMaterial color="#4f6a7a" />
        </mesh>
      ))}
      {lamps.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[1.2, 0.1, 0.3]} />
          <meshBasicMaterial color="#fffbe6" />
        </mesh>
      ))}
      <pointLight position={[cx, h - 1.5, cz]} intensity={60} distance={30} decay={1.5} />
    </>
  )
}

function Fence() {
  const { x0, x1, z0, z1 } = GROUND
  const posts = useMemo(() => {
    const out = []
    for (let x = x0; x <= x1; x += 3) out.push([x, 1.1, z0], [x, 1.1, z1])
    for (let z = z0 + 3; z < z1; z += 3) out.push([x0, 1.1, z], [x1, 1.1, z])
    return out
  }, [x0, x1, z0, z1])
  const sides = [
    { p: [(x0 + x1) / 2, 1.1, z0], r: 0, w: x1 - x0 },
    { p: [(x0 + x1) / 2, 1.1, z1], r: 0, w: x1 - x0 },
    { p: [x0, 1.1, (z0 + z1) / 2], r: Math.PI / 2, w: z1 - z0 },
    { p: [x1, 1.1, (z0 + z1) / 2], r: Math.PI / 2, w: z1 - z0 },
  ]
  return (
    <>
      <Many positions={posts} size={[0.08, 2.2, 0.08]} color="#6b6f72" metalness={0.5} />
      {sides.map((s, i) => (
        <mesh key={i} position={s.p} rotation={[0, s.r, 0]}>
          <planeGeometry args={[s.w, 2.0]} />
          <meshStandardMaterial color="#7d8a80" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

// 울타리 밖 멀리 보이는 건물들 (배경용)
const SKYLINE = [
  [-30, 75, 14, 18], [-8, 80, 10, 26], [12, 72, 18, 14], [36, 78, 12, 22],
  [-70, 10, 12, 16], [-72, 35, 16, 10], [70, 0, 14, 20], [72, 30, 12, 12],
  [-20, -45, 20, 12], [20, -48, 14, 18],
]

export function Exterior() {
  const { x0, x1, z0, z1 } = GROUND
  const W = x1 - x0
  const D = z1 - z0
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const parkLines = []
  for (let x = PARKING.x0; x <= PARKING.x1; x += 3) if (Math.abs(x) > 4) parkLines.push(x)

  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 70, 170]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#8a8f96', 0.6]} />
      <Sun />

      {/* 땅 + 울타리 (보이지 않는 벽) */}
      <RigidBody type="fixed" colliders={false} friction={1}>
        <CuboidCollider args={[W / 2 + 5, 0.5, D / 2 + 5]} position={[cx, -0.5, cz]} />
        <CuboidCollider args={[W / 2, 3, 0.2]} position={[cx, 3, z0]} />
        <CuboidCollider args={[W / 2, 3, 0.2]} position={[cx, 3, z1]} />
        <CuboidCollider args={[0.2, 3, D / 2]} position={[x0, 3, cz]} />
        <CuboidCollider args={[0.2, 3, D / 2]} position={[x1, 3, cz]} />
      </RigidBody>

      <Flat x0={x0 - 120} x1={x1 + 120} z0={z0 - 120} z1={z1 + 120} y={-0.02} color="#8a8c86" />
      <Flat x0={x0} x1={x1} z0={z0} z1={-ROOM.d / 2 - 1} y={-0.01} color="#5f8f4a" />
      <Flat x0={PARKING.x0} x1={PARKING.x1} z0={PARKING.z0} z1={PARKING.z1} y={-0.008} color="#4f5357" />
      <Flat x0={-1.5} x1={1.5} z0={ROOM.d / 2} z1={PARKING.z0} y={-0.006} color="#b9b8ae" />
      {/* 복도 끝 동쪽 문 앞 보도 */}
      <Flat x0={BUILDING.x1} x1={BUILDING.x1 + 5} z0={DOORS.east[0] - 0.3} z1={DOORS.east[1] + 0.3} y={-0.006} color="#b9b8ae" />
      {parkLines.map((x) => (
        <Flat key={x} x0={x - 0.05} x1={x + 0.05} z0={PARKING.z0 + 0.6} z1={PARKING.z1 - 0.6} y={-0.004} color="#eeeeee" />
      ))}

      <Tracks />
      <Shed />
      <Fence />

      {SKYLINE.map(([x, z, w, hh], i) => (
        <mesh key={i} position={[x, hh / 2, z]}>
          <boxGeometry args={[w, hh, w * 0.8]} />
          <meshStandardMaterial color={i % 2 ? '#9aa6b2' : '#a9b3bc'} />
        </mesh>
      ))}
    </>
  )
}
