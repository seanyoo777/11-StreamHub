/** Pure audit list filters — mock only (delegates to @tetherget/mock-audit-core). */

import { filterAuditEntries } from '@tetherget/mock-audit-core'

/**
 * @param {readonly import('./types.js').MockAuditEntry[]} entries
 * @param {string} kindFilter empty = all
 */
export function filterMockAuditByKind(entries, kindFilter) {
  return filterAuditEntries(entries, {
    kindFilter: kindFilter ?? '',
    correlationQuery: '',
  })
}

/**
 * @param {readonly import('./types.js').MockAuditEntry[]} entries
 * @param {string} query
 */
export function searchMockAuditByCorrelation(entries, query) {
  return filterAuditEntries(entries, {
    kindFilter: '',
    correlationQuery: query ?? '',
  })
}

/**
 * @param {readonly import('./types.js').MockAuditEntry[]} entries
 * @param {{ kindFilter?: string; correlationQuery?: string }} filters
 */
export function filterMockAuditEntries(entries, filters = {}) {
  return filterAuditEntries(entries, {
    kindFilter: filters.kindFilter ?? '',
    correlationQuery: filters.correlationQuery ?? '',
  })
}

/**
 * @param {readonly import('./types.js').MockAuditEntry[]} entries
 * @param {number} [limit]
 */
export function getRecentMockAuditPreview(entries, limit = 6) {
  return [...entries].slice(-limit).reverse()
}

/**
 * @param {readonly import('./types.js').MockAuditEntry[]} entries
 */
export function getMockAuditKindOptions(entries) {
  const kinds = new Set(entries.map((e) => e.kind))
  return ['all', ...[...kinds].sort()]
}
