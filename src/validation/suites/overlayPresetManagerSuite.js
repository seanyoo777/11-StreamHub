import {
  loadOverlayEventLayerConfig,
  resetOverlayEventLayerForTests,
  setOverlayEventLayerStorageAdapter,
} from '../../overlay-event-layer/overlayEventLayerStore.js'
import {
  applyOverlayPresetToScene,
  applyOverlaySceneTemplate,
  runOverlayPresetSelfTestChecks,
  saveOverlayPresetFromConfig,
} from '../../overlay-event-layer/overlayPresetOps.js'
import { resetOverlayPresetsForTests } from '../../overlay-event-layer/overlayPresetStore.js'
import { appendOverlayPresetAudit } from '../../overlay-event-layer/overlayPresetAudit.js'
import { resetOverlayScenesForTests } from '../../overlay-scenes/overlaySceneStore.js'
import { resetMockAuditTrailForTests, getMockAuditEntries } from '../mockAuditTrail.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.overlay-preset-manager'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runOverlayPresetManagerSuite() {
  const issues = []
  /** @type {Record<string, string>} */
  const mem = {}

  resetOverlayEventLayerForTests()
  resetOverlayPresetsForTests()
  resetOverlayScenesForTests()
  resetMockAuditTrailForTests()
  setOverlayEventLayerStorageAdapter({
    getItem: (k) => mem[k] ?? null,
    setItem: (k, v) => {
      mem[k] = v
    },
  })

  const self = runOverlayPresetSelfTestChecks()
  if (!self.pass) {
    issues.push(issue(`${SUITE_ID}.self`, self.issues.join('; '), 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.self`, 'Inline preset self-test OK', 'PASS', SUITE_ID))
  }

  applyOverlaySceneTemplate('full_event_stack')
  const cfg = loadOverlayEventLayerConfig()
  if (!cfg.alertBanner.enabled || !cfg.notificationTicker.enabled || !cfg.viralTrendCard.enabled) {
    issues.push(issue(`${SUITE_ID}.template`, 'full_event_stack not applied', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.template`, 'Template applied', 'PASS', SUITE_ID))
  }

  const preset = saveOverlayPresetFromConfig('Suite preset')
  applyOverlayPresetToScene('scene_suite', preset.id)
  const sceneFlags = loadOverlayEventLayerConfig().sceneComponentFlags.scene_suite
  if (!sceneFlags) {
    issues.push(issue(`${SUITE_ID}.scene`, 'Scene preset flags missing', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.scene`, 'Scene preset applied', 'PASS', SUITE_ID))
  }

  appendOverlayPresetAudit('overlay.preset.loaded', {
    correlation_id: `suite_load_${Date.now()}`,
    payload: { presetId: preset.id },
  })

  const auditKinds = getMockAuditEntries()
    .map((e) => e.kind)
    .filter((k) => k.startsWith('overlay.preset.'))
  if (auditKinds.length < 2) {
    issues.push(issue(`${SUITE_ID}.audit`, 'Expected preset audit entries', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.audit`, `${auditKinds.length} preset audit kinds`, 'PASS', SUITE_ID))
  }

  return buildSuite(SUITE_ID, 'Overlay preset manager mock flow', issues)
}
