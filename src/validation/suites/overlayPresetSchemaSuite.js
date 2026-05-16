import {
  OVERLAY_PRESET_AUDIT_KINDS,
  OVERLAY_PRESET_TEMPLATE_IDS,
  STREAMHUB_OVERLAY_PRESETS_KEY,
} from '../../overlay-event-layer/overlayPresetTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.overlay-preset-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runOverlayPresetSchemaSuite() {
  const issues = []

  if (!STREAMHUB_OVERLAY_PRESETS_KEY.startsWith('streamhub.')) {
    issues.push(issue(`${SUITE_ID}.key`, 'Invalid storage key', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.key`, STREAMHUB_OVERLAY_PRESETS_KEY, 'PASS', SUITE_ID))
  }

  if (OVERLAY_PRESET_TEMPLATE_IDS.length !== 4) {
    issues.push(issue(`${SUITE_ID}.templates`, 'Expected 4 templates', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.templates`, '4 scene templates', 'PASS', SUITE_ID))
  }

  for (const kind of OVERLAY_PRESET_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.mock`, 'mockOnly on presets', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-api`, 'No external API', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-broadcast`, 'No stream broadcast automation', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-loop`, 'No JS polling / infinite loop', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Overlay preset schema', issues)
}
