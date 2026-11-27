import { create } from 'zustand'
import { ITEM_TYPES } from './items'
import { LAYOUT } from './layout'
import { sfx } from './sound'

export const WEAPONS = [
  { name: '망치', damage: 34, push: 4.5, range: 2.6, cooldown: 0.32, swingSpeed: 4.5 },
  { name: '대형 스패너', damage: 80, push: 8, range: 3.0, cooldown: 0.75, swingSpeed: 2.6 },
]

// 프레임마다 바뀌는 값은 리렌더링 없이 여기서 관리
export const fx = { shake: 0 }
const hp = new Map()
let uid = 0
const MAX_DEBRIS = 260
const MAX_PROJECTILES = 24
const rand = (a, b) => a + Math.random() * (b - a)

function makeDebris(pos, t, dir) {
  const out = []
  for (let i = 0; i < t.pieces; i++) {
    const s = t.chunk * rand(0.5, 1.2)
    out.push({
      id: uid++,
      pos: [pos.x + rand(-t.w, t.w) * 0.4, pos.y + rand(0.05, t.h), pos.z + rand(-t.w, t.w) * 0.4],
      rot: [rand(0, 3), rand(0, 3), rand(0, 3)],
      size: [s, s * rand(0.25, 0.8), s * rand(0.4, 1)],
      color: t.colors[i % t.colors.length],
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

  setLocked: (locked) => set({ locked }),
  setWeapon: (weapon) => set({ weapon }),

  // 물건에 피해를 줌. 내구도가 0이 되면 파편으로 바뀜
  damage(id, kind, amount, pos, dir) {
    if (get().broken[id]) return
    const t = ITEM_TYPES[kind]
    const left = (hp.has(id) ? hp.get(id) : t.hp) - amount
    hp.set(id, left)
    if (left > 0) {
      sfx.hit(t.mat)
      return
    }
    sfx.break(t.mat)
    fx.shake = Math.min(0.12, fx.shake + 0.05)
    const pieces = makeDebris(pos, t, dir)
    const entry = { id: uid++, name: t.name, value: t.value }
    set((s) => ({
      broken: { ...s.broken, [id]: true },
      score: s.score + t.value,
      count: s.count + 1,
      log: [entry, ...s.log].slice(0, 6),
      debris: [...s.debris, ...pieces].slice(-MAX_DEBRIS),
    }))
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

  reset() {
    hp.clear()
    fx.shake = 0
    set((s) => ({ round: s.round + 1, broken: {}, score: 0, count: 0, log: [], debris: [], projectiles: [] }))
  },
}))
