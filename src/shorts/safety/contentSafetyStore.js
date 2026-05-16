import { STREAMHUB_CONTENT_SAFETY_STORAGE_KEY } from './contentSafetyTypes.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setContentSafetyStorageAdapter(adapter) {
  storageAdapter = adapter
}

function getStorage() {
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
 * @returns {import('./contentSafetyTypes.js').ContentSafetyReview}
 */
function normalizeReviewRow(row) {
  const r = /** @type {Record<string, unknown>} */ (row)
  return {
    id: String(r.id),
    clipId: String(r.clipId ?? r.clip_id),
    title: String(r.title ?? ''),
    caption: String(r.caption ?? ''),
    transcript: String(r.transcript ?? ''),
    sourceType: /** @type {import('./contentSafetyTypes.js').ContentSafetySourceType} */ (r.sourceType),
    riskScore: Number(r.riskScore),
    verdict: /** @type {import('./contentSafetyTypes.js').ContentSafetyVerdict} */ (r.verdict),
    flags: /** @type {import('./contentSafetyTypes.js').ContentSafetyFlags} */ (r.flags),
    suggestedFixes: Array.isArray(r.suggestedFixes) ? r.suggestedFixes : [],
    operatorDecision:
      r.operatorDecision != null
        ? /** @type {import('./contentSafetyTypes.js').ContentSafetyOperatorDecision} */ (
            r.operatorDecision
          )
        : r.operator_decision != null
          ? /** @type {import('./contentSafetyTypes.js').ContentSafetyOperatorDecision} */ (
              r.operator_decision
            )
          : null,
    operatorDecisionAtMs:
      r.operatorDecisionAtMs != null
        ? Number(r.operatorDecisionAtMs)
        : r.operator_decision_at_ms != null
          ? Number(r.operator_decision_at_ms)
          : null,
    correlationId: String(r.correlationId ?? r.correlation_id),
    reviewedAtMs: Number(r.reviewedAtMs ?? r.reviewed_at_ms),
    mockOnly: r.mockOnly !== false,
  }
}

/**
 * @returns {import('./contentSafetyTypes.js').ContentSafetyReview[]}
 */
export function loadContentSafetyReviews() {
  const raw = getStorage().getItem(STREAMHUB_CONTENT_SAFETY_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeReviewRow)
  } catch {
    return []
  }
}

/**
 * @param {import('./contentSafetyTypes.js').ContentSafetyReview[]} rows
 */
export function saveContentSafetyReviews(rows) {
  getStorage().setItem(STREAMHUB_CONTENT_SAFETY_STORAGE_KEY, JSON.stringify(rows))
}

/**
 * @param {import('./contentSafetyTypes.js').ContentSafetyReview} row
 */
export function upsertContentSafetyReview(row) {
  const rows = loadContentSafetyReviews()
  const idx = rows.findIndex((r) => r.id === row.id)
  if (idx >= 0) rows[idx] = row
  else rows.push(row)
  saveContentSafetyReviews(rows)
  return row
}

/**
 * @param {string} clipId
 */
export function getContentSafetyReviewByClipId(clipId) {
  const rows = loadContentSafetyReviews()
  return [...rows].reverse().find((r) => r.clipId === clipId) ?? null
}

export function resetContentSafetyReviewsForTests() {
  memoryStorage = {}
  storageAdapter = null
  saveContentSafetyReviews([])
}
