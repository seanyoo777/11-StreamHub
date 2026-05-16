import { performMockAdminAction } from '../../validation/mockAdminActions.js'
import { AdminPageFrame, MockActionButton } from './AdminPageCommon.jsx'

/**
 * @param {{ onPostChange: (r: import('../../validation/postChangeValidation.js').PostChangeValidationResult) => void; busy?: boolean }} props
 */
export function AdminFeesPage({ onPostChange, busy = false }) {
  return (
    <AdminPageFrame
      title="Fees"
      description="Internal fee display experiment flags — mock only, no payment"
    >
      <MockActionButton
        label="Mock: toggle fee display flag"
        testId="admin-action-fees"
        disabled={busy}
        onClick={() => {
          const result = performMockAdminAction('fees.flag_toggle', {
            flag: 'streamhub.fees.display_experiment',
            enabled: true,
          })
          onPostChange(result)
        }}
      />
    </AdminPageFrame>
  )
}
