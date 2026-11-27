import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, BallCollider } from '@react-three/rapier'
import { useGame } from './store'
import { HelmetMesh } from './items'
import { sfx } from './sound'

const DEBRIS_DATA = { debris: true }

const Piece = memo(function Piece({ d }) {
  return (
    <RigidBody
      position={d.pos}
      rotation={d.rot}
      linearVelocity={d.vel}
      angularVelocity={d.ang}
      colliders="cuboid"
      userData={DEBRIS_DATA}
      friction={0.8}
      restitution={0.2}
    >
      <mesh castShadow>
        <boxGeometry args={d.size} />
        <meshStandardMaterial color={d.color} transparent={d.clear} opacity={d.clear ? 0.45 : 1} roughness={d.clear ? 0.1 : 0.7} />
      </mesh>
    </RigidBody>
  )
})

export function Debris() {
  const debris = useGame((s) => s.debris)
  return debris.map((d) => <Piece key={d.id} d={d} />)
}

const Helmet = memo(function Helmet({ p }) {
  const ref = useRef()
  const userData = useMemo(() => ({ projectile: true, v: { x: p.vel[0], y: p.vel[1], z: p.vel[2] } }), [p])

  useFrame(() => {
    const rb = ref.current
    if (!rb) return
    const v = rb.linvel()
    userData.v.x = v.x
    userData.v.y = v.y
    userData.v.z = v.z
  })

  const onCollisionEnter = () => {
    const { x, y, z } = userData.v
    if (Math.hypot(x, y, z) > 4) sfx.hit('plastic')
  }

  return (
    <RigidBody
      ref={ref}
      position={p.pos}
      linearVelocity={p.vel}
      angularVelocity={[6, 2, 0]}
      colliders={false}
      userData={userData}
      ccd
      onCollisionEnter={onCollisionEnter}
    >
      <BallCollider args={[0.15]} density={40} restitution={0.35} />
      <HelmetMesh />
    </RigidBody>
  )
})

export function Projectiles() {
  const list = useGame((s) => s.projectiles)
  return list.map((p) => <Helmet key={p.id} p={p} />)
}
