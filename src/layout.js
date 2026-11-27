/*
  사무실 배치도. 실제 사무실 구조로 바꾸려면 이 파일만 고치면 됩니다.

  좌표 (단위: m, 위에서 내려다본 기준)
    x: 왼쪽(서쪽) -12  ~  오른쪽(동쪽) +12
    z: 안쪽(북쪽)  -8  ~  출입문(남쪽)  +8
    y: 높이 (바닥 = 0)
  rot: 회전 (0 = 앞면이 출입문 쪽을 향함, Math.PI = 안쪽을 향함)
*/

export const ROOM = { w: 24, d: 16, h: 3.2 }
export const SPAWN = [0, 1.2, 6.3]

const DESK_TOP = 0.752
const BOSS_TOP = 0.772

const items = []
let n = 0
const add = (kind, pos, rot = 0, args) => items.push({ id: `${kind}-${n++}`, kind, pos, rot, args })

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
add('whiteboard', [11.83, 1.5, 1.5], -Math.PI / 2)

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

export const LAYOUT = items
