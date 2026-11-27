import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, BallCollider, useRapier } from '@react-three/rapier'
import { useGame, bodies, centerOf, fx, BOMB } from './store'
import { ITEM_TYPES, burnRate } from './items'
import { sfx } from './sound'

/* ───────────── 불 ───────────── */

const FIRE_TICK = 0.25 // 이 간격(초)마다 타는 물건에 피해
const SPREAD_TICK = 0.8 // 이 간격마다 옆 물건으로 번질지 검사
const SPREAD_GAP = 0.9 // 물건 가장자리끼리 이 거리(m) 안이면 번질 수 있음
const FIRE_LIGHTS = 4 // 불빛은 가까운 불 몇 개만 (조명 개수가 바뀌면 화면이 끊겨서 고정)

const coneGeo = new THREE.ConeGeometry(1, 1, 7)
const ballGeo = new THREE.SphereGeometry(1, 10, 8)
const flameOuter = new THREE.MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
const flameInner = new THREE.MeshBasicMaterial({ color: '#ffd34d', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
const smokeMat = new THREE.MeshBasicMaterial({ color: '#2b2b2b', transparent: true, opacity: 0.32, depthWrite: false })

// 불꽃 크기: 물건 크기에 맞춤
function flameSize(t) {
  return { r: THREE.MathUtils.clamp(t.w * 0.32, 0.12, 1.3), h: THREE.MathUtils.clamp(t.h * 0.9, 0.35, 2.6) }
}

const Flame = memo(function Flame({ id }) {
  const group = useRef()
  const tongues = useRef([])
  const smoke = useRef([])
  const kind = bodies.get(id)?.kind
  const t = ITEM_TYPES[kind] || ITEM_TYPES.box
  const { r, h } = flameSize(t)
  const seeds = useMemo(() => Array.from({ length: 5 }, () => Math.random() * 10), [])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const c = centerOf(id)
    if (!c) return (g.visible = false)
    g.visible = true
    g.position.set(c.x, c.y - t.h * 0.2, c.z)
    const time = clock.elapsedTime
    tongues.current.forEach((m, i) => {
      if (!m) return
      const s = seeds[i]
      const f = 0.75 + 0.25 * Math.sin(time * (9 + i) + s) + 0.1 * Math.sin(time * 23 + s * 3)
      const ri = i === 0 ? r : r * 0.55
      m.scale.set(ri * (0.9 + 0.1 * Math.sin(time * 7 + s)), h * f * (i === 0 ? 1 : 0.7), ri)
      m.position.y = (h * f * (i === 0 ? 1 : 0.7)) / 2
    })
    smoke.current.forEach((m, i) => {
      if (!m) return
      const k = (time * 0.45 + i / 3) % 1 // 0→1 올라가며 커지고 사라짐
      const s = r * (0.6 + k * 1.6) * (1 - k * 0.6)
      m.scale.setScalar(Math.max(0.01, s))
      m.position.set(Math.sin(i * 2.1 + time) * r * 0.4, h * 0.9 + k * 2.2, Math.cos(i * 1.7 + time) * r * 0.4)
    })
  })

  const offsets = [[0, 0], [r * 0.6, r * 0.3], [-r * 0.5, r * 0.45], [r * 0.1, -r * 0.6], [-r * 0.4, -r * 0.4]]
  return (
    <group ref={group}>
      {offsets.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh ref={(m) => (tongues.current[i] = m)} geometry={coneGeo} material={i === 0 ? flameOuter : flameInner} renderOrder={5} />
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => (smoke.current[i] = m)} geometry={ballGeo} material={smokeMat} renderOrder={4} />
      ))}
    </group>
  )
})

export function Fires() {
  const fires = useGame((s) => s.fires)
  const ids = Object.keys(fires)
  const lights = useRef([])
  const acc = useRef({ burn: 0, spread: 0 })
  const { camera } = useThree()

  useFrame(({ clock }, dt) => {
    const st = useGame.getState()
    const burning = Object.keys(st.fires)
    const a = acc.current
    a.burn += dt
    a.spread += dt

    // 타는 물건은 조금씩 부서짐
    if (a.burn >= FIRE_TICK) {
      for (const id of burning) {
        const b = bodies.get(id)
        if (!b) continue
        const dps = (b.t.hp / 8 + 3) * Math.max(0.5, burnRate(b.t))
        st.damage(id, b.kind, dps * a.burn, b.rb.translation(), null, true)
      }
      a.burn = 0
    }

    // 옆 물건으로 번짐
    if (a.spread >= SPREAD_TICK && burning.length) {
      a.spread = 0
      let near = false
      for (const id of burning) {
        const c = centerOf(id)
        const src = bodies.get(id)
        if (!c || !src) continue
        if (camera.position.distanceTo(c) < 10) near = true
        for (const [other, b] of bodies) {
          if (st.fires[other] || other === id) continue
          const rate = burnRate(b.t)
          if (!rate) continue
          const o = centerOf(other)
          const gap = Math.hypot(o.x - c.x, o.y - c.y, o.z - c.z) - (src.t.w + b.t.w) * 0.35
          if (gap < SPREAD_GAP && Math.random() < 0.3 * rate) st.ignite(other)
        }
      }
      if (near) sfx.crackle()
    }

    // 가까운 불에만 주황색 불빛
    const list = burning
      .map((id) => centerOf(id))
      .filter(Boolean)
      .sort((p, q) => camera.position.distanceToSquared(p) - camera.position.distanceToSquared(q))
    const time = clock.elapsedTime
    lights.current.forEach((l, i) => {
      if (!l) return
      const c = list[i]
      if (!c) return (l.intensity = 0)
      l.position.set(c.x, c.y + 0.6, c.z)
      l.intensity = 9 + 3 * Math.sin(time * 13 + i * 2) + 2 * Math.sin(time * 29 + i)
    })
  })

  return (
    <>
      {Array.from({ length: FIRE_LIGHTS }, (_, i) => (
        <pointLight key={i} ref={(l) => (lights.current[i] = l)} color="#ff8a3d" intensity={0} distance={8} decay={1.6} />
      ))}
      {ids.map((id) => (
        <Flame key={id} id={id} />
      ))}
    </>
  )
}

/* ───────────── 폭탄 ───────────── */

const Bomb = memo(function Bomb({ b }) {
  const ref = useRef()
  const spark = useRef()
  const done = useRef(false)
  const userData = useMemo(() => ({ projectile: true, v: { x: b.vel[0], y: b.vel[1], z: b.vel[2] } }), [b])

  useFrame(({ clock }) => {
    const rb = ref.current
    if (!rb || done.current) return
    const v = rb.linvel()
    userData.v.x = v.x
    userData.v.y = v.y
    userData.v.z = v.z
    if (spark.current) spark.current.scale.setScalar(0.6 + 0.5 * Math.abs(Math.sin(clock.elapsedTime * 40)))
    if (performance.now() - b.born > BOMB.fuse * 1000) {
      done.current = true
      const p = rb.translation()
      const st = useGame.getState()
      st.removeBomb(b)
      st.explode({ x: p.x, y: p.y, z: p.z }, 1)
    }
  })

  return (
    <RigidBody ref={ref} position={b.pos} linearVelocity={b.vel} angularVelocity={[4, 1, 2]} colliders={false} userData={userData} ccd>
      <BallCollider args={[0.14]} density={30} restitution={0.3} friction={0.9} />
      <mesh castShadow>
        <sphereGeometry args={[0.14, 14, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.05, 8]} />
        <meshStandardMaterial color="#666" metalness={0.6} />
      </mesh>
      <mesh ref={spark} position={[0, 0.21, 0]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ffd34d" />
      </mesh>
    </RigidBody>
  )
})

export function Bombs() {
  const list = useGame((s) => s.bombs)
  return list.map((b) => <Bomb key={b.id} b={b} />)
}

/* ───────────── 폭발 ───────────── */

const Explosion = memo(function Explosion({ e }) {
  const ball = useRef()
  const cloud = useRef()
  const { world } = useRapier()
  const { camera } = useThree()
  const puff = e.kind === 'puff'
  const R = BOMB.radius * Math.sqrt(e.power || 1)
  const mats = useMemo(
    () => ({
      ball: new THREE.MeshBasicMaterial({ color: puff ? '#f4f6f8' : '#ff8a2a', transparent: true, blending: puff ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false }),
      cloud: new THREE.MeshBasicMaterial({ color: puff ? '#e8ecef' : '#3a3530', transparent: true, depthWrite: false }),
    }),
    [puff],
  )
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  // 폭발 순간: 주변의 움직이는 물체(물건, 파편)를 바깥으로 날림 + 화면 흔들림
  useEffect(() => {
    if (puff) return
    const [x, y, z] = e.pos
    world.bodies.forEach((rb) => {
      if (!rb.isDynamic()) return
      const ud = rb.userData || {}
      if (ud.player) return
      const p = rb.translation()
      const dx = p.x - x
      const dy = p.y - y
      const dz = p.z - z
      const d = Math.hypot(dx, dy, dz)
      if (d > R) return
      const k = 1 - d / R
      const m = rb.mass() * (ITEM_TYPES[ud.kind]?.push ?? 1)
      const n = d || 1
      const f = BOMB.push * e.power * k * m
      rb.applyImpulse({ x: (dx / n) * f, y: (Math.max(0, dy / n) + 0.6) * f, z: (dz / n) * f }, true)
      rb.applyTorqueImpulse({ x: (Math.random() - 0.5) * f * 0.1, y: (Math.random() - 0.5) * f * 0.1, z: (Math.random() - 0.5) * f * 0.1 }, true)
    })
    const dist = camera.position.distanceTo(new THREE.Vector3(x, y, z))
    fx.shake = Math.min(0.45, fx.shake + 0.4 * e.power * Math.max(0, 1 - dist / 30))
  }, [e, world, camera, R, puff])

  useFrame(() => {
    const age = (performance.now() - e.born) / 1000
    if (ball.current) {
      const k = Math.min(1, age / (puff ? 0.6 : 0.35))
      ball.current.scale.setScalar((puff ? 1.8 : R * 0.55) * (0.2 + 0.8 * Math.sqrt(k)))
      mats.ball.opacity = Math.max(0, 1 - age / (puff ? 1.2 : 0.5))
    }
    if (cloud.current) {
      const k = Math.min(1, age / 1.4)
      cloud.current.scale.setScalar((puff ? 2.4 : R * 0.7) * (0.3 + 0.7 * k))
      cloud.current.position.y = e.pos[1] + k * (puff ? 0.3 : 1.5)
      mats.cloud.opacity = Math.max(0, (puff ? 0.7 : 0.55) * (1 - k))
    }
  })

  return (
    <>
      <mesh ref={ball} position={e.pos} geometry={ballGeo} material={mats.ball} renderOrder={6} />
      <mesh ref={cloud} position={e.pos} geometry={ballGeo} material={mats.cloud} renderOrder={5} />
    </>
  )
})

export function Explosions() {
  const list = useGame((s) => s.explosions)
  const light = useRef()
  useFrame(() => {
    const l = light.current
    if (!l) return
    const last = [...useGame.getState().explosions].reverse().find((x) => x.kind === 'boom')
    const age = last ? (performance.now() - last.born) / 1000 : 9
    if (age > 0.5) return (l.intensity = 0)
    l.position.set(last.pos[0], last.pos[1] + 0.5, last.pos[2])
    l.intensity = 160 * last.power * (1 - age / 0.5)
  })
  return (
    <>
      <pointLight ref={light} color="#ffae5a" intensity={0} distance={22} decay={1.4} />
      {list.map((e) => (
        <Explosion key={e.id} e={e} />
      ))}
    </>
  )
}
