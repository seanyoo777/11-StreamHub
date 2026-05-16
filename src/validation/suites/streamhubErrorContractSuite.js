import {
  SH_ERROR_CODE_KEYS,
  SH_ERROR_CODES,
  STREAMHUB_ERROR_ENVELOPE_FIELDS,
} from '../contracts/shErrorCodes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.error-codes'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runStreamhubErrorContractSuite() {
  const issues = []

  for (const field of STREAMHUB_ERROR_ENVELOPE_FIELDS) {
    issues.push(
      issue(`${SUITE_ID}.envelope.${field}`, `ErrorEnvelope field: ${field}`, 'PASS', SUITE_ID),
    )
  }

  for (const code of SH_ERROR_CODE_KEYS) {
    const def = SH_ERROR_CODES[code]
    if (!code.startsWith('SH_')) {
      issues.push(
        issue(`${SUITE_ID}.prefix.${code}`, `${code} must use SH_ prefix`, 'FAIL', SUITE_ID),
      )
      continue
    }
    if (def.fatal === true && def.retryable === true) {
      issues.push(
        issue(
          `${SUITE_ID}.policy.${code}`,
          `${code}: fatal+retryable both true is inconsistent`,
          'FAIL',
          SUITE_ID,
        ),
      )
    } else if (code === 'SH_STREAM_RECONNECTING' && def.fatal === true) {
      issues.push(
        issue(
          `${SUITE_ID}.reconnecting`,
          'SH_STREAM_RECONNECTING must be non-fatal',
          'FAIL',
          SUITE_ID,
        ),
      )
    } else {
      issues.push(
        issue(
          `${SUITE_ID}.ok.${code}`,
          `${code} fatal=${def.fatal} retryable=${def.retryable}`,
          'PASS',
          SUITE_ID,
        ),
      )
    }
    if (!def.messageKey?.startsWith('streamhub.error.')) {
      issues.push(
        issue(
          `${SUITE_ID}.key.${code}`,
          `${code} message_key must start with streamhub.error.`,
          'FAIL',
          SUITE_ID,
        ),
      )
    }
  }

  if (SH_ERROR_CODE_KEYS.length < 6) {
    issues.push(
      issue(`${SUITE_ID}.count`, 'Expected ≥6 SH_* codes in contract', 'WARN', SUITE_ID),
    )
  }

  return buildSuite(SUITE_ID, 'streamhub.error SH_* contract', issues)
}
