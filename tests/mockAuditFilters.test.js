import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { filterAuditEntries } from '@tetherget/mock-audit-core'
import {
  filterMockAuditByKind,
  filterMockAuditEntries,
  getRecentMockAuditPreview,
  searchMockAuditByCorrelation,
} from '../src/validation/mockAuditFilters.js'
import {
  appendMockAuditEntry,
  getMockAuditEntries,
  resetMockAuditTrailForTests,
} from '../src/validation/mockAuditTrail.js'

describe('mockAuditFilters', () => {
  beforeEach(() => {
    resetMockAuditTrailForTests()
    appendMockAuditEntry({
      kind: 'admin.streamhub.self_test_run',
      actor_admin_id: 'a1',
      correlation_id: 'corr_alpha_1',
      payload: {},
    })
    appendMockAuditEntry({
      kind: 'admin.streamhub.recovery_resync_check',
      actor_admin_id: 'a1',
      correlation_id: 'corr_beta_2',
      payload: {},
    })
    appendMockAuditEntry({
      kind: 'admin.streamhub.stream_force_ended',
      actor_admin_id: 'a2',
      correlation_id: 'corr_alpha_force',
      payload: {},
    })
  })

  it('filters by kind', () => {
    const entries = getMockAuditEntries()
    const filtered = filterMockAuditByKind(entries, 'admin.streamhub.self_test_run')
    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].kind, 'admin.streamhub.self_test_run')
  })

  it('searches correlation_id', () => {
    const hits = searchMockAuditByCorrelation(getMockAuditEntries(), 'alpha')
    assert.equal(hits.length, 2)
  })

  it('combines filters and keeps preview last 6', () => {
    const entries = getMockAuditEntries()
    const filtered = filterMockAuditEntries(entries, {
      kindFilter: 'recovery',
      correlationQuery: 'beta',
    })
    assert.equal(filtered.length, 1)
    const preview = getRecentMockAuditPreview(entries, 6)
    assert.equal(preview.length, 3)
    assert.equal(preview[0].correlation_id, 'corr_alpha_force')
  })

  it('matches @tetherget/mock-audit-core filterAuditEntries', () => {
    const entries = getMockAuditEntries()
    const filters = { kindFilter: 'recovery', correlationQuery: 'beta' }
    const a = filterMockAuditEntries(entries, filters)
    const b = filterAuditEntries(entries, {
      kindFilter: filters.kindFilter ?? '',
      correlationQuery: filters.correlationQuery ?? '',
    })
    assert.deepEqual(
      a.map((e) => e.id),
      b.map((e) => e.id),
    )
  })
})
