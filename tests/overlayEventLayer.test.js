import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import {
  isOverlayEventComponentEnabled,
  loadOverlayEventLayerConfig,
  resetOverlayEventLayerForTests,
} from '../src/overlay-event-layer/overlayEventLayerStore.js'
import {
  previewOverlayEventLayer,
  toggleSceneOverlayEventComponent,
} from '../src/overlay-event-layer/overlayEventLayerOps.js'
import { buildOverlayEventLayerPreviewHtml } from '../src/overlay-event-layer/overlayEventLayerBuilder.js'
import { runOverlayEventLayerSelfTestChecks } from '../src/overlay-event-layer/overlayEventLayerOps.js'
import { runStreamHubSelfTests } from '../src/validation/runStreamHubSelfTests.js'
import { resetMockAuditTrailForTests } from '../src/validation/mockAuditTrail.js'

describe('overlay event layer', () => {
  beforeEach(() => {
    resetOverlayEventLayerForTests()
    resetMockAuditTrailForTests()
  })

  it('loads default config with mockOnly', () => {
    const config = loadOverlayEventLayerConfig()
    assert.equal(config.mockOnly, true)
    assert.equal(config.alertBanner.enabled, true)
  })

  it('builds preview with mock badge and components', () => {
    const { previewHtml } = previewOverlayEventLayer()
    assert.ok(previewHtml.includes('MOCK ONLY'))
    assert.ok(previewHtml.includes('event-ticker'))
  })

  it('respects per-scene component flags', () => {
    const config = toggleSceneOverlayEventComponent('s1', 'notification_ticker', false)
    assert.equal(isOverlayEventComponentEnabled(config, 's1', 'notification_ticker'), false)
    const html = buildOverlayEventLayerPreviewHtml({ config, sceneId: 's1' })
    assert.ok(!html.includes('data-event-component="notification_ticker"'))
  })

  it('passes inline self-test', () => {
    assert.equal(runOverlayEventLayerSelfTestChecks().pass, true)
  })

  it('registers overlay event layer suites', () => {
    const ids = runStreamHubSelfTests().suites.map((s) => s.id)
    assert.ok(ids.includes('contract.overlay-event-layer-schema'))
    assert.ok(ids.includes('mock.overlay-event-layer'))
  })
})
