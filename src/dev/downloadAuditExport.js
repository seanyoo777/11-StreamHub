import {
  buildAuditExportPayload,
  getAuditExportFilename,
  serializeAuditExportPayload,
} from '../validation/auditExport.js'

/**
 * Client-only JSON download — no server upload.
 * @param {readonly import('../validation/types.js').MockAuditEntry[]} entries
 * @param {{ kindFilter?: string; correlationQuery?: string }} filters
 */
export function downloadAuditExportClient(entries, filters = {}) {
  const payload = buildAuditExportPayload(entries, filters)
  const json = serializeAuditExportPayload(payload)
  const filename = getAuditExportFilename(payload)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.click()
  URL.revokeObjectURL(url)
  return payload
}
