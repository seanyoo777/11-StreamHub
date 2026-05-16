/** Realtime event catalog — docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md §2 */

export const STREAMHUB_REALTIME_EVENT_TYPES = Object.freeze([
  'stream.started',
  'stream.ended',
  'stream.session.updated',
  'viewer.joined',
  'viewer.left',
  'chat.message',
  'donation.sent',
  'moderation.muted',
  'moderation.banned',
  'report.created',
  'room.status.updated',
  'streamhub.error',
])

export const STREAMHUB_ADMIN_EVENT_KINDS = Object.freeze([
  'admin.streamhub.report_created',
  'admin.streamhub.report_status_changed',
  'admin.streamhub.chat_audit',
  'admin.streamhub.user_muted',
  'admin.streamhub.user_banned',
  'admin.streamhub.room_locked',
  'admin.streamhub.stream_force_ended',
  'admin.streamhub.system_notice',
])

export const STREAMHUB_CORE_AUDIT_KINDS = Object.freeze([
  'admin.streamhub.self_test_run',
  'admin.streamhub.recovery_resync_check',
])

export const STREAMHUB_AUDIT_KINDS = Object.freeze([
  ...STREAMHUB_CORE_AUDIT_KINDS,
  'admin.streamhub.post_change_validation',
])

export const CHAT_CHANNEL_PREFIX = 'stream_chat:'

/** Recovery / resync related catalog (REALTIME §2 + RECOVERY_RESYNC) */
export const STREAMHUB_RECOVERY_EVENT_TYPES = Object.freeze([
  'stream.session.updated',
  'room.status.updated',
])

export const STREAMHUB_ERROR_EVENT_TYPE = 'streamhub.error'

export function formatStreamChatChannel(roomId) {
  return `${CHAT_CHANNEL_PREFIX}${roomId}`
}
