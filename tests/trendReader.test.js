import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { CLIP_DETECTION_REASONS } from '../src/shorts/contracts/clipDetection.js'
import {
  importTrendCandidateToOverlayScene,
  importTrendCandidateToShortsQueue,
  mapTrendToOverlaySceneType,
  resetTrendImportedForTests,
} from '../src/oneai/trends/trendReaderImporter.js'
import { ONEAI_VIRAL_TREND_RADAR_KEY, TREND_IMPORT_SOURCE } from '../src/oneai/trends/trendReaderTypes.js'
import {
  normalizeTrendCandidate,
  readViralTrendRadarFromStorage,
  resetTrendReaderStorageForTests,
  setTrendReaderStorageAdapter,
  writeViralTrendRadarForTests,
} from '../src/oneai/trends/trendReader.js'
import { loadOverlaySceneQueue } from '../src/overlay-scenes/overlaySceneStore.js'
import { loadShortsQueue, resetShortsQueueForTests } from '../src/shorts/shortsQueueStore.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'

describe('OneAI viral trend reader', () => {
  /** @type {Record<string, string>} */
  let mem

  beforeEach(() => {
    mem = {}
    resetTrendReaderStorageForTests()
    resetTrendImportedForTests()
    resetShortsQueueForTests()
    setTrendReaderStorageAdapter({
      getItem: (k) => mem[k] ?? null,
      setItem: (k, v) => {
        mem[k] = v
      },
    })
  })

  it('reads storage key and skips malformed rows', () => {
    assert.equal(ONEAI_VIRAL_TREND_RADAR_KEY, 'tetherget.viral_trend_radar_v1')
    writeViralTrendRadarForTests({
      trends: [{ id: 't1', keyword: 'ETH', mockOnly: true }, null],
    })
    const result = readViralTrendRadarFromStorage()
    assert.equal(result.trends.length, 1)
    assert.ok(result.malformedSkipped >= 1)
  })

  it('imports to shorts queue and overlay scene mock', () => {
    const trend = normalizeTrendCandidate({
      id: 't_import',
      keyword: '긴급 이슈',
      category: 'breaking_news',
      urgencyLevel: 'urgent',
      overlayPriority: 85,
      shortPotentialScore: 80,
      mockOnly: true,
    })
    assert.ok(trend)
    const { clip } = importTrendCandidateToShortsQueue(trend)
    assert.equal(clip.detection_reason, CLIP_DETECTION_REASONS.VIRAL_TREND)
    assert.equal(clip.import_source, TREND_IMPORT_SOURCE)
    assert.ok(loadShortsQueue().some((c) => c.id === clip.id))

    const scene = importTrendCandidateToOverlayScene(trend)
    assert.equal(scene.status, 'queued')
    assert.ok(loadOverlaySceneQueue().some((s) => s.id === scene.id))
  })

  it('maps market_alert category to overlay scene type', () => {
    const trend = normalizeTrendCandidate({
      id: 'm1',
      keyword: 'oil',
      category: 'market_alert',
    })
    assert.ok(trend)
    assert.equal(mapTrendToOverlaySceneType(trend), 'market_alert')
  })

  it('registers trend reader self-test suites', () => {
    const ids = runStreamHubSelfTests().suites.map((s) => s.id)
    assert.ok(ids.includes('contract.viral-trend-reader-schema'))
    assert.ok(ids.includes('mock.viral-trend-reader-flow'))
  })
})
