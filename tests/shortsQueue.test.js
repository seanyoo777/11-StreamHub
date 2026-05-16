import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { detectMockClip } from '../src/shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../src/shorts/contracts/clipDetection.js'
import {
  buildOneAiBroadcastOverlayPayload,
  buildStreamHubOverlayPayload,
  buildTournamentWinnerOverlayPayload,
} from '../src/shorts/contracts/overlayBridge.js'
import { STREAMHUB_SHORTS_QUEUE_STORAGE_KEY } from '../src/shorts/contracts/shortsQueueSchema.js'
import {
  loadShortsQueue,
  resetShortsQueueForTests,
  setShortsQueueStorageAdapter,
} from '../src/shorts/shortsQueueStore.js'
import {
  approveShortsClipMock,
  startShortsClipReview,
} from '../src/shorts/shortsQueueOps.js'
import { getShortsNotifications, resetShortsNotificationsForTests } from '../src/shorts/shortsNotifications.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../src/validation/mockAuditTrail.js'
import { analyzeContentSafetyMock } from '../src/shorts/safety/contentSafetyRules.js'
import { resetContentSafetyReviewsForTests } from '../src/shorts/safety/contentSafetyStore.js'
import { runContentSafetySchemaSuite } from '../src/validation/suites/contentSafetySchemaSuite.js'
import { runContentSafetyShortsGateSuite } from '../src/validation/suites/contentSafetyShortsGateSuite.js'
import { runMockContentSafetyEngineSuite } from '../src/validation/suites/mockContentSafetyEngineSuite.js'
import { runShortsQueueSchemaSuite } from '../src/validation/suites/shortsQueueSchemaSuite.js'
import { runAutoClipDetectorSuite } from '../src/validation/suites/autoClipDetectorSuite.js'
import { runShortsOperatorFlowSuite } from '../src/validation/suites/shortsOperatorFlowSuite.js'
import { resolveAdminPageId } from '../src/admin/resolveAdminPage.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'

describe('shorts queue store', () => {
  /** @type {Record<string, string>} */
  let mem = {}

  beforeEach(() => {
    resetShortsQueueForTests()
    resetContentSafetyReviewsForTests()
    resetShortsNotificationsForTests()
    resetMockAuditTrailForTests()
    mem = {}
    setShortsQueueStorageAdapter({
      getItem: (k) => mem[k] ?? null,
      setItem: (k, v) => {
        mem[k] = v
      },
    })
  })

  it('persists clips to adapter storage', () => {
    detectMockClip({ reason: CLIP_DETECTION_REASONS.SURGE_SPIKE })
    const queue = loadShortsQueue()
    assert.equal(queue.length, 1)
    assert.equal(queue[0].status, 'queued')
    assert.ok(mem[STREAMHUB_SHORTS_QUEUE_STORAGE_KEY])
  })

  it('runs operator review and approve flow', () => {
    const clip = detectMockClip({
      reason: CLIP_DETECTION_REASONS.HIGH_PNL,
      contentOverrides: { caption: 'PnL recap · 출처: mock' },
    })
    startShortsClipReview(clip.id)
    const approved = approveShortsClipMock(clip.id)
    assert.equal(approved?.status, 'approved_mock')
    assert.ok(getShortsNotifications().some((n) => n.kind === 'shorts.clip.approved_mock'))
    assert.ok(getMockAuditEntries().some((e) => e.kind === 'clip.approved.mock'))
  })
})

describe('overlay payloads', () => {
  it('builds streamhub, oneai, and tournament payloads', () => {
    const clip = {
      id: 'c1',
      status: 'queued',
      detection_reason: CLIP_DETECTION_REASONS.LEAGUE_CHAMPION,
      occurred_at_ms: Date.now(),
      room_id: 'r1',
      mock_duration_sec: 15,
      overlay_source: 'tournament_winner',
      overlay_route: '?overlay=winner',
      overlay_payload: {},
      correlation_id: 'corr1',
      preview_title: 'Test',
    }
    assert.equal(buildStreamHubOverlayPayload(clip).platform, 'streamhub')
    assert.equal(buildOneAiBroadcastOverlayPayload(clip).platform, 'oneai')
    assert.ok(buildTournamentWinnerOverlayPayload(clip).winner_handle)
  })
})

describe('admin shorts route', () => {
  it('resolves /admin/shorts', () => {
    assert.equal(resolveAdminPageId('/admin/shorts'), 'shorts')
  })
})

describe('content safety mock engine', () => {
  it('flags financial hype phrases', () => {
    const r = analyzeContentSafetyMock({
      title: 't',
      caption: '100% 수익 무조건',
      transcript: '',
      sourceType: 'market',
    })
    assert.ok(r.flags.financial_advice_risk)
    assert.ok(r.riskScore >= 30)
  })
})

describe('shorts self-test suites', () => {
  beforeEach(() => {
    resetShortsQueueForTests()
    resetContentSafetyReviewsForTests()
    resetShortsNotificationsForTests()
    resetMockAuditTrailForTests()
  })

  it('schema and detector suites pass', () => {
    assert.equal(runShortsQueueSchemaSuite().status, 'PASS')
    assert.equal(runContentSafetySchemaSuite().status, 'PASS')
    assert.equal(runMockContentSafetyEngineSuite().status, 'PASS')
    assert.equal(runContentSafetyShortsGateSuite().status, 'PASS')
    assert.equal(runAutoClipDetectorSuite().status, 'PASS')
    assert.equal(runShortsOperatorFlowSuite().status, 'PASS')
  })

  it('runStreamHubSelfTests includes shorts suites', () => {
    const result = runStreamHubSelfTests()
    assert.equal(result.suites.length, 37)
    assert.ok(result.suites.some((s) => s.id === 'mock.auto-clip-detector'))
  })
})
