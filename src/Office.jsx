import { useMemo } from 'react'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Breakable } from './Breakable'
import { LAYOUT, BUILDING, DOOR, WALLS, ROOMS, WINDOWS } from './layout'
import { floorTex, blindTex } from './textures'

const T_EXT = 0.3 // 바깥벽 두께
const T_INT = 0.2 // 안쪽 벽 두께
const FRAME = '#5d4632'

// 벽 하나를 문 구멍을 피해서 조각내기. 문 위에는 인방(lintel) 조각을 얹음
function splitWall({ axis, at, from, to, ext, doors = [] }, h) {
  const t = ext ? T_EXT : T_INT
  const pad = ext ? t / 2 : 0 // 바깥벽은 모서리가 맞물리도록 살짝 늘림
  const make = (a, b, y0, y1) => {
    const mid = (a + b) / 2
    const len = b - a
    return axis === 'x'
      ? { p: [mid, (y0 + y1) / 2, at], s: [len, y1 - y0, t] }
      : { p: [at, (y0 + y1) / 2, mid], s: [t, y1 - y0, len] }
  }
  const pieces = []
  const lintels = []
  let cur = from - pad
  for (const [a, b] of [...doors].sort((p, q) => p[0] - q[0])) {
    if (a > cur) pieces.push(make(cur, a, 0, h))
    lintels.push(make(a, b, DOOR.h, h))
    cur = b
  }
  if (to + pad > cur) pieces.push(make(cur, to + pad, 0, h))
  return { pieces, lintels, t }
}

// 문틀 (양옆 기둥 + 위)
function DoorFrame({ axis, at, a, b, t }) {
  const parts = [
    { c: a - 0.05, s: 0.1, y: DOOR.h / 2, hgt: DOOR.h },
    { c: b + 0.05, s: 0.1, y: DOOR.h / 2, hgt: DOOR.h },
    { c: (a + b) / 2, s: b - a + 0.2, y: DOOR.h + 0.05, hgt: 0.1 },
  ]
  return parts.map(({ c, s, y, hgt }, i) => (
    <mesh key={i} position={axis === 'x' ? [c, y, at] : [at, y, c]}>
      <boxGeometry args={axis === 'x' ? [s, hgt, t + 0.06] : [t + 0.06, hgt, s]} />
      <meshStandardMaterial color={FRAME} />
    </mesh>
  ))
}

function RoomFloor({ x0, x1, z0, z1, floor, tint = '#ffffff', tile = 1.2 }) {
  const w = x1 - x0
  const d = z1 - z0
  const map = useMemo(() => {
    if (floor !== 'tile') return null
    const t = floorTex().clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(w / tile, d / tile)
    t.needsUpdate = true
    return t
  }, [floor, w, d, tile])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, 0.001, (z0 + z1) / 2]} receiveShadow>
      <planeGeometry args={[w, d]} />
      {map ? <meshStandardMaterial map={map} color={tint} roughness={0.85} /> : <meshStandardMaterial color={floor} roughness={0.95} />}
    </mesh>
  )
}

// 건물 (벽, 문, 바닥, 천장, 지붕, 창문)
function Building() {
  const { x0, x1, z0, z1, h } = BUILDING
  const W = x1 - x0
  const D = z1 - z0
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2

  const walls = useMemo(() => WALLS.map((w) => ({ def: w, ...splitWall(w, h) })), [h])
  const solid = walls.flatMap((w) => [...w.pieces, ...w.lintels])

  const lights = useMemo(() => {
    const out = []
    for (const r of ROOMS) {
      const [sx, sz] = r.lights
      const nx = Math.max(1, Math.round((r.x1 - r.x0) / sx))
      const nz = Math.max(1, Math.round((r.z1 - r.z0) / sz))
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < nz; j++)
          out.push([r.x0 + ((i + 0.5) * (r.x1 - r.x0)) / nx, r.z0 + ((j + 0.5) * (r.z1 - r.z0)) / nz])
    }
    return out
  }, [])

  return (
    <>
      <RigidBody type="fixed" colliders={false} friction={1}>
        {solid.map((wl, i) => (
          <CuboidCollider key={i} args={wl.s.map((v) => v / 2)} position={wl.p} />
        ))}
        {/* 지붕 위로 물건이 날아가지 않도록 */}
        <CuboidCollider args={[W / 2 + 0.3, 0.15, D / 2 + 0.3]} position={[cx, h + 0.17, cz]} />
      </RigidBody>

      {ROOMS.map((r) => (
        <RoomFloor key={r.name} {...r} />
      ))}
      {solid.map((wl, i) => (
        <mesh key={i} position={wl.p} receiveShadow>
          <boxGeometry args={wl.s} />
          <meshStandardMaterial color="#e8e4dc" />
        </mesh>
      ))}
      {/* 걸레받이 */}
      {walls.flatMap((w) => w.pieces).map((wl, i) => (
        <mesh key={`b${i}`} position={[wl.p[0], 0.06, wl.p[2]]}>
          <boxGeometry args={[wl.s[0] + 0.04, 0.12, wl.s[2] + 0.04]} />
          <meshStandardMaterial color="#6f6a62" />
        </mesh>
      ))}
      {walls.flatMap(({ def, t }) =>
        (def.doors || []).map(([a, b]) => <DoorFrame key={`${def.axis}${def.at}${a}`} axis={def.axis} at={def.at} a={a} b={b} t={t} />),
      )}

      {/* 천장 + 조명 패널 */}
      <mesh position={[cx, h, cz]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#f2f2ef" />
      </mesh>
      {lights.map(([x, z], i) => (
        <mesh key={i} position={[x, h - 0.02, z]}>
          <boxGeometry args={[1.2, 0.03, 0.6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* 지붕 (바깥에서 보이는 부분) */}
      <mesh position={[cx, h + 0.17, cz]}>
        <boxGeometry args={[W + 0.6, 0.3, D + 0.6]} />
        <meshStandardMaterial color="#7d848c" />
      </mesh>

      {/* 창문: 바깥쪽은 어두운 유리, 안쪽은 밝은 하늘(또는 롤블라인드) */}
      {WINDOWS.map(({ p, n, w, h: wh, blind }, i) => {
        const rotY = Math.atan2(n[0], n[2])
        const off = T_EXT / 2 + 0.005
        return (
          <group key={i}>
            <mesh position={[p[0] + n[0] * off, p[1], p[2] + n[2] * off]} rotation={[0, rotY, 0]}>
              <planeGeometry args={[w, wh]} />
              <meshStandardMaterial color="#5f7f9e" roughness={0.15} metalness={0.4} />
            </mesh>
            <mesh position={[p[0] - n[0] * off, p[1], p[2] - n[2] * off]} rotation={[0, rotY + Math.PI, 0]}>
              <planeGeometry args={[w, wh]} />
              {blind ? <meshBasicMaterial map={blindTex()} /> : <meshBasicMaterial color="#bfe3ff" />}
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
