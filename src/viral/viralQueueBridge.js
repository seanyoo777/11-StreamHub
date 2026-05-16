import { getContentSafetyReviewByClipId } from '../shorts/safety/contentSafetyStore.js'
import { appendShortsNotification } from '../shorts/shortsNotifications.js'
import {
  loadShortsQueue,
  saveShortsQueue,
  updateShortsQueueClipFields,
} from '../shorts/shortsQueueStore.js'
import { buildViralInputFromClip, calculateViralScore } from './viralScoreCalculator.js'
import { appendViralScoreAudit } from './viralScoreAudit.js'
import { learnFromViralScore } from './viralLearningEngine.js'
import { getViralScoreByContentId, upsertViralScore } from './viralScoreStore.js'
import { VIRAL_KEYWORD_BOOSTS } from './viralScoreTypes.js'

/**
 * @param {string} haystack
 */
function extractMatchedTags(haystack) {
  const lower = haystack.toLowerCase()
  return VIRAL_KEYWORD_BOOSTS.filter((b) => lower.includes(b.phrase.toLowerCase())).map((b) => b.tag)
}

/**
 * @param {import('../shorts/contracts/overlayBridge.js').ShortsClipRecord} clip
 * @param {Parameters<typeof buildViralInputFromClip>[1]} [extras]
 */
export function scoreAndPrioritizeClip(clip, extras = {}) {
  const review = getContentSafetyReviewByClipId(clip.id)
  const input = buildViralInputFromClip(clip, {
    ...extras,
    safetyRiskScore: review?.riskScore ?? 0,
    caption: extras.caption ?? review?.caption,
    transcript: extras.transcript ?? review?.transcript,
    title: extras.title ?? review?.title,
  })
  const combined = [input.title, input.caption, input.transcript].join(' ')
  input.matchedTags = extractMatchedTags(combined)

  const score = calculateViralScore(input)
  upsertViralScore(score)
  learnFromViralScore(score, input.matchedTags)

  updateShortsQueueClipFields(clip.id, {
    viral_score: score.viralScore,
    viral_priority: score.viralScore,
    viral_recommendation: score.recommendation,
    priority_level: score.priorityLevel,
    recommended_first: score.recommendedFirst,
  })

  const correlationId = `viral_${clip.id}_${score.createdAt}`

  appendViralScoreAudit('viral.score.calculated', {
    correlation_id: correlationId,
    payload: {
      contentId: score.contentId,
      viralScore: score.viralScore,
      recommendation: score.recommendation,
      priorityLevel: score.priorityLevel,
    },
  })

  if (score.recommendation === 'strong_candidate') {
    appendViralScoreAudit('viral.content.recommended', {
      correlation_id: correlationId,
      payload: { contentId: score.contentId, viralScore: score.viralScore },
    })
    appendShortsNotification({
      kind: 'viral.high_candidate.detected',
      clip_id: clip.id,
      correlation_id: correlationId,
      payload: { viralScore: score.viralScore },
    })
  }

  if (score.recommendedFirst) {
    appendShortsNotification({
      kind: 'viral.recommended.first',
      clip_id: clip.id,
      correlation_id: correlationId,
      payload: { priorityLevel: score.priorityLevel },
    })
  }

  if (score.urgencyScore >= 75) {
    appendShortsNotification({
      kind: 'viral.urgent_trend.detected',
      clip_id: clip.id,
      correlation_id: correlationId,
      payload: { urgencyScore: score.urgencyScore },
    })
  }

  prioritizeShortsQueueByViralScore()

  return score
}

/**
 * Re-order queue: higher viral_priority first (stable within same score by occurred_at_ms desc).
 */
export function prioritizeShortsQueueByViralScore() {
  const queue = loadShortsQueue()
  queue.sort((a, b) => {
    const pa = Number(a.viral_priority ?? a.viral_score ?? 0)
    const pb = Number(b.viral_priority ?? b.viral_score ?? 0)
    if (pb !== pa) return pb - pa
    return (b.occurred_at_ms ?? 0) - (a.occurred_at_ms ?? 0)
  })
  saveShortsQueue(queue)

  appendViralScoreAudit('viral.queue.prioritized', {
    correlation_id: `viral_queue_${Date.now()}`,
    payload: { count: queue.length, topId: queue[0]?.id ?? null },
  })

  return queue
}

/**
 * @returns {{ queue: import('../shorts/contracts/overlayBridge.js').ShortsClipRecord[]; scores: import('./viralScoreTypes.js').ViralScore[] }}
 */
export function getPriorityQueuePreview() {
  const queue = loadShortsQueue()
  const scores = queue
    .map((c) => getViralScoreByContentId(c.id))
    .filter(Boolean)
  return { queue, scores: /** @type {import('./viralScoreTypes.js').ViralScore[]} */ (scores) }
}
