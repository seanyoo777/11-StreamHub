import {
  STREAMHUB_VIRAL_PATTERNS_STORAGE_KEY,
  STREAMHUB_VIRAL_SCORES_STORAGE_KEY,
  VIRAL_NOTIFICATION_KINDS,
  VIRAL_RECOMMENDATIONS,
  VIRAL_SCORE_AUDIT_KINDS,
} from '../../viral/viralScoreTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.viral-score-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runViralScoreSchemaSuite() {
  const issues = []

  for (const key of [
    { id: 'scores', val: STREAMHUB_VIRAL_SCORES_STORAGE_KEY },
    { id: 'patterns', val: STREAMHUB_VIRAL_PATTERNS_STORAGE_KEY },
  ]) {
    if (!key.val.startsWith('streamhub.')) {
      issues.push(issue(`${SUITE_ID}.${key.id}`, 'Invalid storage key', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.${key.id}`, key.val, 'PASS', SUITE_ID))
    }
  }

  for (const rec of VIRAL_RECOMMENDATIONS) {
    issues.push(issue(`${SUITE_ID}.rec.${rec}`, rec, 'PASS', SUITE_ID))
  }

  for (const kind of VIRAL_SCORE_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
  }

  if (VIRAL_NOTIFICATION_KINDS.length < 3) {
    issues.push(issue(`${SUITE_ID}.notif`, 'Missing viral notifications', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif`, `${VIRAL_NOTIFICATION_KINDS.length} kinds`, 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.no-api`, 'No external analytics API', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Viral score schema contract', issues)
}
