import { filterCommands, runCommandPaletteCoreSelfTests } from '@tetherget/global-command-palette-core'
import { buildStreamHubCommandRegistry } from '../../command/commandRegistry.js'
import { assertStreamHubCommandFlagsRegistered } from '../../command/commandFeatureFlags.js'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runCommandPaletteSuite() {
  const registry = buildStreamHubCommandRegistry()
  const core = runCommandPaletteCoreSelfTests({
    registry,
    skipBrowserChecks: typeof window === 'undefined',
  })

  const required = [
    'sh-admin-shorts',
    'sh-overlay-guide',
    'sh-self-test',
    'sh-admin',
    'sh-oneai-profile',
  ]
  const missing = required.filter((id) => !registry.some((c) => c.id === id))
  const filtered = filterCommands(registry, 'overlay')
  const flags = assertStreamHubCommandFlagsRegistered()

  const checks = [
    ...core,
    {
      id: 'command.streamhub.required',
      label: 'Required StreamHub commands',
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      message: missing.length ? `missing: ${missing.join(', ')}` : required.join(', '),
    },
    {
      id: 'command.streamhub.flags',
      label: 'Command flags registered',
      status: flags.ok ? 'PASS' : 'FAIL',
      message: flags.message,
    },
    {
      id: 'command.streamhub.filter',
      label: 'Local filter overlay',
      status: filtered.some((c) => c.id === 'sh-overlay-guide') ? 'PASS' : 'FAIL',
      message: `matched ${filtered.length}`,
    },
  ]

  const issues = checks
    .filter((c) => c.status !== 'PASS')
    .map((c) => ({
      id: c.id,
      severity: c.status === 'FAIL' ? 'fail' : 'warn',
      message: c.message,
    }))

  let overall = 'pass'
  if (issues.some((i) => i.severity === 'fail')) overall = 'fail'
  else if (issues.some((i) => i.severity === 'warn')) overall = 'warn'

  return {
    id: 'command_palette',
    title: 'Global Command Palette',
    status: overall,
    mockOnly: true,
    issues,
    meta: { checkCount: checks.length },
  }
}
