import { appendMockAuditEntry } from '../../validation/mockAuditTrail.js'
import { WATCHER_CHANNEL_AUDIT_KINDS } from './watchedChannelTypes.js'

/**
 * @param {typeof WATCHER_CHANNEL_AUDIT_KINDS[number]} kind
 * @param {{ correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendWatcherChannelAudit(kind, input) {
  if (!WATCHER_CHANNEL_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid watcher channel audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_channel_watcher',
    correlation_id: input.correlation_id,
    payload: { mockOnly: true, ...(input.payload ?? {}) },
  })
}
