import { useMemo } from 'react'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Breakable } from './Breakable'
import { LAYOUT, ROOM } from './layout'
import { floorTex } from './textures'

const WALL = 0.3

function Room() {
  const { w, d, h } = ROOM
  const floor = useMemo(() => {
    const t = floorTex().clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(w / 1.2, d / 1.2)
    t.needsUpdate = true
    return t
  }, [w, d])

  const walls = [
    { p: [0, h / 2, -d / 2], s: [w + WALL, h, WALL] },
    { p: [0, h / 2, d / 2], s: [w + WALL, h, WALL] },
    { p: [-w / 2, h / 2, 0], s: [WALL, h, d] },
    { p: [w / 2, h / 2, 0], s: [WALL, h, d] },
  ]

  const lights = []
  for (let x = -9; x <= 9; x += 4.5) for (let z = -6; z <= 6; z += 4) lights.push([x, z])

  return (
    <>
      <RigidBody type="fixed" colliders={false} friction={1}>
        <CuboidCollider args={[w / 2, 0.1, d / 2]} position={[0, -0.1, 0]} />
        {walls.map((wl, i) => (
          <CuboidCollider key={i} args={wl.s.map((v) => v / 2)} position={wl.p} />
        ))}
      </RigidBody>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={floor} roughness={0.85} />
      </mesh>
      {walls.map((wl, i) => (
        <mesh key={i} position={wl.p} receiveShadow>
          <boxGeometry args={wl.s} />
          <meshStandardMaterial color="#e8e4dc" />
        </mesh>
      ))}
      {/* 벽 아래 걸레받이 */}
      {walls.map((wl, i) => (
        <mesh key={`b${i}`} position={[wl.p[0], 0.06, wl.p[2]]}>
          <boxGeometry args={[wl.s[0] + 0.04, 0.12, wl.s[2] + 0.04]} />
          <meshStandardMaterial color="#6f6a62" />
        </mesh>
      ))}
      {/* 천장 + 조명 패널 */}
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#f2f2ef" />
      </mesh>
      {lights.map(([x, z], i) => (
        <mesh key={i} position={[x, h - 0.02, z]}>
          <boxGeometry args={[1.2, 0.03, 0.6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* 출입문 (장식) */}
      <mesh position={[0, 1.1, d / 2 - WALL / 2 - 0.02]}>
        <boxGeometry args={[1.8, 2.2, 0.04]} />
        <meshStandardMaterial color="#6b4f36" />
      </mesh>
      {/* 동쪽 창문 (장식) */}
      {[4.2].map((z) => (
        <mesh key={z} position={[w / 2 - WALL / 2 - 0.01, 1.7, z]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.3]} />
          <meshBasicMaterial color="#bfe3ff" />
        </mesh>
      ))}
    </>
  )
}

export function Office() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#8a8f96', 0.6]} />
      <directionalLight
        position={[6, 14, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
      />
      <Room />
      {LAYOUT.map((it) => (
        <Breakable key={it.id} {...it} />
      ))}
    </>
  )
}
