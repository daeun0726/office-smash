import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { ITEM_TYPES } from './items'
import { useGame, bodies } from './store'

const ZERO = { x: 0, y: 0, z: 0 }
const IMPACT_SPEED = 6.5 // 이 속도(m/s) 이상으로 부딪히면 피해를 입음

// 부서지면 Body 컴포넌트째로 사라지게 해서, 지워진 물리 객체를 건드리지 않도록 함
export function Breakable(props) {
  const broken = useGame((s) => !!s.broken[props.id])
  return broken ? null : <Body {...props} />
}

function Body({ id, kind, pos, rot = 0, args }) {
  const t = ITEM_TYPES[kind]
  const ref = useRef()
  const born = useRef(performance.now())
  // 충돌 직전 속도를 기록해 두고 충돌 세기를 계산 (충돌 이벤트 시점엔 이미 튕겨나간 속도라서)
  const userData = useMemo(() => ({ breakable: id, kind, v: { x: 0, y: 0, z: 0 } }), [id, kind])

  useEffect(() => {
    const rb = ref.current
    if (!rb) return
    bodies.set(id, { rb, kind, t })
    return () => bodies.delete(id)
  }, [id, kind, t])

  useFrame(() => {
    const rb = ref.current
    if (!rb || t.fixed || useGame.getState().broken[id]) return
    const v = rb.isSleeping() ? ZERO : rb.linvel()
    userData.v.x = v.x
    userData.v.y = v.y
    userData.v.z = v.z
  })

  const onCollisionEnter = ({ other, target }) => {
    if (performance.now() - born.current < 1500) return
    if (useGame.getState().broken[id]) return
    const o = other.rigidBody
    if (!o || !target.rigidBody) return
    const od = o.userData || {}
    if (od.player || od.debris) return
    const a = userData.v
    const b = od.v || ZERO
    const rel = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
    if (rel < IMPACT_SPEED) return
    const amount = (rel - IMPACT_SPEED) * (od.projectile ? 9 : 5)
    useGame.getState().damage(id, kind, amount, target.rigidBody.translation(), null)
  }

  return (
    <RigidBody
      ref={ref}
      type={t.fixed ? 'fixed' : 'dynamic'}
      position={pos}
      rotation={[0, rot, 0]}
      colliders="cuboid"
      userData={userData}
      friction={0.7}
      onCollisionEnter={onCollisionEnter}
    >
      {t.render(args || {})}
    </RigidBody>
  )
}
