import { buildAuditExportPayload as buildCoreAuditExportPayload } from '@tetherget/mock-audit-core'

/**
 * StreamHub client-only mock audit export (legacy signature preserved).
 * @param {readonly import('./types.js').MockAuditEntry[]} entries
 * @param {{ kindFilter?: string; correlationQuery?: string }} filters
 */
export function buildAuditExportPayload(entries, filters = {}) {
  return buildCoreAuditExportPayload({
    entries,
    platform: 'streamhub',
    filters: {
      kindFilter: filters.kindFilter,
      correlationQuery: filters.correlationQuery,
    },
    schema_version: '1.0',
    exported_at_ms: Date.now(),
  })
}

/**
 * @param {ReturnType<typeof buildAuditExportPayload>} payload
 */
export function serializeAuditExportPayload(payload) {
  return JSON.stringify(payload, null, 2)
}

/**
 * @param {ReturnType<typeof buildAuditExportPayload>} payload
 * @param {string} [filename]
 */
export function getAuditExportFilename(payload, filename) {
  return filename ?? `streamhub-mock-audit-${payload.exported_at_ms}.json`
}
