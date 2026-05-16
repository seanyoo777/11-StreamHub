import {
  STREAMHUB_TREND_CANDIDATES_STORAGE_KEY,
  STREAMHUB_TREND_KEYWORDS_STORAGE_KEY,
  TREND_WATCHER_MOCK_ONLY,
} from './trendWatcherTypes.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

function getStorage() {
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
  const raw = getStorage().getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveJson(key, rows) {
  getStorage().setItem(key, JSON.stringify(rows))
}

/**
 * @returns {import('./trendWatcherTypes.js').TrendKeyword[]}
 */
export function loadTrendKeywords() {
  return loadJson(STREAMHUB_TREND_KEYWORDS_STORAGE_KEY)
}

/**
 * @returns {import('./trendWatcherTypes.js').TrendContentCandidate[]}
 */
export function loadTrendCandidates() {
  return loadJson(STREAMHUB_TREND_CANDIDATES_STORAGE_KEY)
}

/**
 * @param {import('./trendWatcherTypes.js').TrendContentCandidate} row
 */
export function appendTrendCandidate(row) {
  const rows = loadTrendCandidates()
  rows.push(row)
  saveJson(STREAMHUB_TREND_CANDIDATES_STORAGE_KEY, rows)
  return row
}

export function seedDefaultTrendKeywords() {
  if (loadTrendKeywords().length > 0) return loadTrendKeywords()

  const seeds = [
    { keywordId: 'tk_search', keyword: '실시간 검색어 mock', category: 'social', sourceType: 'realtime_search_mock', enabled: true, mockOnly: TREND_WATCHER_MOCK_ONLY },
    { keywordId: 'tk_news', keyword: '최신 뉴스 mock', category: 'politics', sourceType: 'latest_news_mock', enabled: true, mockOnly: TREND_WATCHER_MOCK_ONLY },
    { keywordId: 'tk_market', keyword: '시장 급등락 mock', category: 'market', sourceType: 'market_surge_drop_mock', enabled: true, mockOnly: TREND_WATCHER_MOCK_ONLY },
    { keywordId: 'tk_politics', keyword: '정치 이슈 mock', category: 'politics', sourceType: 'politics_issue_mock', enabled: true, mockOnly: TREND_WATCHER_MOCK_ONLY },
    { keywordId: 'tk_global', keyword: '글로벌 이슈 mock', category: 'global', sourceType: 'global_issue_mock', enabled: true, mockOnly: TREND_WATCHER_MOCK_ONLY },
    { keywordId: 'tk_crypto', keyword: '코인 급등 mock', category: 'crypto', sourceType: 'crypto_stock_keyword_mock', enabled: true, mockOnly: TREND_WATCHER_MOCK_ONLY },
  ]

  saveJson(STREAMHUB_TREND_KEYWORDS_STORAGE_KEY, seeds)
  return seeds
}

export function resetTrendWatcherForTests() {
  memoryStorage = {}
  saveJson(STREAMHUB_TREND_KEYWORDS_STORAGE_KEY, [])
  saveJson(STREAMHUB_TREND_CANDIDATES_STORAGE_KEY, [])
}
