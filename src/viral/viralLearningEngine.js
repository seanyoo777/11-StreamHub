import { appendViralScoreAudit } from './viralScoreAudit.js'
import {
  loadPatternSnapshots,
  savePatternSnapshots,
  seedDefaultPatternSnapshots,
} from './viralScoreStore.js'

const TAG_TO_PATTERN = Object.freeze({
  surge: 'surge_content',
  market_crash: 'market_crash',
  bj_reaction: 'bj_reaction',
  urgent_news: 'urgent_news',
  breaking: 'urgent_news',
  top1: 'surge_content',
  ai_capture: 'surge_content',
})

/**
 * @param {string[]} tags
 */
export function getPatternBoostForTags(tags) {
  const snapshots = loadPatternSnapshots().length ? loadPatternSnapshots() : seedDefaultPatternSnapshots()
  let boost = 0
  for (const tag of tags) {
    const patternKey = TAG_TO_PATTERN[tag]
    if (!patternKey) continue
    const snap = snapshots.find((s) => s.pattern === patternKey)
    if (snap) {
      boost = Math.max(boost, Math.min(35, Math.round(snap.averageScore * 0.35)))
    }
  }
  return boost
}

/**
 * @param {import('./viralScoreTypes.js').ViralScore} score
 * @param {string[]} [tags]
 */
export function learnFromViralScore(score, tags = []) {
  seedDefaultPatternSnapshots()
  const snapshots = loadPatternSnapshots()
  const now = Date.now()
  let learned = false

  const patternsToUpdate = new Set()
  if (score.recommendation !== 'low_priority') {
    for (const tag of tags) {
      const p = TAG_TO_PATTERN[tag]
      if (p) patternsToUpdate.add(p)
    }
    if (score.urgencyScore >= 60) patternsToUpdate.add('urgent_news')
    if (score.engagementScore >= 60) patternsToUpdate.add('bj_reaction')
    if (score.ctrScore >= 60) patternsToUpdate.add('surge_content')
  }

  for (const pattern of patternsToUpdate) {
    const idx = snapshots.findIndex((s) => s.pattern === pattern)
    if (idx < 0) continue
    const row = snapshots[idx]
    const nextCount = row.successCount + 1
    row.averageScore = Math.round((row.averageScore * row.successCount + score.viralScore) / nextCount)
    row.successCount = nextCount
    row.lastDetectedAt = now
    learned = true
  }

  if (learned) {
    savePatternSnapshots(snapshots)
    appendViralScoreAudit('viral.pattern.learned', {
      correlation_id: `viral_learn_${score.contentId}`,
      payload: {
        contentId: score.contentId,
        viralScore: score.viralScore,
        patterns: [...patternsToUpdate],
      },
    })
  }

  return snapshots
}

/**
 * @returns {import('./viralScoreTypes.js').PatternLearningSnapshot[]}
 */
export function getTopLearningPatterns(limit = 4) {
  const rows = loadPatternSnapshots().length ? loadPatternSnapshots() : seedDefaultPatternSnapshots()
  return [...rows].sort((a, b) => b.averageScore - a.averageScore).slice(0, limit)
}

/**
 * @param {import('./viralScoreTypes.js').ViralScore[]} scores
 */
export function buildViralRecommendationsMock(scores) {
  const sorted = [...scores].sort((a, b) => b.viralScore - a.viralScore)
  const top = sorted[0]
  /** @type {string[]} */
  const lines = []

  if (top?.recommendedFirst) {
    lines.push(`오늘 가장 바이럴 가능성 높은 콘텐츠: ${top.contentId} (score ${top.viralScore})`)
  }
  if (sorted.some((s) => s.urgencyScore >= 70)) {
    lines.push('긴급 이슈 우선 제작')
  }
  if (sorted.some((s) => s.engagementScore >= 70)) {
    lines.push('BJ 리액션 우선')
  }
  if (sorted.some((s) => s.sourceType === 'market' && s.urgencyScore >= 65)) {
    lines.push('시장 폭락 브리핑 우선')
  }
  if (sorted.some((s) => s.contentType === 'stock_pick' && s.ctrScore >= 65)) {
    lines.push('AI 공략주 성과 우선')
  }

  return lines.length ? lines : ['mock: 후보 점수 산출 후 운영자 검수']
}
