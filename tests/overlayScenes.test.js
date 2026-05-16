import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { buildOverlayScene, buildBrowserSourceUrlMock } from '../src/overlay-scenes/overlaySceneBuilder.js'
import {
  createOverlaySceneRecord,
  previewOverlayScene,
  queueOverlayScene,
} from '../src/overlay-scenes/overlaySceneOps.js'
import {
  getActiveOverlaySceneId,
  loadOverlayScenes,
  resetOverlayScenesForTests,
} from '../src/overlay-scenes/overlaySceneStore.js'
import { runOverlaySceneSelfTestChecks } from '../src/overlay-scenes/overlaySceneSelfTest.js'
import { resolveAdminPageId } from '../src/admin/resolveAdminPage.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'
import { resetMockAuditTrailForTests } from '../src/validation/mockAuditTrail.js'

describe('OBS overlay scene manager', () => {
  beforeEach(() => {
    resetOverlayScenesForTests()
    resetMockAuditTrailForTests()
  })

  it('builds mock browser source URL', () => {
    const scene = buildOverlayScene({ sceneType: 'shorts_hook', headline: 'Hook mock' })
    const url = buildBrowserSourceUrlMock(scene)
    assert.ok(url.includes('streamhub.mock'))
    assert.ok(url.includes('scene_id='))
  })

  it('persists created scenes and preview', () => {
    const scene = buildOverlayScene({ sceneType: 'breaking_news', priority: 88 })
    createOverlaySceneRecord(scene)
    queueOverlayScene(scene.id)
    const { previewHtml } = previewOverlayScene(scene.id)
    assert.ok(previewHtml.includes('<!DOCTYPE html>'))
    assert.equal(loadOverlayScenes().length, 1)
    assert.equal(getActiveOverlaySceneId(), scene.id)
  })

  it('passes inline self-test checks', () => {
    const result = runOverlaySceneSelfTestChecks()
    assert.equal(result.pass, true)
  })

  it('resolves /admin/overlay-scenes', () => {
    assert.equal(resolveAdminPageId('/admin/overlay-scenes'), 'overlayScenes')
  })

  it('registers overlay self-test suites', () => {
    const ids = runStreamHubSelfTests().suites.map((s) => s.id)
    assert.ok(ids.includes('contract.overlay-scene-schema'))
    assert.ok(ids.includes('mock.overlay-scene-manager'))
  })
})
