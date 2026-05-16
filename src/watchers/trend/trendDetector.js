import { buildContentSuggestions } from '../contentSuggestionMock.js'
import { isTrendCategoryEnabled, isWatcherKeywordBlocked } from '../channel/watchedChannelRules.js'
import { appendTrendCandidate, loadTrendKeywords } from './trendKeywordStore.js'

const CATEGORY_RISK = {
  market: 'high',
  politics: 'high',
  social: 'medium',
  entertainment: 'low',
  crypto: 'high',
  global: 'medium',
}

/**
 * @param {import('./trendWatcherTypes.js').TrendKeyword} keywordRow
 */
export function detectTrendMock(keywordRow) {
  if (!keywordRow.enabled || !isTrendCategoryEnabled(keywordRow.category)) {
    return null
  }
  if (isWatcherKeywordBlocked(keywordRow.keyword)) {
    return null
  }

  const suggestions = buildContentSuggestions({
    keyword: keywordRow.keyword,
    category: keywordRow.category,
  })

  const createdAt = Date.now()
  const urgency =
    keywordRow.category === 'politics' || keywordRow.sourceType === 'latest_news_mock'
      ? 'urgent'
      : keywordRow.category === 'market'
        ? 'high'
        : 'medium'

  /** @type {import('./trendWatcherTypes.js').TrendContentCandidate} */
  const candidate = {
    trendId: `trend_${keywordRow.keywordId}_${createdAt}`,
    keyword: keywordRow.keyword,
    category: keywordRow.category,
    urgency,
    publicInterestScore: Math.floor(60 + Math.random() * 40),
    suggestedAngle: `${keywordRow.keyword} — mock angle`,
    suggestedTitle: suggestions.shortsTitle,
    suggestedScript: `[MOCK] ${suggestions.hook3sec} ${keywordRow.keyword} 요약.`,
    suggestedHashtags: suggestions.hashtags,
    riskLevel: CATEGORY_RISK[keywordRow.category] ?? 'medium',
    createdAt,
  }

  appendTrendCandidate(candidate)
  return candidate
}

/**
 * @param {import('./trendWatcherTypes.js').TrendKeyword} [keywordRow]
 */
export function detectAllTrendMocks(keywordRow) {
  const rows = keywordRow ? [keywordRow] : loadTrendKeywords().filter((k) => k.enabled)
  return rows.map((k) => detectTrendMock(k)).filter(Boolean)
}
