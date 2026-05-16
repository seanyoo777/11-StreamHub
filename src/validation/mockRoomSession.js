/** Mock room/session snapshot for diagnostics — no network */

import { formatStreamChatChannel } from './contracts/realtimeEvents.js'

/** @type {import('./types.js').MockRoomSessionState | null} */
let state = null

/**
 * @typedef {Object} MockRoomSessionState
 * @property {string} room_id
 * @property {string} live_state
 * @property {string | null} active_session_id
 * @property {string} session_state
 * @property {number} last_chat_seq
 * @property {string} channel_id
 * @property {string} transport_state
 * @property {boolean} app_synced
 * @property {string | null} last_error_code
 * @property {boolean} mockOnly
 */

export function getDefaultMockRoomSession() {
  const roomId = 'room_mock_p2'
  return {
    room_id: roomId,
    live_state: 'LIVE',
    active_session_id: 'sess_mock_001',
    session_state: 'LIVE',
    last_chat_seq: 42,
    channel_id: formatStreamChatChannel(roomId),
    transport_state: 'TRANSPORT_CONNECTED',
    app_synced: true,
    last_error_code: null,
    mockOnly: true,
  }
}

/** @param {Partial<MockRoomSessionState>} [patch] */
export function setMockRoomSession(patch = {}) {
  state = { ...getDefaultMockRoomSession(), ...patch }
  return state
}

/** @returns {MockRoomSessionState} */
export function getMockRoomSession() {
  if (!state) state = getDefaultMockRoomSession()
  return state
}

/** @param {{ transportState?: string; appSynced?: boolean; lastErrorCode?: string | null }} [resync] */
export function applyMockResyncToRoomSession(resync = {}) {
  const current = getMockRoomSession()
  return setMockRoomSession({
    transport_state: resync.transportState ?? current.transport_state,
    app_synced: resync.appSynced ?? current.app_synced,
    last_error_code: resync.lastErrorCode ?? current.last_error_code,
    live_state:
      resync.lastErrorCode === 'SH_STREAM_RECONNECTING' ? 'RECONNECTING' : current.live_state,
    session_state:
      resync.lastErrorCode === 'SH_STREAM_RECONNECTING' ? 'RECONNECTING' : current.session_state,
  })
}

export function resetMockRoomSessionForTests() {
  state = null
}
