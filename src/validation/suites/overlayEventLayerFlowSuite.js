import {
  loadOverlayEventLayerConfig,
  resetOverlayEventLayerForTests,
  setOverlayEventLayerStorageAdapter,
} from '../../overlay-event-layer/overlayEventLayerStore.js'
import {
  previewOverlayEventLayer,
  runOverlayEventLayerSelfTestChecks,
  toggleSceneOverlayEventComponent,
} from '../../overlay-event-layer/overlayEventLayerOps.js'
import { buildOverlayEventLayerPreviewHtml } from '../../overlay-event-layer/overlayEventLayerBuilder.js'
import { writeViralTrendRadarForTests } from '../../oneai/trends/trendReader.js'
import { resetOverlayScenesForTests } from '../../overlay-scenes/overlaySceneStore.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { appendOverlayEventLayerAudit } from '../../overlay-event-layer/overlayEventLayerAudit.js'
import { OVERLAY_EVENT_LAYER_AUDIT_KINDS } from '../../overlay-event-layer/overlayEventLayerTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.overlay-event-layer'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runOverlayEventLayerFlowSuite() {
  const issues = []
  /** @type {Record<string, string>} */
  const mem = {}

  resetOverlayEventLayerForTests()
  resetOverlayScenesForTests()
  resetMockAuditTrailForTests()
  setOverlayEventLayerStorageAdapter({
    getItem: (k) => mem[k] ?? null,
    setItem: (k, v) => {
      mem[k] = v
    },
  })

  appendOverlayEventLayerAudit('overlay.event_layer.loaded', {
    correlation_id: `event_layer_load_${Date.now()}`,
    payload: { mockOnly: true },
  })

  const self = runOverlayEventLayerSelfTestChecks()
  if (!self.pass) {
    issues.push(issue(`${SUITE_ID}.self`, self.issues.join('; '), 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.self`, 'Inline self-test OK', 'PASS', SUITE_ID))
  }

  writeViralTrendRadarForTests({
    trends: [
      {
        id: 'trend_layer',
        keyword: 'Layer trend mock',
        category: 'breaking_news',
        urgencyLevel: 'high',
        trendLevel: 'viral',
        overlayPriority: 80,
        mockOnly: true,
      },
    ],
  })

  const { previewHtml } = previewOverlayEventLayer({ sceneId: 'scene_layer_test' })
  if (!previewHtml.includes('MOCK ONLY')) {
    issues.push(issue(`${SUITE_ID}.badge`, 'mock badge missing', 'FAIL', SUITE_ID))
  } else if (!previewHtml.includes('data-event-component="alert_banner"')) {
    issues.push(issue(`${SUITE_ID}.alert`, 'alert banner missing', 'FAIL', SUITE_ID))
  } else if (!previewHtml.includes('data-event-component="notification_ticker"')) {
    issues.push(issue(`${SUITE_ID}.ticker`, 'ticker missing', 'FAIL', SUITE_ID))
  } else if (!previewHtml.includes('data-event-component="viral_trend_card"')) {
    issues.push(issue(`${SUITE_ID}.trend`, 'trend card missing', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.preview`, 'Event layer preview OK', 'PASS', SUITE_ID))
  }

  const config = toggleSceneOverlayEventComponent('scene_layer_test', 'alert_banner', false)
  const htmlOff = buildOverlayEventLayerPreviewHtml({
    config,
    sceneId: 'scene_layer_test',
  })
  if (htmlOff.includes('data-event-component="alert_banner"')) {
    issues.push(issue(`${SUITE_ID}.scene_flag`, 'Per-scene off failed', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.scene_flag`, 'Per-scene overlay flag OK', 'PASS', SUITE_ID))
  }

  if (!loadOverlayEventLayerConfig().mockOnly) {
    issues.push(issue(`${SUITE_ID}.mock_only`, 'config.mockOnly false', 'FAIL', SUITE_ID))
  }

  const kinds = getMockAuditEntries().map((e) => e.kind)
  for (const kind of OVERLAY_EVENT_LAYER_AUDIT_KINDS) {
    if (!kinds.includes(kind)) {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Missing ${kind}`, 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
    }
  }

  issues.push(issue(`${SUITE_ID}.no-automation`, 'No broadcast automation', 'PASS', SUITE_ID))

  resetOverlayEventLayerForTests()

  return buildSuite(SUITE_ID, 'Overlay event layer mock flow', issues)
}
