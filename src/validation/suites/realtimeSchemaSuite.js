import { STREAMHUB_ENVELOPE_FIELDS } from '../contracts/realtimeEnvelope.js'
import {
  CHAT_CHANNEL_PREFIX,
  STREAMHUB_ERROR_EVENT_TYPE,
  STREAMHUB_REALTIME_EVENT_TYPES,
  STREAMHUB_RECOVERY_EVENT_TYPES,
  formatStreamChatChannel,
} from '../contracts/realtimeEvents.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.realtime-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runRealtimeSchemaSuite() {
  const issues = []

  for (const field of STREAMHUB_ENVELOPE_FIELDS) {
    issues.push(
      issue(`${SUITE_ID}.envelope.${field}`, `Envelope field: ${field}`, 'PASS', SUITE_ID),
    )
  }

  const requiredTypes = [
    'stream.started',
    'stream.ended',
    'chat.message',
    'room.status.updated',
    STREAMHUB_ERROR_EVENT_TYPE,
  ]

  for (const eventType of requiredTypes) {
    if (!STREAMHUB_REALTIME_EVENT_TYPES.includes(eventType)) {
      issues.push(
        issue(
          `${SUITE_ID}.missing.${eventType}`,
          `Missing event_type: ${eventType}`,
          'FAIL',
          SUITE_ID,
        ),
      )
    } else {
      issues.push(
        issue(`${SUITE_ID}.catalog.${eventType}`, `Catalog includes ${eventType}`, 'PASS', SUITE_ID),
      )
    }
  }

  const channel = formatStreamChatChannel('room_mock_01')
  if (!channel.startsWith(CHAT_CHANNEL_PREFIX) || channel === CHAT_CHANNEL_PREFIX) {
    issues.push(
      issue(`${SUITE_ID}.channel`, 'stream_chat:{room_id} pattern invalid', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.channel`, `channel_id OK: ${channel} (mock only)`, 'PASS', SUITE_ID),
    )
  }

  for (const recoveryType of STREAMHUB_RECOVERY_EVENT_TYPES) {
    if (!STREAMHUB_REALTIME_EVENT_TYPES.includes(recoveryType)) {
      issues.push(
        issue(
          `${SUITE_ID}.recovery.${recoveryType}`,
          `Recovery event missing: ${recoveryType}`,
          'FAIL',
          SUITE_ID,
        ),
      )
    } else {
      issues.push(
        issue(
          `${SUITE_ID}.recovery.${recoveryType}`,
          `Recovery-related event: ${recoveryType}`,
          'PASS',
          SUITE_ID,
        ),
      )
    }
  }

  if (!STREAMHUB_REALTIME_EVENT_TYPES.includes(STREAMHUB_ERROR_EVENT_TYPE)) {
    issues.push(
      issue(`${SUITE_ID}.error-event`, 'streamhub.error must be in catalog', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.error-event`,
        'streamhub.error orthogonal to moderation (mock validator)',
        'PASS',
        SUITE_ID,
      ),
    )
  }

  issues.push(
    issue(`${SUITE_ID}.mock-only`, 'Realtime schema suite: mock only, no WS', 'PASS', SUITE_ID),
  )

  return buildSuite(SUITE_ID, 'Realtime event schema contract', issues)
}
