import { create } from 'zustand'
import { ITEM_TYPES, debrisColors, burnRate, CHARRED } from './items'
import { LAYOUT } from './layout'
import { sfx } from './sound'

export const WEAPONS = [
  { name: '망치', type: 'melee', damage: 34, push: 4.5, range: 2.6, cooldown: 0.32, swingSpeed: 4.5 },
  { name: '대형 스패너', type: 'melee', damage: 80, push: 8, range: 3.0, cooldown: 0.75, swingSpeed: 2.6 },
  { name: '폭탄', type: 'bomb', cooldown: 0.7, swingSpeed: 3.5 },
  { name: '라이터', type: 'fire', range: 2.8, cooldown: 0.25, swingSpeed: 5 },
]

export const BOMB = { fuse: 1.6, speed: 14, radius: 4.5, damage: 170, push: 9 }
const MAX_FIRES = 45
const MAX_BOMBS = 12

// 프레임마다 바뀌는 값은 리렌더링 없이 여기서 관리
export const fx = { shake: 0 }
const hp = new Map()
let uid = 0
const MAX_DEBRIS = 320
const MAX_PROJECTILES = 24
const rand = (a, b) => a + Math.random() * (b - a)

// 지금 화면에 있는 물건의 물리 객체 (폭발 범위, 불 번짐 계산용). Breakable이 등록/해제함
export const bodies = new Map()
// 물건의 대략적인 중심 위치
export function centerOf(id) {
  const b = bodies.get(id)
  if (!b) return null
  const p = b.rb.translation()
  return { x: p.x, y: p.y + b.t.h * 0.45, z: p.z }
}

export const BY_ID = Object.fromEntries(LAYOUT.map((it) => [it.id, it]))
const CHILDREN = {}
for (const it of LAYOUT) if (it.parent) (CHILDREN[it.parent] ||= []).push(it.id)

function makeDebris(pos, t, args, dir, charred) {
  const colors = charred ? CHARRED : debrisColors(t, args)
  const out = []
  for (let i = 0; i < t.pieces; i++) {
    const s = t.chunk * rand(0.5, 1.2)
    out.push({
      id: uid++,
      pos: [pos.x + rand(-t.w, t.w) * 0.4, pos.y + rand(0.05, t.h), pos.z + rand(-t.w, t.w) * 0.4],
      rot: [rand(0, 3), rand(0, 3), rand(0, 3)],
      size: [s, s * rand(0.25, 0.8), s * rand(0.4, 1)],
      color: colors[i % colors.length],
      clear: !!t.clear,
      vel: [rand(-3, 3) + (dir ? dir.x * 3 : 0), rand(1.5, 4.5), rand(-3, 3) + (dir ? dir.z * 3 : 0)],
      ang: [rand(-10, 10), rand(-10, 10), rand(-10, 10)],
    })
  }
  return out
}

export const useGame = create((set, get) => ({
  round: 0,
  locked: false,
  broken: {},
  score: 0,
  count: 0,
  total: LAYOUT.length,
  log: [],
  debris: [],
  projectiles: [],
  weapon: 0,
  fires: {}, // 불붙은 물건 id → 불붙은 시각
  bombs: [],
  explosions: [],

  setLocked: (locked) => set({ locked }),
  setWeapon: (weapon) => set({ weapon }),

  // 물건에 피해를 줌. 내구도가 0이 되면 파편으로 바뀜 (silent: 불에 타는 중이라 맞는 소리 생략)
  damage(id, kind, amount, pos, dir, silent) {
    if (get().broken[id]) return
    const t = ITEM_TYPES[kind]
    const left = (hp.has(id) ? hp.get(id) : t.hp) - amount
    hp.set(id, left)
    if (left > 0) {
      if (!silent) sfx.hit(t.mat)
      return
    }
    sfx.break(t.mat)
    fx.shake = Math.min(0.12, fx.shake + 0.05)
    const wasBurning = !!get().fires[id]
    const pieces = makeDebris(pos, t, BY_ID[id]?.args, dir, wasBurning)

    // 부서지면 터지는 물건(드럼통, 차)과 불을 끄는 소화기
    const center = { x: pos.x, y: pos.y + t.h * 0.45, z: pos.z }
    if (t.explosive) setTimeout(() => get().explode(center, t.explosive), 140)
    if (t.extinguisher) get().extinguish(center, 3.5)

    // 붙어 있던 물건(유리창 등)도 함께 파손 처리
    const s0 = get()
    const kids = (CHILDREN[id] || []).filter((c) => !s0.broken[c])
    let value = t.value
    const newlyBroken = { [id]: true }
    for (const c of kids) {
      newlyBroken[c] = true
      value += ITEM_TYPES[BY_ID[c].kind].value
    }
    if (kids.length) sfx.break('glass')

    const label = (wasBurning ? '🔥 ' : '') + t.name + (kids.length ? ` (+부품 ${kids.length}개)` : '')
    const entry = { id: uid++, name: label, value }
    set((s) => {
      const fires = { ...s.fires }
      for (const k in newlyBroken) delete fires[k]
      return {
      fires,
      broken: { ...s.broken, ...newlyBroken },
      score: s.score + value,
      count: s.count + 1 + kids.length,
      log: [entry, ...s.log].slice(0, 6),
      debris: [...s.debris, ...pieces].slice(-MAX_DEBRIS),
    }
    })
    const round = get().round
    setTimeout(() => {
      if (get().round !== round) return
      const ids = new Set(pieces.map((p) => p.id))
      set((s) => ({ debris: s.debris.filter((d) => !ids.has(d.id)) }))
    }, 9000)
    setTimeout(() => set((s) => ({ log: s.log.filter((l) => l !== entry) })), 2500)
  },

  throwHelmet(pos, vel) {
    const p = { id: uid++, pos, vel }
    set((s) => ({ projectiles: [...s.projectiles, p].slice(-MAX_PROJECTILES) }))
    setTimeout(() => set((s) => ({ projectiles: s.projectiles.filter((x) => x !== p) })), 7000)
  },

  // 불붙이기 (안 타는 물건이면 false)
  ignite(id) {
    const s = get()
    const it = BY_ID[id]
    if (!it || s.broken[id] || s.fires[id] || !burnRate(ITEM_TYPES[it.kind])) return false
    if (Object.keys(s.fires).length >= MAX_FIRES) return false
    set((st) => ({ fires: { ...st.fires, [id]: performance.now() } }))
    sfx.ignite()
    return true
  },

  // pos 주변 r 안의 불을 끔
  extinguish(pos, r) {
    const fires = { ...get().fires }
    let n = 0
    for (const id in fires) {
      const c = centerOf(id)
      if (!c || Math.hypot(c.x - pos.x, c.y - pos.y, c.z - pos.z) < r) {
        delete fires[id]
        n++
      }
    }
    if (n) set({ fires })
    sfx.puff()
    get().addExplosion(pos, 0, 'puff')
  },

  throwBomb(pos, vel) {
    const b = { id: uid++, pos, vel, born: performance.now() }
    set((s) => ({ bombs: [...s.bombs, b].slice(-MAX_BOMBS) }))
  },
  removeBomb(b) {
    set((s) => ({ bombs: s.bombs.filter((x) => x !== b) }))
  },

  addExplosion(pos, power, kind = 'boom') {
    const e = { id: uid++, pos: [pos.x, pos.y, pos.z], power, kind, born: performance.now() }
    set((s) => ({ explosions: [...s.explosions, e].slice(-10) }))
    const round = get().round
    setTimeout(() => {
      if (get().round === round) set((s) => ({ explosions: s.explosions.filter((x) => x !== e) }))
    }, 1600)
  },

  // 폭발: 반경 안의 물건에 거리에 따라 피해, 탈 수 있는 물건엔 불을 붙임 (밀어내기는 Explosion 화면 효과에서)
  explode(pos, power = 1) {
    const R = BOMB.radius * Math.sqrt(power)
    sfx.boom()
    get().addExplosion(pos, power)
    for (const [id, b] of [...bodies]) {
      const c = centerOf(id)
      if (!c) continue
      const dx = c.x - pos.x
      const dy = c.y - pos.y
      const dz = c.z - pos.z
      const d = Math.hypot(dx, dy, dz) - b.t.w * 0.3
      if (d > R) continue
      const k = Math.max(0, 1 - Math.max(0, d) / R)
      if (k > 0.35 && Math.random() < 0.7) get().ignite(id)
      const dir = { x: dx / (d + 0.5), y: 0.5, z: dz / (d + 0.5) }
      get().damage(id, b.kind, BOMB.damage * power * k, b.rb.translation(), dir, true)
    }
  },

  reset() {
    hp.clear()
    fx.shake = 0
    set((s) => ({ round: s.round + 1, broken: {}, score: 0, count: 0, log: [], debris: [], projectiles: [], fires: {}, bombs: [], explosions: [] }))
  },
}))
