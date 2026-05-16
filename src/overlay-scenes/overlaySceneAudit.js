import { appendMockAuditEntry } from '../validation/mockAuditTrail.js'
import { OVERLAY_SCENE_AUDIT_KINDS } from './overlaySceneTypes.js'

/**
 * @param {typeof OVERLAY_SCENE_AUDIT_KINDS[number]} kind
 * @param {{ correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendOverlaySceneAudit(kind, input) {
  if (!OVERLAY_SCENE_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid overlay scene audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_overlay_scene_manager',
    correlation_id: input.correlation_id,
    payload: { mockOnly: true, ...(input.payload ?? {}) },
  })
}
