import { buildSelfTestResult } from '@tetherget/self-test-core'
import {
  appendMockAuditEntry,
  getMockAuditEntries,
  tryDeleteMockAuditEntry,
} from './mockAuditTrail.js'
import { applyMockResyncToRoomSession } from './mockRoomSession.js'
import { runAdminForceEndSuite } from './suites/adminForceEndSuite.js'
import { runAdminIaRouteSuite } from './suites/adminIaRouteSuite.js'
import { runAdminMockFlowSuite } from './suites/adminMockFlowSuite.js'
import { runAuditAppendOnlySuite } from './suites/auditAppendOnlySuite.js'
import { runChatSeqContractSuite } from './suites/chatSeqContractSuite.js'
import { runFeatureFlagSuite } from './suites/featureFlagSuite.js'
import { runRealtimeSchemaSuite } from './suites/realtimeSchemaSuite.js'
import { runRecoveryResyncContractSuite } from './suites/recoveryResyncContractSuite.js'
import { runRoomSessionContractSuite } from './suites/roomSessionContractSuite.js'
import { runRouteContractSuite } from './suites/routeContractSuite.js'
import { runOneAiBroadcastBridgeSuite } from './suites/oneAiBroadcastBridgeSuite.js'
import { runScenarioToggleSuite } from './suites/scenarioToggleSuite.js'
import { runStreamhubErrorContractSuite } from './suites/streamhubErrorContractSuite.js'

/**
 * Pure mock-first self-test runner (no network, no WebSocket).
 * @param {{ featureFlagOverrides?: Record<string, unknown>; mockResync?: { transportState?: string; appSynced?: boolean; lastErrorCode?: string | null } }} [options]
 * @returns {import('./types.js').SelfTestResult}
 */
export function runStreamHubSelfTests(options = {}) {
  const lastCheckedAtMs = Date.now()
  const correlationId = `self_test_${lastCheckedAtMs}`

  applyMockResyncToRoomSession(options.mockResync ?? {})

  const suites = [
    runRouteContractSuite(),
    runOneAiBroadcastBridgeSuite(),
    runAdminIaRouteSuite(),
    runRoomSessionContractSuite(),
    runChatSeqContractSuite(),
    runStreamhubErrorContractSuite(),
    runRecoveryResyncContractSuite(options.mockResync),
    runRealtimeSchemaSuite(),
    runFeatureFlagSuite(options.featureFlagOverrides),
    runAuditAppendOnlySuite({
      getEntries: () => [...getMockAuditEntries()],
      append: (entry) =>
        appendMockAuditEntry({
          kind: entry.kind,
          actor_admin_id: entry.actor_admin_id,
          correlation_id: entry.correlation_id,
          payload: entry.payload,
          server_ms: entry.server_ms,
        }),
      tryDelete: tryDeleteMockAuditEntry,
    }),
    runAdminMockFlowSuite(),
    runAdminForceEndSuite(),
    runScenarioToggleSuite(),
  ]

  const result = buildSelfTestResult({
    suites,
    mockOnly: true,
    lastCheckedAtMs,
  })

  appendMockAuditEntry({
    kind: 'admin.streamhub.self_test_run',
    actor_admin_id: 'mock_admin_self_test',
    correlation_id: correlationId,
    payload: {
      suiteIds: suites.map((s) => s.id),
      overall: result.overall,
      mockOnly: true,
    },
  })

  appendMockAuditEntry({
    kind: 'admin.streamhub.recovery_resync_check',
    actor_admin_id: 'mock_admin_self_test',
    correlation_id: `${correlationId}_resync`,
    payload: {
      transportState: options.mockResync?.transportState ?? 'TRANSPORT_CONNECTED',
      appSynced: options.mockResync?.appSynced ?? true,
      mockOnly: true,
    },
  })

  applyMockResyncToRoomSession(options.mockResync ?? {})

  return result
}
