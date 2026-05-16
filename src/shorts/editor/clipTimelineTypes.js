/** Clip Timeline / Highlight Editor — mock (no FFmpeg, no real edit) */

export const STREAMHUB_CLIP_TIMELINE_STORAGE_KEY = 'streamhub.clip_timelines_v1'

export const CLIP_TIMELINE_TARGET_FORMATS = Object.freeze([
  'shorts_15',
  'shorts_30',
  'shorts_60',
  'highlight_300',
])

/** @type {Record<typeof CLIP_TIMELINE_TARGET_FORMATS[number], number>} */
export const CLIP_TIMELINE_FORMAT_MAX_SEC = Object.freeze({
  shorts_15: 15,
  shorts_30: 30,
  shorts_60: 60,
  highlight_300: 300,
})

export const THUMBNAIL_CANDIDATE_STYLES = Object.freeze([
  'title_overlay',
  'warning_badge',
  'top1',
  'breaking',
  'live',
  'surge',
])

export const CLIP_TIMELINE_AUDIT_KINDS = Object.freeze([
  'clip.timeline.opened',
  'clip.timeline.saved',
  'clip.timeline.exported',
  'clip.timeline.thumbnail.selected',
])

export const CLIP_TIMELINE_NOTIFICATION_KINDS = Object.freeze([
  'clip.highlight.ready',
  'clip.timeline.review_required',
])

export const CLIP_TIMELINE_MOCK_ONLY = true

/**
 * @typedef {typeof CLIP_TIMELINE_TARGET_FORMATS[number]} ClipTimelineTargetFormat
 * @typedef {typeof THUMBNAIL_CANDIDATE_STYLES[number]} ThumbnailCandidateStyle
 * @typedef {Object} SubtitleTrack
 * @property {string} id
 * @property {string} text
 * @property {number} startSec
 * @property {number} endSec
 * @property {boolean} emphasis
 * @typedef {Object} OverlayMoment
 * @property {string} id
 * @property {string} label
 * @property {number} atSec
 * @property {string} kind
 * @property {boolean} [aiRecommended]
 * @typedef {Object} ThumbnailCandidate
 * @property {string} id
 * @property {ThumbnailCandidateStyle} style
 * @property {string} label
 * @typedef {Object} ClipTimeline
 * @property {string} clipId
 * @property {number} durationSec
 * @property {number} inPointSec
 * @property {number} outPointSec
 * @property {ClipTimelineTargetFormat} targetFormat
 * @property {SubtitleTrack[]} subtitleTracks
 * @property {OverlayMoment[]} overlayMoments
 * @property {ThumbnailCandidate[]} thumbnailCandidates
 * @property {string | null} selectedThumbnailId
 * @property {boolean} safeEdited
 * @property {boolean} mockOnly
 * @property {string} [correlationId]
 * @property {number} [updatedAtMs]
 */

/**
 * @param {unknown} value
 * @returns {value is ClipTimelineTargetFormat}
 */
export function isClipTimelineTargetFormat(value) {
  return typeof value === 'string' && CLIP_TIMELINE_TARGET_FORMATS.includes(value)
}

/**
 * @param {ClipTimeline} timeline
 */
export function validateClipTimelineSchema(timeline) {
  if (!timeline.clipId) throw new Error('clipId required')
  if (!isClipTimelineTargetFormat(timeline.targetFormat)) {
    throw new Error(`Invalid targetFormat: ${timeline.targetFormat}`)
  }
  if (timeline.inPointSec < 0 || timeline.outPointSec > timeline.durationSec) {
    throw new Error('in/out out of source duration')
  }
  if (timeline.outPointSec <= timeline.inPointSec) {
    throw new Error('outPoint must be after inPoint')
  }
  const span = timeline.outPointSec - timeline.inPointSec
  const maxSpan = CLIP_TIMELINE_FORMAT_MAX_SEC[timeline.targetFormat]
  if (span > maxSpan) {
    throw new Error(`Span ${span}s exceeds format max ${maxSpan}s`)
  }
  for (const track of timeline.subtitleTracks) {
    if (track.endSec <= track.startSec) throw new Error('Invalid subtitle span')
    if (track.startSec < timeline.inPointSec || track.endSec > timeline.outPointSec) {
      throw new Error('Subtitle outside in/out window')
    }
  }
  for (const moment of timeline.overlayMoments) {
    if (moment.atSec < timeline.inPointSec || moment.atSec > timeline.outPointSec) {
      throw new Error('Overlay moment outside in/out window')
    }
  }
}
