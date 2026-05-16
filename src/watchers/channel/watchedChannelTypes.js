/** Channel Watcher — mock (no YouTube download / no broadcast capture) */

export const STREAMHUB_WATCHED_CHANNELS_STORAGE_KEY = 'streamhub.watched_channels_v1'
export const STREAMHUB_CHANNEL_MOMENTS_STORAGE_KEY = 'streamhub.channel_moments_v1'

export const WATCHED_CHANNEL_PLATFORMS = Object.freeze([
  'youtube',
  'soop',
  'twitch',
  'custom',
])

export const WATCHED_CHANNEL_WATCH_MODES = Object.freeze(['live', 'upload', 'both'])

export const WATCHED_CHANNEL_PREFERRED_FORMATS = Object.freeze(['shorts_60', 'highlight_300'])

export const CHANNEL_MOMENT_REASONS = Object.freeze([
  'chat_surge',
  'bj_reaction',
  'surge_mention',
  'plunge_mention',
  'pnl_mention',
  'breaking_news',
  'tournament_win',
  'coupon_win',
  'ai_briefing_highlight',
])

export const WATCHER_CHANNEL_AUDIT_KINDS = Object.freeze([
  'watcher.channel.added',
  'watcher.channel.enabled',
  'watcher.moment.detected',
])

export const WATCHER_CHANNEL_MOCK_ONLY = true

/**
 * @typedef {typeof WATCHED_CHANNEL_PLATFORMS[number]} WatchedChannelPlatform
 * @typedef {typeof WATCHED_CHANNEL_WATCH_MODES[number]} WatchedChannelWatchMode
 * @typedef {typeof CHANNEL_MOMENT_REASONS[number]} ChannelMomentReason
 * @typedef {Object} WatchedChannel
 * @property {string} channelId
 * @property {string} channelName
 * @property {WatchedChannelPlatform} platform
 * @property {WatchedChannelWatchMode} watchMode
 * @property {boolean} enabled
 * @property {number} dailyClipLimit
 * @property {typeof WATCHED_CHANNEL_PREFERRED_FORMATS[number][]} preferredFormats
 * @property {string[]} keywords
 * @property {'low' | 'medium' | 'high'} riskLevel
 * @property {boolean} mockOnly
 * @typedef {Object} ChannelMoment
 * @property {string} momentId
 * @property {string} channelId
 * @property {ChannelMomentReason} reason
 * @property {number} confidence
 * @property {string} suggestedTitle
 * @property {string} suggestedCaption
 * @property {number} suggestedDuration
 * @property {string} sourceType
 * @property {number} createdAt
 */
