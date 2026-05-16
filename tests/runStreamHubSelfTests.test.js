import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'
import {
  getMockAuditEntries,
  resetMockAuditTrailForTests,
  tryDeleteMockAuditEntry,
} from '../src/validation/mockAuditTrail.js'

describe('runStreamHubSelfTests', () => {
  beforeEach(() => {
    resetMockAuditTrailForTests()
  })

  it('returns PASS with mock-only flag', () => {
    const result = runStreamHubSelfTests()
    assert.equal(result.mockOnly, true)
    assert.ok(['PASS', 'WARN'].includes(result.overall))
    assert.ok(result.suites.length >= 12)
    assert.ok(result.suites.some((s) => s.id === 'contract.realtime-schema'))
    assert.ok(result.suites.some((s) => s.id === 'contract.oneai-broadcast-bridge'))
    assert.ok(result.suites.some((s) => s.id === 'mock.admin.flow'))
    assert.ok(result.lastCheckedAtMs > 0)
  })

  it('records append-only audit entries', () => {
    runStreamHubSelfTests()
    const entries = getMockAuditEntries()
    assert.ok(entries.length >= 2)
    const kinds = entries.map((e) => e.kind)
    assert.ok(kinds.includes('admin.streamhub.self_test_run'))
    assert.ok(kinds.includes('admin.streamhub.recovery_resync_check'))
    assert.equal(tryDeleteMockAuditEntry(), false)
  })

  it('fails feature flags when MOCK_ONLY is false', () => {
    const result = runStreamHubSelfTests({
      featureFlagOverrides: { VITE_STREAMHUB_MOCK_ONLY: false },
    })
    const flagSuite = result.suites.find((s) => s.id === 'feature-flags')
    assert.equal(flagSuite?.status, 'FAIL')
  })
})
