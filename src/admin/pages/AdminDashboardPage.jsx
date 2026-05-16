import { getMockAuditEntryCount } from '../../validation/mockAuditTrail.js'
import { getMockRoomSession } from '../../validation/mockRoomSession.js'
import { AdminPageFrame } from './AdminPageCommon.jsx'

export function AdminDashboardPage() {
  const session = getMockRoomSession()

  return (
    <AdminPageFrame
      title="Admin Dashboard"
      description="Mock read-only summary — no live metrics API"
    >
      <dl className="sh-admin-stats" data-testid="admin-dashboard-stats">
        <div>
          <dt>live_state</dt>
          <dd>{session.live_state}</dd>
        </div>
        <div>
          <dt>audit entries</dt>
          <dd>{getMockAuditEntryCount()}</dd>
        </div>
        <div>
          <dt>mock_only</dt>
          <dd>true</dd>
        </div>
      </dl>
    </AdminPageFrame>
  )
}
