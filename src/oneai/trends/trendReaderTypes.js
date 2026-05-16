/** OneAI Viral Trend Radar → StreamHub reader (localStorage read-only bridge) */

export const ONEAI_VIRAL_TREND_RADAR_KEY = 'tetherget.viral_trend_radar_v1'

export const STREAMHUB_TREND_IMPORTED_SHORTS_KEY = 'streamhub.trend.imported_shorts_v1'
export const STREAMHUB_TREND_IMPORTED_OVERLAY_KEY = 'streamhub.trend.imported_overlay_v1'

export const TREND_IMPORT_SOURCE = 'viral_trend_radar'

export const TREND_CATEGORIES = Object.freeze([
  'stock',
  'crypto',
  'politics',
  'ai',
  'entertainment',
  'breaking_news',
  'macro',
  'commodity',
  'meme',
  'market_alert',
])

export const TREND_LEVELS = Object.freeze(['emerging', 'rising', 'viral', 'peak', 'cooling'])

export const TREND_URGENCY_LEVELS = Object.freeze(['low', 'medium', 'high', 'urgent'])

export const TREND_READER_AUDIT_KINDS = Object.freeze([
  'trend.reader.loaded',
  'trend.candidate.detected',
  'trend.imported_to_shorts_mock',
  'trend.imported_to_overlay_mock',
  'trend.reader.malformed_skipped',
])

export const TREND_READER_NOTIFICATION_KINDS = Object.freeze([
  'trend.urgent.imported',
  'trend.high_shorts_potential',
  'trend.overlay_priority.detected',
])

/**
 * @typedef {typeof TREND_CATEGORIES[number]} TrendCategory
 * @typedef {typeof TREND_LEVELS[number]} TrendLevel
 * @typedef {typeof TREND_URGENCY_LEVELS[number]} TrendUrgencyLevel
 * @typedef {Object} TrendReaderSnapshot
 * @property {string} id
 * @property {string} keyword
 * @property {TrendCategory} category
 * @property {TrendLevel} trendLevel
 * @property {TrendUrgencyLevel} urgencyLevel
 * @property {number} shortPotentialScore
 * @property {number} briefingPotentialScore
 * @property {number} overlayPriority
 * @property {string[]} relatedThemes
 * @property {string[]} [relatedTickers]
 * @property {boolean} mockOnly
 */
