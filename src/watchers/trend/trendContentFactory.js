import { detectMockClip } from '../../shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import { openClipTimelineMock } from '../../shorts/editor/clipTimelineHelpers.js'
import { getContentSafetyReviewByClipId } from '../../shorts/safety/contentSafetyStore.js'
import { appendShortsNotification } from '../../shorts/shortsNotifications.js'
import { buildContentSuggestions } from '../contentSuggestionMock.js'
import { mapMomentReasonToClipDetection } from '../channel/watchedChannelDetector.js'
import { appendWatcherChannelAudit } from '../channel/watchedChannelAudit.js'
import {
  incrementDailyClipCount,
  isDailyClipLimitReached,
  loadContentFactorySettings,
} from '../channel/watchedChannelRules.js'
import {
  getWatchedChannelById,
  seedDefaultWatchedChannels,
} from '../channel/watchedChannelStore.js'
import { detectChannelMomentMock } from '../channel/watchedChannelDetector.js'
import { appendTrendWatcherAudit } from './trendWatcherAudit.js'
import { detectTrendMock } from './trendDetector.js'
import { loadTrendKeywords, seedDefaultTrendKeywords } from './trendKeywordStore.js'
import { scoreAndPrioritizeClip } from '../../viral/viralQueueBridge.js'

/**
 * @param {import('../channel/watchedChannelTypes.js').ChannelMoment} moment
 */
export function createFactoryDraftFromChannelMoment(moment) {
  const settings = loadContentFactorySettings()
  if (!settings.autoQueueEnabled || !settings.channelWatcherEnabled) {
    return { blocked: true, reason: 'factory_disabled' }
  }

  const channel = getWatchedChannelById(moment.channelId)
  if (!channel?.enabled) {
    return { blocked: true, reason: 'channel_disabled' }
  }

  const correlationId = `factory_ch_${moment.momentId}`

  if (isDailyClipLimitReached(channel.channelId, channel.dailyClipLimit)) {
    appendTrendWatcherAudit('content.factory.daily_limit_reached', {
      correlation_id: correlationId,
      payload: { channelId: channel.channelId, limit: channel.dailyClipLimit },
    })
    appendShortsNotification({
      kind: 'content.factory.daily_limit_reached',
      clip_id: channel.channelId,
      correlation_id: correlationId,
      payload: { channelId: channel.channelId },
    })
    return { blocked: true, reason: 'daily_limit' }
  }

  const clipReason = mapMomentReasonToClipDetection(moment.reason)
  const suggestions = buildContentSuggestions({
    reason: moment.reason,
    channelName: channel.channelName,
  })

  const caption =
    moment.sourceType === 'news' || moment.sourceType === 'market' || moment.sourceType === 'politics'
      ? `${moment.suggestedCaption} · 출처: mock wire`
      : moment.suggestedCaption

  const clip = detectMockClip({
    reason: clipReason,
    room_id: channel.channelId,
    mock_duration_sec: moment.suggestedDuration,
    skipViralScore: true,
    contentOverrides: {
      title: moment.suggestedTitle,
      caption,
      transcript: suggestions.hook3sec,
      sourceType: moment.sourceType,
    },
  })

  openClipTimelineMock(clip.id, clip)
  incrementDailyClipCount(channel.channelId)

  scoreAndPrioritizeClip(clip, {
    contentType: 'channel_moment',
    sourceType: moment.sourceType,
    title: moment.suggestedTitle,
    caption,
    transcript: suggestions.hook3sec,
    momentReason: moment.reason,
  })

  appendTrendWatcherAudit('content.factory.draft_created', {
    correlation_id: correlationId,
    payload: { clipId: clip.id, momentId: moment.momentId, source: 'channel' },
  })

  appendWatcherChannelAudit('watcher.moment.detected', {
    correlation_id: correlationId,
    payload: { momentId: moment.momentId, channelId: channel.channelId, reason: moment.reason },
  })

  appendShortsNotification({
    kind: 'watcher.moment.detected',
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: { momentId: moment.momentId },
  })

  appendShortsNotification({
    kind: 'content.factory.short_created',
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: { channelId: channel.channelId },
  })

  return finalizeFactoryDraft(clip, correlationId, moment.sourceType)
}

/**
 * @param {import('./trendWatcherTypes.js').TrendContentCandidate} candidate
 */
export function createFactoryDraftFromTrend(candidate) {
  const settings = loadContentFactorySettings()
  if (!settings.autoQueueEnabled || !settings.trendWatcherEnabled) {
    return { blocked: true, reason: 'factory_disabled' }
  }
  if (!loadContentFactorySettings().categoryEnabled[candidate.category]) {
    return { blocked: true, reason: 'category_disabled' }
  }

  const correlationId = `factory_tr_${candidate.trendId}`
  const virtualChannelId = `trend_${candidate.category}`

  if (isDailyClipLimitReached(virtualChannelId, 20)) {
    appendTrendWatcherAudit('content.factory.daily_limit_reached', {
      correlation_id: correlationId,
      payload: { trendId: candidate.trendId },
    })
    appendShortsNotification({
      kind: 'content.factory.daily_limit_reached',
      clip_id: virtualChannelId,
      correlation_id: correlationId,
      payload: { trendId: candidate.trendId },
    })
    return { blocked: true, reason: 'daily_limit' }
  }

  const clipReason =
    candidate.category === 'politics' || candidate.urgency === 'urgent'
      ? CLIP_DETECTION_REASONS.AI_BREAKING_ALERT
      : candidate.category === 'market' || candidate.category === 'crypto'
        ? CLIP_DETECTION_REASONS.SURGE_SPIKE
        : CLIP_DETECTION_REASONS.BJ_REACTION

  const sourceType =
    candidate.category === 'politics'
      ? 'politics'
      : candidate.category === 'market' || candidate.category === 'crypto'
        ? 'market'
        : candidate.category === 'entertainment'
          ? 'bj'
          : 'news'

  const clip = detectMockClip({
    reason: clipReason,
    room_id: virtualChannelId,
    mock_duration_sec: candidate.urgency === 'urgent' ? 60 : 30,
    skipViralScore: true,
    overlay_source:
      clipReason === CLIP_DETECTION_REASONS.AI_BREAKING_ALERT ? 'oneai_broadcast' : 'streamhub',
    contentOverrides: {
      title: candidate.suggestedTitle,
      caption: `${candidate.suggestedAngle} · 출처: mock trend · ${candidate.keyword}`,
      transcript: candidate.suggestedScript,
      sourceType,
    },
  })

  openClipTimelineMock(clip.id, clip)
  incrementDailyClipCount(virtualChannelId)

  scoreAndPrioritizeClip(clip, {
    contentType: 'trend_candidate',
    sourceType,
    title: candidate.suggestedTitle,
    caption: `${candidate.suggestedAngle} · ${candidate.keyword}`,
    transcript: candidate.suggestedScript,
    trendCategory: candidate.category,
    urgency: candidate.urgency,
    publicInterestScore: candidate.publicInterestScore,
  })

  appendTrendWatcherAudit('content.factory.draft_created', {
    correlation_id: correlationId,
    payload: { clipId: clip.id, trendId: candidate.trendId, source: 'trend' },
  })

  appendTrendWatcherAudit('watcher.trend.detected', {
    correlation_id: correlationId,
    payload: { trendId: candidate.trendId, keyword: candidate.keyword, category: candidate.category },
  })

  const notifKind =
    candidate.urgency === 'urgent' ? 'watcher.urgent_issue.detected' : 'watcher.trend.detected'

  appendShortsNotification({
    kind: notifKind,
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: { trendId: candidate.trendId, keyword: candidate.keyword },
  })

  appendShortsNotification({
    kind: 'content.factory.short_created',
    clip_id: clip.id,
    correlation_id: correlationId,
    payload: { trendId: candidate.trendId },
  })

  return finalizeFactoryDraft(clip, correlationId, sourceType)
}

/**
 * @param {import('../../shorts/contracts/overlayBridge.js').ShortsClipRecord} clip
 * @param {string} correlationId
 * @param {string} sourceType
 */
function finalizeFactoryDraft(clip, correlationId, sourceType) {
  const review = getContentSafetyReviewByClipId(clip.id)
  const needsSafety =
    review?.verdict === 'needs_review' ||
    review?.verdict === 'block_mock' ||
    ['news', 'market', 'politics'].includes(sourceType)

  if (review?.verdict === 'block_mock') {
    appendTrendWatcherAudit('content.factory.safety_blocked', {
      correlation_id: correlationId,
      payload: { clipId: clip.id, verdict: review.verdict, riskScore: review.riskScore },
    })
  }

  if (needsSafety) {
    appendShortsNotification({
      kind: 'content.factory.safety_review_required',
      clip_id: clip.id,
      correlation_id: correlationId,
      payload: { verdict: review?.verdict, sourceType },
    })
  }

  return {
    clip,
    review,
    blocked: review?.verdict === 'block_mock',
    operatorApprovalRequired: loadContentFactorySettings().operatorApprovalRequired,
  }
}

/**
 * @param {string} channelId
 * @param {import('../channel/watchedChannelTypes.js').ChannelMomentReason} [reason]
 */
export function runChannelWatcherPipeline(channelId, reason) {
  seedDefaultWatchedChannels()
  const channel = getWatchedChannelById(channelId)
  if (!channel) throw new Error(`Channel not found: ${channelId}`)
  const moment = detectChannelMomentMock(channel, reason)
  return createFactoryDraftFromChannelMoment(moment)
}

/**
 * @param {string} [keywordId]
 */
export function runTrendWatcherPipeline(keywordId) {
  seedDefaultTrendKeywords()
  const row = keywordId
    ? loadTrendKeywords().find((k) => k.keywordId === keywordId)
    : loadTrendKeywords().find((k) => k.enabled)
  if (!row) throw new Error('Trend keyword not found')
  const candidate = detectTrendMock(row)
  if (!candidate) return { blocked: true, reason: 'trend_blocked' }
  return createFactoryDraftFromTrend(candidate)
}
