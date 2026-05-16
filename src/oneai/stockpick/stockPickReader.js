import {
  ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY,
  STOCKPICK_SUGGESTED_DURATIONS,
} from './stockPickReaderTypes.js'
import { appendStockPickReaderAudit } from './stockPickReaderAudit.js'
import { appendShortsNotification } from '../../shorts/shortsNotifications.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setStockPickReaderStorageAdapter(adapter) {
  storageAdapter = adapter
}

export function getStockPickStorage() {
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
 * @returns {import('./stockPickReaderTypes.js').StockPickShortsCandidate | null}
 */
export function normalizeStockPickCandidate(row) {
  if (!row || typeof row !== 'object') return null
  const r = /** @type {Record<string, unknown>} */ (row)
  if (typeof r.id !== 'string' || typeof r.title !== 'string') return null
  const duration = r.suggestedDuration
  const safeDuration = STOCKPICK_SUGGESTED_DURATIONS.includes(
    /** @type {typeof STOCKPICK_SUGGESTED_DURATIONS[number]} */ (duration),
  )
    ? duration
    : 'shorts_30'

  return {
    id: r.id,
    stockPickId: typeof r.stockPickId === 'string' ? r.stockPickId : 'unknown',
    scenarioKind: typeof r.scenarioKind === 'string' ? r.scenarioKind : 'top_return',
    title: r.title,
    hookText: typeof r.hookText === 'string' ? r.hookText : '',
    caption: typeof r.caption === 'string' ? r.caption : '',
    suggestedDuration: /** @type {typeof STOCKPICK_SUGGESTED_DURATIONS[number]} */ (safeDuration),
    performanceSnapshot:
      r.performanceSnapshot && typeof r.performanceSnapshot === 'object'
        ? /** @type {import('./stockPickReaderTypes.js').StockPickPerformanceSnapshot} */ (
            r.performanceSnapshot
          )
        : {},
    riskText: typeof r.riskText === 'string' ? r.riskText : '',
    reviewRequired: r.reviewRequired !== false,
    mockOnly: r.mockOnly !== false,
  }
}

/**
 * @returns {{ candidates: import('./stockPickReaderTypes.js').StockPickShortsCandidate[]; malformedSkipped: number; lastGeneratedAt: string | null }}
 */
export function readStockPickCandidatesFromStorage() {
  const raw = getStockPickStorage().getItem(ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY)
  if (!raw) {
    return { candidates: [], malformedSkipped: 0, lastGeneratedAt: null }
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    appendStockPickReaderAudit('stockpick.reader.malformed_skipped', {
      correlation_id: `stockpick_parse_${Date.now()}`,
      payload: { reason: 'invalid_json' },
    })
    return { candidates: [], malformedSkipped: 1, lastGeneratedAt: null }
  }

  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.candidates)
      ? parsed.candidates
      : []

  /** @type {import('./stockPickReaderTypes.js').StockPickShortsCandidate[]} */
  const candidates = []
  let malformedSkipped = 0

  for (const row of list) {
    const normalized = normalizeStockPickCandidate(row)
    if (!normalized) {
      malformedSkipped += 1
      continue
    }
    candidates.push(normalized)
  }

  if (malformedSkipped > 0) {
    appendStockPickReaderAudit('stockpick.reader.malformed_skipped', {
      correlation_id: `stockpick_skip_${Date.now()}`,
      payload: { count: malformedSkipped },
    })
  }

  const lastGeneratedAt =
    typeof parsed?.lastGeneratedAt === 'string' ? parsed.lastGeneratedAt : null

  return { candidates, malformedSkipped, lastGeneratedAt }
}

/**
 * @param {{ notifyOnFound?: boolean }} [options]
 */
export function loadStockPickCandidatesWithAudit(options = {}) {
  const result = readStockPickCandidatesFromStorage()
  const correlationId = `stockpick_load_${Date.now()}`

  appendStockPickReaderAudit('stockpick.reader.loaded', {
    correlation_id: correlationId,
    payload: {
      count: result.candidates.length,
      malformedSkipped: result.malformedSkipped,
      lastGeneratedAt: result.lastGeneratedAt,
    },
  })

  if (options.notifyOnFound !== false && result.candidates.length > 0) {
    appendShortsNotification({
      kind: 'stockpick.candidate.found',
      clip_id: result.candidates[0].id,
      correlation_id: correlationId,
      payload: { count: result.candidates.length },
    })
  }

  return result
}

export function resetStockPickReaderStorageForTests() {
  memoryStorage = {}
  storageAdapter = null
}

/**
 * @param {import('./stockPickReaderTypes.js').StockPickShortsBridgeSnapshot} snapshot
 */
export function writeStockPickCandidatesForTests(snapshot) {
  getStockPickStorage().setItem(ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY, JSON.stringify(snapshot))
}
