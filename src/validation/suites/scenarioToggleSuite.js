import {
  ROOM_SESSION_SCENARIOS,
  applyMockRoomScenario,
  isValidRoomScenario,
} from '../mockRoomSessionScenarios.js'
import { resetMockForceEndFixtureForTests } from '../mockForceEnd.js'
import { getMockRoomSession, setMockRoomSession } from '../mockRoomSession.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.scenario-toggle'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runScenarioToggleSuite() {
  const issues = []
  const saved = { ...getMockRoomSession() }

  for (const scenario of ROOM_SESSION_SCENARIOS) {
    if (!isValidRoomScenario(scenario)) {
      issues.push(
        issue(`${SUITE_ID}.invalid.${scenario}`, `Invalid scenario: ${scenario}`, 'FAIL', SUITE_ID),
      )
      continue
    }

    if (scenario !== 'FORCE_ENDED') {
      resetMockForceEndFixtureForTests()
    }

    const state = applyMockRoomScenario(scenario)

    switch (scenario) {
      case 'RECONNECTING':
        if (state.live_state !== 'RECONNECTING' || state.app_synced) {
          issues.push(
            issue(`${SUITE_ID}.${scenario}`, 'RECONNECTING state mismatch', 'FAIL', SUITE_ID),
          )
        } else {
          issues.push(
            issue(`${SUITE_ID}.${scenario}`, 'RECONNECTING mock applied', 'PASS', SUITE_ID),
          )
        }
        break
      case 'OFFLINE':
        if (state.live_state !== 'OFFLINE' || state.active_session_id !== null) {
          issues.push(issue(`${SUITE_ID}.${scenario}`, 'OFFLINE state mismatch', 'FAIL', SUITE_ID))
        } else {
          issues.push(issue(`${SUITE_ID}.${scenario}`, 'OFFLINE mock applied', 'PASS', SUITE_ID))
        }
        break
      case 'APP_SYNCED':
        if (!state.app_synced || state.live_state !== 'LIVE') {
          issues.push(
            issue(`${SUITE_ID}.${scenario}`, 'APP_SYNCED state mismatch', 'FAIL', SUITE_ID),
          )
        } else {
          issues.push(
            issue(`${SUITE_ID}.${scenario}`, 'APP_SYNCED mock applied', 'PASS', SUITE_ID),
          )
        }
        break
      case 'FORCE_ENDED':
        if (state.session_state !== 'ENDED' || state.live_state !== 'ENDED') {
          issues.push(
            issue(`${SUITE_ID}.${scenario}`, 'FORCE_ENDED state mismatch', 'FAIL', SUITE_ID),
          )
        } else {
          issues.push(
            issue(`${SUITE_ID}.${scenario}`, 'FORCE_ENDED mock applied', 'PASS', SUITE_ID),
          )
        }
        break
      default:
        break
    }
  }

  setMockRoomSession(saved)

  issues.push(
    issue(`${SUITE_ID}.mock-only`, 'Scenario toggles: mock buttons only', 'PASS', SUITE_ID),
  )

  return buildSuite(SUITE_ID, 'Room/session scenario toggles', issues)
}
