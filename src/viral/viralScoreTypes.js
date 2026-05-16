/** Viral Score Engine — mock performance learning (no YouTube/analytics API) */

export const STREAMHUB_VIRAL_SCORES_STORAGE_KEY = 'streamhub.viral_scores_v1'
export const STREAMHUB_VIRAL_PATTERNS_STORAGE_KEY = 'streamhub.viral_patterns_v1'

export const VIRAL_CONTENT_TYPES = Object.freeze([
  'channel_moment',
  'trend_candidate',
  'stock_pick',
  'auto_clip',
])

export const VIRAL_SOURCE_TYPES = Object.freeze([
  'news',
  'market',
  'politics',
  'bj',
  'tournament',
  'entertainment',
  'crypto',
  'global',
])

export const VIRAL_RECOMMENDATIONS = Object.freeze([
  'strong_candidate',
  'watch_candidate',
  'low_priority',
])

export const VIRAL_PRIORITY_LEVELS = Object.freeze(['P0', 'P1', 'P2', 'P3'])

export const VIRAL_SCORE_AUDIT_KINDS = Object.freeze([
  'viral.score.calculated',
  'viral.content.recommended',
  'viral.pattern.learned',
  'viral.queue.prioritized',
])

export const VIRAL_NOTIFICATION_KINDS = Object.freeze([
  'viral.high_candidate.detected',
  'viral.recommended.first',
  'viral.urgent_trend.detected',
])

export const VIRAL_KEYWORD_BOOSTS = Object.freeze([
  { phrase: '긴급', points: 18, tag: 'urgent_news' },
  { phrase: '폭락', points: 16, tag: 'market_crash' },
  { phrase: '급등', points: 15, tag: 'surge' },
  { phrase: 'TOP1', points: 14, tag: 'top1' },
  { phrase: '실시간', points: 12, tag: 'live' },
  { phrase: '반전', points: 12, tag: 'reversal' },
  { phrase: 'AI 포착', points: 14, tag: 'ai_capture' },
  { phrase: '공포', points: 10, tag: 'fear' },
  { phrase: '탐욕', points: 10, tag: 'greed' },
  { phrase: '브리핑', points: 8, tag: 'briefing' },
  { phrase: '리액션', points: 11, tag: 'bj_reaction' },
  { phrase: '속보', points: 16, tag: 'breaking' },
])

export const VIRAL_PATTERN_SEEDS = Object.freeze([
  { pattern: 'surge_content', label: '급등 콘텐츠 강세' },
  { pattern: 'bj_reaction', label: 'BJ 리액션 강세' },
  { pattern: 'urgent_news', label: '긴급 뉴스 강세' },
  { pattern: 'market_crash', label: '시장 폭락 강세' },
])

export const VIRAL_MOCK_ONLY = true

/**
 * @typedef {typeof VIRAL_CONTENT_TYPES[number]} ViralContentType
 * @typedef {typeof VIRAL_SOURCE_TYPES[number]} ViralSourceType
 * @typedef {typeof VIRAL_RECOMMENDATIONS[number]} ViralRecommendation
 * @typedef {typeof VIRAL_PRIORITY_LEVELS[number]} ViralPriorityLevel
 * @typedef {Object} ViralScore
 * @property {string} contentId
 * @property {ViralContentType} contentType
 * @property {ViralSourceType | string} sourceType
 * @property {number} viralScore
 * @property {number} ctrScore
 * @property {number} engagementScore
 * @property {number} urgencyScore
 * @property {number} controversyScore
 * @property {number} repeatPatternScore
 * @property {number} riskScore
 * @property {ViralRecommendation} recommendation
 * @property {ViralPriorityLevel} priorityLevel
 * @property {boolean} recommendedFirst
 * @property {number} createdAt
 * @property {boolean} mockOnly
 * @typedef {Object} PatternLearningSnapshot
 * @property {string} pattern
 * @property {string} [label]
 * @property {number} averageScore
 * @property {number} successCount
 * @property {number} lastDetectedAt
 */
