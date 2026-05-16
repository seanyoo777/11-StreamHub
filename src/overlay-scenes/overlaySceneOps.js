import { appendShortsNotification } from '../shorts/shortsNotifications.js'
import { appendOverlaySceneAudit } from './overlaySceneAudit.js'
import { buildOverlayScene, buildScenePreviewHtml } from './overlaySceneBuilder.js'
import { buildHudLinksFromClip, mapClipToOverlaySceneType } from './overlaySceneHudBridge.js'
import {
  getOverlaySceneById,
  loadOverlaySceneQueue,
  setActiveOverlaySceneId,
  upsertOverlayScene,
} from './overlaySceneStore.js'
import { OVERLAY_SCENE_NOTIFICATION_KINDS } from './overlaySceneTypes.js'

/**
 * @param {ReturnType<typeof buildOverlayScene>} scene
 */
export function createOverlaySceneRecord(scene) {
  upsertOverlayScene(scene)
  const correlationId = `overlay_create_${scene.id}`

  appendOverlaySceneAudit('overlay.scene.created', {
    correlation_id: correlationId,
    payload: { sceneId: scene.id, sceneType: scene.sceneType },
  })

  if (scene.sceneType === 'breaking_news' || scene.sceneType === 'liquidation_alert') {
    appendShortsNotification({
      kind: 'overlay.breaking.ready',
      clip_id: scene.id,
      correlation_id: correlationId,
      payload: { sceneType: scene.sceneType },
    })
  }

  if (scene.priority >= 80) {
    appendShortsNotification({
      kind: 'overlay.high_priority.detected',
      clip_id: scene.id,
      correlation_id: correlationId,
      payload: { priority: scene.priority },
    })
  }

  return scene
}

/**
 * @param {string} sceneId
 */
export function queueOverlayScene(sceneId) {
  const scene = getOverlaySceneById(sceneId)
  if (!scene) throw new Error(`Scene not found: ${sceneId}`)

  scene.status = 'queued'
  upsertOverlayScene(scene)

  const correlationId = `overlay_queue_${sceneId}`
  appendOverlaySceneAudit('overlay.scene.queued', {
    correlation_id: correlationId,
    payload: { sceneId, priority: scene.priority },
  })

  if (scene.priority >= 70) {
    appendShortsNotification({
      kind: 'overlay.urgent.queued',
      clip_id: sceneId,
      correlation_id: correlationId,
      payload: { sceneType: scene.sceneType },
    })
  }

  return scene
}

/**
 * @param {string} sceneId
 */
export function previewOverlayScene(sceneId) {
  const scene = getOverlaySceneById(sceneId)
  if (!scene) throw new Error(`Scene not found: ${sceneId}`)

  scene.status = 'previewing'
  upsertOverlayScene(scene)
  setActiveOverlaySceneId(sceneId)

  const html = buildScenePreviewHtml(scene)
  const correlationId = `overlay_preview_${sceneId}`

  appendOverlaySceneAudit('overlay.scene.previewed', {
    correlation_id: correlationId,
    payload: { sceneId, browserSourceUrlMock: scene.browserSourceUrlMock },
  })

  return { scene, previewHtml: html }
}

/**
 * @param {string} sceneId
 * @param {number} priority
 */
export function updateOverlayScenePriority(sceneId, priority) {
  const scene = getOverlaySceneById(sceneId)
  if (!scene) throw new Error(`Scene not found: ${sceneId}`)

  scene.priority = priority
  upsertOverlayScene(scene)

  appendOverlaySceneAudit('overlay.scene.priority_updated', {
    correlation_id: `overlay_priority_${sceneId}`,
    payload: { sceneId, priority },
  })

  return scene
}

/**
 * @param {string} sceneId
 */
export function broadcastOverlaySceneMock(sceneId) {
  const scene = getOverlaySceneById(sceneId)
  if (!scene) throw new Error(`Scene not found: ${sceneId}`)

  scene.status = 'live_mock'
  upsertOverlayScene(scene)
  setActiveOverlaySceneId(sceneId)

  appendOverlaySceneAudit('overlay.scene.broadcast_mock', {
    correlation_id: `overlay_broadcast_${sceneId}`,
    payload: { sceneId, mockOnly: true, noObsWebSocket: true },
  })

  return scene
}

/**
 * @param {import('../shorts/contracts/overlayBridge.js').ShortsClipRecord} clip
 */
export function importOverlaySceneFromShortsClip(clip) {
  const sceneType = mapClipToOverlaySceneType(clip)
  const hudLinks = buildHudLinksFromClip(clip)

  const scene = buildOverlayScene({
    sceneType,
    title: `[Shorts] ${clip.preview_title}`,
    headline: clip.preview_title,
    subline: `${clip.detection_reason} · ${clip.mock_duration_sec}s mock`,
    overlaySource:
      clip.overlay_source === 'oneai_broadcast'
        ? 'oneai_broadcast'
        : clip.overlay_source === 'tournament_winner'
          ? 'tournament_winner'
          : 'streamhub',
    priority: Number(clip.viral_score ?? 60),
    durationSec: clip.mock_duration_sec,
    hudLinks,
  })

  return createOverlaySceneRecord(scene)
}

/**
 * Re-sort queue by priority after updates.
 */
export function reprioritizeOverlaySceneQueue() {
  const queue = loadOverlaySceneQueue()
  return queue
}

/**
 * @param {typeof OVERLAY_SCENE_NOTIFICATION_KINDS} [kinds]
 */
export function overlaySceneNotificationKindsRegistered(kinds = OVERLAY_SCENE_NOTIFICATION_KINDS) {
  return kinds.length >= 3
}
