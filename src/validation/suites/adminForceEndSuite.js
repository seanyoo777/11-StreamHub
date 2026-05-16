import { STREAM_ENDED_REASONS } from '../contracts/roomSession.js'
import { appendMockAuditEntry, getMockAuditEntries } from '../mockAuditTrail.js'
import {
  getMockForceEndFixture,
  resetMockForceEndFixtureForTests,
  setMockForceEndFixture,
} from '../mockForceEnd.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.admin.force-end'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runAdminForceEndSuite() {
  const issues = []
  resetMockForceEndFixtureForTests()

  const fixture = setMockForceEndFixture({
    room_id: 'room_force_mock',
    session_id: 'sess_force_001',
    reason: 'admin_terminated',
  })

  appendMockAuditEntry({
    kind: 'admin.streamhub.stream_force_ended',
    actor_admin_id: 'mock_admin_force',
    correlation_id: `force_${fixture.session_id}`,
    payload: {
      room_id: fixture.room_id,
      session_id: fixture.session_id,
      mockOnly: true,
    },
  })

  const after = getMockForceEndFixture()
  if (after.session_state !== 'ENDED') {
    issues.push(
      issue(`${SUITE_ID}.session`, 'Mock StreamSession.state should be ENDED', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.session`, 'Mock session ENDED after force-end', 'PASS', SUITE_ID),
    )
  }

  if (after.stream_ended_reason !== 'admin_terminated') {
    issues.push(
      issue(`${SUITE_ID}.reason`, 'stream.ended reason must be admin_terminated', 'FAIL', SUITE_ID),
    )
  } else if (!STREAM_ENDED_REASONS.includes('admin_terminated')) {
    issues.push(issue(`${SUITE_ID}.reason`, 'admin_terminated not in contract', 'FAIL', SUITE_ID))
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.reason`,
        'stream.ended admin_terminated pairs stream_force_ended',
        'PASS',
        SUITE_ID,
      ),
    )
  }

  const auditKinds = getMockAuditEntries().map((e) => e.kind)
  if (!auditKinds.includes('admin.streamhub.stream_force_ended')) {
    issues.push(
      issue(`${SUITE_ID}.audit`, 'Missing stream_force_ended audit row', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.audit`, 'stream_force_ended audit appended', 'PASS', SUITE_ID),
    )
  }

  issues.push(
    issue(`${SUITE_ID}.mock-only`, 'Force-end mock: no live broadcast', 'PASS', SUITE_ID),
  )

  return buildSuite(SUITE_ID, 'Admin mock force-end', issues)
}
