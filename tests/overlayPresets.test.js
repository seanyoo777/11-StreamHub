import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import {
  resetOverlayEventLayerForTests,
  setOverlayEventLayerStorageAdapter,
  loadOverlayEventLayerConfig,
} from '../src/overlay-event-layer/overlayEventLayerStore.js'
import {
  applyOverlayPresetToScene,
  applyOverlaySceneTemplate,
  loadOverlayPresetToConfig,
  runOverlayPresetSelfTestChecks,
  saveOverlayPresetFromConfig,
} from '../src/overlay-event-layer/overlayPresetOps.js'
import {
  getScenePresetId,
  loadOverlayPresetStore,
  resetOverlayPresetsForTests,
} from '../src/overlay-event-layer/overlayPresetStore.js'
import { OVERLAY_SCENE_TEMPLATES } from '../src/overlay-event-layer/overlayPresetTypes.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../src/validation/mockAuditTrail.js'

describe('overlay presets', () => {
  /** @type {Record<string, string>} */
  let mem

  beforeEach(() => {
    mem = {}
    resetOverlayEventLayerForTests()
    resetOverlayPresetsForTests()
    resetMockAuditTrailForTests()
    setOverlayEventLayerStorageAdapter({
      getItem: (k) => mem[k] ?? null,
      setItem: (k, v) => {
        mem[k] = v
      },
    })
  })

  it('exposes four built-in scene templates', () => {
    assert.equal(OVERLAY_SCENE_TEMPLATES.length, 4)
  })

  it('applies viral_trend_focus template', () => {
    applyOverlaySceneTemplate('viral_trend_focus')
    const cfg = loadOverlayEventLayerConfig()
    assert.equal(cfg.viralTrendCard.enabled, true)
    assert.equal(cfg.alertBanner.enabled, false)
  })

  it('saves and loads preset mock', () => {
    const preset = saveOverlayPresetFromConfig('Test preset')
    assert.ok(loadOverlayPresetStore().presets.some((p) => p.id === preset.id))
    loadOverlayPresetToConfig(preset.id)
    assert.equal(loadOverlayEventLayerConfig().alertBanner.headline, preset.alertBanner.headline)
  })

  it('maps preset to scene', () => {
    const preset = saveOverlayPresetFromConfig('Scene preset')
    applyOverlayPresetToScene('scene_a', preset.id)
    assert.equal(getScenePresetId('scene_a'), preset.id)
    assert.ok(loadOverlayEventLayerConfig().sceneComponentFlags.scene_a)
  })

  it('records append-only preset audit', () => {
    saveOverlayPresetFromConfig('Audit preset')
    const kinds = getMockAuditEntries().map((e) => e.kind)
    assert.ok(kinds.includes('overlay.preset.saved'))
  })

  it('passes inline self-test', () => {
    assert.equal(runOverlayPresetSelfTestChecks().pass, true)
  })

  it('registers overlay preset suites', () => {
    const ids = runStreamHubSelfTests().suites.map((s) => s.id)
    assert.ok(ids.includes('contract.overlay-preset-schema'))
    assert.ok(ids.includes('mock.overlay-preset-manager'))
  })
})
