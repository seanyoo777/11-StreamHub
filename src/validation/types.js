/** @typedef {'PASS' | 'WARN' | 'FAIL'} DiagnosticStatus */

/**
 * @typedef {Object} DiagnosticIssue
 * @property {string} id
 * @property {string} message
 * @property {DiagnosticStatus} status
 * @property {string} [suiteId]
 */

/**
 * @typedef {Object} DiagnosticSuite
 * @property {string} id
 * @property {string} label
 * @property {DiagnosticStatus} status
 * @property {DiagnosticIssue[]} issues
 * @property {number} passCount
 * @property {number} warnCount
 * @property {number} failCount
 */

/**
 * @typedef {Object} SelfTestResult
 * @property {DiagnosticStatus} overall
 * @property {number} issueCount
 * @property {number} warnCount
 * @property {number} passCount
 * @property {number} lastCheckedAtMs
 * @property {boolean} mockOnly
 * @property {DiagnosticSuite[]} suites
 * @property {DiagnosticIssue[]} issues
 */

/**
 * @typedef {Object} MockAuditEntry
 * @property {string} id
 * @property {string} kind
 * @property {number} server_ms
 * @property {string} actor_admin_id
 * @property {string} correlation_id
 * @property {Record<string, unknown>} payload
 */

export {}
