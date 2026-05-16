import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import { detectMockClip } from '../../shorts/autoClipDetector.js'
import { getContentSafetyReviewByClipId } from '../../shorts/safety/contentSafetyStore.js'
import { loadShortsQueue, resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { resetContentSafetyReviewsForTests } from '../../shorts/safety/contentSafetyStore.js'
import { resetShortsNotificationsForTests } from '../../shorts/shortsNotifications.js'
import { runChannelWatcherPipeline } from '../../watchers/trend/trendContentFactory.js'
import { resetWatchedChannelsForTests, seedDefaultWatchedChannels } from '../../watchers/channel/watchedChannelStore.js'
import { resetContentFactoryRulesForTests } from '../../watchers/channel/watchedChannelRules.js'
import { resetTrendWatcherForTests } from '../../watchers/trend/trendKeywordStore.js'
import { calculateViralScore, mapViralRecommendation } from '../../viral/viralScoreCalculator.js'
import { getTopLearningPatterns, learnFromViralScore } from '../../viral/viralLearningEngine.js'
import {
  getViralScoreByContentId,
  loadViralScores,
  resetViralScoreStoreForTests,
  seedDefaultPatternSnapshots,
} from '../../viral/viralScoreStore.js'
import {
  prioritizeShortsQueueByViralScore,
  scoreAndPrioritizeClip,
} from '../../viral/viralQueueBridge.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.viral-score-engine'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runViralScoreEngineSuite() {
  const issues = []
  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetViralScoreStoreForTests()
  resetWatchedChannelsForTests()
  resetTrendWatcherForTests()
  resetContentFactoryRulesForTests()
  resetMockAuditTrailForTests()

  seedDefaultPatternSnapshots()

  const urgent = calculateViralScore({
    contentId: 'test_urgent',
    contentType: 'trend_candidate',
    sourceType: 'news',
    title: '긴급 속보 — 실시간 폭락',
    caption: 'AI 포착 급등 반전',
    transcript: '잠깐! 이 장면',
    detectionReason: CLIP_DETECTION_REASONS.AI_BREAKING_ALERT,
    urgency: 'urgent',
    publicInterestScore: 85,
  })

  if (urgent.viralScore < 50) {
    issues.push(issue(`${SUITE_ID}.calc`, `Low urgent score: ${urgent.viralScore}`, 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.calc`, `Urgent viral ${urgent.viralScore}`, 'PASS', SUITE_ID))
  }

  if (mapViralRecommendation(80) !== 'strong_candidate') {
    issues.push(issue(`${SUITE_ID}.rec`, 'Recommendation mapping failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.rec`, 'Recommendation mapping OK', 'PASS', SUITE_ID))
  }

  learnFromViralScore(urgent, ['urgent_news', 'surge'])
  const patterns = getTopLearningPatterns()
  if (patterns.length < 4) {
    issues.push(issue(`${SUITE_ID}.learn`, 'Pattern snapshots missing', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.learn`, `${patterns.length} patterns`, 'PASS', SUITE_ID))
  }

  const clip = detectMockClip({
    reason: CLIP_DETECTION_REASONS.SURGE_SPIKE,
    contentOverrides: {
      title: '급등 TOP1 실시간',
      caption: 'mock surge',
      transcript: 'hook',
      sourceType: 'market',
    },
  })

  const stored = getViralScoreByContentId(clip.id)
  if (!stored) {
    issues.push(issue(`${SUITE_ID}.store`, 'Score not stored', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.store`, `Stored score ${stored.viralScore}`, 'PASS', SUITE_ID))
  }

  void getContentSafetyReviewByClipId(clip.id)

  const lowClip = detectMockClip({
    reason: CLIP_DETECTION_REASONS.BJ_REACTION,
    contentOverrides: { title: 'calm', caption: 'low', transcript: '', sourceType: 'bj' },
  })
  scoreAndPrioritizeClip(lowClip, { contentType: 'auto_clip', sourceType: 'bj', title: 'calm' })

  prioritizeShortsQueueByViralScore()
  const queue = loadShortsQueue()
  const top = queue[0]
  if (!top?.viral_score && top?.viral_score !== 0) {
    issues.push(issue(`${SUITE_ID}.priority`, 'Queue missing viral_score', 'FAIL', SUITE_ID))
  } else if ((top.viral_score ?? 0) < (queue[queue.length - 1]?.viral_score ?? 0)) {
    issues.push(issue(`${SUITE_ID}.priority`, 'Queue not sorted by viral score', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.priority`, `Top clip ${top.id} score ${top.viral_score}`, 'PASS', SUITE_ID))
  }

  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetViralScoreStoreForTests()
  resetWatchedChannelsForTests()
  resetTrendWatcherForTests()
  resetContentFactoryRulesForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  seedDefaultWatchedChannels()
  const factory = runChannelWatcherPipeline('ch_bak_hodu_mock', 'surge_mention')
  const factoryClip = loadShortsQueue().find((c) => c.id === factory.clip?.id)
  if (factoryClip?.viral_score == null) {
    issues.push(issue(`${SUITE_ID}.factory`, 'Factory clip missing viral_score', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.factory`, `Factory viral ${factoryClip.viral_score}`, 'PASS', SUITE_ID))
  }

  const kinds = getMockAuditEntries().map((e) => e.kind)
  for (const kind of ['viral.score.calculated', 'viral.queue.prioritized']) {
    if (!kinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
    }
  }

  if (loadViralScores().length === 0) {
    issues.push(issue(`${SUITE_ID}.scores`, 'No viral scores persisted', 'FAIL', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.no-upload`, 'No upload / no external API', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Viral score engine mock flow', issues)
}
