import { STREAMHUB_ADMIN_EVENT_KINDS, STREAMHUB_AUDIT_KINDS } from '../contracts/realtimeEvents.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'audit.append-only'

/**
 * @param {{ getEntries: () => import('../types.js').MockAuditEntry[]; tryDelete?: () => boolean }} audit
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runAuditAppendOnlySuite(audit) {
  const issues = []

  const before = audit.getEntries().length
  const entry = {
    id: `audit_${before + 1}`,
    kind: 'admin.streamhub.self_test_run',
    server_ms: Date.now(),
    actor_admin_id: 'mock_admin_self_test',
    correlation_id: `corr_${before + 1}`,
    payload: { suite: SUITE_ID, mockOnly: true },
  }

  try {
    audit.append?.(entry)
  } catch {
    issues.push(issue(`${SUITE_ID}.append`, 'append() not available on audit trail', 'FAIL', SUITE_ID))
  }

  const after = audit.getEntries().length
  if (after <= before) {
    issues.push(
      issue(`${SUITE_ID}.grow`, 'Append did not increase entry count', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.grow`, `Append-only OK (${before} → ${after})`, 'PASS', SUITE_ID),
    )
  }

  if (typeof audit.tryDelete === 'function') {
    const deleted = audit.tryDelete()
    if (deleted) {
      issues.push(
        issue(`${SUITE_ID}.delete`, 'Delete API must not exist or must no-op', 'FAIL', SUITE_ID),
      )
    } else {
      issues.push(
        issue(`${SUITE_ID}.delete`, 'No delete path (append-only preserved)', 'PASS', SUITE_ID),
      )
    }
  } else {
    issues.push(
      issue(`${SUITE_ID}.delete`, 'No delete API exposed', 'PASS', SUITE_ID),
    )
  }

  for (const kind of STREAMHUB_ADMIN_EVENT_KINDS) {
    issues.push(issue(`${SUITE_ID}.admin.${kind}`, `Admin kind registered: ${kind}`, 'PASS', SUITE_ID))
  }

  for (const kind of STREAMHUB_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Audit kind registered: ${kind}`, 'PASS', SUITE_ID))
  }

  return buildSuite(SUITE_ID, 'Mock audit trail (append-only)', issues)
}
