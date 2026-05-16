import { detectMockClip } from '../../shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import {
  applyTargetFormatToTimeline,
  buildExportPreviewJson,
  createClipTimelineForClip,
  exportClipTimelineDraftMock,
  openClipTimelineMock,
  saveClipTimelineMock,
  selectClipTimelineThumbnailMock,
} from '../../shorts/editor/clipTimelineHelpers.js'
import { resetClipTimelinesForTests } from '../../shorts/editor/clipTimelineStore.js'
import { resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { resetShortsNotificationsForTests, getShortsNotifications } from '../../shorts/shortsNotifications.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.clip-timeline-editor'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runClipTimelineEditorSuite() {
  const issues = []
  resetShortsQueueForTests()
  resetClipTimelinesForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  const clip = detectMockClip({
    reason: CLIP_DETECTION_REASONS.SURGE_SPIKE,
    contentOverrides: { caption: 'Surge recap · 출처: mock' },
  })

  const opened = openClipTimelineMock(clip.id, clip)
  if (!opened.overlayMoments.some((m) => m.aiRecommended)) {
    issues.push(issue(`${SUITE_ID}.ai-seed`, 'Missing AI overlay seeds', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.ai-seed`, 'AI overlay moments seeded', 'PASS', SUITE_ID))
  }

  if (opened.subtitleTracks.length < 2) {
    issues.push(issue(`${SUITE_ID}.subtitles`, 'Missing mock subtitle tracks', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.subtitles`, 'Subtitle tracks OK', 'PASS', SUITE_ID))
  }

  selectClipTimelineThumbnailMock(opened, opened.thumbnailCandidates[0].id, clip.correlation_id)
  saveClipTimelineMock(opened, clip.correlation_id)

  const preview = exportClipTimelineDraftMock(opened, clip.correlation_id, 'shorts')
  if (!preview.noFfmpeg || !preview.noRealUpload || !preview.mockOnly) {
    issues.push(issue(`${SUITE_ID}.export`, 'Export preview missing mock flags', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.export`, 'Export preview JSON OK', 'PASS', SUITE_ID))
  }

  const highlightPreview = buildExportPreviewJson(
    createClipTimelineForClip(clip),
    'highlight',
  )
  if (highlightPreview.exportKind !== 'highlight') {
    issues.push(issue(`${SUITE_ID}.highlight`, 'Highlight export kind failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.highlight`, 'Highlight preview OK', 'PASS', SUITE_ID))
  }

  const kinds = getMockAuditEntries().map((e) => e.kind)
  for (const kind of [
    'clip.timeline.opened',
    'clip.timeline.saved',
    'clip.timeline.exported',
    'clip.timeline.thumbnail.selected',
  ]) {
    if (!kinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `${kind} OK`, 'PASS', SUITE_ID))
    }
  }

  const notifKinds = getShortsNotifications().map((n) => n.kind)
  if (!notifKinds.includes('clip.timeline.review_required')) {
    issues.push(issue(`${SUITE_ID}.notif.review`, 'Missing review_required notification', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif.review`, 'review_required notification OK', 'PASS', SUITE_ID))
  }

  const highlightTimeline = applyTargetFormatToTimeline(createClipTimelineForClip(clip), 'highlight_300')
  highlightTimeline.durationSec = 300
  highlightTimeline.inPointSec = 0
  highlightTimeline.outPointSec = 300
  exportClipTimelineDraftMock(highlightTimeline, clip.correlation_id, 'highlight')
  if (!getShortsNotifications().some((n) => n.kind === 'clip.highlight.ready')) {
    issues.push(issue(`${SUITE_ID}.notif.highlight`, 'Missing highlight.ready', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif.highlight`, 'highlight.ready OK', 'PASS', SUITE_ID))
  }

  resetShortsQueueForTests()
  resetClipTimelinesForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  return buildSuite(SUITE_ID, 'Clip timeline editor mock flow', issues)
}
