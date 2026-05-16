import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { detectMockClip } from '../src/shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../src/shorts/contracts/clipDetection.js'
import { loadShortsQueue, resetShortsQueueForTests } from '../src/shorts/shortsQueueStore.js'
import { resetContentSafetyReviewsForTests } from '../src/shorts/safety/contentSafetyStore.js'
import { resetShortsNotificationsForTests } from '../src/shorts/shortsNotifications.js'
import { calculateViralScore } from '../src/viral/viralScoreCalculator.js'
import { getViralScoreByContentId, resetViralScoreStoreForTests } from '../src/viral/viralScoreStore.js'
import { prioritizeShortsQueueByViralScore } from '../src/viral/viralQueueBridge.js'
import { resolveAdminPageId } from '../src/admin/resolveAdminPage.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'

describe('Viral score engine', () => {
  beforeEach(() => {
    resetShortsQueueForTests()
    resetContentSafetyReviewsForTests()
    resetShortsNotificationsForTests()
    resetViralScoreStoreForTests()
  })

  it('scores high for urgent keyword content', () => {
    const score = calculateViralScore({
      contentId: 'x1',
      contentType: 'trend_candidate',
      sourceType: 'news',
      title: '긴급 속보 — 실시간 폭락',
      caption: 'AI 포착 급등 반전',
      transcript: 'hook',
      detectionReason: CLIP_DETECTION_REASONS.AI_BREAKING_ALERT,
      urgency: 'urgent',
      publicInterestScore: 85,
    })
    assert.ok(score.viralScore >= 50)
    assert.ok(['strong_candidate', 'watch_candidate'].includes(score.recommendation))
  })

  it('attaches viral fields on clip detect and sorts queue', () => {
    detectMockClip({
      reason: CLIP_DETECTION_REASONS.HIGH_PNL,
      contentOverrides: { title: '급등 TOP1', caption: 'mock', sourceType: 'market' },
    })
    detectMockClip({
      reason: CLIP_DETECTION_REASONS.BJ_REACTION,
      contentOverrides: { title: 'quiet', caption: 'x', sourceType: 'bj' },
    })
    prioritizeShortsQueueByViralScore()
    const queue = loadShortsQueue()
    assert.equal(queue.length, 2)
    assert.ok((queue[0].viral_score ?? 0) >= (queue[1].viral_score ?? 0))
    assert.ok(getViralScoreByContentId(queue[0].id))
  })

  it('resolves /admin/viral', () => {
    assert.equal(resolveAdminPageId('/admin/viral'), 'viral')
  })

  it('registers viral self-test suites', () => {
    const ids = runStreamHubSelfTests().suites.map((s) => s.id)
    assert.ok(ids.includes('contract.viral-score-schema'))
    assert.ok(ids.includes('mock.viral-score-engine'))
  })
})
