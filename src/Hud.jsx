import { useEffect, useState } from 'react'
import { useGame, WEAPONS } from './store'
import { sfx } from './sound'

const won = (n) => `₩${n.toLocaleString('ko-KR')}`

const CONTROLS = [
  ['W A S D', '이동'],
  ['Shift', '달리기'],
  ['Space', '점프'],
  ['마우스', '둘러보기'],
  ['좌클릭', '부수기'],
  ['우클릭', '안전모 던지기'],
  ['1 / 2', '망치 / 대형 스패너'],
  ['R', '처음부터'],
  ['H', '조작법 숨기기/보이기'],
  ['ESC', '일시정지'],
]

export function Hud() {
  const locked = useGame((s) => s.locked)
  const score = useGame((s) => s.score)
  const count = useGame((s) => s.count)
  const total = useGame((s) => s.total)
  const log = useGame((s) => s.log)
  const weapon = useGame((s) => s.weapon)
  const [started, setStarted] = useState(false)
  const [help, setHelp] = useState(true)
  const done = count === total && total > 0

  useEffect(() => {
    const onKey = (e) => e.code === 'KeyH' && setHelp((h) => !h)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div className="hud">
        <div className="score">
          <div className="label">총 피해액</div>
          <div className="value">{won(score)}</div>
          <div className="progress">
            <div className="bar" style={{ width: `${(count / total) * 100}%` }} />
          </div>
          <div className="sub">
            파손 {count} / {total}
          </div>
        </div>

        <div className="log">
          {log.map((l) => (
            <div key={l.id} className="log-item">
              {l.name} 파손! <b>+{won(l.value)}</b>
            </div>
          ))}
        </div>

        <div className="weapons">
          {WEAPONS.map((w, i) => (
            <div key={w.name} className={`weapon ${i === weapon ? 'on' : ''}`}>
              <span className="key">{i + 1}</span> {w.name}
            </div>
          ))}
          <div className="weapon">
            <span className="key">우클릭</span> 안전모 던지기
          </div>
        </div>

        {locked &&
          (help ? (
            <div className="help">
              {CONTROLS.map(([k, v]) => (
                <div key={k}>
                  <span className="k">{k}</span> {v}
                </div>
              ))}
            </div>
          ) : (
            <div className="help small">H 조작법 보기</div>
          ))}

        {locked && <div className="crosshair" />}
        {done && locked && (
          <div className="done">
            <h2>사무실 초토화 완료!</h2>
            <p>총 피해액 {won(score)}</p>
            <p className="hint">R 키를 누르면 처음부터 다시 시작해요</p>
          </div>
        )}
      </div>

      {/* PointerLockControls가 이 버튼에 클릭 이벤트를 걸기 때문에 숨기기만 하고 항상 남겨둠 */}
      <div className="overlay" style={{ display: locked ? 'none' : 'flex' }}>
        <div className="panel">
          <h1>정비단 사무실 부수기</h1>
          <p className="tagline">오늘 하루도 고생 많았어요. 마음껏 부수세요.</p>
          <table className="controls">
            <tbody>
              {CONTROLS.map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
          <button
            id="start-btn"
            onClick={() => {
              sfx.unlock()
              setStarted(true)
            }}
          >
            {started ? '계속하기' : '시작하기'}
          </button>
        </div>
      </div>
    </>
  )
}
