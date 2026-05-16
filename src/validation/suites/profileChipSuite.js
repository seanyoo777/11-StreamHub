import { runProfileChipSelfTests } from '@tetherget/global-profile-chip-core'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runProfileChipSuite() {
  const result = runProfileChipSelfTests('streamhub')
  const issues = result.checks
    .filter((c) => c.status !== 'PASS')
    .map((c) => ({
      id: c.id,
      severity: c.status === 'FAIL' ? 'fail' : 'warn',
      message: c.message,
    }))

  return {
    id: 'profile_chip',
    title: 'Global Profile Chip',
    status: result.overall === 'PASS' ? 'pass' : result.overall === 'WARN' ? 'warn' : 'fail',
    mockOnly: true,
    issues,
    meta: { checkCount: result.checks.length },
  }
}
