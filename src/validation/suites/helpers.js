import { resolveOverallVerdict } from '@tetherget/self-test-core'

/**
 * @param {string} id
 * @param {string} label
 * @param {import('../types.js').DiagnosticIssue[]} issues
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function buildSuite(id, label, issues) {
  const passCount = issues.filter((i) => i.status === 'PASS').length
  const warnCount = issues.filter((i) => i.status === 'WARN').length
  const failCount = issues.filter((i) => i.status === 'FAIL').length
  const status = resolveOverallVerdict(issues.map((i) => i.status))
  return { id, label, status, issues, passCount, warnCount, failCount }
}

/**
 * @param {string} id
 * @param {string} message
 * @param {'PASS' | 'WARN' | 'FAIL'} status
 * @param {string} [suiteId]
 * @returns {import('../types.js').DiagnosticIssue}
 */
export function issue(id, message, status, suiteId) {
  return { id, message, status, suiteId }
}
