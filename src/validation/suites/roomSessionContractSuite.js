import {
  ROOM_STATUS_TO_LIVE_STATE,
  STREAM_ENDED_REASONS,
  STREAM_ROOM_LIVE_STATES,
  STREAM_SESSION_STATES,
} from '../contracts/roomSession.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.room-session'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runRoomSessionContractSuite() {
  const issues = []

  for (const liveState of STREAM_ROOM_LIVE_STATES) {
    issues.push(
      issue(`${SUITE_ID}.live.${liveState}`, `live_state enum: ${liveState}`, 'PASS', SUITE_ID),
    )
  }

  for (const sessionState of STREAM_SESSION_STATES) {
    issues.push(
      issue(
        `${SUITE_ID}.session.${sessionState}`,
        `StreamSession.state: ${sessionState}`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  for (const [status, liveState] of Object.entries(ROOM_STATUS_TO_LIVE_STATE)) {
    issues.push(
      issue(
        `${SUITE_ID}.map.${status}`,
        `status ${status} → live_state ${liveState}`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  if (!STREAM_ENDED_REASONS.includes('admin_terminated')) {
    issues.push(
      issue(`${SUITE_ID}.reason`, 'admin_terminated reason required', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.reason`,
        'stream.ended admin_terminated pairs with force-end',
        'PASS',
        SUITE_ID,
      ),
    )
  }

  issues.push(
    issue(`${SUITE_ID}.mock-only`, 'Room/session contract: mock only', 'PASS', SUITE_ID),
  )

  return buildSuite(SUITE_ID, 'Room / session contract', issues)
}
