import { buildBrowserSourceUrlMock, buildOverlayScene } from './overlaySceneBuilder.js'
import {
  loadOverlayScenes,
  resetOverlayScenesForTests,
  getActiveOverlaySceneId,
} from './overlaySceneStore.js'
import {
  createOverlaySceneRecord,
  previewOverlayScene,
  queueOverlayScene,
  broadcastOverlaySceneMock,
} from './overlaySceneOps.js'
import { OVERLAY_SCENE_TYPES } from './overlaySceneTypes.js'

/**
 * @returns {{ pass: boolean; issues: string[] }}
 */
export function runOverlaySceneSelfTestChecks() {
  const issues = []
  resetOverlayScenesForTests()

  const scene = buildOverlayScene({
    sceneType: 'breaking_news',
    headline: '긴급 속보 mock',
    priority: 90,
  })
  createOverlaySceneRecord(scene)
  queueOverlayScene(scene.id)
  const { previewHtml } = previewOverlayScene(scene.id)
  broadcastOverlaySceneMock(scene.id)

  if (!OVERLAY_SCENE_TYPES.includes(scene.sceneType)) {
    issues.push('invalid scene type')
  }
  if (!buildBrowserSourceUrlMock(scene).includes('streamhub.mock')) {
    issues.push('browser url mock missing')
  }
  if (!previewHtml.includes('긴급')) {
    issues.push('preview html missing headline')
  }
  if (getActiveOverlaySceneId() !== scene.id) {
    issues.push('active scene not set')
  }
  if (loadOverlayScenes().length < 1) {
    issues.push('scene not persisted')
  }

  return { pass: issues.length === 0, issues }
}
