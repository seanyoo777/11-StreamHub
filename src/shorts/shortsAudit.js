import { appendMockAuditEntry } from '../validation/mockAuditTrail.js'
import { SHORTS_CLIP_AUDIT_KINDS } from './contracts/shortsQueueSchema.js'

/**
 * @param {typeof SHORTS_CLIP_AUDIT_KINDS[number]} kind
 * @param {{ clip_id: string; correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendShortsClipAudit(kind, input) {
  if (!SHORTS_CLIP_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid clip audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_shorts_operator',
    correlation_id: input.correlation_id,
    payload: {
      clip_id: input.clip_id,
      mockOnly: true,
      ...(input.payload ?? {}),
    },
  })
}
