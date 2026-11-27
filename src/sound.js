// 효과음은 파일 없이 Web Audio로 직접 합성
let ctx = null
let master = null
let noiseBuf = null

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.45
    master.connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function burst({ dur, type, freq, q = 1, gain = 0.6, delay = 0 }) {
  const c = getCtx()
  const t0 = c.currentTime + delay
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  src.connect(f).connect(g).connect(master)
  src.start(t0, Math.random())
  src.stop(t0 + dur + 0.05)
}

function tone({ freq, freqEnd = freq, dur, type = 'sine', gain = 0.4, delay = 0 }) {
  const c = getCtx()
  const t0 = c.currentTime + delay
  const o = c.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  o.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  o.connect(g).connect(master)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

const r = (a, b) => a + Math.random() * (b - a)

const HIT = {
  wood: () => { burst({ dur: 0.14, type: 'lowpass', freq: 900, gain: 0.9 }); tone({ freq: 170, freqEnd: 90, dur: 0.12, gain: 0.35 }) },
  metal: () => { burst({ dur: 0.1, type: 'bandpass', freq: 2500, q: 3, gain: 0.7 }); tone({ freq: r(500, 700), dur: 0.5, type: 'triangle', gain: 0.18 }); tone({ freq: r(1100, 1400), dur: 0.35, type: 'sine', gain: 0.08 }) },
  plastic: () => { burst({ dur: 0.09, type: 'bandpass', freq: 1400, q: 1.5, gain: 0.8 }) },
  glass: () => { burst({ dur: 0.08, type: 'highpass', freq: 3000, gain: 0.5 }); tone({ freq: r(2000, 2600), dur: 0.2, gain: 0.08 }) },
  soft: () => { burst({ dur: 0.12, type: 'lowpass', freq: 450, gain: 0.9 }) },
}

const BREAK = {
  wood: () => { burst({ dur: 0.5, type: 'lowpass', freq: 1200, gain: 1 }); burst({ dur: 0.3, type: 'bandpass', freq: 600, gain: 0.6, delay: 0.06 }); tone({ freq: 120, freqEnd: 40, dur: 0.35, gain: 0.5 }) },
  metal: () => { burst({ dur: 0.4, type: 'bandpass', freq: 1800, q: 2, gain: 0.9 }); tone({ freq: r(300, 420), dur: 1.0, type: 'triangle', gain: 0.25 }); tone({ freq: r(800, 950), dur: 0.8, type: 'sine', gain: 0.12 }); tone({ freq: 90, freqEnd: 40, dur: 0.4, gain: 0.5 }) },
  plastic: () => { burst({ dur: 0.35, type: 'bandpass', freq: 1500, q: 1, gain: 1 }); burst({ dur: 0.2, type: 'highpass', freq: 2500, gain: 0.4, delay: 0.05 }); tone({ freq: 100, freqEnd: 45, dur: 0.25, gain: 0.35 }) },
  glass: () => {
    burst({ dur: 0.7, type: 'highpass', freq: 2500, gain: 0.9 })
    for (let i = 0; i < 6; i++) tone({ freq: r(1800, 4200), dur: r(0.15, 0.4), gain: 0.07, delay: r(0, 0.35) })
    tone({ freq: 90, freqEnd: 40, dur: 0.25, gain: 0.3 })
  },
  soft: () => { burst({ dur: 0.35, type: 'lowpass', freq: 700, gain: 1 }); tone({ freq: 80, freqEnd: 40, dur: 0.2, gain: 0.4 }) },
}

export const sfx = {
  unlock: () => getCtx(),
  hit: (mat) => (HIT[mat] || HIT.plastic)(),
  break: (mat) => (BREAK[mat] || BREAK.plastic)(),
  swing: () => burst({ dur: 0.18, type: 'bandpass', freq: 700, q: 0.8, gain: 0.25 }),
  thud: () => { burst({ dur: 0.12, type: 'lowpass', freq: 500, gain: 0.8 }); tone({ freq: 90, freqEnd: 50, dur: 0.1, gain: 0.3 }) },
  throw: () => burst({ dur: 0.25, type: 'bandpass', freq: 500, q: 0.7, gain: 0.3 }),
  boom: () => {
    burst({ dur: 1.4, type: 'lowpass', freq: 400, gain: 1.4 })
    burst({ dur: 0.5, type: 'lowpass', freq: 1800, gain: 0.9 })
    tone({ freq: 70, freqEnd: 25, dur: 1.0, gain: 0.9 })
  },
  ignite: () => {
    burst({ dur: 0.5, type: 'bandpass', freq: 900, q: 0.6, gain: 0.35 })
    burst({ dur: 0.3, type: 'lowpass', freq: 300, gain: 0.4 })
  },
  crackle: () => { for (let i = 0; i < 3; i++) burst({ dur: 0.03, type: 'highpass', freq: 2500, gain: r(0.1, 0.25), delay: r(0, 0.25) }) },
  puff: () => burst({ dur: 0.8, type: 'highpass', freq: 1500, gain: 0.5 }),
  click: () => tone({ freq: 1800, dur: 0.03, type: 'square', gain: 0.08 }),
}
