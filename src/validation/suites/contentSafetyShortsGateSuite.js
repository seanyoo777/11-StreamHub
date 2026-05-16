import { detectMockClip } from '../../shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import {
  approveContentSafetyAfterReviewMock,
  getShortsUploadGuardState,
} from '../../shorts/safety/contentSafetyReview.js'
import { resetContentSafetyReviewsForTests } from '../../shorts/safety/contentSafetyStore.js'
import {
  approveShortsClipMock,
  startShortsClipReview,
} from '../../shorts/shortsQueueOps.js'
import { resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { resetShortsNotificationsForTests } from '../../shorts/shortsNotifications.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.content-safety-shorts-gate'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runContentSafetyShortsGateSuite() {
  const issues = []
  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  const safeClip = detectMockClip({
    reason: CLIP_DETECTION_REASONS.BJ_REACTION,
    contentOverrides: { caption: 'Fun reaction · 출처: mock' },
  })
  const safeGuard = getShortsUploadGuardState(safeClip.id)
  if (!safeGuard.review || safeGuard.review.verdict !== 'pass') {
    issues.push(issue(`${SUITE_ID}.auto-review`, 'Missing pass safety review', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.auto-review`, 'Auto safety review on queue OK', 'PASS', SUITE_ID))
  }

  startShortsClipReview(safeClip.id)
  const approved = approveShortsClipMock(safeClip.id)
  if (approved?.status !== 'approved_mock') {
    issues.push(issue(`${SUITE_ID}.approve-pass`, 'Pass clip approve failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.approve-pass`, 'Pass clip approved_mock OK', 'PASS', SUITE_ID))
  }

  const riskyClip = detectMockClip({
    reason: CLIP_DETECTION_REASONS.HIGH_PNL,
    contentOverrides: {
      caption: '100% 수익 무조건 확정',
      sourceType: 'market',
    },
  })
  const riskyGuard = getShortsUploadGuardState(riskyClip.id)
  if (riskyGuard.canPrepareUpload) {
    issues.push(issue(`${SUITE_ID}.gate-risky`, 'Risky clip should block approve', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.gate-risky`, `Gate: ${riskyGuard.reason}`, 'PASS', SUITE_ID))
  }

  try {
    startShortsClipReview(riskyClip.id)
    approveShortsClipMock(riskyClip.id)
    issues.push(issue(`${SUITE_ID}.gate-throw`, 'Approve should throw when gated', 'FAIL', SUITE_ID))
  } catch {
    issues.push(issue(`${SUITE_ID}.gate-throw`, 'Approve blocked without operator OK', 'PASS', SUITE_ID))
  }

  const reviewClip = detectMockClip({
    reason: CLIP_DETECTION_REASONS.AI_BREAKING_ALERT,
    contentOverrides: {
      caption: 'Breaking: 100% 수익 hype',
      sourceType: 'news',
    },
  })
  approveContentSafetyAfterReviewMock(reviewClip.id)
  startShortsClipReview(reviewClip.id)
  const afterReview = approveShortsClipMock(reviewClip.id)
  if (afterReview?.status !== 'approved_mock') {
    issues.push(issue(`${SUITE_ID}.operator`, 'Operator safety approve path failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.operator`, 'Operator review + clip approve OK', 'PASS', SUITE_ID))
  }

  const kinds = getMockAuditEntries().map((e) => e.kind)
  for (const kind of [
    'content.safety.reviewed',
    'content.safety.approved_after_review',
  ]) {
    if (!kinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `${kind} OK`, 'PASS', SUITE_ID))
    }
  }

  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  return buildSuite(SUITE_ID, 'Content safety shorts upload guard', issues)
}
