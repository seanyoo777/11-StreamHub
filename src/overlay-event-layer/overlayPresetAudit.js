import { appendMockAuditEntry } from '../validation/mockAuditTrail.js'
import { OVERLAY_PRESET_AUDIT_KINDS } from './overlayPresetTypes.js'

/**
 * @param {typeof OVERLAY_PRESET_AUDIT_KINDS[number]} kind
 * @param {{ correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendOverlayPresetAudit(kind, input) {
  if (!OVERLAY_PRESET_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid overlay preset audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_overlay_preset_manager',
    correlation_id: input.correlation_id,
    payload: { mockOnly: true, ...(input.payload ?? {}) },
  })
}
