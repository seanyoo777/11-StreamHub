import { appendMockAuditEntry } from '../../validation/mockAuditTrail.js'
import { CLIP_TIMELINE_AUDIT_KINDS } from './clipTimelineTypes.js'

/**
 * @param {typeof CLIP_TIMELINE_AUDIT_KINDS[number]} kind
 * @param {{ clip_id: string; correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendClipTimelineAudit(kind, input) {
  if (!CLIP_TIMELINE_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid clip timeline audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_clip_timeline_editor',
    correlation_id: input.correlation_id,
    payload: {
      clip_id: input.clip_id,
      mockOnly: true,
      ...(input.payload ?? {}),
    },
  })
}
