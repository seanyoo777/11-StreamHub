import { ROOM_SESSION_SCENARIOS, applyMockRoomScenario } from '../validation/mockRoomSessionScenarios.js'
import { runPostChangeValidation } from '../validation/postChangeValidation.js'

/**
 * @param {{
 *   onScenarioApplied?: (session: import('../validation/mockRoomSession.js').MockRoomSessionState) => void;
 *   onPostChange?: (r: import('../validation/postChangeValidation.js').PostChangeValidationResult) => void;
 * }} props
 */
export function RoomSessionScenarioToggle({ onScenarioApplied, onPostChange }) {
  return (
    <section className="sh-scenario-toggle" aria-labelledby="scenario-toggle-heading">
      <h2 id="scenario-toggle-heading">Room / session scenarios</h2>
      <p className="sh-subtitle">Mock buttons — applies state + post-change self-test (once)</p>
      <div className="sh-scenario-buttons" data-testid="dev-scenario-buttons">
        {ROOM_SESSION_SCENARIOS.map((scenario) => (
          <button
            key={scenario}
            type="button"
            className="sh-run-btn sh-scenario-btn"
            data-testid={`scenario-${scenario}`}
            onClick={() => {
              const session = applyMockRoomScenario(scenario)
              onScenarioApplied?.(session)
              const validation = runPostChangeValidation({
                kind: 'scenario.apply',
                payload: { scenario, source: 'dev_self_test' },
              })
              onPostChange?.(validation)
            }}
          >
            {scenario}
          </button>
        ))}
      </div>
    </section>
  )
}
