import {
  STREAMHUB_ADMIN_ROUTES,
  STREAMHUB_ADMIN_ROUTE_PATHS,
  STREAMHUB_ADMIN_SHELL_PATHS,
} from '../contracts/adminRoutes.js'
import { STREAMHUB_DEV_ROUTES } from '../contracts/routes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.admin-ia'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runAdminIaRouteSuite() {
  const issues = []

  const required = ['dashboard', 'reports', 'users', 'rooms', 'chat', 'recovery']

  for (const key of required) {
    const path = STREAMHUB_ADMIN_ROUTES[key]
    if (!path?.startsWith('/admin/')) {
      issues.push(
        issue(`${SUITE_ID}.missing.${key}`, `Missing admin route: ${key}`, 'FAIL', SUITE_ID),
      )
    } else {
      issues.push(issue(`${SUITE_ID}.ok.${key}`, `Admin route ${key} → ${path}`, 'PASS', SUITE_ID))
    }
  }

  if (STREAMHUB_ADMIN_ROUTE_PATHS.length < 6) {
    issues.push(
      issue(
        `${SUITE_ID}.count`,
        `Expected ≥6 admin paths; got ${STREAMHUB_ADMIN_ROUTE_PATHS.length}`,
        'WARN',
        SUITE_ID,
      ),
    )
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.count`,
        `${STREAMHUB_ADMIN_ROUTE_PATHS.length} admin IA paths`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  if (!STREAMHUB_DEV_ROUTES.selfTest) {
    issues.push(issue(`${SUITE_ID}.self-test`, 'Dev self-test route missing', 'FAIL', SUITE_ID))
  } else {
    issues.push(
      issue(
        `${SUITE_ID}.self-test`,
        `Self-test panel link target: ${STREAMHUB_DEV_ROUTES.selfTest}`,
        'PASS',
        SUITE_ID,
      ),
    )
  }

  for (const shellPath of STREAMHUB_ADMIN_SHELL_PATHS) {
    if (!shellPath.startsWith('/admin/')) {
      issues.push(
        issue(`${SUITE_ID}.shell.${shellPath}`, 'Invalid admin shell path', 'FAIL', SUITE_ID),
      )
    } else {
      issues.push(
        issue(`${SUITE_ID}.shell.${shellPath}`, `P3 shell route: ${shellPath}`, 'PASS', SUITE_ID),
      )
    }
  }

  issues.push(
    issue(`${SUITE_ID}.mock-only`, 'Admin IA routes: SCREEN_FLOW mock validation', 'PASS', SUITE_ID),
  )

  return buildSuite(SUITE_ID, 'Admin IA route contract (SCREEN_FLOW)', issues)
}
