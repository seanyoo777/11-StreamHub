import { STREAMHUB_ROUTE_KEYS, STREAMHUB_ROUTES } from '../contracts/routes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.route-ia'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runRouteContractSuite() {
  const issues = []
  const required = [
    'home',
    'live',
    'liveRoom',
    'creator',
    'creatorRoomStream',
    'admin',
  ]

  for (const key of required) {
    const path = STREAMHUB_ROUTES[key]
    if (!path) {
      issues.push(
        issue(`${SUITE_ID}.missing.${key}`, `Missing route key: ${key}`, 'FAIL', SUITE_ID),
      )
    } else {
      issues.push(
        issue(`${SUITE_ID}.ok.${key}`, `Route ${key} → ${path}`, 'PASS', SUITE_ID),
      )
    }
  }

  if (STREAMHUB_ROUTE_KEYS.length < 10) {
    issues.push(
      issue(
        `${SUITE_ID}.count`,
        `Expected ≥10 route keys; got ${STREAMHUB_ROUTE_KEYS.length}`,
        'WARN',
        SUITE_ID,
      ),
    )
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.count`,
        `${STREAMHUB_ROUTE_KEYS.length} route keys registered`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  const liveRoom = STREAMHUB_ROUTES.liveRoom
  if (!liveRoom?.includes(':roomId')) {
    issues.push(
      issue(`${SUITE_ID}.param`, 'liveRoom must include :roomId param', 'FAIL', SUITE_ID),
    )
  } else {
    issues.push(issue(`${SUITE_ID}.param`, 'liveRoom param pattern OK', 'PASS', SUITE_ID))
  }

  return buildSuite(SUITE_ID, 'Route IA contract (SCREEN_FLOW)', issues)
}
