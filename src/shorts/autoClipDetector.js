import {
  CLIP_DETECTION_LABELS,
  CLIP_DETECTION_REASON_KEYS,
  CLIP_DETECTION_REASONS,
  DEFAULT_MOCK_CLIP_DURATION_SEC,
} from './contracts/clipDetection.js'
import {
  buildOverlayPayloadForSource,
} from './contracts/overlayBridge.js'
import { SHORTS_OVERLAY_SOURCES } from './contracts/shortsQueueSchema.js'
import { appendOneAiShortsDraftStub, pushOverlayToLocalStorage } from './overlayStorageSync.js'
import { appendShortsClipAudit } from './shortsAudit.js'
import { appendShortsNotification } from './shortsNotifications.js'
import { appendShortsQueueClip } from './shortsQueueStore.js'
import { ONEAI_STREAM_OVERLAY_ROUTES } from '../validation/contracts/oneAiBridge.js'
import { createContentSafetyReviewForClip } from './safety/contentSafetyReview.js'
import { scoreAndPrioritizeClip } from '../viral/viralQueueBridge.js'

/**
 * @typedef {Object} MockDetectClipInput
 * @property {string} reason
 * @property {string} [room_id]
 * @property {{ title?: string; caption?: string; transcript?: string; sourceType?: string }} [contentOverrides]
 * @property {number} [mock_duration_sec]
 * @property {'streamhub' | 'oneai_broadcast' | 'tournament_winner'} [overlay_source]
 * @property {Record<string, unknown>} [context]
 * @property {boolean} [skipViralScore]
 */

/**
 * @param {string} reason
 */
export function isValidClipDetectionReason(reason) {
  return CLIP_DETECTION_REASON_KEYS.includes(reason)
}

/**
 * @param {MockDetectClipInput} input
 */
export function detectMockClip(input) {
  const reason = input.reason
  if (!isValidClipDetectionReason(reason)) {
    throw new Error(`Unknown clip detection reason: ${reason}`)
  }

  const occurredAtMs = Date.now()
  const correlationId = `clip_${reason}_${occurredAtMs}`
  const overlaySource =
    input.overlay_source ??
    (reason === CLIP_DETECTION_REASONS.LEAGUE_CHAMPION
      ? 'tournament_winner'
      : reason === CLIP_DETECTION_REASONS.AI_BREAKING_ALERT
        ? 'oneai_broadcast'
        : 'streamhub')

  const safeSource = SHORTS_OVERLAY_SOURCES.includes(overlaySource)
    ? overlaySource
    : 'streamhub'

  const label = CLIP_DETECTION_LABELS[reason] ?? reason
  const previewTitle = `[MOCK] ${label} — ${input.room_id ?? 'room_mock_live'}`

  const clip = {
    id: `shorts_clip_${occurredAtMs}`,
    status: 'queued',
    detection_reason: reason,
    occurred_at_ms: occurredAtMs,
    room_id: input.room_id ?? 'room_mock_live',
    mock_duration_sec: input.mock_duration_sec ?? DEFAULT_MOCK_CLIP_DURATION_SEC,
    overlay_source: safeSource,
    overlay_route:
      safeSource === 'oneai_broadcast'
        ? ONEAI_STREAM_OVERLAY_ROUTES.shorts_moment
        : safeSource === 'tournament_winner'
          ? ONEAI_STREAM_OVERLAY_ROUTES.winner
          : ONEAI_STREAM_OVERLAY_ROUTES.event,
    overlay_payload: {},
    correlation_id: correlationId,
    preview_title: previewTitle,
  }

  clip.overlay_payload = buildOverlayPayloadForSource(clip, safeSource)

  appendShortsQueueClip(clip)

  appendShortsClipAudit('clip.detected', {
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: { reason, overlay_source: safeSource },
  })

  appendShortsNotification({
    kind: 'shorts.clip.queued',
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: { reason, preview_title: previewTitle },
  })

  pushOverlayToLocalStorage(clip, clip.overlay_payload)
  appendOneAiShortsDraftStub(clip)

  createContentSafetyReviewForClip(clip, input.contentOverrides ?? {})

  if (!input.skipViralScore) {
    scoreAndPrioritizeClip(clip, {
      contentType: 'auto_clip',
      sourceType: input.contentOverrides?.sourceType ?? 'market',
      title: input.contentOverrides?.title,
      caption: input.contentOverrides?.caption,
      transcript: input.contentOverrides?.transcript,
    })
  }

  return clip
}

/**
 * Mock trigger all detection reasons (self-test / demo).
 */
export function detectAllMockClipReasons() {
  return CLIP_DETECTION_REASON_KEYS.map((reason) =>
    detectMockClip({
      reason,
      overlay_source:
        reason === 'league_champion'
          ? 'tournament_winner'
          : reason === 'ai_breaking_alert'
            ? 'oneai_broadcast'
            : 'streamhub',
    }),
  )
}
