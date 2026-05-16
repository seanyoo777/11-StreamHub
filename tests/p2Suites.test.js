import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { runRoomSessionContractSuite } from '../src/validation/suites/roomSessionContractSuite.js'
import { runChatSeqContractSuite } from '../src/validation/suites/chatSeqContractSuite.js'
import { runAdminForceEndSuite } from '../src/validation/suites/adminForceEndSuite.js'
import { runAdminIaRouteSuite } from '../src/validation/suites/adminIaRouteSuite.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'
import { resetMockAuditTrailForTests } from '../src/validation/mockAuditTrail.js'
import { resetMockRoomSessionForTests } from '../src/validation/mockRoomSession.js'
import { resetMockForceEndFixtureForTests } from '../src/validation/mockForceEnd.js'
import { getRoomSessionDiagnosticsViewModel } from '../src/dev/viewModels.js'
import { applyMockResyncToRoomSession } from '../src/validation/mockRoomSession.js'
import { STREAMHUB_ADMIN_ROUTES } from '../src/validation/contracts/adminRoutes.js'

describe('P2 contract suites', () => {
  beforeEach(() => {
    resetMockAuditTrailForTests()
    resetMockRoomSessionForTests()
    resetMockForceEndFixtureForTests()
  })

  it('contract.room-session passes', () => {
    const suite = runRoomSessionContractSuite()
    assert.equal(suite.id, 'contract.room-session')
    assert.equal(suite.status, 'PASS')
  })

  it('contract.chat-seq passes', () => {
    const suite = runChatSeqContractSuite()
    assert.equal(suite.id, 'contract.chat-seq')
    assert.equal(suite.status, 'PASS')
  })

  it('mock.admin.force-end passes', () => {
    const suite = runAdminForceEndSuite()
    assert.equal(suite.id, 'mock.admin.force-end')
    assert.equal(suite.status, 'PASS')
  })

  it('contract.admin-ia validates SCREEN_FLOW admin paths', () => {
    const suite = runAdminIaRouteSuite()
    assert.equal(suite.status, 'PASS')
    assert.equal(STREAMHUB_ADMIN_ROUTES.reports, '/admin/reports')
  })
})

describe('room session diagnostics view model', () => {
  beforeEach(() => {
    resetMockRoomSessionForTests()
  })

  it('exposes mock room/session fields', () => {
    const session = applyMockResyncToRoomSession({
      transportState: 'TRANSPORT_CONNECTED',
      appSynced: false,
      lastErrorCode: 'SH_STREAM_RECONNECTING',
    })
    const vm = getRoomSessionDiagnosticsViewModel(session)
    assert.equal(vm.mockOnlyBadge, 'MOCK ONLY')
    assert.equal(vm.live_state, 'RECONNECTING')
    assert.ok(vm.channel_id.startsWith('stream_chat:'))
    assert.equal(vm.last_chat_seq, 42)
    assert.equal(vm.recovery_label, 'RESYNC_REQUIRED')
  })
})

describe('runStreamHubSelfTests P2', () => {
  beforeEach(() => {
    resetMockAuditTrailForTests()
    resetMockRoomSessionForTests()
    resetMockForceEndFixtureForTests()
  })

  it('includes 13 suites', () => {
    const result = runStreamHubSelfTests()
    assert.equal(result.suites.length, 13)
    const ids = result.suites.map((s) => s.id)
    assert.ok(ids.includes('contract.room-session'))
    assert.ok(ids.includes('contract.chat-seq'))
    assert.ok(ids.includes('mock.admin.force-end'))
    assert.ok(ids.includes('contract.admin-ia'))
    assert.ok(ids.includes('contract.oneai-broadcast-bridge'))
  })
})
