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

export function Weapon({ swing }) {
  const group = useRef()
  const pivot = useRef()
  const weapon = useGame((s) => s.weapon)
  const { camera } = useThree()

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
        <group ref={pivot}>{weapon === 0 ? <Hammer /> : <Spanner />}</group>
      </group>
    </group>
  )
}
