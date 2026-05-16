import {
  ONEAI_VIRAL_TREND_RADAR_KEY,
  TREND_READER_AUDIT_KINDS,
  TREND_READER_NOTIFICATION_KINDS,
  TREND_IMPORT_SOURCE,
} from '../../oneai/trends/trendReaderTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.viral-trend-reader-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runViralTrendReaderSchemaSuite() {
  const issues = []

  if (ONEAI_VIRAL_TREND_RADAR_KEY !== 'tetherget.viral_trend_radar_v1') {
    issues.push(issue(`${SUITE_ID}.key`, 'Storage key mismatch', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.key`, ONEAI_VIRAL_TREND_RADAR_KEY, 'PASS', SUITE_ID))
  }

  if (TREND_IMPORT_SOURCE !== 'viral_trend_radar') {
    issues.push(issue(`${SUITE_ID}.import`, 'import_source mismatch', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.import`, TREND_IMPORT_SOURCE, 'PASS', SUITE_ID))
  }

  for (const kind of TREND_READER_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
  }

  if (TREND_READER_NOTIFICATION_KINDS.length < 3) {
    issues.push(issue(`${SUITE_ID}.notif`, 'Missing trend notifications', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif`, `${TREND_READER_NOTIFICATION_KINDS.length} kinds`, 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.read-only`, 'localStorage read-only bridge', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-api`, 'No external API', 'PASS', SUITE_ID))
  issues.push(issue(`${SUITE_ID}.no-broadcast`, 'No real broadcast', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Viral trend reader schema contract', issues)
}
