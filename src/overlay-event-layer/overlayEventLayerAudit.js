import { appendMockAuditEntry } from '../validation/mockAuditTrail.js'
import { OVERLAY_EVENT_LAYER_AUDIT_KINDS } from './overlayEventLayerTypes.js'

/**
 * @param {typeof OVERLAY_EVENT_LAYER_AUDIT_KINDS[number]} kind
 * @param {{ correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendOverlayEventLayerAudit(kind, input) {
  if (!OVERLAY_EVENT_LAYER_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid overlay event layer audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_overlay_event_layer',
    correlation_id: input.correlation_id,
    payload: { mockOnly: true, ...(input.payload ?? {}) },
  })
}
