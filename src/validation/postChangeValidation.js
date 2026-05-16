import { appendMockAuditEntry } from './mockAuditTrail.js'
import { getMockRoomSession } from './mockRoomSession.js'
import { runStreamHubSelfTests } from './runStreamHubSelfTests.js'

/**
 * @typedef {Object} PostChangeAction
 * @property {string} kind
 * @property {string} [actorAdminId]
 * @property {Record<string, unknown>} [payload]
 */

/**
 * @typedef {Object} PostChangeValidationResult
 * @property {import('./types.js').SelfTestResult} selfTestResult
 * @property {string} correlationId
 * @property {string} actionKind
 * @property {'PASS' | 'WARN' | 'FAIL'} validationStatus
 */

/**
 * @param {PostChangeAction} action
 * @returns {PostChangeValidationResult}
 */
export function runPostChangeValidation(action) {
  const session = getMockRoomSession()
  const correlationId = `post_change_${action.kind}_${Date.now()}`

  const selfTestResult = runStreamHubSelfTests({
    mockResync: {
      transportState: session.transport_state,
      appSynced: session.app_synced,
      lastErrorCode: session.last_error_code,
    },
  })

  const validationStatus = selfTestResult.overall

  appendMockAuditEntry({
    kind: 'admin.streamhub.post_change_validation',
    actor_admin_id: action.actorAdminId ?? 'mock_admin_shell',
    correlation_id: correlationId,
    payload: {
      actionKind: action.kind,
      overall: validationStatus,
      issueCount: selfTestResult.issueCount,
      mockOnly: true,
      ...(action.payload ?? {}),
    },
  })

  return {
    selfTestResult,
    correlationId,
    actionKind: action.kind,
    validationStatus,
  }
}
