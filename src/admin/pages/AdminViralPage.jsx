import { useCallback, useState } from 'react'
import { ViralScoreBoard } from '../../viral/ui/ViralScoreBoard.jsx'
import { AdminPageFrame } from './AdminPageCommon.jsx'

export function AdminViralPage() {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])
  void tick

  return (
    <AdminPageFrame
      title="Viral Score Engine"
      description="Mock performance learning — no YouTube/analytics API, operator approval required"
    >
      <ViralScoreBoard onUpdated={refresh} />
    </AdminPageFrame>
  )
}
