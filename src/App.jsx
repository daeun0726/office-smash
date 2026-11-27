import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { PointerLockControls } from '@react-three/drei'
import { Office } from './Office'
import { Exterior } from './Exterior'
import { Player } from './Player'
import { Debris, Projectiles } from './Effects'
import { Fires, Bombs, Explosions } from './Fire'
import { Hud } from './Hud'
import { useGame } from './store'
import { SPAWN } from './layout'

export default function App() {
  const round = useGame((s) => s.round)
  const setLocked = useGame((s) => s.setLocked)

  return (
    <>
      <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 75, near: 0.05, far: 220, position: SPAWN }}>
        <Suspense fallback={null}>
          {/* R 키로 처음부터 시작하면 round가 바뀌면서 물리 세계 전체를 새로 만듦 */}
          <Physics key={round} gravity={[0, -9.81, 0]}>
            <Exterior />
            <Office />
            <Player />
            <Debris />
            <Projectiles />
            <Bombs />
            <Fires />
            <Explosions />
          </Physics>
        </Suspense>
        <PointerLockControls selector="#start-btn" onLock={() => setLocked(true)} onUnlock={() => setLocked(false)} />
      </Canvas>
      <Hud />
    </>
  )
}
