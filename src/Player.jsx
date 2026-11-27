import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useGame, WEAPONS, fx } from './store'
import { SPAWN } from './layout'
import { sfx } from './sound'
import { Weapon } from './Weapon'

const SPEED = 4.5
const SPRINT = 7.5
const JUMP = 4.8
const EYE = 0.6
const THROW_SPEED = 20

const fwd = new THREE.Vector3()
const side = new THREE.Vector3()
const move = new THREE.Vector3()
const dir = new THREE.Vector3()
const UP = new THREE.Vector3(0, 1, 0)

export function Player() {
  const body = useRef()
  const keys = useRef({})
  const swing = useRef({ t: 1, ready: 0, throwReady: 0 })
  const { camera } = useThree()
  const { world, rapier } = useRapier()
  const userData = useMemo(() => ({ player: true }), [])

  useEffect(() => {
    // 좌클릭: 바라보는 방향으로 광선을 쏴서 맞은 물건에 피해 + 밀어내기
    const attack = () => {
      const now = performance.now() / 1000
      const w = WEAPONS[useGame.getState().weapon]
      if (now < swing.current.ready || !body.current) return
      swing.current.ready = now + w.cooldown
      swing.current.t = 0

      camera.getWorldDirection(dir)
      const origin = camera.position.clone()
      const hit = world.castRay(new rapier.Ray(origin, dir), w.range, true, undefined, undefined, undefined, body.current)
      if (!hit) return sfx.swing()

      const toi = hit.timeOfImpact ?? hit.toi
      const point = origin.clone().addScaledVector(dir, toi)
      const rb = hit.collider.parent()
      if (!rb) return sfx.thud()
      if (rb.isDynamic()) {
        const m = rb.mass()
        rb.applyImpulseAtPoint({ x: dir.x * w.push * m, y: (dir.y * w.push + 1.5) * m, z: dir.z * w.push * m }, point, true)
      }
      const ud = rb.userData || {}
      if (ud.breakable) useGame.getState().damage(ud.breakable, ud.kind, w.damage, rb.translation(), dir.clone())
      else sfx.thud()
    }

    // 우클릭: 안전모 던지기
    const throwHelmet = () => {
      const now = performance.now() / 1000
      if (now < swing.current.throwReady) return
      swing.current.throwReady = now + 0.25
      camera.getWorldDirection(dir)
      const p = camera.position.clone().addScaledVector(dir, 0.7)
      useGame.getState().throwHelmet([p.x, p.y, p.z], [dir.x * THROW_SPEED, dir.y * THROW_SPEED + 1.5, dir.z * THROW_SPEED])
      sfx.throw()
    }

    const onKeyDown = (e) => {
      keys.current[e.code] = true
      if (!document.pointerLockElement) return
      if (e.code === 'Space') e.preventDefault()
      if (e.code === 'Digit1') useGame.getState().setWeapon(0)
      if (e.code === 'Digit2') useGame.getState().setWeapon(1)
      if (e.code === 'KeyR') useGame.getState().reset()
    }
    const onKeyUp = (e) => (keys.current[e.code] = false)
    const onMouse = (e) => {
      if (!document.pointerLockElement) return
      if (e.button === 0) attack()
      if (e.button === 2) throwHelmet()
    }
    const onMenu = (e) => e.preventDefault()
    const onBlur = () => (keys.current = {})

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousedown', onMouse)
    window.addEventListener('contextmenu', onMenu)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousedown', onMouse)
      window.removeEventListener('contextmenu', onMenu)
      window.removeEventListener('blur', onBlur)
    }
  }, [camera, world, rapier])

  useFrame((_, dt) => {
    const b = body.current
    if (!b) return
    const t = b.translation()
    camera.position.set(t.x, t.y + EYE, t.z)
    if (fx.shake > 0) {
      camera.position.x += (Math.random() - 0.5) * fx.shake
      camera.position.y += (Math.random() - 0.5) * fx.shake
      fx.shake = Math.max(0, fx.shake - dt * 0.6)
    }

    const k = keys.current
    const locked = !!document.pointerLockElement
    camera.getWorldDirection(fwd)
    fwd.y = 0
    fwd.normalize()
    side.crossVectors(fwd, UP)
    move.set(0, 0, 0)
    if (locked) {
      if (k.KeyW) move.add(fwd)
      if (k.KeyS) move.sub(fwd)
      if (k.KeyD) move.add(side)
      if (k.KeyA) move.sub(side)
    }
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(k.ShiftLeft || k.ShiftRight ? SPRINT : SPEED)

    const v = b.linvel()
    let vy = v.y
    if (locked && k.Space && Math.abs(v.y) < 0.05) vy = JUMP
    b.setLinvel({ x: move.x, y: vy, z: move.z }, true)

    if (t.y < -5) b.setTranslation({ x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] }, true)
  })

  return (
    <>
      <RigidBody
        ref={body}
        position={SPAWN}
        colliders={false}
        enabledRotations={[false, false, false]}
        userData={userData}
        friction={0}
        ccd
        canSleep={false}
      >
        <CapsuleCollider args={[0.5, 0.35]} />
      </RigidBody>
      <Weapon swing={swing} />
    </>
  )
}
