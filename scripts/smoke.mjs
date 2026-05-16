#!/usr/bin/env node
/**
 * StreamHub contract smoke — no network, mock-only validators.
 */
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'
import { resetMockAuditTrailForTests } from '../src/validation/mockAuditTrail.js'

resetMockAuditTrailForTests()

const result = runStreamHubSelfTests({
  mockResync: {
    transportState: 'TRANSPORT_CONNECTED',
    appSynced: true,
    lastErrorCode: 'SH_STREAM_RECONNECTING',
  },
})

const failIssues = result.issues.filter((i) => i.status === 'FAIL')

console.log('[streamhub smoke] MOCK ONLY')
console.log(`  overall: ${result.overall}`)
console.log(`  suites: ${result.suites.length}`)
console.log(`  pass/warn/fail issues: ${result.passCount}/${result.warnCount}/${result.issueCount}`)
console.log(`  lastCheckedAtMs: ${result.lastCheckedAtMs}`)

for (const suite of result.suites) {
  console.log(`  - ${suite.id}: ${suite.status}`)
}

if (failIssues.length > 0) {
  console.error('[streamhub smoke] FAIL issues:')
  for (const i of failIssues) {
    console.error(`  - ${i.id}: ${i.message}`)
  }
  process.exit(1)
}

if (result.overall === 'FAIL') {
  console.error('[streamhub smoke] overall FAIL')
  process.exit(1)
}

const expectedSuiteIds = [
  'contract.route-ia',
  'contract.oneai-broadcast-bridge',
  'contract.shorts-queue-schema',
  'contract.content-safety-schema',
  'mock.content-safety-engine',
  'mock.content-safety-shorts-gate',
  'mock.auto-clip-detector',
  'mock.shorts-operator-flow',
  'contract.clip-timeline-schema',
  'mock.clip-timeline-editor',
  'contract.channel-watcher-schema',
  'contract.trend-watcher-schema',
  'mock.content-factory-flow',
  'mock.stockpick-reader-flow',
  'contract.viral-score-schema',
  'mock.viral-score-engine',
  'contract.overlay-scene-schema',
  'mock.overlay-scene-manager',
  'contract.viral-trend-reader-schema',
  'mock.viral-trend-reader-flow',
  'contract.overlay-event-layer-schema',
  'mock.overlay-event-layer',
  'contract.overlay-preset-schema',
  'mock.overlay-preset-manager',
  'contract.admin-ia',
  'contract.room-session',
  'contract.chat-seq',
  'contract.error-codes',
  'contract.recovery-resync',
  'contract.realtime-schema',
  'feature-flags',
  'audit.append-only',
  'mock.admin.flow',
  'mock.admin.force-end',
  'mock.scenario-toggle',
]
for (const id of expectedSuiteIds) {
  if (!result.suites.some((s) => s.id === id)) {
    console.error(`[streamhub smoke] missing suite: ${id}`)
    process.exit(1)
  }
}

console.log('[streamhub smoke] PASS')
process.exit(0)
