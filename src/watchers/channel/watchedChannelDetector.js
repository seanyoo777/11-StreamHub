import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import { CHANNEL_MOMENT_REASONS } from './watchedChannelTypes.js'
import { appendChannelMoment } from './watchedChannelStore.js'
import { buildContentSuggestions } from '../contentSuggestionMock.js'

/** @type {Record<string, string>} */
export const MOMENT_TO_CLIP_REASON = Object.freeze({
  chat_surge: CLIP_DETECTION_REASONS.BJ_REACTION,
  bj_reaction: CLIP_DETECTION_REASONS.BJ_REACTION,
  surge_mention: CLIP_DETECTION_REASONS.SURGE_SPIKE,
  plunge_mention: CLIP_DETECTION_REASONS.PLUNGE_DROP,
  pnl_mention: CLIP_DETECTION_REASONS.HIGH_PNL,
  breaking_news: CLIP_DETECTION_REASONS.AI_BREAKING_ALERT,
  tournament_win: CLIP_DETECTION_REASONS.LEAGUE_CHAMPION,
  coupon_win: CLIP_DETECTION_REASONS.BJ_REACTION,
  ai_briefing_highlight: CLIP_DETECTION_REASONS.AI_BREAKING_ALERT,
})

/** @type {Record<string, string>} */
const MOMENT_SOURCE_TYPE = Object.freeze({
  chat_surge: 'bj',
  bj_reaction: 'bj',
  surge_mention: 'market',
  plunge_mention: 'market',
  pnl_mention: 'market',
  breaking_news: 'news',
  tournament_win: 'tournament',
  coupon_win: 'fortune',
  ai_briefing_highlight: 'news',
})

const MOMENT_LABELS = {
  chat_surge: '채팅 급증',
  bj_reaction: 'BJ 리액션',
  surge_mention: '급등 언급',
  plunge_mention: '급락 언급',
  pnl_mention: '수익률 언급',
  breaking_news: '긴급 뉴스',
  tournament_win: '토너먼트 우승',
  coupon_win: '쿠폰 당첨',
  ai_briefing_highlight: 'AI 브리핑 하이라이트',
}

/**
 * @param {import('./watchedChannelTypes.js').WatchedChannel} channel
 * @param {import('./watchedChannelTypes.js').ChannelMomentReason} [reason]
 */
export function detectChannelMomentMock(channel, reason) {
  const pick =
    reason ??
    CHANNEL_MOMENT_REASONS[Math.floor(Math.random() * CHANNEL_MOMENT_REASONS.length)]

  const suggestions = buildContentSuggestions({
    reason: pick,
    channelName: channel.channelName,
  })

  const createdAt = Date.now()
  /** @type {import('./watchedChannelTypes.js').ChannelMoment} */
  const moment = {
    momentId: `moment_${channel.channelId}_${createdAt}`,
    channelId: channel.channelId,
    reason: pick,
    confidence: 0.75 + Math.random() * 0.2,
    suggestedTitle: suggestions.shortsTitle,
    suggestedCaption: `${MOMENT_LABELS[pick]} · ${channel.channelName} · 출처: mock`,
    suggestedDuration: pick === 'breaking_news' || pick === 'ai_briefing_highlight' ? 60 : 30,
    sourceType: MOMENT_SOURCE_TYPE[pick] ?? 'market',
    createdAt,
  }

  appendChannelMoment(moment)
  return moment
}

/**
 * @param {import('./watchedChannelTypes.js').ChannelMomentReason} reason
 */
export function mapMomentReasonToClipDetection(reason) {
  return MOMENT_TO_CLIP_REASON[reason] ?? CLIP_DETECTION_REASONS.SURGE_SPIKE
}
