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
