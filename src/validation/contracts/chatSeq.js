/** Chat seq — docs/STREAMHUB_CHAT_MODERATION_POLICY.md §3 */

import { CHAT_CHANNEL_PREFIX } from './realtimeEvents.js'

export const CHAT_SEQ_POLICY = Object.freeze({
  monotonic: true,
  sortKey: 'chat_seq',
  reconnectParam: 'since_chat_seq',
  snapshotEvent: 'streamhub.chat_message_list_snapshot',
})

export function isValidStreamChatChannel(channelId, roomId) {
  return channelId === `${CHAT_CHANNEL_PREFIX}${roomId}`
}
