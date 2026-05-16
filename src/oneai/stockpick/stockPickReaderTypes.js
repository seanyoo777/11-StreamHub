/** OneAI Stock Pick → StreamHub reader (localStorage contract mirror) */

export const ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY = 'oneai.stockpick.shorts_candidates_v1'

export const STREAMHUB_STOCKPICK_IMPORTED_KEY = 'streamhub.stockpick.imported_v1'

export const STOCKPICK_SUGGESTED_DURATIONS = Object.freeze([
  'shorts_30',
  'shorts_60',
  'highlight_300',
])

export const STOCKPICK_READER_AUDIT_KINDS = Object.freeze([
  'stockpick.reader.loaded',
  'stockpick.reader.imported_to_queue',
  'stockpick.reader.malformed_skipped',
])

export const STOCKPICK_READER_NOTIFICATION_KINDS = Object.freeze([
  'stockpick.candidate.found',
  'stockpick.imported_to_queue',
  'stockpick.safety_review_required',
])

export const STOCKPICK_IMPORT_SOURCE = 'oneai_stock_pick'

/**
 * @typedef {Object} StockPickPerformanceSnapshot
 * @property {number} [returnPct]
 * @property {number} [maxReturnPct]
 * @property {string} [portfolioKind]
 * @property {string} [pickStatus]
 * @property {string} [ticker]
 * @property {string} [marketSignalStatus]
 */

/**
 * @typedef {Object} StockPickShortsCandidate
 * @property {string} id
 * @property {string} [stockPickId]
 * @property {string} [scenarioKind]
 * @property {string} title
 * @property {string} hookText
 * @property {string} caption
 * @property {typeof STOCKPICK_SUGGESTED_DURATIONS[number]} suggestedDuration
 * @property {StockPickPerformanceSnapshot} [performanceSnapshot]
 * @property {string} riskText
 * @property {boolean} [reviewRequired]
 * @property {boolean} [mockOnly]
 */

/**
 * @typedef {Object} StockPickShortsBridgeSnapshot
 * @property {unknown[]} candidates
 * @property {string | null} [lastGeneratedAt]
 */
