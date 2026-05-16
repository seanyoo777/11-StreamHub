import { getContentSafetyReviewByClipId } from '../../shorts/safety/contentSafetyStore.js'
import { loadShortsQueue } from '../../shorts/shortsQueueStore.js'
import { getClipTimelineByClipId, resetClipTimelinesForTests } from '../../shorts/editor/clipTimelineStore.js'
import { resetContentSafetyReviewsForTests } from '../../shorts/safety/contentSafetyStore.js'
import { resetWatchedChannelsForTests, seedDefaultWatchedChannels } from '../../watchers/channel/watchedChannelStore.js'
import { resetContentFactoryRulesForTests } from '../../watchers/channel/watchedChannelRules.js'
import { resetTrendWatcherForTests, seedDefaultTrendKeywords } from '../../watchers/trend/trendKeywordStore.js'
import { runChannelWatcherPipeline, runTrendWatcherPipeline } from '../../watchers/trend/trendContentFactory.js'
import { resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { resetShortsNotificationsForTests, getShortsNotifications } from '../../shorts/shortsNotifications.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.content-factory-flow'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runContentFactoryFlowSuite() {
  const issues = []
  resetShortsQueueForTests()
  resetClipTimelinesForTests()
  resetContentSafetyReviewsForTests()
  resetWatchedChannelsForTests()
  resetTrendWatcherForTests()
  resetContentFactoryRulesForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  seedDefaultWatchedChannels()
  seedDefaultTrendKeywords()

  const ch = seedDefaultWatchedChannels()[0]
  const channelResult = runChannelWatcherPipeline(ch.channelId, 'bj_reaction')

  if (!channelResult.clip?.id) {
    issues.push(issue(`${SUITE_ID}.channel.clip`, 'Channel pipeline did not create clip', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.channel.clip`, `Clip ${channelResult.clip.id}`, 'PASS', SUITE_ID))
  }

  if (!loadShortsQueue().some((c) => c.id === channelResult.clip?.id)) {
    issues.push(issue(`${SUITE_ID}.queue`, 'Clip missing from shorts queue', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.queue`, 'Shorts queue integration OK', 'PASS', SUITE_ID))
  }

  const review = getContentSafetyReviewByClipId(channelResult.clip.id)
  if (!review) {
    issues.push(issue(`${SUITE_ID}.safety`, 'Safety review missing', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.safety`, `Safety verdict: ${review.verdict}`, 'PASS', SUITE_ID))
  }

  if (!getClipTimelineByClipId(channelResult.clip.id)) {
    issues.push(issue(`${SUITE_ID}.timeline`, 'Timeline draft missing', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.timeline`, 'Timeline integration OK', 'PASS', SUITE_ID))
  }

  const trendResult = runTrendWatcherPipeline('tk_news')
  if (!trendResult.clip?.id) {
    issues.push(issue(`${SUITE_ID}.trend.clip`, 'Trend pipeline failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.trend.clip`, 'Trend pipeline OK', 'PASS', SUITE_ID))
  }

  const kinds = getMockAuditEntries().map((e) => e.kind)
  for (const kind of ['content.factory.draft_created', 'watcher.moment.detected', 'watcher.trend.detected']) {
    if (!kinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
    }
  }

  if (!getShortsNotifications().some((n) => n.kind === 'content.factory.short_created')) {
    issues.push(issue(`${SUITE_ID}.notif`, 'Missing short_created notification', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif`, 'Factory notifications OK', 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.no-upload`, 'No real upload / no FFmpeg', 'PASS', SUITE_ID))

  resetShortsQueueForTests()
  resetClipTimelinesForTests()
  resetContentSafetyReviewsForTests()
  resetWatchedChannelsForTests()
  resetTrendWatcherForTests()
  resetContentFactoryRulesForTests()
  resetShortsNotificationsForTests()
  resetMockAuditTrailForTests()

  return buildSuite(SUITE_ID, 'Content factory mock flow', issues)
}
