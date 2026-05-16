import { STREAMHUB_CORE_AUDIT_KINDS } from '../contracts/realtimeEvents.js'
import { appendMockAuditEntry, getMockAuditEntries } from '../mockAuditTrail.js'
import {
  getMockReportQueue,
  mockActionReport,
  mockEnqueueReport,
  resetMockReportQueueForTests,
} from '../mockAdminReportQueue.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.admin.flow'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runAdminMockFlowSuite() {
  const issues = []
  resetMockReportQueueForTests()

  const reportId = `mock_report_${Date.now()}`
  mockEnqueueReport(reportId)

  appendMockAuditEntry({
    kind: 'admin.streamhub.report_created',
    actor_admin_id: 'mock_admin_flow',
    correlation_id: `corr_${reportId}`,
    payload: { reportId, status: 'OPEN', mockOnly: true },
  })

  const actioned = mockActionReport(reportId)
  if (!actioned) {
    issues.push(
      issue(`${SUITE_ID}.action`, 'Mock report OPEN→ACTIONED failed', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.action`, 'Mock report OPEN→ACTIONED OK', 'PASS', SUITE_ID),
    )
  }

  appendMockAuditEntry({
    kind: 'admin.streamhub.report_status_changed',
    actor_admin_id: 'mock_admin_flow',
    correlation_id: `corr_${reportId}_status`,
    payload: { reportId, status: 'ACTIONED', mockOnly: true },
  })

  const queue = getMockReportQueue()
  const row = queue.find((r) => r.id === reportId)
  if (row?.status !== 'ACTIONED') {
    issues.push(
      issue(`${SUITE_ID}.queue`, 'Report queue status not ACTIONED', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(issue(`${SUITE_ID}.queue`, 'Mock report queue consistent', 'PASS', SUITE_ID))
  }

  appendMockAuditEntry({
    kind: 'admin.streamhub.self_test_run',
    actor_admin_id: 'mock_admin_flow',
    correlation_id: `flow_self_test_${Date.now()}`,
    payload: { source: SUITE_ID, mockOnly: true },
  })

  appendMockAuditEntry({
    kind: 'admin.streamhub.recovery_resync_check',
    actor_admin_id: 'mock_admin_flow',
    correlation_id: `flow_resync_${Date.now()}`,
    payload: { appSynced: true, mockOnly: true },
  })

  const entries = getMockAuditEntries()
  const kinds = entries.map((e) => e.kind)

  for (const kind of STREAMHUB_CORE_AUDIT_KINDS) {
    if (kinds.includes(kind)) {
      issues.push(
        issue(`${SUITE_ID}.audit.${kind}`, `Audit trail contains ${kind}`, 'PASS', SUITE_ID),
      )
    } else {
      issues.push(
        issue(
          `${SUITE_ID}.audit.${kind}`,
          `Missing required audit kind: ${kind}`,
          'FAIL',
          SUITE_ID,
        ),
      )
    }
  }

  const beforeLen = entries.length
  appendMockAuditEntry({
    kind: 'admin.streamhub.chat_audit',
    actor_admin_id: 'mock_admin_flow',
    correlation_id: `flow_audit_${Date.now()}`,
    payload: { source: SUITE_ID, mockOnly: true },
  })

  if (getMockAuditEntries().length <= beforeLen) {
    issues.push(
      issue(`${SUITE_ID}.append`, 'Append-only audit growth failed', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.append`, 'Append-only audit growth OK', 'PASS', SUITE_ID),
    )
  }

  issues.push(
    issue(`${SUITE_ID}.mock-only`, 'Admin mock flow: no live WS or broadcast', 'PASS', SUITE_ID),
  )

  return buildSuite(SUITE_ID, 'Admin mock flow (audit append-only)', issues)
}
