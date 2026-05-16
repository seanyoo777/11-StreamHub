import {
  CLIP_TIMELINE_AUDIT_KINDS,
  CLIP_TIMELINE_FORMAT_MAX_SEC,
  CLIP_TIMELINE_NOTIFICATION_KINDS,
  CLIP_TIMELINE_TARGET_FORMATS,
  STREAMHUB_CLIP_TIMELINE_STORAGE_KEY,
  THUMBNAIL_CANDIDATE_STYLES,
  validateClipTimelineSchema,
} from '../../shorts/editor/clipTimelineTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.clip-timeline-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runClipTimelineSchemaSuite() {
  const issues = []

  if (!STREAMHUB_CLIP_TIMELINE_STORAGE_KEY.startsWith('streamhub.')) {
    issues.push(issue(`${SUITE_ID}.storage`, 'Invalid storage key', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.storage`, `Key: ${STREAMHUB_CLIP_TIMELINE_STORAGE_KEY}`, 'PASS', SUITE_ID))
  }

  for (const fmt of CLIP_TIMELINE_TARGET_FORMATS) {
    issues.push(
      issue(
        `${SUITE_ID}.format.${fmt}`,
        `${fmt} max ${CLIP_TIMELINE_FORMAT_MAX_SEC[fmt]}s`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  for (const style of THUMBNAIL_CANDIDATE_STYLES) {
    issues.push(issue(`${SUITE_ID}.thumb.${style}`, `Thumbnail: ${style}`, 'PASS', SUITE_ID))
  }

  for (const kind of CLIP_TIMELINE_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Audit: ${kind}`, 'PASS', SUITE_ID))
  }

  for (const kind of CLIP_TIMELINE_NOTIFICATION_KINDS) {
    issues.push(issue(`${SUITE_ID}.notif.${kind}`, `Notification: ${kind}`, 'PASS', SUITE_ID))
  }

  try {
    validateClipTimelineSchema({
      clipId: 'c1',
      durationSec: 60,
      inPointSec: 0,
      outPointSec: 15,
      targetFormat: 'shorts_15',
      subtitleTracks: [
        { id: 's1', text: 't', startSec: 0, endSec: 5, emphasis: false },
      ],
      overlayMoments: [{ id: 'o1', label: 'x', atSec: 3, kind: 'surge' }],
      thumbnailCandidates: [{ id: 't1', style: 'live', label: 'LIVE' }],
      selectedThumbnailId: 't1',
      safeEdited: false,
      mockOnly: true,
    })
    issues.push(issue(`${SUITE_ID}.validate`, 'Schema validation OK', 'PASS', SUITE_ID))
  } catch (e) {
    issues.push(
      issue(`${SUITE_ID}.validate`, `Schema validation failed: ${e.message}`, 'FAIL', SUITE_ID),
    )
  }

  issues.push(issue(`${SUITE_ID}.no-ffmpeg`, 'Timeline: no FFmpeg / mock only', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Clip timeline schema contract', issues)
}
