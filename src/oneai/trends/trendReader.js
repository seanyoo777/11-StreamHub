import { ONEAI_VIRAL_TREND_RADAR_KEY, TREND_CATEGORIES, TREND_LEVELS, TREND_URGENCY_LEVELS } from './trendReaderTypes.js'
import { appendTrendReaderAudit } from './trendReaderAudit.js'
import { appendShortsNotification } from '../../shorts/shortsNotifications.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setTrendReaderStorageAdapter(adapter) {
  storageAdapter = adapter
}

export function getTrendReaderStorage() {
  if (storageAdapter) return storageAdapter
  if (typeof localStorage !== 'undefined') {
    return {
      getItem: (k) => localStorage.getItem(k),
      setItem: (k, v) => localStorage.setItem(k, v),
    }
  }
  return {
    getItem: (k) => memoryStorage[k] ?? null,
    setItem: (k, v) => {
      memoryStorage[k] = v
    },
  }
}

/**
 * @param {unknown} row
 * @returns {import('./trendReaderTypes.js').TrendReaderSnapshot | null}
 */
export function normalizeTrendCandidate(row) {
  if (!row || typeof row !== 'object') return null
  const r = /** @type {Record<string, unknown>} */ (row)
  if (typeof r.id !== 'string' || typeof r.keyword !== 'string') return null

  const category = TREND_CATEGORIES.includes(/** @type {import('./trendReaderTypes.js').TrendCategory} */ (r.category))
    ? r.category
    : 'breaking_news'
  const trendLevel = TREND_LEVELS.includes(/** @type {import('./trendReaderTypes.js').TrendLevel} */ (r.trendLevel))
    ? r.trendLevel
    : 'rising'
  const urgencyLevel = TREND_URGENCY_LEVELS.includes(
    /** @type {import('./trendReaderTypes.js').TrendUrgencyLevel} */ (r.urgencyLevel),
  )
    ? r.urgencyLevel
    : 'medium'

  const relatedThemes = Array.isArray(r.relatedThemes)
    ? r.relatedThemes.filter((t) => typeof t === 'string')
    : []
  const relatedTickers = Array.isArray(r.relatedTickers)
    ? r.relatedTickers.filter((t) => typeof t === 'string')
    : []

  return {
    id: r.id,
    keyword: r.keyword,
    category: /** @type {import('./trendReaderTypes.js').TrendCategory} */ (category),
    trendLevel: /** @type {import('./trendReaderTypes.js').TrendLevel} */ (trendLevel),
    urgencyLevel: /** @type {import('./trendReaderTypes.js').TrendUrgencyLevel} */ (urgencyLevel),
    shortPotentialScore: clampScore(r.shortPotentialScore, 50),
    briefingPotentialScore: clampScore(r.briefingPotentialScore, 40),
    overlayPriority: clampScore(r.overlayPriority, 55),
    relatedThemes,
    relatedTickers,
    mockOnly: r.mockOnly !== false,
  }
}

/**
 * @param {unknown} value
 * @param {number} fallback
 */
function clampScore(value, fallback) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(100, Math.round(n)))
}

/**
 * @returns {{
 *   trends: import('./trendReaderTypes.js').TrendReaderSnapshot[];
 *   malformedSkipped: number;
 *   lastScanAt: string | null;
 *   momentumIndex: number | null;
 * }}
 */
export function readViralTrendRadarFromStorage() {
  const raw = getTrendReaderStorage().getItem(ONEAI_VIRAL_TREND_RADAR_KEY)
  if (!raw) {
    return { trends: [], malformedSkipped: 0, lastScanAt: null, momentumIndex: null }
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    appendTrendReaderAudit('trend.reader.malformed_skipped', {
      correlation_id: `trend_parse_${Date.now()}`,
      payload: { reason: 'invalid_json' },
    })
    return { trends: [], malformedSkipped: 1, lastScanAt: null, momentumIndex: null }
  }

  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.trends)
      ? parsed.trends
      : []

  /** @type {import('./trendReaderTypes.js').TrendReaderSnapshot[]} */
  const trends = []
  let malformedSkipped = 0

  for (const row of list) {
    const normalized = normalizeTrendCandidate(row)
    if (!normalized) {
      malformedSkipped += 1
      continue
    }
    trends.push(normalized)
  }

  if (malformedSkipped > 0) {
    appendTrendReaderAudit('trend.reader.malformed_skipped', {
      correlation_id: `trend_skip_${Date.now()}`,
      payload: { count: malformedSkipped },
    })
  }

  const lastScanAt = typeof parsed?.lastScanAt === 'string' ? parsed.lastScanAt : null
  const momentumIndex =
    typeof parsed?.momentumIndex === 'number' ? parsed.momentumIndex : null

  return { trends, malformedSkipped, lastScanAt, momentumIndex }
}

/**
 * @param {{ notifyOnDetected?: boolean }} [options]
 */
export function loadViralTrendRadarWithAudit(options = {}) {
  const result = readViralTrendRadarFromStorage()
  const correlationId = `trend_load_${Date.now()}`

  appendTrendReaderAudit('trend.reader.loaded', {
    correlation_id: correlationId,
    payload: {
      count: result.trends.length,
      malformedSkipped: result.malformedSkipped,
      lastScanAt: result.lastScanAt,
      momentumIndex: result.momentumIndex,
    },
  })

  if (result.trends.length > 0) {
    const top = result.trends[0]
    appendTrendReaderAudit('trend.candidate.detected', {
      correlation_id: `${correlationId}_detect`,
      payload: { trendId: top.id, keyword: top.keyword, overlayPriority: top.overlayPriority },
    })

    if (options.notifyOnDetected !== false && top.overlayPriority >= 70) {
      appendShortsNotification({
        kind: 'trend.overlay_priority.detected',
        clip_id: top.id,
        correlation_id: correlationId,
        payload: { keyword: top.keyword, overlayPriority: top.overlayPriority },
      })
    }
  }

  return result
}

export function resetTrendReaderStorageForTests() {
  memoryStorage = {}
  storageAdapter = null
}

/**
 * @param {{ trends: unknown[]; lastScanAt?: string; momentumIndex?: number }} snapshot
 */
export function writeViralTrendRadarForTests(snapshot) {
  getTrendReaderStorage().setItem(ONEAI_VIRAL_TREND_RADAR_KEY, JSON.stringify(snapshot))
}
