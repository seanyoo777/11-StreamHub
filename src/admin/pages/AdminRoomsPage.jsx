import { getMockRoomSession } from '../../validation/mockRoomSession.js'
import { performMockAdminAction } from '../../validation/mockAdminActions.js'
import { AdminPageFrame, MockActionButton } from './AdminPageCommon.jsx'

/**
 * @param {{ onPostChange: (r: import('../../validation/postChangeValidation.js').PostChangeValidationResult) => void; busy?: boolean }} props
 */
export function AdminRoomsPage({ onPostChange, busy = false }) {
  const session = getMockRoomSession()

  return (
    <AdminPageFrame
      title="Rooms"
      description="Mock room controls — force-end runs post-change validation once"
    >
      <p>
        Room <code>{session.room_id}</code> — {session.live_state}
      </p>
      <MockActionButton
        label="Mock: force-end room"
        testId="admin-action-force-end"
        disabled={busy}
        onClick={() => {
          const result = performMockAdminAction('room.force_end', { roomId: session.room_id })
          onPostChange(result)
        }}
      />
    </AdminPageFrame>
  )
}
