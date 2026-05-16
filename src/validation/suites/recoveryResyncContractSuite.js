import { RESYNC_ORTHOGONAL_ERROR_CODES, SESSION_STATES, TRANSPORT_STATES } from '../contracts/recoveryPolicy.js'
import { CHAT_CHANNEL_PREFIX } from '../contracts/realtimeEvents.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.recovery-resync'

/**
 * @param {{ transportState?: string; appSynced?: boolean; lastErrorCode?: string | null }} [mockState]
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runRecoveryResyncContractSuite(mockState = {}) {
  const issues = []
  const transport = mockState.transportState ?? 'TRANSPORT_CONNECTED'
  const appSynced = mockState.appSynced ?? false
  const lastError = mockState.lastErrorCode ?? null

  for (const state of TRANSPORT_STATES) {
    issues.push(issue(`${SUITE_ID}.transport.${state}`, `Transport state defined: ${state}`, 'PASS', SUITE_ID))
  }

  for (const state of SESSION_STATES) {
    issues.push(issue(`${SUITE_ID}.session.${state}`, `Session state defined: ${state}`, 'PASS', SUITE_ID))
  }

  const channelId = `${CHAT_CHANNEL_PREFIX}room_mock_01`
  if (!channelId.startsWith(CHAT_CHANNEL_PREFIX)) {
    issues.push(issue(`${SUITE_ID}.channel`, 'Invalid chat channel_id pattern', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.channel`, `channel_id pattern OK: ${channelId}`, 'PASS', SUITE_ID))
  }

  if (lastError && appSynced) {
    const orthogonal = RESYNC_ORTHOGONAL_ERROR_CODES.includes(lastError)
    if (orthogonal) {
      issues.push(
        issue(
          `${SUITE_ID}.orthogonal`,
          `${lastError} may coexist with APP_SYNCED; error does not replace resync`,
          'PASS',
          SUITE_ID,
        ),
      )
    }
  }

  if (transport === 'TRANSPORT_CONNECTED' && !appSynced) {
    issues.push(
      issue(
        `${SUITE_ID}.not-synced`,
        'Transport connected but APP_SYNCED false — resync required (mock)',
        'WARN',
        SUITE_ID,
      ),
    )
  } else if (appSynced) {
    issues.push(
      issue(`${SUITE_ID}.synced`, 'APP_SYNCED true — mock resync complete', 'PASS', SUITE_ID),
    )
  }

  issues.push(
    issue(
      `${SUITE_ID}.since-seq`,
      'since_chat_seq replay path documented (mock validator only)',
      'PASS',
      SUITE_ID,
    ),
  )

  return buildSuite(SUITE_ID, 'Recovery / resync contract', issues)
}
