import { appendMockAuditEntry } from '../validation/mockAuditTrail.js'
import { VIRAL_SCORE_AUDIT_KINDS } from './viralScoreTypes.js'

/**
 * @param {typeof VIRAL_SCORE_AUDIT_KINDS[number]} kind
 * @param {{ correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendViralScoreAudit(kind, input) {
  if (!VIRAL_SCORE_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid viral score audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_viral_score_engine',
    correlation_id: input.correlation_id,
    payload: { mockOnly: true, ...(input.payload ?? {}) },
  })
}
