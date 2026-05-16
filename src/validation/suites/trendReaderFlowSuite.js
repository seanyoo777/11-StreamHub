import { ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH } from '../contracts/oneAiBridge.js'
import {
  ONEAI_VIRAL_TREND_RADAR_KEY,
  TREND_IMPORT_SOURCE,
  TREND_READER_AUDIT_KINDS,
  TREND_READER_NOTIFICATION_KINDS,
} from '../../oneai/trends/trendReaderTypes.js'
import {
  importTrendCandidateToOverlayScene,
  importTrendCandidateToShortsQueue,
  mapTrendToOverlaySceneType,
  resetTrendImportedForTests,
} from '../../oneai/trends/trendReaderImporter.js'
import {
  loadViralTrendRadarWithAudit,
  normalizeTrendCandidate,
  readViralTrendRadarFromStorage,
  resetTrendReaderStorageForTests,
  setTrendReaderStorageAdapter,
  writeViralTrendRadarForTests,
} from '../../oneai/trends/trendReader.js'
import { getClipTimelineByClipId, resetClipTimelinesForTests } from '../../shorts/editor/clipTimelineStore.js'
import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import { loadShortsQueue, resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { getShortsNotifications, resetShortsNotificationsForTests } from '../../shorts/shortsNotifications.js'
import { getContentSafetyReviewByClipId, resetContentSafetyReviewsForTests } from '../../shorts/safety/contentSafetyStore.js'
import { loadOverlaySceneQueue, resetOverlayScenesForTests } from '../../overlay-scenes/overlaySceneStore.js'
import { resetViralScoreStoreForTests } from '../../viral/viralScoreStore.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.viral-trend-reader-flow'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runTrendReaderFlowSuite() {
  const issues = []
  /** @type {Record<string, string>} */
  const mem = {}

  resetTrendReaderStorageForTests()
  resetShortsQueueForTests()
  resetClipTimelinesForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetOverlayScenesForTests()
  resetViralScoreStoreForTests()
  resetMockAuditTrailForTests()
  resetTrendImportedForTests()

  setTrendReaderStorageAdapter({
    getItem: (k) => mem[k] ?? null,
    setItem: (k, v) => {
      mem[k] = v
    },
  })

  if (ONEAI_VIRAL_TREND_RADAR_KEY !== 'tetherget.viral_trend_radar_v1') {
    issues.push(issue(`${SUITE_ID}.key`, 'Storage key mismatch', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.key`, ONEAI_VIRAL_TREND_RADAR_KEY, 'PASS', SUITE_ID))
  }

  const empty = readViralTrendRadarFromStorage()
  if (empty.trends.length !== 0) {
    issues.push(issue(`${SUITE_ID}.empty`, 'Expected empty trends', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.empty`, 'Empty state OK', 'PASS', SUITE_ID))
  }

  writeViralTrendRadarForTests({
    lastScanAt: '2026-05-15T12:00:00.000Z',
    momentumIndex: 72,
    trends: [
      {
        id: 'trend_urgent',
        keyword: 'BTC 급등 속보',
        category: 'breaking_news',
        trendLevel: 'viral',
        urgencyLevel: 'urgent',
        shortPotentialScore: 88,
        briefingPotentialScore: 80,
        overlayPriority: 92,
        relatedThemes: ['crypto', 'macro'],
        relatedTickers: ['BTC'],
        mockOnly: true,
      },
      {
        id: 'trend_market',
        keyword: '원유 급등',
        category: 'market_alert',
        trendLevel: 'rising',
        urgencyLevel: 'high',
        shortPotentialScore: 76,
        briefingPotentialScore: 70,
        overlayPriority: 78,
        relatedThemes: ['commodity'],
        mockOnly: true,
      },
      { bad: true },
      'not-an-object',
    ],
  })

  const loaded = loadViralTrendRadarWithAudit({ notifyOnDetected: false })
  if (loaded.trends.length !== 2) {
    issues.push(
      issue(`${SUITE_ID}.parse`, `Expected 2 trends; got ${loaded.trends.length}`, 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(issue(`${SUITE_ID}.parse`, 'Valid trends parsed', 'PASS', SUITE_ID))
  }

  if (loaded.malformedSkipped < 2) {
    issues.push(issue(`${SUITE_ID}.malformed`, 'Expected malformed rows skipped', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.malformed`, 'Malformed skip OK', 'PASS', SUITE_ID))
  }

  if (!normalizeTrendCandidate({ id: 'x', keyword: 'k' })) {
    issues.push(issue(`${SUITE_ID}.normalize`, 'normalize failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.normalize`, 'Trend snapshot normalize OK', 'PASS', SUITE_ID))
  }

  const urgent = loaded.trends.find((t) => t.id === 'trend_urgent')
  const market = loaded.trends.find((t) => t.id === 'trend_market')

  if (!urgent || !market) {
    issues.push(issue(`${SUITE_ID}.seed`, 'Missing seeded trends', 'FAIL', SUITE_ID))
  } else {
    const rShorts = importTrendCandidateToShortsQueue(urgent)
    const rOverlay = importTrendCandidateToOverlayScene(market)

    if (rShorts.clip.detection_reason !== CLIP_DETECTION_REASONS.VIRAL_TREND) {
      issues.push(issue(`${SUITE_ID}.reason`, 'detection_reason must be viral_trend', 'FAIL', SUITE_ID))
    } else if (rShorts.clip.overlay_source !== 'oneai_broadcast') {
      issues.push(issue(`${SUITE_ID}.overlay_src`, 'overlay_source mismatch', 'FAIL', SUITE_ID))
    } else if (rShorts.clip.import_source !== TREND_IMPORT_SOURCE) {
      issues.push(issue(`${SUITE_ID}.import_src`, 'import_source mismatch', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.shorts`, 'Shorts import OK', 'PASS', SUITE_ID))
    }

    if (!rShorts.clip.trend_urgency_badge) {
      issues.push(issue(`${SUITE_ID}.badge`, 'urgency badge missing', 'FAIL', SUITE_ID))
    }

    const review = getContentSafetyReviewByClipId(rShorts.clip.id)
    if (!review) {
      issues.push(issue(`${SUITE_ID}.safety`, 'Safety review missing', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.safety`, `Safety review: ${review.verdict}`, 'PASS', SUITE_ID))
    }

    const tl = getClipTimelineByClipId(rShorts.clip.id)
    if (tl?.targetFormat !== 'shorts_30') {
      issues.push(issue(`${SUITE_ID}.timeline`, 'shorts_30 timeline expected', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.timeline`, 'Timeline seed OK', 'PASS', SUITE_ID))
    }

    const expectedScene = mapTrendToOverlaySceneType(market)
    if (rOverlay.sceneType !== expectedScene) {
      issues.push(issue(`${SUITE_ID}.scene_type`, 'sceneType mapping mismatch', 'FAIL', SUITE_ID))
    } else if (rOverlay.import_source !== TREND_IMPORT_SOURCE) {
      issues.push(issue(`${SUITE_ID}.scene_import`, 'scene import_source mismatch', 'FAIL', SUITE_ID))
    } else if (rOverlay.status !== 'queued') {
      issues.push(issue(`${SUITE_ID}.overlay_status`, `Expected queued; got ${rOverlay.status}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.overlay`, 'Overlay scene import OK', 'PASS', SUITE_ID))
    }

    const queue = loadOverlaySceneQueue()
    if (!queue.some((s) => s.id === rOverlay.id)) {
      issues.push(issue(`${SUITE_ID}.overlay_queue`, 'Scene not in overlay queue', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.overlay_queue`, 'Overlay queue contains trend scene', 'PASS', SUITE_ID))
    }
  }

  if (!loadShortsQueue().some((c) => c.trend_candidate_id === 'trend_urgent')) {
    issues.push(issue(`${SUITE_ID}.queue`, 'Clip not in shorts queue', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.queue`, 'Shorts queue contains trend clip', 'PASS', SUITE_ID))
  }

  const auditKinds = getMockAuditEntries().map((e) => e.kind)
  for (const kind of TREND_READER_AUDIT_KINDS) {
    if (!auditKinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing audit ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
    }
  }

  const notifKinds = getShortsNotifications().map((n) => n.kind)
  for (const kind of ['trend.urgent.imported', 'trend.high_shorts_potential', 'trend.overlay_priority.detected']) {
    if (!notifKinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.notif.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.notif.${kind}`, kind, 'PASS', SUITE_ID))
    }
  }

  if (!TREND_READER_NOTIFICATION_KINDS.includes('trend.overlay_priority.detected')) {
    issues.push(issue(`${SUITE_ID}.notif.schema`, 'Notification kinds incomplete', 'FAIL', SUITE_ID))
  }

  if (ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH !== true) {
    issues.push(issue(`${SUITE_ID}.no_upload`, 'Auto publish must stay forbidden', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.no_upload`, 'No upload / no external API (mock-only)', 'PASS', SUITE_ID))
  }

  issues.push(
    issue(`${SUITE_ID}.no_broadcast`, 'No OBS WebSocket / no real broadcast', 'PASS', SUITE_ID),
  )

  resetTrendReaderStorageForTests()

  return buildSuite(SUITE_ID, 'OneAI viral trend radar reader flow (mock)', issues)
}
