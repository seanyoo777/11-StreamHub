import {
  ONEAI_BROADCAST_FEATURE_FLAG_KEYS,
  ONEAI_BROADCAST_FEATURE_FLAGS,
  ONEAI_SHORTS_AUDIT_ACTION,
  ONEAI_SHORTS_AUDIT_ENTITY_ID,
  ONEAI_SHORTS_DRAFT_STATUSES,
  ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH,
  ONEAI_SHORTS_UPLOAD_TARGETS,
  ONEAI_STREAM_OVERLAY_ROUTE_KEYS,
  ONEAI_STREAM_OVERLAY_ROUTES,
  ONEAI_STREAMHUB_OVERLAY_STORAGE_KEY,
  ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY,
} from '../contracts/oneAiBridge.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.oneai-broadcast-bridge'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runOneAiBroadcastBridgeSuite() {
  const issues = []

  if (!ONEAI_STREAMHUB_OVERLAY_STORAGE_KEY.startsWith('oneai.')) {
    issues.push(
      issue(
        `${SUITE_ID}.overlay.key`,
        'overlay storage key must be oneai.* namespace',
        'FAIL',
        SUITE_ID,
      ),
    )
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.overlay.key.ok`,
        `overlay key ${ONEAI_STREAMHUB_OVERLAY_STORAGE_KEY}`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  if (!ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY.includes('shorts_drafts')) {
    issues.push(
      issue(`${SUITE_ID}.shorts.key`, 'shorts drafts key mismatch', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.shorts.key.ok`,
        `shorts key ${ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY}`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  for (const key of ONEAI_STREAM_OVERLAY_ROUTE_KEYS) {
    const route = ONEAI_STREAM_OVERLAY_ROUTES[key]
    if (!route?.startsWith('?overlay=')) {
      issues.push(
        issue(`${SUITE_ID}.route.${key}`, `invalid route for ${key}`, 'FAIL', SUITE_ID),
      )
    } else {
      issues.push(
        issue(`${SUITE_ID}.route.${key}.ok`, `${key} → ${route}`, 'PASS', SUITE_ID),
      )
    }
  }

  if (ONEAI_STREAM_OVERLAY_ROUTE_KEYS.length !== 4) {
    issues.push(
      issue(
        `${SUITE_ID}.route.count`,
        `expected 4 overlay modes; got ${ONEAI_STREAM_OVERLAY_ROUTE_KEYS.length}`,
        'FAIL',
        SUITE_ID,
      ),
    )
  }

  for (const flagKey of ONEAI_BROADCAST_FEATURE_FLAG_KEYS) {
    const def = ONEAI_BROADCAST_FEATURE_FLAGS[flagKey]
    if (def?.type !== 'boolean' || def.defaultValue !== true) {
      issues.push(
        issue(`${SUITE_ID}.flag.${flagKey}`, `${flagKey} must default true boolean`, 'FAIL', SUITE_ID),
      )
    } else {
      issues.push(
        issue(`${SUITE_ID}.flag.${flagKey}.ok`, `${flagKey}=true (mock)`, 'PASS', SUITE_ID),
      )
    }
  }

  if (ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH !== true) {
    issues.push(
      issue(
        `${SUITE_ID}.no_auto_publish`,
        'auto publish must be forbidden',
        'FAIL',
        SUITE_ID,
      ),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.no_auto_publish.ok`, 'SHORTS_FORBIDDEN_AUTO_PUBLISH=true', 'PASS', SUITE_ID),
    )
  }

  if (!ONEAI_SHORTS_DRAFT_STATUSES.includes('needs_review')) {
    issues.push(
      issue(`${SUITE_ID}.review.status`, 'needs_review status required', 'FAIL', SUITE_ID),
    )
  }

  if (ONEAI_SHORTS_UPLOAD_TARGETS.length !== 3) {
    issues.push(
      issue(
        `${SUITE_ID}.upload.targets`,
        'upload targets are labels only (3 platforms)',
        'WARN',
        SUITE_ID,
      ),
    )
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.upload.targets.ok`,
        `labels: ${ONEAI_SHORTS_UPLOAD_TARGETS.join(', ')} (no API)`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  if (ONEAI_SHORTS_AUDIT_ACTION !== 'shorts.draft.status_changed') {
    issues.push(
      issue(`${SUITE_ID}.audit.action`, 'audit action mismatch', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.audit.ok`,
        `${ONEAI_SHORTS_AUDIT_ENTITY_ID} · ${ONEAI_SHORTS_AUDIT_ACTION}`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  return buildSuite(SUITE_ID, 'OneAI broadcast bridge contract', issues)
}
