import { appendShortsNotification } from '../shortsNotifications.js'
import { CLIP_DETECTION_REASONS } from '../contracts/clipDetection.js'
import { appendClipTimelineAudit } from './clipTimelineAudit.js'
import { getClipTimelineByClipId, upsertClipTimeline } from './clipTimelineStore.js'
import {
  CLIP_TIMELINE_FORMAT_MAX_SEC,
  CLIP_TIMELINE_MOCK_ONLY,
  THUMBNAIL_CANDIDATE_STYLES,
  validateClipTimelineSchema,
} from './clipTimelineTypes.js'

const THUMBNAIL_LABELS = {
  title_overlay: 'Title overlay',
  warning_badge: 'Warning badge',
  top1: 'TOP1',
  breaking: 'BREAKING',
  live: 'LIVE',
  surge: 'SURGE',
}

/**
 * @param {import('../contracts/overlayBridge.js').ShortsClipRecord} clip
 */
export function createClipTimelineForClip(clip) {
  const durationSec = Math.max(clip.mock_duration_sec ?? 15, 60)
  const maxShort = CLIP_TIMELINE_FORMAT_MAX_SEC.shorts_15
  const timeline = {
    clipId: clip.id,
    durationSec,
    inPointSec: 0,
    outPointSec: Math.min(maxShort, durationSec),
    targetFormat: /** @type {import('./clipTimelineTypes.js').ClipTimelineTargetFormat} */ (
      'shorts_15'
    ),
    subtitleTracks: seedMockSubtitleTracks(0, Math.min(maxShort, durationSec)),
    overlayMoments: seedAiOverlayMoments(clip),
    thumbnailCandidates: seedThumbnailCandidates(),
    selectedThumbnailId: null,
    safeEdited: false,
    mockOnly: CLIP_TIMELINE_MOCK_ONLY,
    correlationId: clip.correlation_id,
    updatedAtMs: Date.now(),
  }
  timeline.selectedThumbnailId = timeline.thumbnailCandidates[0]?.id ?? null
  return timeline
}

/**
 * @param {string} clipId
 * @param {import('../contracts/overlayBridge.js').ShortsClipRecord} clip
 */
export function openClipTimelineMock(clipId, clip) {
  let timeline = getClipTimelineByClipId(clipId)
  if (!timeline) {
    timeline = createClipTimelineForClip(clip)
    upsertClipTimeline(timeline)
  }
  appendClipTimelineAudit('clip.timeline.opened', {
    clip_id: clipId,
    correlation_id: clip.correlation_id,
    payload: { targetFormat: timeline.targetFormat },
  })
  return timeline
}

/**
 * @param {import('./clipTimelineTypes.js').ClipTimeline} timeline
 * @param {string} correlationId
 */
export function saveClipTimelineMock(timeline, correlationId) {
  timeline.safeEdited = true
  timeline.updatedAtMs = Date.now()
  validateClipTimelineSchema(timeline)
  upsertClipTimeline(timeline)
  appendClipTimelineAudit('clip.timeline.saved', {
    clip_id: timeline.clipId,
    correlation_id: correlationId,
    payload: {
      inPointSec: timeline.inPointSec,
      outPointSec: timeline.outPointSec,
      targetFormat: timeline.targetFormat,
    },
  })
  appendShortsNotification({
    kind: 'clip.timeline.review_required',
    clip_id: timeline.clipId,
    correlation_id: correlationId,
    payload: { targetFormat: timeline.targetFormat },
  })
  return timeline
}

/**
 * @param {import('./clipTimelineTypes.js').ClipTimeline} timeline
 * @param {string} correlationId
 * @param {'shorts' | 'highlight'} exportKind
 */
export function exportClipTimelineDraftMock(timeline, correlationId, exportKind) {
  validateClipTimelineSchema(timeline)
  const preview = buildExportPreviewJson(timeline, exportKind)
  appendClipTimelineAudit('clip.timeline.exported', {
    clip_id: timeline.clipId,
    correlation_id: correlationId,
    payload: {
      exportKind,
      targetFormat: timeline.targetFormat,
      mockOnly: true,
      noFfmpeg: true,
      noRealUpload: true,
    },
  })
  if (exportKind === 'highlight' || timeline.targetFormat === 'highlight_300') {
    appendShortsNotification({
      kind: 'clip.highlight.ready',
      clip_id: timeline.clipId,
      correlation_id: correlationId,
      payload: { previewId: preview.id },
    })
  }
  return preview
}

/**
 * @param {import('./clipTimelineTypes.js').ClipTimeline} timeline
 * @param {string} thumbnailId
 * @param {string} correlationId
 */
export function selectClipTimelineThumbnailMock(timeline, thumbnailId, correlationId) {
  const candidate = timeline.thumbnailCandidates.find((t) => t.id === thumbnailId)
  if (!candidate) throw new Error(`Thumbnail not found: ${thumbnailId}`)
  timeline.selectedThumbnailId = thumbnailId
  timeline.updatedAtMs = Date.now()
  upsertClipTimeline(timeline)
  appendClipTimelineAudit('clip.timeline.thumbnail.selected', {
    clip_id: timeline.clipId,
    correlation_id: correlationId,
    payload: { style: candidate.style, label: candidate.label },
  })
  return timeline
}

/**
 * @param {import('./clipTimelineTypes.js').ClipTimeline} timeline
 * @param {import('./clipTimelineTypes.js').ClipTimelineTargetFormat} targetFormat
 */
export function applyTargetFormatToTimeline(timeline, targetFormat) {
  const maxSpan = CLIP_TIMELINE_FORMAT_MAX_SEC[targetFormat]
  timeline.targetFormat = targetFormat
  const span = timeline.outPointSec - timeline.inPointSec
  if (span > maxSpan) {
    timeline.outPointSec = timeline.inPointSec + maxSpan
  }
  if (timeline.outPointSec > timeline.durationSec) {
    timeline.outPointSec = timeline.durationSec
    timeline.inPointSec = Math.max(0, timeline.outPointSec - maxSpan)
  }
  return timeline
}

/**
 * @param {import('./clipTimelineTypes.js').ClipTimeline} timeline
 * @param {number} inPointSec
 * @param {number} outPointSec
 */
export function setClipTimelineInOut(timeline, inPointSec, outPointSec) {
  const maxSpan = CLIP_TIMELINE_FORMAT_MAX_SEC[timeline.targetFormat]
  timeline.inPointSec = Math.max(0, Math.min(inPointSec, timeline.durationSec - 1))
  timeline.outPointSec = Math.min(
    timeline.durationSec,
    Math.max(outPointSec, timeline.inPointSec + 1),
  )
  if (timeline.outPointSec - timeline.inPointSec > maxSpan) {
    timeline.outPointSec = timeline.inPointSec + maxSpan
  }
  return timeline
}

/**
 * @param {import('./clipTimelineTypes.js').ClipTimeline} timeline
 * @param {'shorts' | 'highlight'} exportKind
 */
export function buildExportPreviewJson(timeline, exportKind) {
  const spanSec = timeline.outPointSec - timeline.inPointSec
  const selectedThumb = timeline.thumbnailCandidates.find(
    (t) => t.id === timeline.selectedThumbnailId,
  )
  return {
    id: `export_preview_${timeline.clipId}_${Date.now()}`,
    mockOnly: true,
    noFfmpeg: true,
    noRealUpload: true,
    exportKind,
    clipId: timeline.clipId,
    targetFormat: timeline.targetFormat,
    spanSec,
    inPointSec: timeline.inPointSec,
    outPointSec: timeline.outPointSec,
    subtitleTracks: timeline.subtitleTracks,
    overlayMoments: timeline.overlayMoments,
    thumbnail: selectedThumb ?? null,
    generatedAtMs: Date.now(),
  }
}

/**
 * @param {import('../contracts/overlayBridge.js').ShortsClipRecord} clip
 */
function seedAiOverlayMoments(clip) {
  /** @type {import('./clipTimelineTypes.js').OverlayMoment[]} */
  const moments = []
  const add = (kind, label, atSec) => {
    moments.push({
      id: `overlay_${kind}_${atSec}`,
      kind,
      label,
      atSec,
      aiRecommended: true,
    })
  }

  switch (clip.detection_reason) {
    case CLIP_DETECTION_REASONS.SURGE_SPIKE:
      add('surge', '급등 순간 (AI mock)', 2)
      break
    case CLIP_DETECTION_REASONS.BJ_REACTION:
      add('bj_reaction', 'BJ 리액션 순간 (AI mock)', 4)
      break
    case CLIP_DETECTION_REASONS.LEAGUE_CHAMPION:
      add('league_win', '리그 우승 순간 (AI mock)', 6)
      add('top1', 'TOP1 강조 (AI mock)', 8)
      break
    case CLIP_DETECTION_REASONS.AI_BREAKING_ALERT:
      add('breaking', 'AI 브리핑 강조 (AI mock)', 3)
      add('briefing', '브리핑 하이라이트 (AI mock)', 10)
      break
    case CLIP_DETECTION_REASONS.ONEAI_STOCK_PICK:
      add('stock_pick', 'OneAI Stock Pick (mock)', 2)
      add('briefing', 'Pick highlight (mock)', 8)
      break
    default:
      add('highlight', 'Mock highlight beat', 5)
  }

  return moments
}

/**
 * @param {number} inSec
 * @param {number} outSec
 */
function seedMockSubtitleTracks(inSec, outSec) {
  const mid = (inSec + outSec) / 2
  return [
    {
      id: 'sub_1',
      text: '[MOCK] Opening hook',
      startSec: inSec,
      endSec: inSec + 3,
      emphasis: true,
    },
    {
      id: 'sub_2',
      text: '[MOCK] Key moment caption',
      startSec: mid - 1,
      endSec: mid + 2,
      emphasis: false,
    },
    {
      id: 'sub_3',
      text: '[MOCK] CTA / follow',
      startSec: Math.max(inSec, outSec - 3),
      endSec: outSec,
      emphasis: true,
    },
  ]
}

function seedThumbnailCandidates() {
  return THUMBNAIL_CANDIDATE_STYLES.map((style) => ({
    id: `thumb_${style}`,
    style,
    label: THUMBNAIL_LABELS[style] ?? style,
  }))
}
