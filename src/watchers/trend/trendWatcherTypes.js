/** Trend / News Watcher — mock (no crawl / no external API) */

export const STREAMHUB_TREND_KEYWORDS_STORAGE_KEY = 'streamhub.trend_keywords_v1'
export const STREAMHUB_TREND_CANDIDATES_STORAGE_KEY = 'streamhub.trend_candidates_v1'
export const STREAMHUB_CONTENT_FACTORY_SETTINGS_KEY = 'streamhub.content_factory_settings_v1'

export const TREND_SOURCE_TYPES = Object.freeze([
  'realtime_search_mock',
  'latest_news_mock',
  'market_surge_drop_mock',
  'politics_issue_mock',
  'global_issue_mock',
  'crypto_stock_keyword_mock',
])

export const TREND_CATEGORIES = Object.freeze([
  'market',
  'politics',
  'social',
  'entertainment',
  'crypto',
  'global',
])

export const WATCHER_TREND_AUDIT_KINDS = Object.freeze([
  'watcher.trend.detected',
])

export const WATCHER_FACTORY_AUDIT_KINDS = Object.freeze([
  'content.factory.draft_created',
  'content.factory.daily_limit_reached',
  'content.factory.safety_blocked',
])

export const TREND_WATCHER_MOCK_ONLY = true

/**
 * @typedef {typeof TREND_CATEGORIES[number]} TrendCategory
 * @typedef {Object} TrendKeyword
 * @property {string} keywordId
 * @property {string} keyword
 * @property {TrendCategory} category
 * @property {typeof TREND_SOURCE_TYPES[number]} sourceType
 * @property {boolean} enabled
 * @property {boolean} mockOnly
 * @typedef {Object} TrendContentCandidate
 * @property {string} trendId
 * @property {string} keyword
 * @property {TrendCategory} category
 * @property {'low' | 'medium' | 'high' | 'urgent'} urgency
 * @property {number} publicInterestScore
 * @property {string} suggestedAngle
 * @property {string} suggestedTitle
 * @property {string} suggestedScript
 * @property {string[]} suggestedHashtags
 * @property {'low' | 'medium' | 'high'} riskLevel
 * @property {number} createdAt
 */
