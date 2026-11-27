import { useMemo } from 'react'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Breakable } from './Breakable'
import { LAYOUT, ROOM, DOOR } from './layout'
import { floorTex } from './textures'

const WALL = 0.3

// 사무실 건물 (벽, 출입문, 천장, 지붕, 창문)
function Building() {
  const { w, d, h } = ROOM
  const floor = useMemo(() => {
    const t = floorTex().clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(w / 1.2, d / 1.2)
    t.needsUpdate = true
    return t
  }, [w, d])

  // 남쪽 벽은 출입문 자리를 비워 두고 세 조각으로 나눔
  const leftW = DOOR.x0 + w / 2 + WALL / 2
  const rightW = w / 2 + WALL / 2 - DOOR.x1
  const walls = [
    { p: [0, h / 2, -d / 2], s: [w + WALL, h, WALL] },
    { p: [-w / 2, h / 2, 0], s: [WALL, h, d] },
    { p: [w / 2, h / 2, 0], s: [WALL, h, d] },
    { p: [-w / 2 - WALL / 2 + leftW / 2, h / 2, d / 2], s: [leftW, h, WALL] },
    { p: [w / 2 + WALL / 2 - rightW / 2, h / 2, d / 2], s: [rightW, h, WALL] },
    { p: [(DOOR.x0 + DOOR.x1) / 2, (DOOR.h + h) / 2, d / 2], s: [DOOR.x1 - DOOR.x0, h - DOOR.h, WALL] },
  ]

  // 창문: 벽 안쪽(밝은 하늘색)과 바깥쪽(어두운 유리) 양면
  const off = WALL / 2 + 0.005
  const windows = [
    ...[-3.5, 3].map((x) => ({ p: [x, 1.8, d / 2], n: [0, 0, 1] })),
    ...[-1.5, 4.2].map((z) => ({ p: [w / 2, 1.8, z], n: [1, 0, 0] })),
    ...[-1, 3].map((z) => ({ p: [-w / 2, 1.8, z], n: [-1, 0, 0] })),
  ]

  const lights = []
  for (let x = -9; x <= 9; x += 4.5) for (let z = -6; z <= 6; z += 4) lights.push([x, z])

  return (
    <>
      <RigidBody type="fixed" colliders={false} friction={1}>
        {walls.map((wl, i) => (
          <CuboidCollider key={i} args={wl.s.map((v) => v / 2)} position={wl.p} />
        ))}
        {/* 지붕 위로 안전모가 날아가지 않도록 */}
        <CuboidCollider args={[w / 2 + 0.3, 0.15, d / 2 + 0.3]} position={[0, h + 0.17, 0]} />
      </RigidBody>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={floor} roughness={0.85} />
      </mesh>
      {walls.map((wl, i) => (
        <mesh key={i} position={wl.p} receiveShadow>
          <boxGeometry args={wl.s} />
          <meshStandardMaterial color="#e8e4dc" />
        </mesh>
      ))}
      {/* 안쪽 걸레받이 */}
      {walls.slice(0, 5).map((wl, i) => (
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
      {/* 지붕 (바깥에서 보이는 부분) */}
      <mesh position={[0, h + 0.17, 0]}>
        <boxGeometry args={[w + 0.6, 0.3, d + 0.6]} />
        <meshStandardMaterial color="#7d848c" />
      </mesh>
      {/* 출입문 틀 */}
      {[DOOR.x0 - 0.05, DOOR.x1 + 0.05].map((x) => (
        <mesh key={x} position={[x, DOOR.h / 2, d / 2]}>
          <boxGeometry args={[0.1, DOOR.h, WALL + 0.06]} />
          <meshStandardMaterial color="#5d4632" />
        </mesh>
      ))}
      <mesh position={[(DOOR.x0 + DOOR.x1) / 2, DOOR.h + 0.05, d / 2]}>
        <boxGeometry args={[DOOR.x1 - DOOR.x0 + 0.2, 0.1, WALL + 0.06]} />
        <meshStandardMaterial color="#5d4632" />
      </mesh>
      {/* 창문 */}
      {windows.map(({ p, n }, i) => {
        const rotY = Math.atan2(n[0], n[2])
        return (
          <group key={i}>
            <mesh position={[p[0] + n[0] * off, p[1], p[2] + n[2] * off]} rotation={[0, rotY, 0]}>
              <planeGeometry args={[2.4, 1.3]} />
              <meshStandardMaterial color="#5f7f9e" roughness={0.15} metalness={0.4} />
            </mesh>
            <mesh position={[p[0] - n[0] * off, p[1], p[2] - n[2] * off]} rotation={[0, rotY + Math.PI, 0]}>
              <planeGeometry args={[2.4, 1.3]} />
              <meshBasicMaterial color="#bfe3ff" />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

export function Office() {
  return (
    <>
      <Building />
      {LAYOUT.map((it) => (
        <Breakable key={it.id} {...it} />
      ))}
    </>
  )
}
