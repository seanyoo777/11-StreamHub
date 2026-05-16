import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { runRealtimeSchemaSuite } from '../src/validation/suites/realtimeSchemaSuite.js'

describe('runRealtimeSchemaSuite', () => {
  it('passes contract.realtime-schema', () => {
    const suite = runRealtimeSchemaSuite()
    assert.equal(suite.id, 'contract.realtime-schema')
    assert.equal(suite.status, 'PASS')
    assert.ok(suite.issues.some((i) => i.id.includes('channel')))
    assert.ok(suite.issues.some((i) => i.id.includes('error-event')))
  })
})
