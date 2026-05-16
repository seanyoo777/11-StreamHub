import { detectMockClip, isValidClipDetectionReason } from '../../shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import {
  buildOneAiBroadcastOverlayPayload,
  buildStreamHubOverlayPayload,
  buildTournamentWinnerOverlayPayload,
} from '../../shorts/contracts/overlayBridge.js'
import { getShortsNotifications, resetShortsNotificationsForTests } from '../../shorts/shortsNotifications.js'
import {
  getContentSafetyReviewByClipId,
  resetContentSafetyReviewsForTests,
} from '../../shorts/safety/contentSafetyStore.js'
import { loadShortsQueue, resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.auto-clip-detector'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runAutoClipDetectorSuite() {
  const issues = []
  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  if (!isValidClipDetectionReason(CLIP_DETECTION_REASONS.SURGE_SPIKE)) {
    issues.push(issue(`${SUITE_ID}.reason`, 'Reason validator failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.reason`, 'Detection reason validator OK', 'PASS', SUITE_ID))
  }

  const clip = detectMockClip({
    reason: CLIP_DETECTION_REASONS.BJ_REACTION,
    room_id: 'room_detector_test',
  })

  const queue = loadShortsQueue()
  if (!queue.some((c) => c.id === clip.id)) {
    issues.push(issue(`${SUITE_ID}.queue`, 'Clip not in queue store', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.queue`, 'Clip appended to queue', 'PASS', SUITE_ID))
  }

  if (clip.status !== 'queued') {
    issues.push(issue(`${SUITE_ID}.status`, 'Initial status must be queued', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.status`, 'Initial status queued', 'PASS', SUITE_ID))
  }

  const notifs = getShortsNotifications()
  if (!notifs.some((n) => n.kind === 'shorts.clip.queued' && n.clip_id === clip.id)) {
    issues.push(issue(`${SUITE_ID}.notif`, 'Missing shorts.clip.queued notification', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif`, 'Notification appended', 'PASS', SUITE_ID))
  }

  const audits = getMockAuditEntries().map((e) => e.kind)
  if (!audits.includes('clip.detected')) {
    issues.push(issue(`${SUITE_ID}.audit`, 'Missing clip.detected audit', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.audit`, 'clip.detected audit OK', 'PASS', SUITE_ID))
  }

  const safety = getContentSafetyReviewByClipId(clip.id)
  if (!safety || !audits.includes('content.safety.reviewed')) {
    issues.push(issue(`${SUITE_ID}.safety`, 'Missing auto content safety review', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.safety`, 'Content safety review on detect OK', 'PASS', SUITE_ID))
  }

  const shPayload = buildStreamHubOverlayPayload(clip)
  const oneAiPayload = buildOneAiBroadcastOverlayPayload(clip)
  const winnerPayload = buildTournamentWinnerOverlayPayload(clip)

  if (!shPayload.mock_only || !oneAiPayload.mock_only || !winnerPayload.mock_only) {
    issues.push(issue(`${SUITE_ID}.overlay`, 'Overlay payloads must be mock_only', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.overlay`, 'Overlay payload builders OK', 'PASS', SUITE_ID))
  }

  issues.push(
    issue(`${SUITE_ID}.no-ffmpeg`, 'No FFmpeg / video analysis (mock only)', 'PASS', SUITE_ID),
  )

  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  return buildSuite(SUITE_ID, 'Auto clip detector (mock)', issues)
}
