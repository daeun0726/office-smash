import * as THREE from 'three'

// 캔버스로 그린 텍스처 (한글 글꼴은 시스템 글꼴을 사용해서 오프라인에서도 표시됨)
const FONT = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif'
const cache = {}

function canvasTex(key, w, h, draw) {
  if (cache[key]) return cache[key]
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  cache[key] = t
  return t
}

function fitText(g, text, maxW, size, weight = 'bold') {
  let s = size
  do {
    g.font = `${weight} ${s}px ${FONT}`
    s -= 4
  } while (g.measureText(text).width > maxW && s > 10)
}

export const signTex = (text, bg = '#1f7a3a', fg = '#ffffff') =>
  canvasTex(`sign:${text}:${bg}`, 1024, 256, (g, w, h) => {
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    g.strokeStyle = fg
    g.lineWidth = 10
    g.strokeRect(16, 16, w - 32, h - 32)
    g.fillStyle = fg
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    fitText(g, text, w - 100, 140)
    g.fillText(text, w / 2, h / 2 + 6)
  })

export const nameplateTex = (text) =>
  canvasTex(`plate:${text}`, 512, 128, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#e8c76a')
    grad.addColorStop(1, '#b08a2e')
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#2a1d05'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    fitText(g, text, w - 40, 80)
    g.fillText(text, w / 2, h / 2 + 4)
  })

export const screenTex = () =>
  canvasTex('screen', 512, 320, (g, w, h) => {
    g.fillStyle = '#0f2747'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#2f6fd0'
    g.fillRect(0, 0, w, 44)
    g.fillStyle = '#fff'
    g.textBaseline = 'middle'
    g.font = `bold 24px ${FONT}`
    g.fillText('차량 정비 관리 시스템', 16, 23)
    g.font = `18px ${FONT}`
    const rows = ['편성번호', '검수 종류', '진행 상태', '담당자']
    rows.forEach((r, i) => {
      g.fillStyle = i % 2 ? '#16345c' : '#1b3d6b'
      g.fillRect(12, 60 + i * 52, w - 24, 46)
      g.fillStyle = '#cfe0ff'
      g.fillText(r, 26, 83 + i * 52)
      g.fillStyle = '#7fb2ff'
      g.fillRect(200, 76 + i * 52, 120 + ((i * 73) % 160), 14)
    })
  })

export const tvTex = () =>
  canvasTex('tv', 768, 432, (g, w, h) => {
    g.fillStyle = '#10151c'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#fff'
    g.font = `bold 40px ${FONT}`
    g.fillText('주간 정비 실적', 40, 70)
    const vals = [0.55, 0.8, 0.62, 0.9, 0.7]
    const days = ['월', '화', '수', '목', '금']
    vals.forEach((v, i) => {
      const x = 80 + i * 130
      g.fillStyle = '#3c8dff'
      g.fillRect(x, 380 - v * 250, 70, v * 250)
      g.fillStyle = '#aab'
      g.font = `28px ${FONT}`
      g.fillText(days[i], x + 22, 415)
    })
  })

export const whiteboardTex = () =>
  canvasTex('whiteboard', 900, 550, (g, w, h) => {
    g.fillStyle = '#fbfbfb'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#1846b8'
    g.font = `bold 56px ${FONT}`
    g.fillText('이번 주 할 일', 50, 90)
    g.font = `40px ${FONT}`
    const lines = ['- 대차 정밀 점검', '- 제동장치 정비', '- 출입문 동작 시험', '- 보고서 제출 (금)']
    lines.forEach((l, i) => {
      g.fillStyle = i === 3 ? '#d22' : '#222'
      g.fillText(l, 70, 180 + i * 80)
    })
    g.strokeStyle = '#d22'
    g.lineWidth = 6
    g.beginPath()
    g.ellipse(270, 420, 230, 50, 0, 0, Math.PI * 2)
    g.stroke()
  })

export const clockTex = () =>
  canvasTex('clock', 256, 256, (g, w, h) => {
    g.fillStyle = '#f4f4f4'
    g.fillRect(0, 0, w, h)
    g.translate(w / 2, h / 2)
    g.fillStyle = '#fff'
    g.beginPath()
    g.arc(0, 0, 118, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#222'
    g.lineWidth = 8
    g.stroke()
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      g.fillStyle = '#222'
      g.fillRect(Math.sin(a) * 95 - 3, -Math.cos(a) * 95 - 3, 6, 6)
    }
    g.lineCap = 'round'
    g.lineWidth = 9
    g.beginPath()
    g.moveTo(0, 0)
    g.lineTo(55, -30)
    g.stroke()
    g.lineWidth = 5
    g.beginPath()
    g.moveTo(0, 0)
    g.lineTo(-10, -88)
    g.stroke()
  })

export const vendTex = () =>
  canvasTex('vend', 256, 360, (g, w, h) => {
    g.fillStyle = '#e9f2fa'
    g.fillRect(0, 0, w, h)
    const cols = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00']
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const x = 14 + c * 47
        const y = 18 + r * 86
        g.fillStyle = cols[(r * 5 + c) % cols.length]
        g.fillRect(x + 8, y + 10, 24, 56)
        g.fillRect(x + 14, y, 12, 12)
        g.fillStyle = '#333'
        g.fillRect(x + 4, y + 70, 32, 6)
      }
    }
  })

// 경영인사처 조직도 액자 (실제 이름·내선번호 대신 ○○○로 표시)
export const orgChartTex = () =>
  canvasTex('org', 1024, 768, (g, w, h) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillStyle = '#222'
    g.font = `bold 40px ${FONT}`
    g.fillText('경 영 인 사 처   조 직 도', w / 2, 58)
    g.fillStyle = '#555'
    g.fillRect(40, 92, w - 80, 3)

    const cols = [
      { head: '경영인사처장', rows: [['처장', '']] },
      { head: '관리팀', rows: [['관리총괄', '팀장'], ['자산', '차장'], ['기록물/문서', '차장'], ['소방/보안', '대리'], ['물품', '대리']] },
      { head: '기획팀', rows: [['기획총괄', '팀장'], ['예산/홍보', '차장'], ['경영혁신', '과장'], ['사무업무보조', '인턴']] },
      { head: '인사노무팀', rows: [['인사노무총괄', '팀장'], ['감사/청렴', '차장'], ['인사/근태', '과장'], ['급여', '과장'], ['노무/후생', '과장']] },
    ]
    const colW = [170, 250, 250, 250]
    let x = 40
    cols.forEach((c, ci) => {
      const cw = colW[ci]
      g.fillStyle = '#3d3d3d'
      g.fillRect(x, 118, cw - 16, 34)
      g.fillStyle = '#fff'
      g.font = `bold 22px ${FONT}`
      g.fillText(c.head, x + (cw - 16) / 2, 136)
      c.rows.forEach(([duty, rank], ri) => {
        const y = 168 + ri * 112
        g.strokeStyle = '#999'
        g.lineWidth = 2
        g.strokeRect(x, y, cw - 16, 96)
        g.fillStyle = '#333'
        if (rank) {
          const half = (cw - 16) / 2
          g.beginPath()
          g.moveTo(x + half, y)
          g.lineTo(x + half, y + 96)
          g.stroke()
          g.font = `18px ${FONT}`
          g.fillText(duty, x + half / 2, y + 48)
          g.fillText(rank, x + half * 1.5, y + 32)
          g.fillText('○ ○ ○', x + half * 1.5, y + 64)
        } else {
          g.font = `20px ${FONT}`
          g.fillText(duty, x + (cw - 16) / 2, y + 32)
          g.fillText('○ ○ ○', x + (cw - 16) / 2, y + 64)
        }
      })
      x += cw
    })
    g.strokeStyle = '#d0d0d0'
    g.lineWidth = 14
    g.strokeRect(7, 7, w - 14, h - 14)
  })

// 안쪽에서 본 창문: 위쪽은 내려온 롤블라인드, 아래쪽은 바깥 나무와 하늘
export const blindTex = () =>
  canvasTex('blind', 512, 340, (g, w, h) => {
    const split = h * 0.55
    const sky = g.createLinearGradient(0, split, 0, h)
    sky.addColorStop(0, '#dfeefa')
    sky.addColorStop(1, '#a9cfa0')
    g.fillStyle = sky
    g.fillRect(0, split, w, h - split)
    g.fillStyle = '#6f9c5e'
    for (let i = 0; i < 9; i++) {
      g.beginPath()
      g.arc(30 + i * 58, h - 20 - (i % 3) * 18, 46, 0, Math.PI * 2)
      g.fill()
    }
    g.fillStyle = '#f3f1ea'
    g.fillRect(0, 0, w, split)
    g.fillStyle = 'rgba(0,0,0,0.05)'
    for (let y = 8; y < split; y += 16) g.fillRect(0, y, w, 2)
    g.fillStyle = '#d9d5ca'
    g.fillRect(0, split - 8, w, 8)
    // 창틀
    g.fillStyle = '#c9ccd0'
    g.fillRect(0, 0, w, 6)
    g.fillRect(0, h - 6, w, 6)
    g.fillRect(0, 0, 6, h)
    g.fillRect(w - 6, 0, 6, h)
    g.fillRect(w / 2 - 3, split, 6, h - split)
  })

export const floorTex = () =>
  canvasTex('floor', 256, 256, (g, w, h) => {
    g.fillStyle = '#b9bcbf'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#aeb1b4'
    g.fillRect(0, 0, w / 2, h / 2)
    g.fillRect(w / 2, h / 2, w / 2, h / 2)
    g.strokeStyle = '#9a9da0'
    g.lineWidth = 3
    g.strokeRect(0, 0, w, h)
    g.beginPath()
    g.moveTo(w / 2, 0)
    g.lineTo(w / 2, h)
    g.moveTo(0, h / 2)
    g.lineTo(w, h / 2)
    g.stroke()
  })
