import { signTex, nameplateTex, screenTex, tvTex, whiteboardTex, clockTex, vendTex } from './textures'

// 기본 도형 (각 메시마다 물리 충돌 상자가 자동으로 만들어짐)
function Box({ p = [0, 0, 0], s, c = '#fff', r, basic, shadow = true, ...m }) {
  return (
    <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
      {basic ? <meshBasicMaterial color={c} {...m} /> : <meshStandardMaterial color={c} roughness={0.7} {...m} />}
    </mesh>
  )
}

function Cyl({ p = [0, 0, 0], r, rt, rb = rt, h, c, seg = 18, ...m }) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <cylinderGeometry args={[rt, rb, h, seg]} />
      <meshStandardMaterial color={c} roughness={0.6} {...m} />
    </mesh>
  )
}

function Cone({ p = [0, 0, 0], rad, h, c, seg = 14, ...m }) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <coneGeometry args={[rad, h, seg]} />
      <meshStandardMaterial color={c} roughness={0.7} {...m} />
    </mesh>
  )
}

const AXIS_X = [0, 0, Math.PI / 2] // 원기둥을 x축 방향으로 눕힘
const AXIS_Z = [Math.PI / 2, 0, 0] // 원기둥을 z축 방향으로 눕힘

export function HelmetMesh() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow>
        <sphereGeometry args={[0.14, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffc400" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.015, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 20]} />
        <meshStandardMaterial color="#f0b400" roughness={0.4} />
      </mesh>
    </group>
  )
}

/*
  name: 화면에 표시할 이름   hp: 내구도   value: 파손 금액(원)
  mat: 효과음 재질            fixed: 벽에 고정된 물건
  w/h: 파편이 튀는 범위       pieces/chunk: 파편 개수와 크기
*/
export const ITEM_TYPES = {
  desk: {
    name: '책상', hp: 90, value: 400000, mat: 'wood', colors: ['#c9b08a', '#6b6b6b', '#a89270'], w: 1.4, h: 0.75, pieces: 12, chunk: 0.28,
    render: () => (
      <>
        <Box p={[0, 0.73, 0]} s={[1.4, 0.04, 0.7]} c="#c9b08a" />
        {[[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].map(([x, z], i) => (
          <Box key={i} p={[x, 0.355, z]} s={[0.05, 0.71, 0.05]} c="#6b6b6b" metalness={0.5} />
        ))}
        <Box p={[0, 0.45, -0.32]} s={[1.28, 0.45, 0.02]} c="#a89270" />
      </>
    ),
  },
  monitor: {
    name: '모니터', hp: 25, value: 350000, mat: 'glass', colors: ['#111111', '#2f6fd0', '#222222'], w: 0.6, h: 0.6, pieces: 9, chunk: 0.14,
    render: () => (
      <>
        <Box p={[0, 0.01, 0]} s={[0.25, 0.02, 0.18]} c="#222" />
        <Box p={[0, 0.17, -0.03]} s={[0.05, 0.3, 0.03]} c="#222" />
        <Box p={[0, 0.47, 0]} s={[0.6, 0.36, 0.04]} c="#111" roughness={0.3} />
        <Box p={[0, 0.47, 0.021]} s={[0.56, 0.32, 0.003]} basic map={screenTex()} shadow={false} />
      </>
    ),
  },
  keyboard: {
    name: '키보드', hp: 10, value: 50000, mat: 'plastic', colors: ['#2a2a2a', '#444444'], w: 0.45, h: 0.05, pieces: 6, chunk: 0.08,
    render: () => <Box p={[0, 0.0125, 0]} s={[0.45, 0.025, 0.15]} c="#2a2a2a" />,
  },
  phone: {
    name: '전화기', hp: 8, value: 80000, mat: 'plastic', colors: ['#333333', '#222222'], w: 0.2, h: 0.1, pieces: 5, chunk: 0.07,
    render: () => (
      <>
        <Box p={[0, 0.03, 0]} s={[0.2, 0.06, 0.18]} c="#333" />
        <Box p={[-0.05, 0.075, 0]} s={[0.06, 0.03, 0.18]} c="#222" />
      </>
    ),
  },
  mug: {
    name: '머그컵', hp: 3, value: 8000, mat: 'glass', colors: ['#ffffff', '#e04040'], w: 0.1, h: 0.1, pieces: 5, chunk: 0.05,
    render: () => <Cyl p={[0, 0.05, 0]} rt={0.045} h={0.1} c="#f5f5f5" />,
  },
  chair: {
    name: '의자', hp: 50, value: 250000, mat: 'plastic', colors: ['#2c3e66', '#333333'], w: 0.5, h: 1.0, pieces: 9, chunk: 0.2,
    render: () => (
      <>
        <Box p={[0, 0.025, 0]} s={[0.55, 0.05, 0.55]} c="#333" />
        <Box p={[0, 0.25, 0]} s={[0.06, 0.4, 0.06]} c="#555" metalness={0.6} />
        <Box p={[0, 0.47, 0]} s={[0.5, 0.08, 0.5]} c="#2c3e66" />
        <Box p={[0, 0.82, 0.22]} s={[0.5, 0.55, 0.06]} c="#2c3e66" />
      </>
    ),
  },
  divider: {
    name: '칸막이', hp: 20, value: 100000, mat: 'plastic', colors: ['#8fa3b8', '#6d7f92'], w: 2.8, h: 0.4, pieces: 8, chunk: 0.3,
    render: () => <Box p={[0, 0.2, 0]} s={[2.8, 0.4, 0.03]} c="#8fa3b8" />,
  },
  cabinet: {
    name: '서류함', hp: 120, value: 300000, mat: 'metal', colors: ['#9aa3ad', '#f2f2f2', '#555555'], w: 0.5, h: 1.3, pieces: 12, chunk: 0.22,
    render: () => (
      <>
        <Box p={[0, 0.65, 0]} s={[0.5, 1.3, 0.6]} c="#9aa3ad" metalness={0.4} />
        {[0.35, 0.75, 1.1].map((y) => <Box key={y} p={[0, y, 0.31]} s={[0.15, 0.03, 0.02]} c="#555" />)}
      </>
    ),
  },
  printer: {
    name: '복합기', hp: 100, value: 1500000, mat: 'plastic', colors: ['#e8e8e8', '#d0d0d0', '#333333', '#ffffff'], w: 0.75, h: 1.1, pieces: 14, chunk: 0.24,
    render: () => (
      <>
        <Box p={[0, 0.45, 0]} s={[0.75, 0.9, 0.6]} c="#e8e8e8" />
        <Box p={[0, 0.99, -0.05]} s={[0.75, 0.18, 0.5]} c="#d0d0d0" />
        <Box p={[0.2, 1.1, 0.2]} s={[0.2, 0.05, 0.1]} c="#333" />
        <Box p={[0, 0.6, 0.38]} s={[0.4, 0.03, 0.25]} c="#fafafa" />
      </>
    ),
  },
  water: {
    name: '정수기', hp: 40, value: 600000, mat: 'glass', clear: true, colors: ['#8fd0ff', '#f2f2f2'], w: 0.35, h: 1.4, pieces: 10, chunk: 0.15,
    render: () => (
      <>
        <Box p={[0, 0.5, 0]} s={[0.35, 1.0, 0.35]} c="#f2f2f2" />
        <Box p={[0, 0.8, 0.19]} s={[0.08, 0.06, 0.06]} c="#2a6dd8" />
        <Cyl p={[0, 1.23, 0]} rt={0.15} h={0.45} c="#8fd0ff" transparent opacity={0.55} roughness={0.1} />
      </>
    ),
  },
  plant: {
    name: '화분', hp: 15, value: 30000, mat: 'soft', colors: ['#3f8f3f', '#8b5a2b', '#2f6f2f'], w: 0.4, h: 1.0, pieces: 10, chunk: 0.14,
    render: () => (
      <>
        <Cyl p={[0, 0.175, 0]} rt={0.2} rb={0.15} h={0.35} c="#8b5a2b" />
        <mesh position={[0, 0.65, 0]} castShadow>
          <sphereGeometry args={[0.33, 12, 10]} />
          <meshStandardMaterial color="#3f8f3f" />
        </mesh>
        <mesh position={[0.08, 0.95, 0.05]} castShadow>
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial color="#4aa04a" />
        </mesh>
      </>
    ),
  },
  box: {
    name: '택배 상자', hp: 8, value: 5000, mat: 'soft', colors: ['#b98a52', '#d8c39a'], w: 0.45, h: 0.32, pieces: 6, chunk: 0.15,
    render: () => (
      <>
        <Box p={[0, 0.16, 0]} s={[0.45, 0.32, 0.35]} c="#b98a52" />
        <Box p={[0, 0.3225, 0]} s={[0.45, 0.005, 0.06]} c="#d8c39a" />
      </>
    ),
  },
  glass: {
    name: '유리 칸막이', hp: 20, value: 500000, mat: 'glass', fixed: true, clear: true, colors: ['#a8d8ff', '#c8e8ff'], w: 1.2, h: 2.6, pieces: 16, chunk: 0.25,
    render: () => (
      <>
        <Box p={[0, 1.3, 0]} s={[1.2, 2.5, 0.04]} c="#a8d8ff" transparent opacity={0.22} roughness={0.05} shadow={false} />
        <Box p={[0, 0.03, 0]} s={[1.2, 0.06, 0.07]} c="#555" metalness={0.6} />
        <Box p={[0, 2.57, 0]} s={[1.2, 0.06, 0.07]} c="#555" metalness={0.6} />
      </>
    ),
  },
  whiteboard: {
    name: '화이트보드', hp: 40, value: 200000, mat: 'plastic', fixed: true, colors: ['#f8f8f8', '#999999'], w: 1.8, h: 1.1, pieces: 10, chunk: 0.3,
    render: () => (
      <>
        <Box p={[0, 0, -0.01]} s={[1.86, 1.16, 0.02]} c="#999" metalness={0.5} />
        <Box p={[0, 0, 0.005]} s={[1.8, 1.1, 0.01]} c="#fff" map={whiteboardTex()} roughness={0.3} />
        <Box p={[0, -0.58, 0.04]} s={[1.2, 0.03, 0.08]} c="#999" />
      </>
    ),
  },
  tv: {
    name: '회의실 TV', hp: 30, value: 2000000, mat: 'glass', fixed: true, colors: ['#111111', '#3c8dff'], w: 1.6, h: 0.9, pieces: 12, chunk: 0.25,
    render: () => (
      <>
        <Box s={[1.6, 0.92, 0.06]} c="#111" roughness={0.3} />
        <Box p={[0, 0, 0.031]} s={[1.52, 0.84, 0.005]} basic map={tvTex()} shadow={false} />
      </>
    ),
  },
  meetingTable: {
    name: '회의 테이블', hp: 150, value: 900000, mat: 'wood', colors: ['#5c4033', '#3a2a20'], w: 3, h: 0.75, pieces: 14, chunk: 0.35,
    render: () => (
      <>
        <Box p={[0, 0.745, 0]} s={[3, 0.05, 1.2]} c="#5c4033" />
        <Box p={[-1.2, 0.36, 0]} s={[0.1, 0.72, 0.8]} c="#3a2a20" />
        <Box p={[1.2, 0.36, 0]} s={[0.1, 0.72, 0.8]} c="#3a2a20" />
      </>
    ),
  },
  bossDesk: {
    name: '팀장님 책상', hp: 150, value: 1200000, mat: 'wood', colors: ['#4a3022', '#3a2418'], w: 2, h: 0.77, pieces: 14, chunk: 0.32,
    render: () => (
      <>
        <Box p={[0, 0.745, 0]} s={[2, 0.05, 0.9]} c="#4a3022" roughness={0.4} />
        <Box p={[-0.95, 0.36, 0]} s={[0.05, 0.72, 0.85]} c="#3a2418" />
        <Box p={[0.95, 0.36, 0]} s={[0.05, 0.72, 0.85]} c="#3a2418" />
        <Box p={[0, 0.42, -0.42]} s={[1.85, 0.6, 0.03]} c="#3a2418" />
      </>
    ),
  },
  nameplate: {
    name: '팀장 명패', hp: 5, value: 50000, mat: 'wood', colors: ['#d8b04a', '#2a1d05'], w: 0.3, h: 0.1, pieces: 5, chunk: 0.06,
    render: () => <Box p={[0, 0.04, 0]} s={[0.3, 0.08, 0.04]} c="#fff" map={nameplateTex('팀  장')} />,
  },
  train: {
    name: '모형 열차', hp: 10, value: 3000000, mat: 'metal', colors: ['#1f5fbf', '#ffffff', '#5a3b22'], w: 0.6, h: 0.2, pieces: 8, chunk: 0.08,
    render: () => (
      <>
        <Box p={[0, 0.015, 0]} s={[0.62, 0.03, 0.14]} c="#5a3b22" />
        <Box p={[0, 0.1, 0]} s={[0.5, 0.12, 0.1]} c="#1f5fbf" metalness={0.3} roughness={0.4} />
        <Box p={[0, 0.085, 0]} s={[0.501, 0.02, 0.102]} c="#ffffff" />
        <Box p={[0, 0.13, 0]} s={[0.42, 0.03, 0.103]} c="#223" />
        <Box p={[0, 0.17, 0]} s={[0.48, 0.02, 0.09]} c="#ccc" />
      </>
    ),
  },
  locker: {
    name: '작업복 사물함', hp: 150, value: 450000, mat: 'metal', colors: ['#7d8a96', '#5d6872'], w: 0.88, h: 1.9, pieces: 12, chunk: 0.3,
    render: () => (
      <>
        <Box p={[0, 0.95, 0]} s={[0.88, 1.9, 0.5]} c="#7d8a96" metalness={0.45} />
        <Box p={[0, 0.95, 0.255]} s={[0.012, 1.8, 0.01]} c="#5d6872" />
        <Box p={[-0.22, 1.7, 0.255]} s={[0.3, 0.1, 0.01]} c="#5d6872" />
        <Box p={[0.22, 1.7, 0.255]} s={[0.3, 0.1, 0.01]} c="#5d6872" />
        <Box p={[-0.05, 1.0, 0.265]} s={[0.02, 0.12, 0.03]} c="#333" />
        <Box p={[0.05, 1.0, 0.265]} s={[0.02, 0.12, 0.03]} c="#333" />
      </>
    ),
  },
  helmet: {
    name: '안전모', hp: 5, value: 40000, mat: 'plastic', colors: ['#ffc400', '#f0b400'], w: 0.3, h: 0.15, pieces: 6, chunk: 0.08,
    render: () => <HelmetMesh />,
  },
  fridge: {
    name: '냉장고', hp: 120, value: 900000, mat: 'metal', colors: ['#f4f4f4', '#999999'], w: 0.7, h: 1.75, pieces: 12, chunk: 0.3,
    render: () => (
      <>
        <Box p={[0, 0.875, 0]} s={[0.7, 1.75, 0.65]} c="#f4f4f4" metalness={0.2} roughness={0.4} />
        <Box p={[0, 1.2, 0.33]} s={[0.7, 0.01, 0.01]} c="#bbb" />
        <Box p={[0.28, 1.45, 0.34]} s={[0.03, 0.4, 0.04]} c="#999" />
        <Box p={[0.28, 0.8, 0.34]} s={[0.03, 0.5, 0.04]} c="#999" />
      </>
    ),
  },
  counter: {
    name: '탕비실 싱크대', hp: 150, value: 700000, mat: 'wood', colors: ['#e9e2d6', '#7a7a7a'], w: 2.4, h: 0.9, pieces: 14, chunk: 0.32,
    render: () => (
      <>
        <Box p={[0, 0.43, 0]} s={[2.4, 0.86, 0.6]} c="#e9e2d6" />
        <Box p={[0, 0.88, 0]} s={[2.44, 0.04, 0.64]} c="#7a7a7a" metalness={0.5} />
      </>
    ),
  },
  coffee: {
    name: '커피머신', hp: 30, value: 800000, mat: 'metal', colors: ['#1c1c1c', '#555555'], w: 0.3, h: 0.4, pieces: 8, chunk: 0.1,
    render: () => (
      <>
        <Box p={[0, 0.2, 0]} s={[0.3, 0.4, 0.32]} c="#1c1c1c" metalness={0.4} />
        <Box p={[0, 0.08, 0.12]} s={[0.12, 0.03, 0.1]} c="#555" />
        <Box p={[0, 0.3, 0.161]} s={[0.12, 0.06, 0.005]} c="#c23" emissive="#f33" emissiveIntensity={0.6} />
      </>
    ),
  },
  clock: {
    name: '벽시계', hp: 5, value: 30000, mat: 'plastic', fixed: true, colors: ['#ffffff', '#222222'], w: 0.45, h: 0.45, pieces: 6, chunk: 0.1,
    render: () => <Box s={[0.45, 0.45, 0.03]} c="#fff" map={clockTex()} />,
  },
  sign: {
    name: '표어 액자', hp: 30, value: 100000, mat: 'wood', fixed: true, colors: ['#1f7a3a', '#ffffff'], w: 2.2, h: 0.55, pieces: 10, chunk: 0.22,
    render: ({ text, bg, w = 2.2 }) => <Box s={[w, w / 4, 0.03]} c="#fff" map={signTex(text, bg)} />,
  },

  // ───────────── 건물 밖 ─────────────
  vending: {
    name: '음료 자판기', hp: 80, value: 3000000, mat: 'glass', push: 0.4, colors: ['#c8202a', '#222222', '#ffffff'], w: 1, h: 1.85, pieces: 14, chunk: 0.25,
    render: () => (
      <>
        <Box p={[0, 0.925, 0]} s={[1, 1.85, 0.8]} c="#c8202a" />
        <Box p={[-0.08, 1.2, 0.41]} s={[0.7, 1.0, 0.02]} basic map={vendTex()} shadow={false} />
        <Box p={[0.38, 1.1, 0.41]} s={[0.16, 0.45, 0.02]} c="#222" />
        <Box p={[-0.08, 0.3, 0.41]} s={[0.6, 0.15, 0.02]} c="#111" />
      </>
    ),
  },
  bench: {
    name: '벤치', hp: 40, value: 200000, mat: 'wood', colors: ['#8b5a2b', '#333333'], w: 1.6, h: 0.8, pieces: 8, chunk: 0.25,
    render: () => (
      <>
        <Box p={[0, 0.45, 0]} s={[1.6, 0.06, 0.45]} c="#8b5a2b" />
        <Box p={[0, 0.75, -0.2]} s={[1.6, 0.35, 0.05]} c="#8b5a2b" />
        <Box p={[-0.7, 0.225, 0]} s={[0.06, 0.45, 0.4]} c="#333" />
        <Box p={[0.7, 0.225, 0]} s={[0.06, 0.45, 0.4]} c="#333" />
      </>
    ),
  },
  trashBin: {
    name: '쓰레기통', hp: 15, value: 60000, mat: 'plastic', colors: ['#2e7d32', '#1b5e20'], w: 0.6, h: 0.9, pieces: 7, chunk: 0.15,
    render: () => (
      <>
        <Cyl p={[0, 0.45, 0]} rt={0.3} rb={0.27} h={0.9} c="#2e7d32" />
        <Cyl p={[0, 0.93, 0]} rt={0.32} h={0.06} c="#1b5e20" />
      </>
    ),
  },
  car: {
    name: '승용차', hp: 220, value: 25000000, mat: 'metal', push: 0.25, colors: [], w: 4.2, h: 1.6, pieces: 18, chunk: 0.45,
    render: ({ color = '#b0b6bd' }) => (
      <>
        <Box p={[0, 0.62, 0]} s={[4.2, 0.75, 1.8]} c={color} metalness={0.4} roughness={0.35} />
        <Box p={[-0.2, 1.27, 0]} s={[2.3, 0.6, 1.62]} c="#2b3440" roughness={0.15} />
        {[[-1.35, -0.85], [-1.35, 0.85], [1.35, -0.85], [1.35, 0.85]].map(([x, z], i) => (
          <Cyl key={i} p={[x, 0.33, z]} r={AXIS_Z} rt={0.33} h={0.25} c="#1a1a1a" />
        ))}
        <Box p={[2.1, 0.75, 0.6]} s={[0.04, 0.14, 0.32]} c="#fff8d0" emissive="#fff3b0" emissiveIntensity={0.5} />
        <Box p={[2.1, 0.75, -0.6]} s={[0.04, 0.14, 0.32]} c="#fff8d0" emissive="#fff3b0" emissiveIntensity={0.5} />
        <Box p={[-2.1, 0.78, 0.6]} s={[0.04, 0.12, 0.3]} c="#b71c1c" />
        <Box p={[-2.1, 0.78, -0.6]} s={[0.04, 0.12, 0.3]} c="#b71c1c" />
      </>
    ),
  },
  cone: {
    name: '라바콘', hp: 3, value: 10000, mat: 'soft', colors: ['#ff6d00', '#ffffff'], w: 0.4, h: 0.6, pieces: 4, chunk: 0.12,
    render: () => (
      <>
        <Box p={[0, 0.02, 0]} s={[0.4, 0.04, 0.4]} c="#222" />
        <Cone p={[0, 0.34, 0]} rad={0.17} h={0.6} c="#ff6d00" />
      </>
    ),
  },
  drum: {
    name: '드럼통', hp: 40, value: 150000, mat: 'metal', colors: ['#1f5fbf', '#555555'], w: 0.6, h: 0.9, pieces: 8, chunk: 0.22,
    render: ({ color = '#1f5fbf' }) => (
      <>
        <Cyl p={[0, 0.45, 0]} rt={0.3} h={0.9} c={color} metalness={0.4} />
        <Cyl p={[0, 0.3, 0]} rt={0.305} h={0.03} c="#444" />
        <Cyl p={[0, 0.6, 0]} rt={0.305} h={0.03} c="#444" />
      </>
    ),
  },
  toolCart: {
    name: '공구 카트', hp: 50, value: 1200000, mat: 'metal', colors: ['#c62828', '#555555'], w: 0.9, h: 1.0, pieces: 10, chunk: 0.18,
    render: () => (
      <>
        <Box p={[0, 0.35, 0]} s={[0.9, 0.05, 0.5]} c="#c62828" />
        <Box p={[0, 0.8, 0]} s={[0.9, 0.05, 0.5]} c="#c62828" />
        {[[-0.42, -0.22], [0.42, -0.22], [-0.42, 0.22], [0.42, 0.22]].map(([x, z], i) => (
          <Box key={i} p={[x, 0.42, z]} s={[0.04, 0.84, 0.04]} c="#555" />
        ))}
        <Box p={[0.1, 0.93, 0]} s={[0.5, 0.2, 0.3]} c="#d32f2f" />
      </>
    ),
  },
  wheelset: {
    name: '윤축(차륜)', hp: 200, value: 30000000, mat: 'metal', push: 0.2, colors: ['#6a6a6a', '#444444'], w: 1.5, h: 0.9, pieces: 10, chunk: 0.3,
    render: () => (
      <>
        <Cyl p={[0, 0.46, 0]} r={AXIS_Z} rt={0.09} h={2.0} c="#555" metalness={0.7} />
        <Cyl p={[0, 0.46, 0.72]} r={AXIS_Z} rt={0.46} h={0.14} c="#6a6a6a" metalness={0.7} />
        <Cyl p={[0, 0.46, -0.72]} r={AXIS_Z} rt={0.46} h={0.14} c="#6a6a6a" metalness={0.7} />
      </>
    ),
  },
  lightPole: {
    name: '가로등', hp: 60, value: 1500000, mat: 'metal', fixed: true, colors: ['#777777', '#fffde7'], w: 1, h: 7, pieces: 10, chunk: 0.3,
    render: () => (
      <>
        <Cyl p={[0, 3.5, 0]} rt={0.08} rb={0.12} h={7} c="#777" metalness={0.5} />
        <Box p={[0.6, 6.9, 0]} s={[1.2, 0.08, 0.08]} c="#777" />
        <Box p={[1.1, 6.82, 0]} s={[0.5, 0.12, 0.3]} c="#fffde7" emissive="#fff8c0" emissiveIntensity={0.8} />
      </>
    ),
  },
  signal: {
    name: '신호기', hp: 40, value: 5000000, mat: 'glass', fixed: true, colors: ['#222222', '#e53935', '#43a047'], w: 0.5, h: 4.8, pieces: 8, chunk: 0.2,
    render: () => (
      <>
        <Cyl p={[0, 2, 0]} rt={0.07} h={4} c="#444" />
        <Box p={[0, 4.3, 0]} s={[0.45, 1.1, 0.3]} c="#222" />
        <Box p={[0, 4.6, 0.16]} s={[0.22, 0.22, 0.02]} c="#e53935" emissive="#ff1744" emissiveIntensity={1} />
        <Box p={[0, 4.3, 0.16]} s={[0.22, 0.22, 0.02]} c="#3a3a10" />
        <Box p={[0, 4.0, 0.16]} s={[0.22, 0.22, 0.02]} c="#173d1a" />
      </>
    ),
  },
  bumper: {
    name: '차막이', hp: 150, value: 2000000, mat: 'metal', fixed: true, colors: ['#c62828', '#222222'], w: 1, h: 1.3, pieces: 10, chunk: 0.3,
    render: () => (
      <>
        <Box p={[0, 0.7, 0]} s={[0.8, 1.1, 2.2]} c="#c62828" />
        <Cyl p={[0.6, 1.05, 0.75]} r={AXIS_X} rt={0.18} h={0.5} c="#222" />
        <Cyl p={[0.6, 1.05, -0.75]} r={AXIS_X} rt={0.18} h={0.5} c="#222" />
      </>
    ),
  },
  container: {
    name: '컨테이너', hp: 300, value: 4000000, mat: 'metal', push: 0.05, colors: [], w: 6, h: 2.6, pieces: 20, chunk: 0.8,
    render: ({ color = '#1565c0' }) => (
      <>
        <Box p={[0, 1.3, 0]} s={[6, 2.6, 2.4]} c={color} metalness={0.3} />
        {[-2.9, -1.5, 0, 1.5, 2.9].map((x) => (
          <Box key={x} p={[x, 1.3, 0]} s={[0.08, 2.5, 2.44]} c="#333" />
        ))}
      </>
    ),
  },
  tree: {
    name: '나무', hp: 60, value: 300000, mat: 'soft', fixed: true, colors: ['#2e7d32', '#6d4c41', '#388e3c'], w: 2, h: 5, pieces: 12, chunk: 0.4,
    render: () => (
      <>
        <Cyl p={[0, 1.1, 0]} rt={0.15} rb={0.22} h={2.2} c="#6d4c41" />
        <Cone p={[0, 3.4, 0]} rad={1.4} h={3} c="#2e7d32" />
        <Cone p={[0, 4.8, 0]} rad={1.0} h={2.2} c="#388e3c" />
      </>
    ),
  },
  trainCar: {
    name: '전동차', hp: 500, value: 1200000000, mat: 'metal', fixed: true, colors: [], w: 12, h: 3.6, pieces: 26, chunk: 0.9,
    render: ({ color = '#1f5fbf' }) => (
      <>
        <Box p={[0, 2.35, 0]} s={[12, 2.6, 2.8]} c="#e3e7eb" metalness={0.5} roughness={0.35} />
        <Box p={[0, 1.75, 0]} s={[12.02, 0.25, 2.82]} c={color} />
        <Box p={[0, 3.75, 0]} s={[11.8, 0.2, 2.6]} c="#9aa0a6" />
        {[-3.2, 3.2].map((x) => (
          <Box key={x} p={[x, 2.15, 0]} s={[1.3, 2.0, 2.84]} c="#c3c8cd" metalness={0.4} />
        ))}
        {[-4.2, 4.2].map((x) => (
          <group key={x}>
            <Box p={[x, 0.75, 0]} s={[2.4, 0.5, 2.3]} c="#2d2d2d" />
            {[-0.85, 0.85].map((dx) =>
              [-0.72, 0.72].map((z) => <Cyl key={`${dx}${z}`} p={[x + dx, 0.43, z]} r={AXIS_Z} rt={0.43} h={0.12} c="#555" metalness={0.6} />),
            )}
          </group>
        ))}
        <Box p={[6.15, 1.2, 0]} s={[0.3, 0.3, 0.3]} c="#333" />
        <Box p={[-6.15, 1.2, 0]} s={[0.3, 0.3, 0.3]} c="#333" />
      </>
    ),
  },
  trainWindow: {
    name: '전동차 유리창', hp: 10, value: 800000, mat: 'glass', fixed: true, clear: true, colors: ['#9ec9ef', '#cfe6fa'], w: 1.4, h: 0.9, pieces: 10, chunk: 0.2,
    render: () => <Box s={[1.4, 0.9, 0.04]} c="#1d2b3a" transparent opacity={0.75} roughness={0.1} shadow={false} />,
  },
}

// 파편 색이 매개변수(차 색상 등)에 따라 정해지는 물건
export function debrisColors(t, args) {
  if (t.colors.length) return t.colors
  return [args?.color || '#888888', '#333333', '#cccccc']
}
