import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { runAdminMockFlowSuite } from '../src/validation/suites/adminMockFlowSuite.js'
import { resetMockAuditTrailForTests } from '../src/validation/mockAuditTrail.js'
import { resetMockReportQueueForTests } from '../src/validation/mockAdminReportQueue.js'

describe('runAdminMockFlowSuite', () => {
  beforeEach(() => {
    resetMockAuditTrailForTests()
    resetMockReportQueueForTests()
  })

  it('passes mock.admin.flow with report queue', () => {
    const suite = runAdminMockFlowSuite()
    assert.equal(suite.id, 'mock.admin.flow')
    assert.equal(suite.status, 'PASS')
    assert.ok(suite.issues.some((i) => i.id.includes('action')))
  })
})
