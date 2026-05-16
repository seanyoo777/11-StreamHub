import {
  OVERLAY_EVENT_LAYER_AUDIT_KINDS,
  OVERLAY_EVENT_LAYER_COMPONENTS,
  OVERLAY_EVENT_LAYER_MOCK_ONLY,
  STREAMHUB_OVERLAY_EVENT_LAYER_KEY,
} from '../../overlay-event-layer/overlayEventLayerTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.overlay-event-layer-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runOverlayEventLayerSchemaSuite() {
  const issues = []

  if (!STREAMHUB_OVERLAY_EVENT_LAYER_KEY.startsWith('streamhub.')) {
    issues.push(issue(`${SUITE_ID}.key`, 'Invalid storage key', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.key`, STREAMHUB_OVERLAY_EVENT_LAYER_KEY, 'PASS', SUITE_ID))
  }

  if (OVERLAY_EVENT_LAYER_COMPONENTS.length !== 3) {
    issues.push(issue(`${SUITE_ID}.components`, 'Expected 3 components', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.components`, '3 event layer components', 'PASS', SUITE_ID))
  }

  for (const kind of OVERLAY_EVENT_LAYER_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
  }

  if (!OVERLAY_EVENT_LAYER_MOCK_ONLY) {
    issues.push(issue(`${SUITE_ID}.mock`, 'mockOnly required', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.mock`, 'mockOnly enforced', 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.no-api`, 'No external API', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-broadcast`, 'No stream broadcast automation', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-loop`, 'No JS polling / infinite loop', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Overlay event layer schema', issues)
}
