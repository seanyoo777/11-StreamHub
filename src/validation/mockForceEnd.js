/** Mock force-end fixture — pairs admin.streamhub.stream_force_ended + stream.ended */

/**
 * @typedef {Object} MockForceEndFixture
 * @property {string} room_id
 * @property {string} session_id
 * @property {string} session_state
 * @property {string} stream_ended_reason
 * @property {string} live_state
 */

/** @type {MockForceEndFixture | null} */
let fixture = null

/**
 * @param {{ room_id: string; session_id: string; reason?: string }} input
 */
export function setMockForceEndFixture(input) {
  fixture = {
    room_id: input.room_id,
    session_id: input.session_id,
    session_state: 'ENDED',
    stream_ended_reason: input.reason ?? 'admin_terminated',
    live_state: 'ENDED',
  }
  return fixture
}

export function getMockForceEndFixture() {
  if (!fixture) {
    return setMockForceEndFixture({
      room_id: 'room_default',
      session_id: 'sess_default',
    })
  }
  return fixture
}

export function resetMockForceEndFixtureForTests() {
  fixture = null
}
