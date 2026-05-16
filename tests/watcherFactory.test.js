import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { resolveAdminPageId } from '../src/admin/resolveAdminPage.js'
import { loadShortsQueue } from '../src/shorts/shortsQueueStore.js'
import { resetShortsQueueForTests } from '../src/shorts/shortsQueueStore.js'
import { resetClipTimelinesForTests } from '../src/shorts/editor/clipTimelineStore.js'
import { resetContentSafetyReviewsForTests } from '../src/shorts/safety/contentSafetyStore.js'
import { buildContentSuggestions } from '../src/watchers/contentSuggestionMock.js'
import { resetWatchedChannelsForTests, seedDefaultWatchedChannels } from '../src/watchers/channel/watchedChannelStore.js'
import { resetContentFactoryRulesForTests } from '../src/watchers/channel/watchedChannelRules.js'
import { resetTrendWatcherForTests } from '../src/watchers/trend/trendKeywordStore.js'
import { runChannelWatcherPipeline } from '../src/watchers/trend/trendContentFactory.js'
import { resetShortsNotificationsForTests } from '../src/shorts/shortsNotifications.js'
import { resetMockAuditTrailForTests } from '../src/validation/mockAuditTrail.js'
import { runChannelWatcherSchemaSuite } from '../src/validation/suites/channelWatcherSchemaSuite.js'
import { runContentFactoryFlowSuite } from '../src/validation/suites/contentFactoryFlowSuite.js'
import { runTrendWatcherSchemaSuite } from '../src/validation/suites/trendWatcherSchemaSuite.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'

describe('watcher factory', () => {
  beforeEach(() => {
    resetShortsQueueForTests()
    resetClipTimelinesForTests()
    resetContentSafetyReviewsForTests()
    resetWatchedChannelsForTests()
    resetTrendWatcherForTests()
    resetContentFactoryRulesForTests()
    resetShortsNotificationsForTests()
    resetMockAuditTrailForTests()
  })

  it('resolves /admin/watchers', () => {
    assert.equal(resolveAdminPageId('/admin/watchers'), 'watchers')
  })

  it('builds title suggestions', () => {
    const s = buildContentSuggestions({ keyword: '급등' })
    assert.equal(s.titles.length, 5)
    assert.ok(s.hook3sec.includes('mock'))
  })

  it('runs channel watcher pipeline into shorts queue', () => {
    const ch = seedDefaultWatchedChannels()[0]
    const result = runChannelWatcherPipeline(ch.channelId, 'chat_surge')
    assert.ok(result.clip)
    assert.ok(loadShortsQueue().some((c) => c.id === result.clip.id))
    assert.ok(result.review)
  })

  it('runs watcher self-test suites', () => {
    assert.equal(runChannelWatcherSchemaSuite().status, 'PASS')
    assert.equal(runTrendWatcherSchemaSuite().status, 'PASS')
    assert.equal(runContentFactoryFlowSuite().status, 'PASS')
  })

  it('runStreamHubSelfTests includes watcher suites', () => {
    assert.equal(runStreamHubSelfTests().suites.length, 37)
  })
})
