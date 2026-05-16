import { ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH } from '../contracts/oneAiBridge.js'
import {
  ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY,
  STOCKPICK_READER_AUDIT_KINDS,
  STOCKPICK_READER_NOTIFICATION_KINDS,
} from '../../oneai/stockpick/stockPickReaderTypes.js'
import {
  importStockPickCandidateToQueue,
  mapStockPickDurationToSec,
  mapStockPickDurationToTimelineFormat,
  resetStockPickImportedForTests,
} from '../../oneai/stockpick/stockPickImporter.js'
import {
  loadStockPickCandidatesWithAudit,
  normalizeStockPickCandidate,
  readStockPickCandidatesFromStorage,
  resetStockPickReaderStorageForTests,
  setStockPickReaderStorageAdapter,
  writeStockPickCandidatesForTests,
} from '../../oneai/stockpick/stockPickReader.js'
import { getClipTimelineByClipId, resetClipTimelinesForTests } from '../../shorts/editor/clipTimelineStore.js'
import { CLIP_TIMELINE_FORMAT_MAX_SEC } from '../../shorts/editor/clipTimelineTypes.js'
import { runContentSafetyRules } from '../../shorts/safety/contentSafetyRules.js'
import { getContentSafetyReviewByClipId, resetContentSafetyReviewsForTests } from '../../shorts/safety/contentSafetyStore.js'
import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import { loadShortsQueue, resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { getShortsNotifications, resetShortsNotificationsForTests } from '../../shorts/shortsNotifications.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.stockpick-reader-flow'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runStockPickReaderFlowSuite() {
  const issues = []
  /** @type {Record<string, string>} */
  const mem = {}

  resetStockPickReaderStorageForTests()
  resetShortsQueueForTests()
  resetClipTimelinesForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  setStockPickReaderStorageAdapter({
    getItem: (k) => mem[k] ?? null,
    setItem: (k, v) => {
      mem[k] = v
    },
  })
  resetStockPickImportedForTests()

  if (ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY !== 'oneai.stockpick.shorts_candidates_v1') {
    issues.push(issue(`${SUITE_ID}.key`, 'Storage key mismatch', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.key`, ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY, 'PASS', SUITE_ID))
  }

  const empty = readStockPickCandidatesFromStorage()
  if (empty.candidates.length !== 0) {
    issues.push(issue(`${SUITE_ID}.empty`, 'Expected empty candidates', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.empty`, 'Empty state OK', 'PASS', SUITE_ID))
  }

  writeStockPickCandidatesForTests({
    lastGeneratedAt: '2026-05-15T00:00:00.000Z',
    candidates: [
      {
        id: 'sp_mock_30',
        title: 'Mock pick 30s',
        hookText: 'Top return scenario',
        caption: '시나리오 mock · 출처: OneAI',
        suggestedDuration: 'shorts_30',
        performanceSnapshot: { ticker: 'MOCK', returnPct: 12.5 },
        riskText: '투자 권유 아님 · 참고용 mock',
        reviewRequired: true,
        mockOnly: true,
      },
      {
        id: 'sp_mock_highlight',
        title: 'Mock pick 5m',
        hookText: 'Highlight reel',
        caption: '5분 하이라이트 mock',
        suggestedDuration: 'highlight_300',
        riskText: '도박 광고 금지 · platform policy mock',
        reviewRequired: true,
      },
      { bad: true },
      'not-an-object',
    ],
  })

  const loaded = loadStockPickCandidatesWithAudit({ notifyOnFound: false })
  if (loaded.candidates.length !== 2) {
    issues.push(
      issue(`${SUITE_ID}.parse`, `Expected 2 candidates; got ${loaded.candidates.length}`, 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(issue(`${SUITE_ID}.parse`, 'Valid candidates parsed', 'PASS', SUITE_ID))
  }

  if (loaded.malformedSkipped < 2) {
    issues.push(issue(`${SUITE_ID}.malformed`, 'Expected malformed rows skipped', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.malformed`, 'Malformed skip OK', 'PASS', SUITE_ID))
  }

  if (!normalizeStockPickCandidate({ id: 'x', title: 't', suggestedDuration: 'invalid' })) {
    issues.push(issue(`${SUITE_ID}.normalize`, 'normalize failed', 'FAIL', SUITE_ID))
  }

  const flagProbe = runContentSafetyRules({
    title: 'flags probe',
    caption: '100% 수익 무조건',
    transcript: '도박 광고',
    sourceType: 'market',
  })
  if (!flagProbe.flags.financial_advice_risk || !flagProbe.flags.platform_policy_risk) {
    issues.push(issue(`${SUITE_ID}.flags`, 'Safety flag engine check failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.flags`, 'financial_advice_risk + platform_policy_risk OK', 'PASS', SUITE_ID))
  }

  const candidate30 = loaded.candidates.find((c) => c.id === 'sp_mock_30')
  const candidateHl = loaded.candidates.find((c) => c.id === 'sp_mock_highlight')
  if (!candidate30 || !candidateHl) {
    issues.push(issue(`${SUITE_ID}.seed`, 'Missing seeded candidates', 'FAIL', SUITE_ID))
  } else {
    const r30 = importStockPickCandidateToQueue(candidate30)
    const rHl = importStockPickCandidateToQueue(candidateHl)

    if (r30.clip.detection_reason !== CLIP_DETECTION_REASONS.ONEAI_STOCK_PICK) {
      issues.push(issue(`${SUITE_ID}.reason`, 'detection_reason mismatch', 'FAIL', SUITE_ID))
    } else if (r30.clip.overlay_source !== 'oneai_broadcast') {
      issues.push(issue(`${SUITE_ID}.overlay`, 'overlay_source must be oneai_broadcast', 'FAIL', SUITE_ID))
    } else if (r30.clip.import_source !== 'oneai_stock_pick') {
      issues.push(issue(`${SUITE_ID}.source`, 'import_source mismatch', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.import`, 'Import to queue OK', 'PASS', SUITE_ID))
    }

    const review = getContentSafetyReviewByClipId(r30.clip.id)
    if (!review?.caption?.includes(candidate30.riskText)) {
      issues.push(issue(`${SUITE_ID}.safety.caption`, 'riskText missing from safety caption', 'FAIL', SUITE_ID))
    } else if (!review.transcript?.includes(candidate30.riskText)) {
      issues.push(issue(`${SUITE_ID}.safety.transcript`, 'riskText missing from transcript', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.safety`, `Safety review: ${review.verdict}`, 'PASS', SUITE_ID))
    }

    const tl30 = getClipTimelineByClipId(r30.clip.id)
    const tlHl = getClipTimelineByClipId(rHl.clip.id)
    if (tl30?.targetFormat !== mapStockPickDurationToTimelineFormat('shorts_30')) {
      issues.push(issue(`${SUITE_ID}.timeline.30`, 'shorts_30 timeline format mismatch', 'FAIL', SUITE_ID))
    } else if (tl30.outPointSec !== CLIP_TIMELINE_FORMAT_MAX_SEC.shorts_30) {
      issues.push(issue(`${SUITE_ID}.timeline.30.span`, 'shorts_30 outPoint mismatch', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.timeline.30`, 'shorts_30 timeline seed OK', 'PASS', SUITE_ID))
    }

    if (tlHl?.targetFormat !== 'highlight_300' || tlHl.outPointSec !== 300) {
      issues.push(issue(`${SUITE_ID}.timeline.300`, 'highlight_300 timeline seed mismatch', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.timeline.300`, 'highlight_300 timeline seed OK', 'PASS', SUITE_ID))
    }

    if (mapStockPickDurationToSec('shorts_60') !== 60) {
      issues.push(issue(`${SUITE_ID}.duration.map`, 'Duration map failed', 'FAIL', SUITE_ID))
    }
  }

  if (!loadShortsQueue().some((c) => c.stockpick_candidate_id === 'sp_mock_30')) {
    issues.push(issue(`${SUITE_ID}.queue`, 'Clip not in queue', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.queue`, 'Queue contains stock pick clip', 'PASS', SUITE_ID))
  }

  const auditKinds = getMockAuditEntries().map((e) => e.kind)
  for (const kind of STOCKPICK_READER_AUDIT_KINDS) {
    if (!auditKinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing audit ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
    }
  }

  const notifKinds = getShortsNotifications().map((n) => n.kind)
  for (const kind of ['stockpick.imported_to_queue', 'stockpick.safety_review_required']) {
    if (!notifKinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.notif.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.notif.${kind}`, kind, 'PASS', SUITE_ID))
    }
  }

  if (!STOCKPICK_READER_NOTIFICATION_KINDS.includes('stockpick.candidate.found')) {
    issues.push(issue(`${SUITE_ID}.notif.schema`, 'Notification kinds incomplete', 'FAIL', SUITE_ID))
  }

  if (ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH !== true) {
    issues.push(issue(`${SUITE_ID}.no_upload`, 'Auto publish must stay forbidden', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.no_upload`, 'No upload / no external API (mock-only)', 'PASS', SUITE_ID))
  }

  resetStockPickReaderStorageForTests()

  return buildSuite(SUITE_ID, 'OneAI stock pick reader flow (mock)', issues)
}
