import { appendMockAuditEntry } from '../../validation/mockAuditTrail.js'
import { STOCKPICK_READER_AUDIT_KINDS } from './stockPickReaderTypes.js'

/**
 * @param {typeof STOCKPICK_READER_AUDIT_KINDS[number]} kind
 * @param {{ correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendStockPickReaderAudit(kind, input) {
  if (!STOCKPICK_READER_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid stock pick reader audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_stockpick_reader',
    correlation_id: input.correlation_id,
    payload: { mockOnly: true, ...(input.payload ?? {}) },
  })
}
