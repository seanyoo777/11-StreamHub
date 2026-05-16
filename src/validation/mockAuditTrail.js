import { createMockAuditTrail } from '@tetherget/mock-audit-core'

/** @typedef {import('./types.js').MockAuditEntry} MockAuditEntry */

const trail = createMockAuditTrail({ idPrefix: 'mock_audit_' })

/**
 * @param {Omit<MockAuditEntry, 'id' | 'server_ms'> & { server_ms?: number }} partial
 * @returns {MockAuditEntry}
 */
export function appendMockAuditEntry(partial) {
  return trail.append(partial)
}

/** @returns {readonly MockAuditEntry[]} */
export function getMockAuditEntries() {
  return trail.getEntries()
}

/** @returns {number} */
export function getMockAuditEntryCount() {
  return trail.getEntryCount()
}

/** Append-only: delete is intentionally unavailable. */
export function tryDeleteMockAuditEntry() {
  return trail.tryDelete()
}

/** @param {string} correlationId */
export function findMockAuditByCorrelation(correlationId) {
  return trail.findByCorrelation(correlationId)
}

/** Reset for tests only */
export function resetMockAuditTrailForTests() {
  trail.resetForTests()
}

export const mockAuditTrailApi = {
  append: appendMockAuditEntry,
  getEntries: getMockAuditEntries,
  tryDelete: tryDeleteMockAuditEntry,
}
