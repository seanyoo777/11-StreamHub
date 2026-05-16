import { STREAMHUB_FEATURE_FLAGS, STREAMHUB_FEATURE_FLAG_KEYS } from '../contracts/featureFlags.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'feature-flags'

/**
 * @param {Record<string, unknown>} [overrides]
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runFeatureFlagSuite(overrides = {}) {
  const issues = []

  for (const key of STREAMHUB_FEATURE_FLAG_KEYS) {
    const def = STREAMHUB_FEATURE_FLAGS[key]
    const value = key in overrides ? overrides[key] : def.defaultValue
    const typeofValue = typeof value

    if (def.type === 'boolean' && typeofValue !== 'boolean') {
      issues.push(
        issue(`${SUITE_ID}.${key}.type`, `${key} must be boolean`, 'FAIL', SUITE_ID),
      )
    } else if (def.type === 'number') {
      if (typeofValue !== 'number' || Number.isNaN(value)) {
        issues.push(
          issue(`${SUITE_ID}.${key}.type`, `${key} must be number`, 'FAIL', SUITE_ID),
        )
      } else if (def.min != null && value < def.min) {
        issues.push(
          issue(`${SUITE_ID}.${key}.min`, `${key} below min ${def.min}`, 'FAIL', SUITE_ID),
        )
      } else if (def.max != null && value > def.max) {
        issues.push(
          issue(`${SUITE_ID}.${key}.max`, `${key} above max ${def.max}`, 'FAIL', SUITE_ID),
        )
      } else {
        issues.push(
          issue(`${SUITE_ID}.${key}.ok`, `${key}=${value}`, 'PASS', SUITE_ID),
        )
      }
    } else {
      issues.push(issue(`${SUITE_ID}.${key}.ok`, `${key}=${value}`, 'PASS', SUITE_ID))
    }
  }

  const mockOnly =
    'VITE_STREAMHUB_MOCK_ONLY' in overrides
      ? overrides.VITE_STREAMHUB_MOCK_ONLY
      : STREAMHUB_FEATURE_FLAGS.VITE_STREAMHUB_MOCK_ONLY.defaultValue

  if (mockOnly !== true) {
    issues.push(
      issue(
        `${SUITE_ID}.mock-only`,
        'VITE_STREAMHUB_MOCK_ONLY must be true in dev/mock',
        'FAIL',
        SUITE_ID,
      ),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.mock-only`, 'MOCK ONLY flag enforced', 'PASS', SUITE_ID),
    )
  }

  return buildSuite(SUITE_ID, 'Feature flag validation', issues)
}
