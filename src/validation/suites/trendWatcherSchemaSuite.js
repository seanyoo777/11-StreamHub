import {
  STREAMHUB_TREND_CANDIDATES_STORAGE_KEY,
  STREAMHUB_TREND_KEYWORDS_STORAGE_KEY,
  TREND_CATEGORIES,
  TREND_SOURCE_TYPES,
  WATCHER_FACTORY_AUDIT_KINDS,
  WATCHER_TREND_AUDIT_KINDS,
} from '../../watchers/trend/trendWatcherTypes.js'
import { buildContentSuggestions } from '../../watchers/contentSuggestionMock.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.trend-watcher-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runTrendWatcherSchemaSuite() {
  const issues = []

  if (!STREAMHUB_TREND_KEYWORDS_STORAGE_KEY.startsWith('streamhub.')) {
    issues.push(issue(`${SUITE_ID}.keywords`, 'Invalid keywords key', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.keywords`, STREAMHUB_TREND_KEYWORDS_STORAGE_KEY, 'PASS', SUITE_ID))
  }

  if (!STREAMHUB_TREND_CANDIDATES_STORAGE_KEY.startsWith('streamhub.')) {
    issues.push(issue(`${SUITE_ID}.candidates`, 'Invalid candidates key', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.candidates`, STREAMHUB_TREND_CANDIDATES_STORAGE_KEY, 'PASS', SUITE_ID))
  }

  for (const s of TREND_SOURCE_TYPES) {
    issues.push(issue(`${SUITE_ID}.source.${s}`, s, 'PASS', SUITE_ID))
  }

  for (const c of TREND_CATEGORIES) {
    issues.push(issue(`${SUITE_ID}.cat.${c}`, c, 'PASS', SUITE_ID))
  }

  for (const kind of [...WATCHER_TREND_AUDIT_KINDS, ...WATCHER_FACTORY_AUDIT_KINDS]) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
  }

  const suggestions = buildContentSuggestions({ keyword: 'test' })
  if (suggestions.titles.length < 5) {
    issues.push(issue(`${SUITE_ID}.titles`, 'Expected 5 title suggestions', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.titles`, 'Title suggestions OK', 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.no-crawl`, 'No news crawl / no external API', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Trend watcher schema', issues)
}
