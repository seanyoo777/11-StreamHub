/** Mock room/session scenarios — button-driven only, no network */

import { setMockForceEndFixture } from './mockForceEnd.js'
import { getMockRoomSession, setMockRoomSession } from './mockRoomSession.js'

export const ROOM_SESSION_SCENARIOS = Object.freeze([
  'RECONNECTING',
  'OFFLINE',
  'APP_SYNCED',
  'FORCE_ENDED',
])

/**
 * @param {typeof ROOM_SESSION_SCENARIOS[number]} scenario
 */
export function applyMockRoomScenario(scenario) {
  const base = getMockRoomSession()

  switch (scenario) {
    case 'RECONNECTING':
      return setMockRoomSession({
        live_state: 'RECONNECTING',
        session_state: 'RECONNECTING',
        active_session_id: base.active_session_id,
        transport_state: 'TRANSPORT_CONNECTED',
        app_synced: false,
        last_error_code: 'SH_STREAM_RECONNECTING',
      })
    case 'OFFLINE':
      return setMockRoomSession({
        live_state: 'OFFLINE',
        session_state: 'ENDED',
        active_session_id: null,
        transport_state: 'TRANSPORT_DISCONNECTED',
        app_synced: false,
        last_error_code: 'SH_STREAM_OFFLINE',
      })
    case 'APP_SYNCED':
      return setMockRoomSession({
        live_state: 'LIVE',
        session_state: 'LIVE',
        active_session_id: base.active_session_id ?? 'sess_mock_001',
        transport_state: 'TRANSPORT_CONNECTED',
        app_synced: true,
        last_error_code: null,
      })
    case 'FORCE_ENDED': {
      setMockForceEndFixture({
        room_id: base.room_id,
        session_id: base.active_session_id ?? 'sess_force_mock',
        reason: 'admin_terminated',
      })
      return setMockRoomSession({
        live_state: 'ENDED',
        session_state: 'ENDED',
        active_session_id: null,
        transport_state: 'TRANSPORT_CONNECTED',
        app_synced: true,
        last_error_code: null,
      })
    }
    default:
      throw new Error(`Unknown scenario: ${scenario}`)
  }
}

/**
 * @param {typeof ROOM_SESSION_SCENARIOS[number]} scenario
 */
export function isValidRoomScenario(scenario) {
  return ROOM_SESSION_SCENARIOS.includes(scenario)
}
