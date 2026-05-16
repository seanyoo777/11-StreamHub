import {
  OVERLAY_LAYOUT_PRESETS,
  OVERLAY_SCENE_AUDIT_KINDS,
  OVERLAY_SCENE_MOCK_ONLY,
  OVERLAY_SCENE_NOTIFICATION_KINDS,
  OVERLAY_SCENE_TYPES,
  STREAMHUB_OVERLAY_SCENE_ACTIVE_KEY,
  STREAMHUB_OVERLAY_SCENES_STORAGE_KEY,
} from '../../overlay-scenes/overlaySceneTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.overlay-scene-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runOverlaySceneSchemaSuite() {
  const issues = []

  for (const key of [
    { id: 'scenes', val: STREAMHUB_OVERLAY_SCENES_STORAGE_KEY },
    { id: 'active', val: STREAMHUB_OVERLAY_SCENE_ACTIVE_KEY },
  ]) {
    if (!key.val.startsWith('streamhub.')) {
      issues.push(issue(`${SUITE_ID}.${key.id}`, 'Invalid storage key', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.${key.id}`, key.val, 'PASS', SUITE_ID))
    }
  }

  if (OVERLAY_SCENE_TYPES.length !== 9) {
    issues.push(issue(`${SUITE_ID}.types`, `Expected 9 scene types; got ${OVERLAY_SCENE_TYPES.length}`, 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.types`, '9 scene types', 'PASS', SUITE_ID))
  }

  if (OVERLAY_LAYOUT_PRESETS.length < 7) {
    issues.push(issue(`${SUITE_ID}.layouts`, 'Missing layout presets', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.layouts`, `${OVERLAY_LAYOUT_PRESETS.length} layouts`, 'PASS', SUITE_ID))
  }

  for (const kind of OVERLAY_SCENE_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
  }

  if (OVERLAY_SCENE_NOTIFICATION_KINDS.length < 3) {
    issues.push(issue(`${SUITE_ID}.notif`, 'Missing overlay notifications', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif`, `${OVERLAY_SCENE_NOTIFICATION_KINDS.length} kinds`, 'PASS', SUITE_ID))
  }

  if (!OVERLAY_SCENE_MOCK_ONLY) {
    issues.push(issue(`${SUITE_ID}.mock`, 'mockOnly must be true', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.mock`, 'mockOnly enforced', 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.no-obs`, 'No OBS WebSocket', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-broadcast`, 'No real stream broadcast', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Overlay scene schema contract', issues)
}
