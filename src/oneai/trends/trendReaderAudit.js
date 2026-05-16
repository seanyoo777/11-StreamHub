import { appendMockAuditEntry } from '../../validation/mockAuditTrail.js'
import { TREND_READER_AUDIT_KINDS } from './trendReaderTypes.js'

/**
 * @param {typeof TREND_READER_AUDIT_KINDS[number]} kind
 * @param {{ correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendTrendReaderAudit(kind, input) {
  if (!TREND_READER_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid trend reader audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_trend_reader',
    correlation_id: input.correlation_id,
    payload: { mockOnly: true, ...(input.payload ?? {}) },
  })
}
