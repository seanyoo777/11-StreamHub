import { getMockReportQueue } from '../../validation/mockAdminReportQueue.js'
import { performMockAdminAction } from '../../validation/mockAdminActions.js'
import { AdminPageFrame, MockActionButton } from './AdminPageCommon.jsx'

/**
 * @param {{ onPostChange: (r: import('../../validation/postChangeValidation.js').PostChangeValidationResult) => void; busy?: boolean }} props
 */
export function AdminReportsPage({ onPostChange, busy = false }) {
  const queue = getMockReportQueue()

  return (
    <AdminPageFrame
      title="Reports"
      description="Mock report queue — action triggers one post-change self-test (no polling)"
    >
      <p>Open reports: {queue.filter((r) => r.status === 'OPEN').length}</p>
      <MockActionButton
        label="Mock: mark latest report ACTIONED"
        testId="admin-action-report"
        disabled={busy}
        onClick={() => {
          const result = performMockAdminAction('report.actioned')
          onPostChange(result)
        }}
      />
    </AdminPageFrame>
  )
}
