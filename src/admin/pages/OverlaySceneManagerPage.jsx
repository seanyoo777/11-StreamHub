import { useCallback, useState } from 'react'
import { OverlaySceneBoard } from '../../overlay-scenes/ui/OverlaySceneBoard.jsx'
import { AdminPageFrame } from './AdminPageCommon.jsx'

export function OverlaySceneManagerPage() {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])
  void tick

  return (
    <AdminPageFrame
      title="OBS Overlay Scene Manager"
      description="Browser Source preview mock — no OBS WebSocket, no real broadcast"
    >
      <OverlaySceneBoard onUpdated={refresh} />
    </AdminPageFrame>
  )
}
