import { assertCanApproveShortsClipMock } from './safety/contentSafetyReview.js'
import { appendShortsClipAudit } from './shortsAudit.js'
import { appendShortsNotification } from './shortsNotifications.js'
import { getShortsQueueClip, updateShortsQueueClipStatus } from './shortsQueueStore.js'

/**
 * @param {string} clipId
 */
export function startShortsClipReview(clipId) {
  const clip = updateShortsQueueClipStatus(clipId, 'reviewing')
  if (!clip) return null

  appendShortsClipAudit('clip.review.started', {
    clip_id: clipId,
    correlation_id: clip.correlation_id,
  })

  appendShortsNotification({
    kind: 'shorts.operator.review_needed',
    clip_id: clipId,
    correlation_id: clip.correlation_id,
    payload: { status: 'reviewing' },
  })

  return clip
}

/**
 * @param {string} clipId
 */
export function approveShortsClipMock(clipId) {
  assertCanApproveShortsClipMock(clipId)
  const clip = updateShortsQueueClipStatus(clipId, 'approved_mock')
  if (!clip) return null

  appendShortsClipAudit('clip.approved.mock', {
    clip_id: clipId,
    correlation_id: clip.correlation_id,
    payload: { operator: 'mock' },
  })

  appendShortsNotification({
    kind: 'shorts.clip.approved_mock',
    clip_id: clipId,
    correlation_id: clip.correlation_id,
    payload: { status: 'approved_mock' },
  })

  return clip
}

/**
 * @param {string} clipId
 */
export function rejectShortsClipMock(clipId) {
  const clip = updateShortsQueueClipStatus(clipId, 'rejected_mock')
  if (!clip) return null

  appendShortsClipAudit('clip.rejected.mock', {
    clip_id: clipId,
    correlation_id: clip.correlation_id,
  })

  return clip
}

/**
 * @param {string} clipId
 */
export function getShortsClipOrThrow(clipId) {
  const clip = getShortsQueueClip(clipId)
  if (!clip) throw new Error(`Clip not found: ${clipId}`)
  return clip
}
