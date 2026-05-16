import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import {
  buildOneAiBroadcastOverlayPayload,
  buildOverlayPayloadForSource,
} from '../../shorts/contracts/overlayBridge.js'
import {
  applyTargetFormatToTimeline,
  createClipTimelineForClip,
} from '../../shorts/editor/clipTimelineHelpers.js'
import { upsertClipTimeline } from '../../shorts/editor/clipTimelineStore.js'
import { CLIP_TIMELINE_FORMAT_MAX_SEC } from '../../shorts/editor/clipTimelineTypes.js'
import { appendOneAiShortsDraftStub, pushOverlayToLocalStorage } from '../../shorts/overlayStorageSync.js'
import { createContentSafetyReviewForClip } from '../../shorts/safety/contentSafetyReview.js'
import { appendShortsClipAudit } from '../../shorts/shortsAudit.js'
import { appendShortsNotification } from '../../shorts/shortsNotifications.js'
import { appendShortsQueueClip } from '../../shorts/shortsQueueStore.js'
import { ONEAI_STREAM_OVERLAY_ROUTES } from '../../validation/contracts/oneAiBridge.js'
import { getStockPickStorage } from './stockPickReader.js'
import { scoreAndPrioritizeClip } from '../../viral/viralQueueBridge.js'
import { appendStockPickReaderAudit } from './stockPickReaderAudit.js'
import {
  STOCKPICK_IMPORT_SOURCE,
  STREAMHUB_STOCKPICK_IMPORTED_KEY,
} from './stockPickReaderTypes.js'

/**
 * @param {import('./stockPickReaderTypes.js').StockPickShortsCandidate['suggestedDuration']} suggestedDuration
 */
export function mapStockPickDurationToSec(suggestedDuration) {
  switch (suggestedDuration) {
    case 'highlight_300':
      return 300
    case 'shorts_60':
      return 60
    case 'shorts_30':
    default:
      return 30
  }
}

/**
 * @param {import('./stockPickReaderTypes.js').StockPickShortsCandidate['suggestedDuration']} suggestedDuration
 */
export function mapStockPickDurationToTimelineFormat(suggestedDuration) {
  if (suggestedDuration === 'highlight_300') return 'highlight_300'
  if (suggestedDuration === 'shorts_60') return 'shorts_60'
  return 'shorts_30'
}

/**
 * @returns {string[]}
 */
export function loadImportedStockPickIds() {
  const raw = getStockPickStorage().getItem(STREAMHUB_STOCKPICK_IMPORTED_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

/**
 * @param {string} candidateId
 */
export function markStockPickCandidateImported(candidateId) {
  const ids = loadImportedStockPickIds()
  if (!ids.includes(candidateId)) ids.push(candidateId)
  getStockPickStorage().setItem(STREAMHUB_STOCKPICK_IMPORTED_KEY, JSON.stringify(ids))
}

/**
 * @param {import('./stockPickReaderTypes.js').StockPickShortsCandidate} candidate
 */
export function seedClipTimelineForStockPick(clip, suggestedDuration) {
  const format = mapStockPickDurationToTimelineFormat(suggestedDuration)
  const maxSpan = CLIP_TIMELINE_FORMAT_MAX_SEC[format]
  const timeline = createClipTimelineForClip(clip)
  timeline.durationSec = Math.max(clip.mock_duration_sec ?? 30, maxSpan)
  timeline.inPointSec = 0
  timeline.outPointSec = maxSpan
  applyTargetFormatToTimeline(timeline, format)
  upsertClipTimeline(timeline)
  return timeline
}

/**
 * @param {import('./stockPickReaderTypes.js').StockPickShortsCandidate} candidate
 */
export function importStockPickCandidateToQueue(candidate) {
  const occurredAtMs = Date.now()
  const correlationId = `stockpick_${candidate.id}_${occurredAtMs}`
  const durationSec = mapStockPickDurationToSec(candidate.suggestedDuration)
  const perf = candidate.performanceSnapshot ?? {}

  const previewTitle = `[OneAI Stock Pick] ${candidate.title}`

  const clip = {
    id: `shorts_clip_stockpick_${candidate.id}_${occurredAtMs}`,
    status: 'queued',
    detection_reason: CLIP_DETECTION_REASONS.ONEAI_STOCK_PICK,
    occurred_at_ms: occurredAtMs,
    room_id: `oneai_stock_pick_${candidate.stockPickId ?? 'mock'}`,
    mock_duration_sec: durationSec,
    overlay_source: 'oneai_broadcast',
    overlay_route: ONEAI_STREAM_OVERLAY_ROUTES.shorts_moment,
    overlay_payload: {},
    correlation_id: correlationId,
    preview_title: previewTitle,
    stockpick_candidate_id: candidate.id,
    stockpick_scenario: candidate.scenarioKind,
    import_source: STOCKPICK_IMPORT_SOURCE,
  }

  clip.overlay_payload = {
    ...buildOverlayPayloadForSource(clip, 'oneai_broadcast'),
    stock_pick: {
      candidate_id: candidate.id,
      scenario_kind: candidate.scenarioKind,
      ticker: perf.ticker,
      return_pct: perf.returnPct,
      max_return_pct: perf.maxReturnPct,
      suggested_duration: candidate.suggestedDuration,
      source: STOCKPICK_IMPORT_SOURCE,
      mock_only: true,
    },
    oneai_broadcast: buildOneAiBroadcastOverlayPayload(clip),
  }

  appendShortsQueueClip(clip)

  appendShortsClipAudit('clip.detected', {
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: {
      reason: CLIP_DETECTION_REASONS.ONEAI_STOCK_PICK,
      stockpick_candidate_id: candidate.id,
      overlay_source: 'oneai_broadcast',
    },
  })

  const safetyCaption = `${candidate.caption}\n\n${candidate.hookText}\n\n${candidate.riskText}`
  const safetyTranscript = `${candidate.hookText} · ${candidate.riskText} · 투자 권유 아님 · 시나리오 mock`

  const review = createContentSafetyReviewForClip(clip, {
    title: candidate.title,
    caption: safetyCaption,
    transcript: safetyTranscript,
    sourceType: 'market',
  })

  const timeline = seedClipTimelineForStockPick(clip, candidate.suggestedDuration)

  pushOverlayToLocalStorage(clip, clip.overlay_payload)
  appendOneAiShortsDraftStub(clip)

  scoreAndPrioritizeClip(clip, {
    contentType: 'stock_pick',
    sourceType: 'market',
    title: candidate.title,
    caption: safetyCaption,
    transcript: safetyTranscript,
  })

  markStockPickCandidateImported(candidate.id)

  appendStockPickReaderAudit('stockpick.reader.imported_to_queue', {
    correlation_id: correlationId,
    payload: {
      candidateId: candidate.id,
      clipId: clip.id,
      suggestedDuration: candidate.suggestedDuration,
      timelineFormat: timeline.targetFormat,
      safetyVerdict: review.verdict,
    },
  })

  appendShortsNotification({
    kind: 'stockpick.imported_to_queue',
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: { candidateId: candidate.id },
  })

  if (review.verdict !== 'pass' || candidate.reviewRequired) {
    appendShortsNotification({
      kind: 'stockpick.safety_review_required',
      clip_id: clip.id,
      correlation_id: correlationId,
      payload: { verdict: review.verdict, reviewRequired: candidate.reviewRequired },
    })
  }

  return { clip, review, timeline }
}

export function resetStockPickImportedForTests() {
  getStockPickStorage().setItem(STREAMHUB_STOCKPICK_IMPORTED_KEY, '[]')
}

/**
 * @param {string} candidateId
 */
export function isStockPickCandidateImported(candidateId) {
  return loadImportedStockPickIds().includes(candidateId)
}
