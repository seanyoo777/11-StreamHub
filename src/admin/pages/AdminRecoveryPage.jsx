import { ROOM_SESSION_SCENARIOS } from '../../validation/mockRoomSessionScenarios.js'
import { getMockRoomSession } from '../../validation/mockRoomSession.js'
import { performMockAdminAction } from '../../validation/mockAdminActions.js'
import { AdminPageFrame, MockActionButton } from './AdminPageCommon.jsx'

/**
 * @param {{
 *   onPostChange: (r: import('../../validation/postChangeValidation.js').PostChangeValidationResult) => void;
 *   onSessionChange?: () => void;
 *   busy?: boolean;
 * }} props
 */
export function AdminRecoveryPage({ onPostChange, onSessionChange, busy = false }) {
  const session = getMockRoomSession()

  return (
    <AdminPageFrame
      title="Recovery"
      description="Room/session scenario toggles — mock buttons, post-change self-test per action"
    >
      <p className="sh-recovery-state" data-testid="admin-recovery-state">
        {session.transport_state} · {session.app_synced ? 'APP_SYNCED' : 'RESYNC_REQUIRED'} ·{' '}
        {session.live_state}
      </p>
      <div className="sh-scenario-buttons" data-testid="admin-scenario-buttons">
        {ROOM_SESSION_SCENARIOS.map((scenario) => (
          <MockActionButton
            key={scenario}
            label={scenario}
            testId={`admin-scenario-${scenario}`}
            disabled={busy}
            onClick={() => {
              const result = performMockAdminAction('scenario.apply', { scenario })
              onSessionChange?.()
              onPostChange(result)
            }}
          />
        ))}
      </div>
    </AdminPageFrame>
  )
}
