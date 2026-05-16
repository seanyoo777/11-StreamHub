import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DIAGNOSTICS_SECTIONS } from '../src/dev/diagnosticsMeta.js'
import {
  getAuditTrailViewModel,
  getDiagnosticsViewModel,
  getRoomSessionDiagnosticsViewModel,
  getSelfTestCenterViewModel,
} from '../src/dev/viewModels.js'
import {
  appendMockAuditEntry,
  getMockAuditEntries,
  resetMockAuditTrailForTests,
} from '../src/validation/mockAuditTrail.js'
import { applyMockResyncToRoomSession } from '../src/validation/mockRoomSession.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'
import { STREAMHUB_DEV_ROUTES } from '../src/validation/contracts/routes.js'
import { STREAMHUB_ADMIN_ROUTES } from '../src/validation/contracts/adminRoutes.js'

describe('Self-Test UI view models (panel rendering)', () => {
  it('builds Self-Test Center panel fields', () => {
    resetMockAuditTrailForTests()
    const result = runStreamHubSelfTests()
    const vm = getSelfTestCenterViewModel(result)

    assert.equal(vm.mockOnlyBadge, 'MOCK ONLY')
    assert.equal(vm.title, 'Self-Test Center')
    assert.equal(vm.overall, result.overall)
    assert.equal(vm.issueCount, result.issueCount)
    assert.ok(vm.lastCheckedAtMs > 0)
    assert.equal(vm.mockOnly, true)
  })

  it('builds Diagnostics Panel rows for all sections', () => {
    resetMockAuditTrailForTests()
    const result = runStreamHubSelfTests()
    const rows = getDiagnosticsViewModel(result)

    assert.equal(rows.length, DIAGNOSTICS_SECTIONS.length)
    assert.equal(rows.length, 12)

    const routeRow = rows.find((r) => r.suiteId === 'contract.route-ia')
    assert.equal(routeRow?.label, 'Route contract')
    assert.equal(routeRow?.status, 'PASS')

    assert.ok(rows.some((r) => r.suiteId === 'contract.realtime-schema'))
    assert.ok(rows.some((r) => r.suiteId === 'mock.admin.flow'))
    assert.ok(rows.some((r) => r.suiteId === 'contract.room-session'))
  })

  it('builds audit trail view model with filter and preview', () => {
    resetMockAuditTrailForTests()
    appendMockAuditEntry({
      kind: 'admin.streamhub.self_test_run',
      actor_admin_id: 'x',
      correlation_id: 'search_me',
      payload: {},
    })
    appendMockAuditEntry({
      kind: 'admin.streamhub.chat_audit',
      actor_admin_id: 'x',
      correlation_id: 'other',
      payload: {},
    })
    const all = getMockAuditEntries()
    const vm = getAuditTrailViewModel(all, {
      kindFilter: 'self_test',
      correlationQuery: 'search',
    })
    assert.equal(vm.preview.length, 2)
    assert.equal(vm.filteredCount, 1)
  })

  it('builds room session diagnostics card fields', () => {
    const session = applyMockResyncToRoomSession({
      appSynced: true,
      lastErrorCode: null,
    })
    const vm = getRoomSessionDiagnosticsViewModel(session)
    assert.equal(vm.mockOnlyBadge, 'MOCK ONLY')
    assert.ok(vm.channel_id.includes('stream_chat:'))
    assert.equal(vm.recovery_label, 'APP_SYNCED')
  })
})

describe('dev self-test route', () => {
  it('exports /dev/self-test path', () => {
    assert.equal(STREAMHUB_DEV_ROUTES.selfTest, '/dev/self-test')
  })

  it('admin IA includes /admin/reports', () => {
    assert.equal(STREAMHUB_ADMIN_ROUTES.reports, '/admin/reports')
  })
})
