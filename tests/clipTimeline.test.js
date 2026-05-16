import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { detectMockClip } from '../src/shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../src/shorts/contracts/clipDetection.js'
import {
  exportClipTimelineDraftMock,
  openClipTimelineMock,
} from '../src/shorts/editor/clipTimelineHelpers.js'
import { getClipTimelineByClipId, resetClipTimelinesForTests } from '../src/shorts/editor/clipTimelineStore.js'
import { validateClipTimelineSchema } from '../src/shorts/editor/clipTimelineTypes.js'
import { resetShortsQueueForTests } from '../src/shorts/shortsQueueStore.js'
import { resetShortsNotificationsForTests } from '../src/shorts/shortsNotifications.js'
import { resetMockAuditTrailForTests } from '../src/validation/mockAuditTrail.js'
import { runClipTimelineEditorSuite } from '../src/validation/suites/clipTimelineEditorSuite.js'
import { runClipTimelineSchemaSuite } from '../src/validation/suites/clipTimelineSchemaSuite.js'

describe('clip timeline editor', () => {
  beforeEach(() => {
    resetShortsQueueForTests()
    resetClipTimelinesForTests()
    resetShortsNotificationsForTests()
    resetMockAuditTrailForTests()
  })

  it('opens timeline on clip detect flow', () => {
    const clip = detectMockClip({ reason: CLIP_DETECTION_REASONS.BJ_REACTION })
    openClipTimelineMock(clip.id, clip)
    const row = getClipTimelineByClipId(clip.id)
    assert.ok(row)
    assert.equal(row.clipId, clip.id)
    assert.ok(row.overlayMoments.length > 0)
  })

  it('exports preview JSON without ffmpeg', () => {
    const clip = detectMockClip({ reason: CLIP_DETECTION_REASONS.SURGE_SPIKE })
    const timeline = openClipTimelineMock(clip.id, clip)
    const preview = exportClipTimelineDraftMock(timeline, clip.correlation_id, 'shorts')
    assert.equal(preview.noFfmpeg, true)
    assert.equal(preview.noRealUpload, true)
    validateClipTimelineSchema(timeline)
  })

  it('runs timeline self-test suites', () => {
    assert.equal(runClipTimelineSchemaSuite().status, 'PASS')
    assert.equal(runClipTimelineEditorSuite().status, 'PASS')
  })
})
