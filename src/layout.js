/*
  사무실 배치도. 실제 사무실 구조로 바꾸려면 이 파일만 고치면 됩니다.

  좌표 (단위: m, 위에서 내려다본 기준)
    x: 왼쪽(서쪽) -12  ~  오른쪽(동쪽) +12
    z: 안쪽(북쪽)  -8  ~  출입문(남쪽)  +8
    y: 높이 (바닥 = 0)
  rot: 회전 (0 = 앞면이 출입문 쪽을 향함, Math.PI = 안쪽을 향함)
*/

export const ROOM = { w: 24, d: 16, h: 3.2 } // 경영인사처 사무실 (x -12~12, z -8~8)
export const SPAWN = [0, 1.2, 6.3]

/* ── 건물 전체 구조 ──
   경영인사처 동쪽 벽 문으로 나가면 동쪽으로 뻗은 복도.
   복도에 나서면 바로 오른쪽(남쪽)이 단장실, 5걸음(약 3.3m) 더 가면 왼쪽(북쪽)에 화장실,
   화장실 바로 옆이 인턴실. 복도 끝(동쪽)은 바깥으로 나가는 문.

        z -8 ┌──────────────────────┬─────────┬──────────────┐
             │                      │ 화장실  │   인턴실      │
             │     경영인사처        │         │              │
        z 0.5│                      ├──[문]───┴─[문]─────────┤
             │                    [문]  복  도               [문]→ 밖
        z 3.1│                      ├[문]────────┬─────[문]──┤
             │                      │  단장실    │  비품실    │
        z  8 └─────────[출입문]──────┴────────────┴───────────┘
           x -12                   x 12        x 20         x 30          */
export const BUILDING = { x0: -12, x1: 30, z0: -8, z1: 8, h: 3.2 }
export const DOOR = { x0: -0.9, x1: 0.9, h: 2.3 } // 정문 (남쪽 벽 가운데)
export const CORRIDOR = { z0: 0.5, z1: 3.1 }
const CZ = (CORRIDOR.z0 + CORRIDOR.z1) / 2
const SIDE_DOOR = [CZ - 0.9, CZ + 0.9] // 경영인사처 ↔ 복도, 복도 ↔ 바깥
export const DOORS = {
  main: [DOOR.x0, DOOR.x1],
  dept: SIDE_DOOR,
  director: [12.55, 13.65],
  restroom: [15.9, 16.9],
  intern: [18.4, 19.6],
  storage: [25.6, 26.7],
  east: SIDE_DOOR,
}

// 벽: axis 'x' = z가 at인 위치에서 x방향으로 뻗은 벽, axis 'z' = x가 at인 위치에서 z방향으로 뻗은 벽
export const WALLS = [
  { axis: 'x', at: -8, from: -12, to: 30, ext: true },
  { axis: 'x', at: 8, from: -12, to: 30, ext: true, doors: [DOORS.main] },
  { axis: 'z', at: -12, from: -8, to: 8, ext: true },
  { axis: 'z', at: 30, from: -8, to: 8, ext: true, doors: [DOORS.east] },
  { axis: 'z', at: 12, from: -8, to: 8, doors: [DOORS.dept] },
  { axis: 'x', at: CORRIDOR.z0, from: 12, to: 30, doors: [DOORS.restroom, DOORS.intern] },
  { axis: 'x', at: CORRIDOR.z1, from: 12, to: 30, doors: [DOORS.director, DOORS.storage] },
  { axis: 'z', at: 17.5, from: -8, to: CORRIDOR.z0 },
  { axis: 'z', at: 20, from: CORRIDOR.z1, to: 8 },
]

// 방마다 바닥 재질과 천장 조명
export const ROOMS = [
  { name: '경영인사처', x0: -12, x1: 12, z0: -8, z1: 8, floor: 'tile', lights: [4.5, 4] },
  { name: '복도', x0: 12, x1: 30, z0: CORRIDOR.z0, z1: CORRIDOR.z1, floor: 'tile', tint: '#d9d4c8', lights: [4, 9] },
  { name: '화장실', x0: 12, x1: 17.5, z0: -8, z1: CORRIDOR.z0, floor: 'tile', tint: '#cfe3ec', tile: 0.5, lights: [2.6, 3.2] },
  { name: '인턴실', x0: 17.5, x1: 30, z0: -8, z1: CORRIDOR.z0, floor: 'tile', tint: '#f1ece2', lights: [3.6, 2.8] },
  { name: '단장실', x0: 12, x1: 20, z0: CORRIDOR.z1, z1: 8, floor: '#59607a', lights: [3.5, 9] },
  { name: '비품실', x0: 20, x1: 30, z0: CORRIDOR.z1, z1: 8, floor: 'tile', lights: [4.5, 9] },
]

// 창문 (모두 바깥벽). n = 바깥쪽 방향, blind = 안쪽에 롤블라인드
export const WINDOWS = [
  ...[-3.5, 3].map((x) => ({ p: [x, 1.8, 8], n: [0, 0, 1], w: 2.4, h: 1.3 })),
  ...[-1, 3].map((z) => ({ p: [-12, 1.8, z], n: [-1, 0, 0], w: 2.4, h: 1.3 })),
  { p: [14.6, 2.35, -8], n: [0, 0, -1], w: 1.4, h: 0.5 }, // 화장실 환기창
  ...[19.6, 22.2, 24.8, 27.4].map((x) => ({ p: [x, 1.85, -8], n: [0, 0, -1], w: 2.5, h: 1.7, blind: true })),
  ...[-6.3, -3.6].map((z) => ({ p: [30, 1.85, z], n: [1, 0, 0], w: 2.5, h: 1.7, blind: true })),
  ...[15, 18.2].map((x) => ({ p: [x, 1.8, 8], n: [0, 0, 1], w: 2.2, h: 1.4, blind: true })),
]

const DESK_TOP = 0.752
const BOSS_TOP = 0.772

const items = []
let n = 0
// parent: 이 물건이 붙어 있는 물건 (예: 전동차 유리창 → 전동차). 부모가 부서지면 같이 사라짐
const add = (kind, pos, rot = 0, args, parent) => {
  const id = `${kind}-${n++}`
  items.push({ id, kind, pos, rot, args, parent })
  return id
}

// 기준점(base)에서 rot만큼 돌린 상대 좌표
function local(base, rot, [lx, ly, lz]) {
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  return [base[0] + lx * c + lz * s, base[1] + ly, base[2] - lx * s + lz * c]
}

// 자리 하나: 책상 + 모니터 + 키보드 + 의자 (+ 전화기, 머그컵)
function workstation(base, rot, seed) {
  add('desk', base, rot)
  add('monitor', local(base, rot, [0, DESK_TOP, -0.15]), rot)
  add('keyboard', local(base, rot, [0, DESK_TOP, 0.12]), rot)
  add('chair', local(base, rot, [0, 0, 0.7]), rot)
  if (seed % 2 === 0) add('phone', local(base, rot, [0.5, DESK_TOP, -0.1]), rot)
  if (seed % 3 !== 1) add('mug', local(base, rot, [-0.5, DESK_TOP, 0.08]), rot)
}

// 4인 책상 묶음 (2명씩 마주 보기)
let seed = 0
function pod(cx, cz) {
  for (const dx of [-0.7, 0.7]) {
    workstation([cx + dx, 0, cz + 0.36], 0, seed++)
    workstation([cx + dx, 0, cz - 0.36], Math.PI, seed++)
  }
  add('divider', [cx, DESK_TOP, cz], 0)
}

// ── 사무 공간 ──
for (const cx of [-6, -1, 4]) for (const cz of [-0.5, 3.8]) pod(cx, cz)

// ── 팀장님 자리 (안쪽 가운데, 직원 쪽을 바라봄) ──
{
  const base = [0, 0, -5.6]
  const rot = Math.PI
  add('bossDesk', base, rot)
  add('monitor', local(base, rot, [0.3, BOSS_TOP, -0.2]), rot)
  add('keyboard', local(base, rot, [0.3, BOSS_TOP, 0.12]), rot)
  add('chair', local(base, rot, [0, 0, 0.75]), rot)
  add('phone', local(base, rot, [-0.75, BOSS_TOP, -0.1]), rot)
  add('train', local(base, rot, [-0.45, BOSS_TOP, 0.15]), 0)
  add('nameplate', [0.4, BOSS_TOP, -5.25], 0)
  add('cabinet', [-1.7, 0, -7.5], 0)
  add('cabinet', [1.7, 0, -7.5], 0)
  add('plant', [-2.6, 0, -7.4])
}

// ── 벽 장식 ──
add('sign', [0, 2.2, -7.83], 0, { text: '안 전 제 일', bg: '#1f7a3a' })
add('sign', [-5.5, 2.2, -7.83], 0, { text: '무재해 1000일 달성!', bg: '#1d4f9c' })
add('clock', [3.6, 2.3, -7.83], 0)
add('whiteboard', [11.86, 1.5, -1.6], -Math.PI / 2)
add('orgChart', [11.88, 1.65, 4.2], -Math.PI / 2)

// ── 서쪽 벽: 서류함, 복합기, 상자 ──
for (let i = 0; i < 13; i++) add('cabinet', [-11.54, 0, -3 + i * 0.55], Math.PI / 2)
add('printer', [-11.45, 0, 5.6], Math.PI / 2)
add('box', [-10.6, 0, 6.9], 0.2)
add('box', [-10.6, 0.322, 6.9], 0.5)
add('box', [-10.05, 0, 6.95], -0.15)

// ── 탕비실 (북서쪽) ──
add('counter', [-10.6, 0, -7.5], 0)
add('coffee', [-11.3, 0.902, -7.55], 0)
add('mug', [-10.8, 0.902, -7.4])
add('mug', [-10.55, 0.902, -7.5])
add('mug', [-10.3, 0.902, -7.4])
add('fridge', [-8.9, 0, -7.45], 0)
add('water', [-11.5, 0, -6.2], Math.PI / 2)
add('plant', [-11.3, 0, -4.3])

// ── 회의실 (북동쪽, 유리 칸막이) ──
for (const z of [-7.25, -6.05, -4.85]) add('glass', [6, 0, z], Math.PI / 2)
for (const x of [6.6, 7.8, 9.0, 10.2, 11.4]) add('glass', [x, 0, -3], 0)
add('meetingTable', [9, 0, -5.5], 0)
for (const x of [8, 9, 10]) {
  add('chair', [x, 0, -6.45], Math.PI)
  add('chair', [x, 0, -4.55], 0)
}
add('tv', [11.82, 1.5, -5.5], -Math.PI / 2)
add('plant', [11.3, 0, -7.4])

// ── 남쪽 벽: 작업복 사물함 + 위에 안전모 ──
for (const x of [-11.2, -10.3, -9.4, -8.5, -7.6, -6.7, 5.6, 6.5, 7.4, 8.3, 9.2, 10.1]) {
  add('locker', [x, 0, 7.58], Math.PI)
  add('helmet', [x, 1.902, 7.58], Math.random() * Math.PI)
}
add('plant', [-5.7, 0, 7.4])
add('plant', [4.6, 0, 7.4])
add('plant', [11.4, 0, 7.4])
add('water', [11.5, 0, 5.8], -Math.PI / 2)

/* ═══════════════════════ 복도 쪽 방들 ═══════════════════════ */
const HALF = 0.1 // 안쪽 벽 두께의 절반
const PLATE = 0.12 // 벽에서 실명판까지

// ── 실명판 ──
add('doorSign', [12 + PLATE, 2.7, CZ], Math.PI / 2, { text: '경영인사처', w: 1.2 })
add('doorSign', [DOORS.director[1] + 0.5, 2.0, CORRIDOR.z1 - PLATE], Math.PI, { text: '단장실' })
add('doorSign', [DOORS.restroom[0] - 0.5, 2.0, CORRIDOR.z0 + PLATE], 0, { text: '화장실', bg: '#1d4f9c' })
add('doorSign', [DOORS.intern[1] + 0.5, 2.0, CORRIDOR.z0 + PLATE], 0, { text: '인턴실' })
add('doorSign', [DOORS.storage[1] + 0.5, 2.0, CORRIDOR.z1 - PLATE], Math.PI, { text: '비품실' })

// ── 복도 ──
add('extinguisher', [16.2, 0, CORRIDOR.z1 - 0.25], 0)
add('extinguisher', [28.5, 0, CORRIDOR.z0 + 0.25], 0)
add('plant', [22, 0, CORRIDOR.z0 + 0.35])
add('water', [23.6, 0, CORRIDOR.z1 - 0.3], Math.PI)

// ── 단장실 (x 12~20, z 3.1~8) ──
{
  const base = [17.9, 0, 5.4]
  const rot = Math.PI / 2 // 동쪽 창가에 앉아 문 쪽(서쪽)을 바라봄
  add('directorDesk', base, rot)
  add('monitor', local(base, rot, [0.45, 0.772, -0.25]), rot)
  add('keyboard', local(base, rot, [0.45, 0.772, 0.12]), rot)
  add('phone', local(base, rot, [-0.85, 0.772, -0.1]), rot)
  add('train', local(base, rot, [-0.4, 0.772, -0.25]), rot)
  add('nameplate', local(base, rot, [0, 0.772, -0.42]), rot - Math.PI, { text: '단  장' })
  add('execChair', local(base, rot, [0, 0, 0.8]), rot)
}
for (const z of [4.1, 7.1]) add('bookshelf', [20 - HALF - 0.22, 0, z], -Math.PI / 2)
add('sofa', [14.7, 0, 7.45], Math.PI)
add('coffeeTable', [14.7, 0, 6.15], 0)
add('armchair', [12.75, 0, 6.15], -Math.PI / 2)
add('armchair', [16.65, 0, 6.15], Math.PI / 2)
add('mug', [14.4, 0.42, 6.1])
add('mug', [15.0, 0.42, 6.25])
add('plant', [12.5, 0, 7.5])
add('sign', [12 + HALF + 0.02, 2.1, 5.6], Math.PI / 2, { text: '청렴 · 안전 · 혁신', bg: '#5d4037', w: 2 })
add('clock', [16.5, 2.5, CORRIDOR.z1 + HALF + 0.02], 0)

// ── 화장실 (x 12~17.5, z -8~0.5) ──
for (const cx of [12.73, 13.98, 15.23]) {
  add('toilet', [cx, 0, -7.5], 0)
  add('stallPanel', [cx, 0, -6.4], 0, { w: 1.2 }) // 칸 문
}
for (const x of [13.35, 14.6, 15.85]) add('stallPanel', [x, 0, -7.2], Math.PI / 2, { w: 1.55 }) // 칸 사이
for (const z of [-5.3, -4.4, -3.5]) add('urinal', [17.5 - HALF - 0.18, 0, z], -Math.PI / 2)
for (const z of [-4.85, -3.95]) add('stallPanel', [17.5 - HALF - 0.25, 0.25, z], 0, { w: 0.5, short: true })
for (const z of [-4.6, -3.45, -2.3]) add('sink', [12 + HALF + 0.25, 0, z], Math.PI / 2)
add('mirror', [12 + HALF + 0.02, 1.6, -3.45], Math.PI / 2, { w: 3.2 })
add('trashBin', [12.5, 0, -1.2])

// ── 인턴실 (x 17.5~30, z -8~0.5) ──
// 들어가자마자 왼쪽: 대형 플로터와 프린터
add('plotter', [17.5 + HALF + 0.35, 0, -1.4], Math.PI / 2)
add('printer', [17.5 + HALF + 0.35, 0, -3.3], Math.PI / 2)
add('cabinet', [17.5 + HALF + 0.32, 0, -4.4], Math.PI / 2)
add('cabinet', [17.5 + HALF + 0.32, 0, -4.95], Math.PI / 2)
add('box', [18.1, 0, -5.9], 0.3)
// 창가 수납장
for (const x of [19.6, 22.2, 24.8, 27.4]) add('windowCabinet', [x, 0, -8 + 0.15 + 0.25], 0)
// 가운데 회의 테이블 + 노트북
{
  const [tx, tz] = [21.4, -4.3]
  add('meetingTable', [tx, 0, tz], Math.PI / 2)
  const TOP = 0.77
  for (const [dz, s] of [[-0.9, -1], [0.1, -1], [-0.4, 1], [0.9, 1]]) {
    add('laptop', [tx + s * 0.3, TOP, tz + dz], (s < 0 ? -Math.PI / 2 : Math.PI / 2) + dz * 0.12)
  }
  add('mug', [tx - 0.05, TOP, tz - 0.3])
  add('mug', [tx + 0.1, TOP, tz + 0.5])
  add('box', [tx + 0.05, TOP, tz - 1.15], 0.4)
  for (const dz of [-1, 0, 1]) {
    add('meshChair', [tx - 1.1, 0, tz + dz * 0.95], -Math.PI / 2 + dz * 0.15)
    add('meshChair', [tx + 1.1, 0, tz + dz * 0.95], Math.PI / 2 - dz * 0.2)
  }
}
// 오른쪽: 파티션 책상 4자리
{
  const cx = 26.2
  const cz = -4.2
  for (const dx of [-0.72, 0.72]) {
    for (const [dz, rot] of [[0.38, 0], [-0.38, Math.PI]]) {
      const base = [cx + dx, 0, cz + dz]
      add('woodDesk', base, rot)
      add('meshChair', local(base, rot, [0, 0, 0.72]), rot + (dx > 0 ? 0.25 : -0.1))
    }
  }
  add('cubicle', [cx, 0, cz], 0, { w: 2.9 })
  for (const s of [-1, 1]) add('cubicle', [cx + s * 1.47, 0, cz], Math.PI / 2, { w: 1.6 })
  add('monitor', [cx - 0.72, DESK_TOP, cz + 0.22], 0)
  add('keyboard', [cx - 0.72, DESK_TOP, cz + 0.5], 0)
  add('laptop', [cx + 0.72, DESK_TOP, cz + 0.5], 0.2)
  add('monitor', [cx + 0.72, DESK_TOP, cz - 0.22], Math.PI)
  add('mug', [cx - 1.1, DESK_TOP, cz - 0.6])
  add('phone', [cx + 1.1, DESK_TOP, cz + 0.55], 0)
}
add('rollingBoard', [23.4, 0, -1.2], -0.35)
for (const z of [-2.2, -1.2]) add('logStool', [29.4, 0, z], Math.PI / 2)
add('logStool', [28.8, 0, -1.7], 0.3)
add('trashBin', [29.5, 0, 0])
add('plant', [29.5, 0, -7.4])

// ── 비품실 (x 20~30, z 3.1~8) ──
for (let i = 0; i < 6; i++) add('cabinet', [21.2 + i * 0.55, 0, 8 - HALF - 0.42], Math.PI)
for (const [x, z, r] of [[26.4, 7.3, 0.1], [27, 7.35, -0.2], [26.7, 6.7, 0.4], [28.8, 6.9, 0], [29.2, 5.8, 0.6]]) add('box', [x, 0, z], r)
add('box', [26.7, 0.322, 7.3], 0.3)
for (const z of [4.2, 5]) add('drum', [29.4, 0, z], 0, { color: '#c62828' })

/* ═══════════════════════ 건물 밖 ═══════════════════════
   사무실 건물: x -12~12, z -8~8 (출입문은 남쪽 벽 가운데)
   건물 앞(남쪽)  z 8~18  : 간판, 자판기, 주차장
   차량기지 마당  z 22~45 : 선로 4줄, 전동차, 정비고(동쪽)
   건물 뒤(북쪽)  z -24~-9: 잔디밭과 나무
*/
export const GROUND = { x0: -45, x1: 45, z0: -24, z1: 58 }
export const PARKING = { x0: -21, x1: 21, z0: 11, z1: 17 }
export const TRACK_Z = [26, 31, 36, 41]
export const TRACK_X = [-42, 42]
export const RAIL_TOP = 0.15
export const SHED = { x0: 8, x1: 42, z0: 22.5, z1: 44.5, h: 9 }

// ── 건물 앞 ──
add('sign', [0, 2.75, 8.17], 0, { text: '차량정비단', bg: '#1d4f9c' })
add('vending', [2.1, 0, 8.6], 0)
add('vending', [3.3, 0, 8.6], 0)
add('bench', [-3, 0, 9.2], 0)
add('trashBin', [-1.6, 0, 8.6])
add('trashBin', [-4.6, 0, 8.6])
add('plant', [-6, 0, 8.7])

// ── 주차장 ──
const CAR_COLORS = ['#f5f5f5', '#212121', '#b0b6bd', '#8e1b1b', '#1d3f73', '#d9d2c3']
let ci = 0
for (const x of [-18, -15, -12, -9, -6, 6, 9, 12, 15, 18]) {
  if (x === -12 || x === 15) continue // 빈자리
  add('car', [x, 0, 14], Math.PI / 2 + (ci % 2 ? 0.03 : -0.02), { color: CAR_COLORS[ci++ % CAR_COLORS.length] })
}
for (const x of [-10, 10]) add('lightPole', [x, 0, 10], x < 0 ? 0 : Math.PI)
for (const x of [-24, 0, 24]) add('lightPole', [x, 0, 19.5], Math.PI / 2)

// ── 선로: 차막이, 신호기 ──
for (const z of TRACK_Z) add('bumper', [TRACK_X[0] + 0.5, 0, z], 0)
for (const z of [28.5, 38.5]) {
  add('signal', [5, 0, z], -Math.PI / 2)
  add('signal', [-37, 0, z], -Math.PI / 2)
}
for (const x of [-25, -5]) add('lightPole', [x, 0, 33.5], 0)

// ── 전동차 (3량 1편성) ──
function train(cx, z, color, cars = 3) {
  for (let i = 0; i < cars; i++) {
    const x = cx + (i - (cars - 1) / 2) * 12.5
    const car = add('trainCar', [x, RAIL_TOP, z], 0, { color })
    for (const wx of [-5.2, -1.2, 1.2, 5.2]) {
      for (const side of [-1, 1]) add('trainWindow', [x + wx, RAIL_TOP + 2.55, z + side * 1.42], 0, undefined, car)
    }
  }
}
train(-18, 26, '#1f5fbf')
train(26, 31, '#2e7d32')
train(-14, 36, '#1f5fbf')
train(26, 41, '#c62828')

// ── 정비고 안 ──
for (const x of [13, 15.5, 18]) add('wheelset', [x, RAIL_TOP, 36], 0)
for (const x of [24, 30, 36]) add('toolCart', [x, 0, 33.6], 0)
for (const x of [22, 34]) add('toolCart', [x, 0, 38.4], Math.PI)
for (const [x, c] of [[15, '#1f5fbf'], [15.7, '#1f5fbf'], [16.4, '#c62828'], [30, '#2e7d32'], [30.7, '#1f5fbf']]) add('drum', [x, 0, 43.6], 0, { color: c })
add('sign', [SHED.x0 - 0.1, 7.6, 33.5], -Math.PI / 2, { text: '정 비 고', bg: '#37474f', w: 4 })

// ── 선로 사이 라바콘, 드럼통 ──
for (let i = 0; i < 6; i++) add('cone', [-2 + i * 1.3, 0, 33.5])
for (const [x, z] of [[10, 23.8], [10.7, 24.1], [10.2, 24.6]]) add('drum', [x, 0, z], 0, { color: '#c62828' })

// ── 컨테이너 ──
add('container', [-36, 0, 11], 0, { color: '#1565c0' })
add('container', [-36, 0, 14.5], 0, { color: '#e65100' })
add('container', [-28, 0, 12.5], Math.PI / 2, { color: '#2e7d32' })

// ── 나무 (건물 뒤 잔디밭 + 서쪽 울타리) ──
for (let x = -40; x <= 40; x += 8) {
  add('tree', [x + ((x * 7) % 3), 0, -14], 0)
  add('tree', [x + 4, 0, -20.5], 0)
}
for (const z of [-4, 2, 18]) add('tree', [-42, 0, z], 0)

export const LAYOUT = items
