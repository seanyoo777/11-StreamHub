import { CHAT_SEQ_POLICY, isValidStreamChatChannel } from '../contracts/chatSeq.js'
import { formatStreamChatChannel } from '../contracts/realtimeEvents.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.chat-seq'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runChatSeqContractSuite() {
  const issues = []
  const roomId = 'room_chat_mock'

  const channel = formatStreamChatChannel(roomId)
  if (!isValidStreamChatChannel(channel, roomId)) {
    issues.push(
      issue(`${SUITE_ID}.channel`, 'stream_chat:{room_id} validation failed', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(
      issue(`${SUITE_ID}.channel`, `channel_id OK: ${channel}`, 'PASS', SUITE_ID),
    )
  }

  if (CHAT_SEQ_POLICY.sortKey !== 'chat_seq') {
    issues.push(issue(`${SUITE_ID}.sort`, 'sort key must be chat_seq', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.sort`, 'chat_seq sort policy OK', 'PASS', SUITE_ID))
  }

  if (CHAT_SEQ_POLICY.reconnectParam !== 'since_chat_seq') {
    issues.push(issue(`${SUITE_ID}.since`, 'since_chat_seq reconnect param', 'FAIL', SUITE_ID))
  } else {
    issues.push(
      issue(`${SUITE_ID}.since`, 'since_chat_seq reconnect policy OK', 'PASS', SUITE_ID),
    )
  }

  issues.push(
    issue(
      `${SUITE_ID}.snapshot`,
      `snapshot event: ${CHAT_SEQ_POLICY.snapshotEvent}`,
      'PASS',
      SUITE_ID,
    ),
  )

  issues.push(
    issue(`${SUITE_ID}.mock-only`, 'Chat seq contract: mock only', 'PASS', SUITE_ID),
  )

  return buildSuite(SUITE_ID, 'Chat seq / channel contract', issues)
}
