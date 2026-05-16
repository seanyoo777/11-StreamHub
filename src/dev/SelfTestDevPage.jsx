import { useCallback, useState } from 'react'
import { PostChangeValidationBanner } from '../admin/PostChangeValidationBanner.jsx'
import { getMockAuditEntries } from '../validation/mockAuditTrail.js'
import { getMockRoomSession } from '../validation/mockRoomSession.js'
import { runStreamHubSelfTests } from '../validation/runStreamHubSelfTests.js'
import { AdminIaPanel } from './AdminIaPanel.jsx'
import { AuditTrailPanel } from './AuditTrailPanel.jsx'
import { DiagnosticsPanel } from './DiagnosticsPanel.jsx'
import { RoomSessionDiagnostics } from './RoomSessionDiagnostics.jsx'
import { RoomSessionScenarioToggle } from './RoomSessionScenarioToggle.jsx'
import { SelfTestCenter } from './SelfTestCenter.jsx'
import './selfTestDev.css'

function executeSelfTests() {
  const session = getMockRoomSession()
  return runStreamHubSelfTests({
    mockResync: {
      transportState: session.transport_state,
      appSynced: session.app_synced,
      lastErrorCode: session.last_error_code,
    },
  })
}

export function SelfTestDevPage() {
  const [result, setResult] = useState(() => executeSelfTests())
  const [running, setRunning] = useState(false)
  const [auditRefresh, setAuditRefresh] = useState(0)
  const [roomSession, setRoomSession] = useState(() => getMockRoomSession())
  const [postChange, setPostChange] = useState(null)

  const auditEntries = getMockAuditEntries()

  const run = useCallback(() => {
    setRunning(true)
    try {
      const next = executeSelfTests()
      setResult(next)
      setRoomSession(getMockRoomSession())
      setAuditRefresh((n) => n + 1)
    } finally {
      setRunning(false)
    }
  }, [])

  return (
    <main className="sh-dev-page" data-testid="self-test-dev-page">
      <SelfTestCenter result={result} running={running} onRun={run} />
      <PostChangeValidationBanner lastResult={postChange} />
      <RoomSessionDiagnostics session={roomSession} />
      <RoomSessionScenarioToggle
        onScenarioApplied={setRoomSession}
        onPostChange={(validation) => {
          setPostChange(validation)
          setResult(validation.selfTestResult)
          setRoomSession(getMockRoomSession())
          setAuditRefresh((n) => n + 1)
        }}
      />
      <DiagnosticsPanel result={result} />
      <AdminIaPanel />
      <AuditTrailPanel entries={auditEntries} refreshKey={auditRefresh} />
      <p className="sh-dev-footer">
        No RTMP, WebSocket, or live broadcast.{' '}
        <a href="/admin/dashboard">Mock admin shell</a> · <a href="/">Home</a>
      </p>
    </main>
  )
}
