import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { CLIP_DETECTION_REASONS } from '../src/shorts/contracts/clipDetection.js'
import { getContentSafetyReviewByClipId } from '../src/shorts/safety/contentSafetyStore.js'
import { getClipTimelineByClipId } from '../src/shorts/editor/clipTimelineStore.js'
import { loadShortsQueue } from '../src/shorts/shortsQueueStore.js'
import {
  importStockPickCandidateToQueue,
  isStockPickCandidateImported,
  resetStockPickImportedForTests,
} from '../src/oneai/stockpick/stockPickImporter.js'
import { ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY } from '../src/oneai/stockpick/stockPickReaderTypes.js'
import {
  normalizeStockPickCandidate,
  readStockPickCandidatesFromStorage,
  resetStockPickReaderStorageForTests,
  setStockPickReaderStorageAdapter,
  writeStockPickCandidatesForTests,
} from '../src/oneai/stockpick/stockPickReader.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'

describe('OneAI stock pick reader', () => {
  /** @type {Record<string, string>} */
  let mem

  beforeEach(() => {
    mem = {}
    resetStockPickReaderStorageForTests()
    resetStockPickImportedForTests()
    setStockPickReaderStorageAdapter({
      getItem: (k) => mem[k] ?? null,
      setItem: (k, v) => {
        mem[k] = v
      },
    })
  })

  it('reads storage key and skips malformed rows', () => {
    writeStockPickCandidatesForTests({
      candidates: [
        {
          id: 'ok1',
          title: 'T',
          hookText: 'H',
          caption: 'C',
          suggestedDuration: 'shorts_60',
          riskText: 'R',
        },
        null,
      ],
    })
    const result = readStockPickCandidatesFromStorage()
    assert.equal(result.candidates.length, 1)
    assert.equal(result.candidates[0].suggestedDuration, 'shorts_60')
    assert.ok(result.malformedSkipped >= 1)
  })

  it('imports to shorts queue with safety and timeline', () => {
    const candidate = normalizeStockPickCandidate({
      id: 'import_test',
      title: 'Import test',
      hookText: 'Hook',
      caption: 'Caption · 출처',
      suggestedDuration: 'shorts_30',
      riskText: 'Not investment advice',
    })
    assert.ok(candidate)
    const { clip } = importStockPickCandidateToQueue(candidate)
    assert.equal(clip.detection_reason, CLIP_DETECTION_REASONS.ONEAI_STOCK_PICK)
    assert.equal(clip.overlay_source, 'oneai_broadcast')
    assert.ok(loadShortsQueue().some((c) => c.id === clip.id))
    assert.ok(getContentSafetyReviewByClipId(clip.id))
    assert.equal(getClipTimelineByClipId(clip.id)?.targetFormat, 'shorts_30')
    assert.ok(isStockPickCandidateImported('import_test'))
  })

  it('exposes reader storage key constant', () => {
    assert.equal(
      ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY,
      'oneai.stockpick.shorts_candidates_v1',
    )
  })

  it('registers stockpick self-test suite', () => {
    const ids = runStreamHubSelfTests().suites.map((s) => s.id)
    assert.ok(ids.includes('mock.stockpick-reader-flow'))
  })
})
