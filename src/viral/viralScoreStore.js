import {
  STREAMHUB_VIRAL_PATTERNS_STORAGE_KEY,
  STREAMHUB_VIRAL_SCORES_STORAGE_KEY,
  VIRAL_PATTERN_SEEDS,
} from './viralScoreTypes.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setViralScoreStorageAdapter(adapter) {
  storageAdapter = adapter
}

export function getViralScoreStorage() {
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

function loadJson(key) {
  const raw = getViralScoreStorage().getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveJson(key, rows) {
  getViralScoreStorage().setItem(key, JSON.stringify(rows))
}

/**
 * @returns {import('./viralScoreTypes.js').ViralScore[]}
 */
export function loadViralScores() {
  return loadJson(STREAMHUB_VIRAL_SCORES_STORAGE_KEY)
}

/**
 * @param {import('./viralScoreTypes.js').ViralScore} row
 */
export function upsertViralScore(row) {
  const rows = loadViralScores()
  const idx = rows.findIndex((r) => r.contentId === row.contentId)
  if (idx >= 0) rows[idx] = row
  else rows.push(row)
  saveJson(STREAMHUB_VIRAL_SCORES_STORAGE_KEY, rows)
  return row
}

/**
 * @param {string} contentId
 */
export function getViralScoreByContentId(contentId) {
  return loadViralScores().find((r) => r.contentId === contentId) ?? null
}

/**
 * @returns {import('./viralScoreTypes.js').PatternLearningSnapshot[]}
 */
export function loadPatternSnapshots() {
  return loadJson(STREAMHUB_VIRAL_PATTERNS_STORAGE_KEY)
}

/**
 * @param {import('./viralScoreTypes.js').PatternLearningSnapshot[]} rows
 */
export function savePatternSnapshots(rows) {
  saveJson(STREAMHUB_VIRAL_PATTERNS_STORAGE_KEY, rows)
}

export function seedDefaultPatternSnapshots() {
  const existing = loadPatternSnapshots()
  if (existing.length > 0) return existing

  const now = Date.now()
  const seeds = VIRAL_PATTERN_SEEDS.map((s, i) => ({
    pattern: s.pattern,
    label: s.label,
    averageScore: 55 + i * 5,
    successCount: 3 + i,
    lastDetectedAt: now - i * 86_400_000,
  }))
  savePatternSnapshots(seeds)
  return seeds
}

export function resetViralScoreStoreForTests() {
  memoryStorage = {}
  storageAdapter = null
  saveJson(STREAMHUB_VIRAL_SCORES_STORAGE_KEY, [])
  saveJson(STREAMHUB_VIRAL_PATTERNS_STORAGE_KEY, [])
}
