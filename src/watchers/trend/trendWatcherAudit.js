import { appendMockAuditEntry } from '../../validation/mockAuditTrail.js'
import {
  WATCHER_FACTORY_AUDIT_KINDS,
  WATCHER_TREND_AUDIT_KINDS,
} from './trendWatcherTypes.js'

const ALL_KINDS = [...WATCHER_TREND_AUDIT_KINDS, ...WATCHER_FACTORY_AUDIT_KINDS]

/**
 * @param {typeof ALL_KINDS[number]} kind
 * @param {{ correlation_id: string; payload?: Record<string, unknown> }} input
 */
export function appendTrendWatcherAudit(kind, input) {
  if (!ALL_KINDS.includes(kind)) {
    throw new Error(`Invalid trend watcher audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_trend_watcher',
    correlation_id: input.correlation_id,
    payload: { mockOnly: true, ...(input.payload ?? {}) },
  })
}
