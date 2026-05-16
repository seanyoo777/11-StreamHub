import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { buildAuditExportPayload as buildCoreAuditExportPayload } from '@tetherget/mock-audit-core'
import { isAdminShellPath, resolveAdminPageId } from '../src/admin/resolveAdminPage.js'
import { STREAMHUB_ADMIN_SHELL_ROUTES } from '../src/validation/contracts/adminRoutes.js'
import { buildAuditExportPayload, serializeAuditExportPayload } from '../src/validation/auditExport.js'
import { appendMockAuditEntry, getMockAuditEntries, resetMockAuditTrailForTests } from '../src/validation/mockAuditTrail.js'
import { performMockAdminAction } from '../src/validation/mockAdminActions.js'
import { resetMockRoomSessionForTests } from '../src/validation/mockRoomSession.js'
import { resetMockForceEndFixtureForTests } from '../src/validation/mockForceEnd.js'
import { runScenarioToggleSuite } from '../src/validation/suites/scenarioToggleSuite.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'
import { applyMockRoomScenario } from '../src/validation/mockRoomSessionScenarios.js'

describe('admin shell routing', () => {
  it('resolves P3 shell paths', () => {
    assert.equal(resolveAdminPageId('/admin/dashboard'), 'dashboard')
    assert.equal(resolveAdminPageId('/admin/reports'), 'reports')
    assert.equal(resolveAdminPageId('/admin/rooms'), 'rooms')
    assert.equal(resolveAdminPageId('/admin/fees'), 'fees')
    assert.equal(resolveAdminPageId('/admin/recovery'), 'recovery')
    assert.equal(isAdminShellPath('/admin/unknown'), true)
    assert.equal(isAdminShellPath('/live'), false)
  })

  it('exports shell route constants', () => {
    assert.equal(STREAMHUB_ADMIN_SHELL_ROUTES.recovery, '/admin/recovery')
  })
})

describe('post-change validation', () => {
  beforeEach(() => {
    resetMockAuditTrailForTests()
    resetMockRoomSessionForTests()
    resetMockForceEndFixtureForTests()
  })

  it('runs self-test once and appends post_change_validation audit', () => {
    applyMockRoomScenario('OFFLINE')
    const result = performMockAdminAction('scenario.apply', { scenario: 'APP_SYNCED' })
    assert.ok(['PASS', 'WARN'].includes(result.validationStatus))
    assert.ok(result.selfTestResult.suites.length >= 12)
    const kinds = getMockAuditEntries().map((e) => e.kind)
    assert.ok(kinds.includes('admin.streamhub.post_change_validation'))
    assert.ok(kinds.includes('admin.streamhub.self_test_run'))
  })
})

describe('audit export payload', () => {
  beforeEach(() => {
    resetMockAuditTrailForTests()
    appendMockAuditEntry({
      kind: 'admin.streamhub.self_test_run',
      actor_admin_id: 'x',
      correlation_id: 'export_alpha',
      payload: {},
    })
    appendMockAuditEntry({
      kind: 'admin.streamhub.chat_audit',
      actor_admin_id: 'x',
      correlation_id: 'other',
      payload: {},
    })
  })

  it('builds client-only JSON export with filters', () => {
    const payload = buildAuditExportPayload(getMockAuditEntries(), {
      kindFilter: 'self_test',
      correlationQuery: 'alpha',
    })
    assert.equal(payload.mock_only, true)
    assert.equal(payload.client_only, true)
    assert.equal(payload.entry_count, 1)
    const json = serializeAuditExportPayload(payload)
    assert.match(json, /export_alpha/)
    assert.doesNotMatch(json, /"other"/)
  })

  it('delegates to @tetherget/mock-audit-core with same snapshot fields', () => {
    const entries = getMockAuditEntries()
    const filters = { kindFilter: 'self_test', correlationQuery: 'alpha' }
    const payload = buildAuditExportPayload(entries, filters)
    const corePayload = buildCoreAuditExportPayload({
      entries,
      platform: 'streamhub',
      filters: {
        kindFilter: filters.kindFilter,
        correlationQuery: filters.correlationQuery,
      },
      schema_version: '1.0',
      exported_at_ms: payload.exported_at_ms,
    })
    assert.deepEqual(payload, corePayload)
  })
})

describe('scenario toggle suite', () => {
  beforeEach(() => {
    resetMockRoomSessionForTests()
    resetMockForceEndFixtureForTests()
  })

  it('passes mock.scenario-toggle', () => {
    const suite = runScenarioToggleSuite()
    assert.equal(suite.id, 'mock.scenario-toggle')
    assert.equal(suite.status, 'PASS')
  })
})

describe('runStreamHubSelfTests P3', () => {
  beforeEach(() => {
    resetMockAuditTrailForTests()
    resetMockRoomSessionForTests()
    resetMockForceEndFixtureForTests()
  })

  it('includes 18 suites including scenario toggle', () => {
    const result = runStreamHubSelfTests()
    assert.equal(result.suites.length, 37)
    assert.ok(result.suites.some((s) => s.id === 'mock.scenario-toggle'))
  })
})
