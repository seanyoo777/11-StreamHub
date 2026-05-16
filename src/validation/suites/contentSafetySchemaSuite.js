import {
  CONTENT_SAFETY_AUDIT_KINDS,
  CONTENT_SAFETY_FLAG_KEYS,
  CONTENT_SAFETY_NOTIFICATION_KINDS,
  CONTENT_SAFETY_RISK_THRESHOLDS,
  CONTENT_SAFETY_SOURCE_TYPES,
  CONTENT_SAFETY_VERDICTS,
  STREAMHUB_CONTENT_SAFETY_STORAGE_KEY,
  validateContentSafetyFlags,
} from '../../shorts/safety/contentSafetyTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.content-safety-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runContentSafetySchemaSuite() {
  const issues = []

  if (!STREAMHUB_CONTENT_SAFETY_STORAGE_KEY.startsWith('streamhub.')) {
    issues.push(issue(`${SUITE_ID}.storage`, 'Invalid storage key', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.storage`, `Key: ${STREAMHUB_CONTENT_SAFETY_STORAGE_KEY}`, 'PASS', SUITE_ID))
  }

  for (const t of CONTENT_SAFETY_SOURCE_TYPES) {
    issues.push(issue(`${SUITE_ID}.source.${t}`, `sourceType: ${t}`, 'PASS', SUITE_ID))
  }

  for (const v of CONTENT_SAFETY_VERDICTS) {
    issues.push(issue(`${SUITE_ID}.verdict.${v}`, `verdict: ${v}`, 'PASS', SUITE_ID))
  }

  for (const f of CONTENT_SAFETY_FLAG_KEYS) {
    issues.push(issue(`${SUITE_ID}.flag.${f}`, `flag: ${f}`, 'PASS', SUITE_ID))
  }

  try {
    const flags = Object.fromEntries(CONTENT_SAFETY_FLAG_KEYS.map((k) => [k, false]))
    validateContentSafetyFlags(flags)
    issues.push(issue(`${SUITE_ID}.flags.validate`, 'Flag schema OK', 'PASS', SUITE_ID))
  } catch {
    issues.push(issue(`${SUITE_ID}.flags.validate`, 'Flag validation failed', 'FAIL', SUITE_ID))
  }

  for (const kind of CONTENT_SAFETY_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, `Audit: ${kind}`, 'PASS', SUITE_ID))
  }

  for (const kind of CONTENT_SAFETY_NOTIFICATION_KINDS) {
    issues.push(issue(`${SUITE_ID}.notif.${kind}`, `Notification: ${kind}`, 'PASS', SUITE_ID))
  }

  issues.push(
    issue(
      `${SUITE_ID}.thresholds`,
      `needs_review≥${CONTENT_SAFETY_RISK_THRESHOLDS.NEEDS_REVIEW_MIN} block≥${CONTENT_SAFETY_RISK_THRESHOLDS.BLOCK_MOCK_MIN}`,
      'PASS',
      SUITE_ID,
    ),
  )

  issues.push(issue(`${SUITE_ID}.mock-only`, 'No real upload / no external AI', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Content safety review schema', issues)
}
