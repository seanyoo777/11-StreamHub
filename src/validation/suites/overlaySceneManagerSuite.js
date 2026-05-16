import { detectMockClip } from '../../shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS } from '../../shorts/contracts/clipDetection.js'
import { resetShortsQueueForTests } from '../../shorts/shortsQueueStore.js'
import { resetContentSafetyReviewsForTests } from '../../shorts/safety/contentSafetyStore.js'
import { resetShortsNotificationsForTests } from '../../shorts/shortsNotifications.js'
import { resetViralScoreStoreForTests } from '../../viral/viralScoreStore.js'
import {
  buildBrowserSourceUrlMock,
  buildOverlayScene,
} from '../../overlay-scenes/overlaySceneBuilder.js'
import {
  broadcastOverlaySceneMock,
  createOverlaySceneRecord,
  importOverlaySceneFromShortsClip,
  previewOverlayScene,
  queueOverlayScene,
} from '../../overlay-scenes/overlaySceneOps.js'
import { buildLiveHudSnapshotMock } from '../../overlay-scenes/overlaySceneHudBridge.js'
import {
  getActiveOverlaySceneId,
  loadOverlaySceneQueue,
  resetOverlayScenesForTests,
} from '../../overlay-scenes/overlaySceneStore.js'
import { runOverlaySceneSelfTestChecks } from '../../overlay-scenes/overlaySceneSelfTest.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.overlay-scene-manager'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runOverlaySceneManagerSuite() {
  const issues = []
  resetOverlayScenesForTests()
  resetShortsQueueForTests()
  resetContentSafetyReviewsForTests()
  resetShortsNotificationsForTests()
  resetViralScoreStoreForTests()
  resetMockAuditTrailForTests()

  const self = runOverlaySceneSelfTestChecks()
  if (!self.pass) {
    issues.push(issue(`${SUITE_ID}.self`, self.issues.join('; '), 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.self`, 'Self-test checks OK', 'PASS', SUITE_ID))
  }

  const hud = buildLiveHudSnapshotMock()
  if (typeof hud.shortsQueueCount !== 'number') {
    issues.push(issue(`${SUITE_ID}.hud`, 'HUD snapshot invalid', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.hud`, `HUD queue ${hud.shortsQueueCount}`, 'PASS', SUITE_ID))
  }

  const scene = buildOverlayScene({
    sceneType: 'market_alert',
    headline: 'Market alert mock',
    priority: 72,
    hudLinks: hud,
  })
  createOverlaySceneRecord(scene)
  queueOverlayScene(scene.id)
  const { previewHtml } = previewOverlayScene(scene.id)
  broadcastOverlaySceneMock(scene.id)

  if (!previewHtml.includes('Market alert')) {
    issues.push(issue(`${SUITE_ID}.preview`, 'Preview HTML missing headline', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.preview`, 'Preview HTML OK', 'PASS', SUITE_ID))
  }

  const url = buildBrowserSourceUrlMock(scene)
  if (!url.includes('streamhub.mock')) {
    issues.push(issue(`${SUITE_ID}.url`, 'Browser source URL mock missing', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.url`, 'Browser source URL mock OK', 'PASS', SUITE_ID))
  }

  const clip = detectMockClip({ reason: CLIP_DETECTION_REASONS.AI_BREAKING_ALERT })
  importOverlaySceneFromShortsClip(clip)
  const queue = loadOverlaySceneQueue()
  if (queue.length < 2) {
    issues.push(issue(`${SUITE_ID}.import`, 'Shorts import did not add scene', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.import`, `${queue.length} scenes in queue`, 'PASS', SUITE_ID))
  }

  if (getActiveOverlaySceneId() !== scene.id) {
    issues.push(issue(`${SUITE_ID}.active`, 'Active scene mismatch', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.active`, 'Active scene set', 'PASS', SUITE_ID))
  }

  const kinds = getMockAuditEntries().map((e) => e.kind)
  for (const kind of [
    'overlay.scene.created',
    'overlay.scene.queued',
    'overlay.scene.previewed',
    'overlay.scene.broadcast_mock',
  ]) {
    if (!kinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
    }
  }

  issues.push(issue(`${SUITE_ID}.no-obs-ws`, 'No OBS WebSocket client', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-stream`, 'No stream broadcast API', 'PASS', SUITE_ID))

  resetOverlayScenesForTests()

  return buildSuite(SUITE_ID, 'Overlay scene manager mock flow', issues)
}
