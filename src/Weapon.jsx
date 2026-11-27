import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGame, WEAPONS } from './store'

// 손에 든 무기는 벽에 파묻혀 보이지 않도록 항상 맨 위에 그림
function Part({ p, s, c, metal = 0, cyl }) {
  return (
    <mesh position={p} renderOrder={10}>
      {cyl ? <cylinderGeometry args={[s[0], s[0], s[1], 12]} /> : <boxGeometry args={s} />}
      <meshStandardMaterial color={c} metalness={metal * 0.35} roughness={0.45} depthTest={false} />
    </mesh>
  )
}

const Hammer = () => (
  <>
    <Part cyl p={[0, 0.18, 0]} s={[0.022, 0.42]} c="#8b5a2b" />
    <Part p={[0, 0.4, -0.02]} s={[0.07, 0.07, 0.2]} c="#7a7f86" metal={0.8} />
  </>
)

const Spanner = () => (
  <>
    <Part p={[0, 0.25, 0]} s={[0.05, 0.6, 0.025]} c="#9aa4ad" metal={0.9} />
    <Part p={[0, 0.56, 0]} s={[0.17, 0.05, 0.03]} c="#9aa4ad" metal={0.9} />
    <Part p={[-0.065, 0.62, 0]} s={[0.04, 0.1, 0.03]} c="#9aa4ad" metal={0.9} />
    <Part p={[0.065, 0.62, 0]} s={[0.04, 0.1, 0.03]} c="#9aa4ad" metal={0.9} />
    <Part p={[0, 0.0, 0]} s={[0.07, 0.12, 0.035]} c="#c23" />
  </>
)

const BombHand = () => (
  <>
    <mesh position={[0, 0.12, 0]} renderOrder={10}>
      <sphereGeometry args={[0.1, 14, 10]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} depthTest={false} />
    </mesh>
    <Part cyl p={[0, 0.24, 0]} s={[0.012, 0.06]} c="#c8b27a" />
    <Part p={[0, 0.28, 0]} s={[0.025, 0.025, 0.025]} c="#ffd34d" />
  </>
)

// 라이터 + 작은 불꽃
function Lighter() {
  const flame = useRef()
  useFrame(({ clock }) => {
    if (flame.current) flame.current.scale.y = 0.8 + 0.3 * Math.sin(clock.elapsedTime * 25)
  })
  return (
    <>
      <Part p={[0, 0.1, 0]} s={[0.06, 0.14, 0.025]} c="#d32f2f" />
      <Part p={[0, 0.19, 0]} s={[0.06, 0.04, 0.026]} c="#b0b6bd" metal={0.9} />
      <mesh ref={flame} position={[0.01, 0.25, 0]} renderOrder={11}>
        <coneGeometry args={[0.018, 0.07, 8]} />
        <meshBasicMaterial color="#ffb13d" depthTest={false} transparent opacity={0.9} />
      </mesh>
    </>
  )
}

const HAND = [Hammer, Spanner, BombHand, Lighter]

export function Weapon({ swing }) {
  const group = useRef()
  const pivot = useRef()
  const weapon = useGame((s) => s.weapon)
  const { camera } = useThree()
  const Hand = HAND[weapon]

  useFrame((_, dt) => {
    if (!group.current) return
    group.current.position.copy(camera.position)
    group.current.quaternion.copy(camera.quaternion)
    const s = swing.current
    s.t = Math.min(1, s.t + dt * WEAPONS[weapon].swingSpeed)
    // 앞으로 빠르게 내려찍고 천천히 원위치
    const a = s.t < 0.25 ? -(s.t / 0.25) * 1.5 : -1.5 * (1 - (s.t - 0.25) / 0.75)
    pivot.current.rotation.x = 0.25 + a
    pivot.current.rotation.z = -0.2 - a * 0.25
  })

  return (
    <group ref={group}>
      <group position={[0.42, -0.5, -0.7]} scale={0.85}>
        <group ref={pivot}><Hand /></group>
      </group>
    </group>
  )
}
