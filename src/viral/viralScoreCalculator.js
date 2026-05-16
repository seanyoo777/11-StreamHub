import { CLIP_DETECTION_REASONS } from '../shorts/contracts/clipDetection.js'
import { getPatternBoostForTags } from './viralLearningEngine.js'
import {
  VIRAL_KEYWORD_BOOSTS,
  VIRAL_MOCK_ONLY,
  VIRAL_PRIORITY_LEVELS,
  VIRAL_RECOMMENDATIONS,
} from './viralScoreTypes.js'

/**
 * @typedef {Object} ViralScoreInput
 * @property {string} contentId
 * @property {import('./viralScoreTypes.js').ViralContentType} contentType
 * @property {string} sourceType
 * @property {string} [title]
 * @property {string} [caption]
 * @property {string} [transcript]
 * @property {string} [detectionReason]
 * @property {string} [momentReason]
 * @property {string} [trendCategory]
 * @property {'low' | 'medium' | 'high' | 'urgent'} [urgency]
 * @property {number} [publicInterestScore]
 * @property {number} [safetyRiskScore]
 * @property {string[]} [matchedTags]
 */

/**
 * @param {string} haystack
 * @param {readonly { phrase: string; points: number; tag: string }[]} boosts
 */
function scoreKeywordBoosts(haystack, boosts = VIRAL_KEYWORD_BOOSTS) {
  const lower = haystack.toLowerCase()
  let points = 0
  /** @type {string[]} */
  const tags = []
  for (const row of boosts) {
    if (lower.includes(row.phrase.toLowerCase())) {
      points += row.points
      tags.push(row.tag)
    }
  }
  return { points, tags }
}

/**
 * @param {ViralScoreInput} input
 */
function scoreDetectionReason(input) {
  const reason = input.detectionReason ?? input.momentReason ?? ''
  let urgency = 0
  let engagement = 0
  let ctr

  switch (reason) {
    case CLIP_DETECTION_REASONS.AI_BREAKING_ALERT:
    case 'breaking_news':
    case 'ai_briefing_highlight':
      urgency = 28
      ctr = 20
      break
    case CLIP_DETECTION_REASONS.SURGE_SPIKE:
    case 'surge_mention':
      urgency = 22
      ctr = 18
      break
    case CLIP_DETECTION_REASONS.PLUNGE_DROP:
    case 'plunge_mention':
      urgency = 24
      ctr = 16
      break
    case CLIP_DETECTION_REASONS.BJ_REACTION:
    case 'bj_reaction':
    case 'chat_surge':
      engagement = 26
      ctr = 15
      break
    case CLIP_DETECTION_REASONS.LEAGUE_CHAMPION:
    case 'tournament_win':
      engagement = 22
      ctr = 14
      break
    case CLIP_DETECTION_REASONS.HIGH_PNL:
    case 'pnl_mention':
      ctr = 20
      engagement = 12
      break
    case CLIP_DETECTION_REASONS.ONEAI_STOCK_PICK:
      ctr = 18
      engagement = 10
      break
    default:
      engagement = 8
      ctr = 6
  }

  if (input.trendCategory === 'politics') urgency += 12
  if (input.trendCategory === 'market' || input.trendCategory === 'crypto') ctr += 10
  if (input.trendCategory === 'entertainment') engagement += 8

  if (input.urgency === 'urgent') urgency += 20
  else if (input.urgency === 'high') urgency += 10

  if (typeof input.publicInterestScore === 'number') {
    engagement += Math.min(20, Math.round(input.publicInterestScore / 5))
  }

  return { urgency, engagement, ctr }
}

/**
 * @param {number} viralScore
 */
export function mapViralRecommendation(viralScore) {
  if (viralScore >= 75) return VIRAL_RECOMMENDATIONS[0]
  if (viralScore >= 50) return VIRAL_RECOMMENDATIONS[1]
  return VIRAL_RECOMMENDATIONS[2]
}

/**
 * @param {number} viralScore
 * @param {import('./viralScoreTypes.js').ViralRecommendation} recommendation
 */
export function mapViralPriorityLevel(viralScore, recommendation) {
  if (recommendation === VIRAL_RECOMMENDATIONS[0] && viralScore >= 85) {
    return VIRAL_PRIORITY_LEVELS[0]
  }
  if (recommendation === VIRAL_RECOMMENDATIONS[0]) {
    return VIRAL_PRIORITY_LEVELS[1]
  }
  if (recommendation === VIRAL_RECOMMENDATIONS[1]) {
    return VIRAL_PRIORITY_LEVELS[2]
  }
  return VIRAL_PRIORITY_LEVELS[3]
}

/**
 * @param {ViralScoreInput} input
 * @returns {import('./viralScoreTypes.js').ViralScore}
 */
export function calculateViralScore(input) {
  const combined = [input.title, input.caption, input.transcript].filter(Boolean).join(' ')
  const { points: keywordPoints, tags } = scoreKeywordBoosts(combined)
  const allTags = [...new Set([...(input.matchedTags ?? []), ...tags])]
  const reasonScores = scoreDetectionReason(input)
  const patternBoost = getPatternBoostForTags(allTags)

  const hookShort = (input.transcript?.length ?? 0) > 0 && (input.transcript?.length ?? 99) < 80
  const titleStrong = (input.title?.length ?? 0) >= 12

  let ctrScore = Math.min(100, reasonScores.ctr + Math.round(keywordPoints * 0.35) + (titleStrong ? 8 : 0))
  let engagementScore = Math.min(
    100,
    reasonScores.engagement + Math.round(keywordPoints * 0.25) + (hookShort ? 10 : 0),
  )
  let urgencyScore = Math.min(100, reasonScores.urgency + Math.round(keywordPoints * 0.4))
  let controversyScore = 0
  if (input.sourceType === 'politics' || allTags.includes('breaking')) {
    controversyScore = Math.min(40, 12 + Math.round(keywordPoints * 0.15))
  }

  const repeatPatternScore = Math.min(100, patternBoost)
  const riskScore = Math.min(100, input.safetyRiskScore ?? 0)

  let viralScore = Math.round(
    ctrScore * 0.28 +
      engagementScore * 0.27 +
      urgencyScore * 0.25 +
      repeatPatternScore * 0.12 +
      keywordPoints * 0.08 -
      controversyScore * 0.15 -
      riskScore * 0.1,
  )
  viralScore = Math.max(0, Math.min(100, viralScore))

  const recommendation = mapViralRecommendation(viralScore)
  const priorityLevel = mapViralPriorityLevel(viralScore, recommendation)
  const recommendedFirst = priorityLevel === 'P0' || (recommendation === 'strong_candidate' && viralScore >= 80)

  return {
    contentId: input.contentId,
    contentType: input.contentType,
    sourceType: input.sourceType,
    viralScore,
    ctrScore,
    engagementScore,
    urgencyScore,
    controversyScore,
    repeatPatternScore,
    riskScore,
    recommendation,
    priorityLevel,
    recommendedFirst,
    createdAt: Date.now(),
    mockOnly: VIRAL_MOCK_ONLY,
  }
}

/**
 * @param {import('../shorts/contracts/overlayBridge.js').ShortsClipRecord} clip
 * @param {{
 *   contentType?: import('./viralScoreTypes.js').ViralContentType;
 *   sourceType?: string;
 *   title?: string;
 *   caption?: string;
 *   transcript?: string;
 *   momentReason?: string;
 *   trendCategory?: string;
 *   urgency?: string;
 *   publicInterestScore?: number;
 *   safetyRiskScore?: number;
 * }} [extras]
 */
export function buildViralInputFromClip(clip, extras = {}) {
  return {
    contentId: clip.id,
    contentType: extras.contentType ?? 'auto_clip',
    sourceType: extras.sourceType ?? 'market',
    title: extras.title ?? clip.preview_title,
    caption: extras.caption ?? '',
    transcript: extras.transcript ?? '',
    detectionReason: clip.detection_reason,
    momentReason: extras.momentReason,
    trendCategory: extras.trendCategory,
    urgency: /** @type {'low' | 'medium' | 'high' | 'urgent' | undefined} */ (extras.urgency),
    publicInterestScore: extras.publicInterestScore,
    safetyRiskScore: extras.safetyRiskScore,
  }
}
