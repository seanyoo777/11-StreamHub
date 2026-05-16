import { DIAGNOSTICS_SECTIONS } from './diagnosticsMeta.js'
import {
  filterMockAuditEntries,
  getMockAuditKindOptions,
  getRecentMockAuditPreview,
} from '../validation/mockAuditFilters.js'
import { getMockRoomSession } from '../validation/mockRoomSession.js'

/**
 * @param {import('../validation/types.js').SelfTestResult | null} result
 */
export function getSelfTestCenterViewModel(result) {
  return {
    title: 'Self-Test Center',
    subtitle: 'Mock contract validation — no broadcast or WebSocket',
    mockOnlyBadge: 'MOCK ONLY',
    overall: result?.overall ?? '—',
    issueCount: result?.issueCount ?? 0,
    warnCount: result?.warnCount ?? 0,
    lastCheckedAtMs: result?.lastCheckedAtMs ?? null,
    mockOnly: result?.mockOnly ?? true,
  }
}

/**
 * @param {import('../validation/types.js').SelfTestResult | null} result
 */
export function getDiagnosticsViewModel(result) {
  const suiteById = new Map((result?.suites ?? []).map((s) => [s.id, s]))

  return DIAGNOSTICS_SECTIONS.map((section) => {
    const suite = suiteById.get(section.suiteId)
    return {
      suiteId: section.suiteId,
      label: section.label,
      description: section.description,
      status: suite?.status ?? '—',
      passCount: suite?.passCount ?? 0,
      warnCount: suite?.warnCount ?? 0,
      failCount: suite?.failCount ?? 0,
      issueCount: suite?.issues.length ?? 0,
    }
  })
}

/**
 * @param {readonly import('../validation/types.js').MockAuditEntry[]} entries
 * @param {{ kindFilter?: string; correlationQuery?: string }} filters
 */
export function getAuditTrailViewModel(entries, filters = {}) {
  const filtered = filterMockAuditEntries(entries, filters)
  const preview = getRecentMockAuditPreview(entries, 6)
  const kindOptions = getMockAuditKindOptions(entries)

  return {
    totalCount: entries.length,
    filteredCount: filtered.length,
    kindOptions,
    preview,
    filtered,
    mockOnly: true,
  }
}

/** @param {import('../validation/mockRoomSession.js').MockRoomSessionState} [session] */
export function getRoomSessionDiagnosticsViewModel(session = getMockRoomSession()) {
  return {
    mockOnlyBadge: 'MOCK ONLY',
    room_id: session.room_id,
    live_state: session.live_state,
    active_session_id: session.active_session_id,
    session_state: session.session_state,
    last_chat_seq: session.last_chat_seq,
    channel_id: session.channel_id,
    transport_state: session.transport_state,
    app_synced: session.app_synced,
    recovery_label: session.app_synced ? 'APP_SYNCED' : 'RESYNC_REQUIRED',
    last_error_code: session.last_error_code ?? '—',
    mockOnly: session.mockOnly,
  }
}
