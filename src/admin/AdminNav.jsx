import { STREAMHUB_ADMIN_SHELL_ROUTES } from '../validation/contracts/adminRoutes.js'
import { STREAMHUB_DEV_ROUTES } from '../validation/contracts/routes.js'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: STREAMHUB_ADMIN_SHELL_ROUTES.dashboard },
  { id: 'reports', label: 'Reports', path: STREAMHUB_ADMIN_SHELL_ROUTES.reports },
  { id: 'rooms', label: 'Rooms', path: STREAMHUB_ADMIN_SHELL_ROUTES.rooms },
  { id: 'fees', label: 'Fees', path: STREAMHUB_ADMIN_SHELL_ROUTES.fees },
  { id: 'recovery', label: 'Recovery', path: STREAMHUB_ADMIN_SHELL_ROUTES.recovery },
]

/**
 * @param {{ activePageId: string }} props
 */
export function AdminNav({ activePageId }) {
  return (
    <nav className="sh-admin-nav" aria-label="Mock admin navigation">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <a
              href={item.path}
              className={activePageId === item.id ? 'sh-admin-nav-active' : undefined}
              data-testid={`admin-nav-${item.id}`}
            >
              {item.label}
            </a>
          </li>
        ))}
        <li className="sh-admin-nav-divider" />
        <li>
          <a href={STREAMHUB_DEV_ROUTES.selfTest} data-testid="admin-nav-self-test">
            Self-Test
          </a>
        </li>
        <li>
          <a href="/">Home</a>
        </li>
      </ul>
    </nav>
  )
}
