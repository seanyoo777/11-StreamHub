import {
  STREAMHUB_SHORTS_QUEUE_STORAGE_KEY,
  SHORTS_CLIP_AUDIT_KINDS,
  SHORTS_NOTIFICATION_KINDS,
  SHORTS_QUEUE_STATUSES,
} from '../../shorts/contracts/shortsQueueSchema.js'
import { CLIP_DETECTION_REASON_KEYS } from '../../shorts/contracts/clipDetection.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.shorts-queue-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runShortsQueueSchemaSuite() {
  const issues = []

  if (!STREAMHUB_SHORTS_QUEUE_STORAGE_KEY.startsWith('streamhub.')) {
    issues.push(issue(`${SUITE_ID}.storage`, 'Invalid queue storage key', 'FAIL', SUITE_ID))
  } else {
    issues.push(
      issue(`${SUITE_ID}.storage`, `Queue key: ${STREAMHUB_SHORTS_QUEUE_STORAGE_KEY}`, 'PASS', SUITE_ID),
    )
  }

  for (const status of SHORTS_QUEUE_STATUSES) {
    issues.push(issue(`${SUITE_ID}.status.${status}`, `Status: ${status}`, 'PASS', SUITE_ID))
  }

  if (CLIP_DETECTION_REASON_KEYS.length < 7) {
    issues.push(
      issue(`${SUITE_ID}.reasons`, 'Expected ≥7 detection reasons', 'WARN', SUITE_ID),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.reasons`, `${CLIP_DETECTION_REASON_KEYS.length} detection reasons`, 'PASS', SUITE_ID),
    )
  }

  for (const kind of SHORTS_CLIP_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Audit kind: ${kind}`, 'PASS', SUITE_ID))
  }

  for (const kind of SHORTS_NOTIFICATION_KINDS) {
    issues.push(
      issue(`${SUITE_ID}.notif.${kind}`, `Notification kind: ${kind}`, 'PASS', SUITE_ID),
    )
  }

  issues.push(
    issue(`${SUITE_ID}.mock-only`, 'Shorts queue: localStorage mock only', 'PASS', SUITE_ID),
  )

  return buildSuite(SUITE_ID, 'Shorts queue schema contract', issues)
}
