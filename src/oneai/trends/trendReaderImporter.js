import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import {
  buildOneAiBroadcastOverlayPayload,
  buildOverlayPayloadForSource,
} from '../../shorts/contracts/overlayBridge.js'
import { createClipTimelineForClip, applyTargetFormatToTimeline } from '../../shorts/editor/clipTimelineHelpers.js'
import { upsertClipTimeline } from '../../shorts/editor/clipTimelineStore.js'
import { appendOneAiShortsDraftStub, pushOverlayToLocalStorage } from '../../shorts/overlayStorageSync.js'
import { createContentSafetyReviewForClip } from '../../shorts/safety/contentSafetyReview.js'
import { appendShortsClipAudit } from '../../shorts/shortsAudit.js'
import { appendShortsNotification } from '../../shorts/shortsNotifications.js'
import { appendShortsQueueClip } from '../../shorts/shortsQueueStore.js'
import { ONEAI_STREAM_OVERLAY_ROUTES } from '../../validation/contracts/oneAiBridge.js'
import { buildOverlayScene } from '../../overlay-scenes/overlaySceneBuilder.js'
import {
  createOverlaySceneRecord,
  queueOverlayScene,
} from '../../overlay-scenes/overlaySceneOps.js'
import { getOverlaySceneById } from '../../overlay-scenes/overlaySceneStore.js'
import { buildLiveHudSnapshotMock } from '../../overlay-scenes/overlaySceneHudBridge.js'
import { scoreAndPrioritizeClip } from '../../viral/viralQueueBridge.js'
import { getTrendReaderStorage } from './trendReader.js'
import { appendTrendReaderAudit } from './trendReaderAudit.js'
import {
  STREAMHUB_TREND_IMPORTED_OVERLAY_KEY,
  STREAMHUB_TREND_IMPORTED_SHORTS_KEY,
  TREND_IMPORT_SOURCE,
} from './trendReaderTypes.js'

/**
 * @param {import('./trendReaderTypes.js').TrendReaderSnapshot} trend
 */
export function buildTrendShortsHook(trend) {
  return `🔥 ${trend.keyword} — ${trend.trendLevel} · OneAI Viral Trend Radar (mock)`
}

/**
 * @param {import('./trendReaderTypes.js').TrendReaderSnapshot} trend
 */
export function buildTrendTickerCaption(trend) {
  const themes = trend.relatedThemes.slice(0, 3).join(' · ')
  const tickers = (trend.relatedTickers ?? []).slice(0, 2).join(', ')
  return [trend.keyword, themes, tickers].filter(Boolean).join(' | ')
}

/**
 * @param {import('./trendReaderTypes.js').TrendReaderSnapshot} trend
 */
export function buildTrendBreakingTitle(trend) {
  const badge = trend.urgencyLevel === 'urgent' ? '긴급' : trend.urgencyLevel === 'high' ? '주목' : '트렌드'
  return `[${badge}] ${trend.keyword}`
}

/**
 * @param {import('./trendReaderTypes.js').TrendReaderSnapshot} trend
 */
export function buildTrendUrgencyBadge(trend) {
  return trend.urgencyLevel.toUpperCase()
}

/**
 * @param {import('./trendReaderTypes.js').TrendReaderSnapshot} trend
 * @returns {import('../../overlay-scenes/overlaySceneTypes.js').OverlaySceneType}
 */
export function mapTrendToOverlaySceneType(trend) {
  if (trend.category === 'breaking_news' || trend.urgencyLevel === 'urgent') {
    return 'breaking_news'
  }
  if (trend.category === 'market_alert' || trend.category === 'macro' || trend.category === 'commodity') {
    return 'market_alert'
  }
  if (trend.category === 'stock' || trend.category === 'ai') {
    return 'ai_stock_pick'
  }
  return 'shorts_hook'
}

/**
 * @param {string} storageKey
 */
function loadImportedTrendIds(storageKey) {
  const raw = getTrendReaderStorage().getItem(storageKey)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

/**
 * @param {string} storageKey
 * @param {string} trendId
 */
function markTrendImported(storageKey, trendId) {
  const ids = loadImportedTrendIds(storageKey)
  if (!ids.includes(trendId)) ids.push(trendId)
  getTrendReaderStorage().setItem(storageKey, JSON.stringify(ids))
}

/**
 * @param {string} trendId
 */
export function isTrendImportedToShorts(trendId) {
  return loadImportedTrendIds(STREAMHUB_TREND_IMPORTED_SHORTS_KEY).includes(trendId)
}

/**
 * @param {string} trendId
 */
export function isTrendImportedToOverlay(trendId) {
  return loadImportedTrendIds(STREAMHUB_TREND_IMPORTED_OVERLAY_KEY).includes(trendId)
}

/**
 * @param {import('./trendReaderTypes.js').TrendReaderSnapshot} trend
 */
export function importTrendCandidateToShortsQueue(trend) {
  const occurredAtMs = Date.now()
  const correlationId = `trend_shorts_${trend.id}_${occurredAtMs}`
  const hook = buildTrendShortsHook(trend)
  const caption = buildTrendTickerCaption(trend)
  const title = buildTrendBreakingTitle(trend)

  const clip = {
    id: `shorts_clip_trend_${trend.id}_${occurredAtMs}`,
    status: 'queued',
    detection_reason: CLIP_DETECTION_REASONS.VIRAL_TREND,
    occurred_at_ms: occurredAtMs,
    room_id: `oneai_viral_trend_${trend.id}`,
    mock_duration_sec: 30,
    overlay_source: 'oneai_broadcast',
    overlay_route: ONEAI_STREAM_OVERLAY_ROUTES.shorts_moment,
    overlay_payload: {},
    correlation_id: correlationId,
    preview_title: `[OneAI Trend] ${title}`,
    trend_candidate_id: trend.id,
    trend_keyword: trend.keyword,
    trend_urgency_badge: buildTrendUrgencyBadge(trend),
    import_source: TREND_IMPORT_SOURCE,
  }

  clip.overlay_payload = {
    ...buildOverlayPayloadForSource(clip, 'oneai_broadcast'),
    viral_trend: {
      candidate_id: trend.id,
      keyword: trend.keyword,
      category: trend.category,
      trend_level: trend.trendLevel,
      urgency: trend.urgencyLevel,
      short_potential: trend.shortPotentialScore,
      overlay_priority: trend.overlayPriority,
      source: TREND_IMPORT_SOURCE,
      mock_only: true,
    },
    oneai_broadcast: buildOneAiBroadcastOverlayPayload(clip),
  }

  appendShortsQueueClip(clip)

  appendShortsClipAudit('clip.detected', {
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: {
      reason: CLIP_DETECTION_REASONS.VIRAL_TREND,
      trend_id: trend.id,
      overlay_source: 'oneai_broadcast',
    },
  })

  const safetyCaption = `${caption}\n\n${hook}\n\n목 데이터 mock · 투자 권유 아님`
  const safetyTranscript = `${hook} · ${trend.keyword} · trend radar mock`

  const review = createContentSafetyReviewForClip(clip, {
    title,
    caption: safetyCaption,
    transcript: safetyTranscript,
    sourceType: trend.category === 'politics' ? 'news' : 'market',
  })

  const timeline = createClipTimelineForClip(clip)
  timeline.durationSec = 30
  timeline.inPointSec = 0
  timeline.outPointSec = 30
  applyTargetFormatToTimeline(timeline, 'shorts_30')
  upsertClipTimeline(timeline)

  pushOverlayToLocalStorage(clip, clip.overlay_payload)
  appendOneAiShortsDraftStub(clip)

  scoreAndPrioritizeClip(clip, {
    contentType: 'trend_candidate',
    sourceType: trend.category === 'politics' ? 'news' : 'market',
    title,
    caption: safetyCaption,
    transcript: safetyTranscript,
    urgency: trend.urgencyLevel === 'urgent' ? 'urgent' : trend.urgencyLevel === 'high' ? 'high' : 'normal',
    publicInterestScore: trend.shortPotentialScore,
  })

  markTrendImported(STREAMHUB_TREND_IMPORTED_SHORTS_KEY, trend.id)

  appendTrendReaderAudit('trend.imported_to_shorts_mock', {
    correlation_id: correlationId,
    payload: {
      trendId: trend.id,
      clipId: clip.id,
      detectionReason: CLIP_DETECTION_REASONS.VIRAL_TREND,
      safetyVerdict: review.verdict,
    },
  })

  if (trend.urgencyLevel === 'urgent') {
    appendShortsNotification({
      kind: 'trend.urgent.imported',
      clip_id: clip.id,
      correlation_id: correlationId,
      payload: { keyword: trend.keyword },
    })
  }

  if (trend.shortPotentialScore >= 75) {
    appendShortsNotification({
      kind: 'trend.high_shorts_potential',
      clip_id: clip.id,
      correlation_id: correlationId,
      payload: { score: trend.shortPotentialScore, keyword: trend.keyword },
    })
  }

  return { clip, review, timeline }
}

/**
 * @param {import('./trendReaderTypes.js').TrendReaderSnapshot} trend
 */
export function importTrendCandidateToOverlayScene(trend) {
  const sceneType = mapTrendToOverlaySceneType(trend)
  const correlationId = `trend_overlay_${trend.id}_${Date.now()}`
  const headline = buildTrendBreakingTitle(trend)
  const subline = buildTrendTickerCaption(trend)
  const hudLinks = {
    ...buildLiveHudSnapshotMock(),
    oneAiBriefingHint: `Trend: ${trend.keyword}`,
    stockPickTicker: trend.relatedTickers?.[0] ?? null,
  }

  const scene = buildOverlayScene({
    sceneType,
    title: `[Trend] ${trend.keyword}`,
    headline,
    subline,
    tickerText: buildTrendTickerCaption(trend),
    overlaySource: 'oneai_broadcast',
    priority: trend.overlayPriority,
    durationSec: 20,
    hudLinks,
  })

  scene.trend_candidate_id = trend.id
  scene.trend_keyword = trend.keyword
  scene.import_source = TREND_IMPORT_SOURCE

  createOverlaySceneRecord(scene)
  queueOverlayScene(scene.id)
  const queuedScene = getOverlaySceneById(scene.id) ?? scene

  markTrendImported(STREAMHUB_TREND_IMPORTED_OVERLAY_KEY, trend.id)

  appendTrendReaderAudit('trend.imported_to_overlay_mock', {
    correlation_id: correlationId,
    payload: {
      trendId: trend.id,
      sceneId: queuedScene.id,
      sceneType,
      overlayPriority: trend.overlayPriority,
    },
  })

  if (trend.overlayPriority >= 70) {
    appendShortsNotification({
      kind: 'trend.overlay_priority.detected',
      clip_id: queuedScene.id,
      correlation_id: correlationId,
      payload: { keyword: trend.keyword, overlayPriority: trend.overlayPriority },
    })
  }

  return queuedScene
}

export function resetTrendImportedForTests() {
  getTrendReaderStorage().setItem(STREAMHUB_TREND_IMPORTED_SHORTS_KEY, '[]')
  getTrendReaderStorage().setItem(STREAMHUB_TREND_IMPORTED_OVERLAY_KEY, '[]')
}
