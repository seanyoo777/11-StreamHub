import { detectMockClip } from '../../shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import {
  approveShortsClipMock,
  rejectShortsClipMock,
  startShortsClipReview,
} from '../../shorts/shortsQueueOps.js'
import { getShortsNotifications, resetShortsNotificationsForTests } from '../../shorts/shortsNotifications.js'
import { resetContentSafetyReviewsForTests } from '../../shorts/safety/contentSafetyStore.js'
import { resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.shorts-operator-flow'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runShortsOperatorFlowSuite() {
  const issues = []
  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  const clip = detectMockClip({
    reason: CLIP_DETECTION_REASONS.HIGH_PNL,
    contentOverrides: { caption: 'Highlight · 출처: mock feed' },
  })

  const reviewing = startShortsClipReview(clip.id)
  if (reviewing?.status !== 'reviewing') {
    issues.push(issue(`${SUITE_ID}.review`, 'Review transition failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.review`, 'reviewing status OK', 'PASS', SUITE_ID))
  }

  const approved = approveShortsClipMock(clip.id)
  if (approved?.status !== 'approved_mock') {
    issues.push(issue(`${SUITE_ID}.approve`, 'Approve transition failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.approve`, 'approved_mock OK', 'PASS', SUITE_ID))
  }

  const clip2 = detectMockClip({
    reason: CLIP_DETECTION_REASONS.PLUNGE_DROP,
    contentOverrides: { caption: 'Drop recap · 출처: mock' },
  })
  startShortsClipReview(clip2.id)
  const rejected = rejectShortsClipMock(clip2.id)
  if (rejected?.status !== 'rejected_mock') {
    issues.push(issue(`${SUITE_ID}.reject`, 'Reject transition failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.reject`, 'rejected_mock OK', 'PASS', SUITE_ID))
  }

  const kinds = getMockAuditEntries().map((e) => e.kind)
  const required = ['clip.review.started', 'clip.approved.mock', 'clip.rejected.mock']
  for (const kind of required) {
    if (!kinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `${kind} recorded`, 'PASS', SUITE_ID))
    }
  }

  if (!getShortsNotifications().some((n) => n.kind === 'shorts.clip.approved_mock')) {
    issues.push(issue(`${SUITE_ID}.notif`, 'Missing approved notification', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif`, 'Approval notification OK', 'PASS', SUITE_ID))
  }

  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  return buildSuite(SUITE_ID, 'Shorts operator approval flow (mock)', issues)
}
