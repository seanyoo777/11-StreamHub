/** Room / Session — docs/STREAMHUB_ROOM_CONTRACT.md §3 */

export const STREAM_ROOM_LIVE_STATES = Object.freeze([
  'OFFLINE',
  'LIVE',
  'RECONNECTING',
  'ENDED',
])

export const STREAM_SESSION_STATES = Object.freeze([
  'CREATED',
  'PREPARING',
  'LIVE',
  'RECONNECTING',
  'ENDED',
  'ARCHIVED',
])

/** room.status.updated.status ↔ StreamRoom.live_state (ROOM_CONTRACT §3.2) */
export const ROOM_STATUS_TO_LIVE_STATE = Object.freeze({
  offline: 'OFFLINE',
  live: 'LIVE',
  reconnecting: 'RECONNECTING',
  ended: 'ENDED',
})

export const STREAM_ENDED_REASONS = Object.freeze([
  'bj_stopped',
  'signal_lost',
  'admin_terminated',
  'system',
])
