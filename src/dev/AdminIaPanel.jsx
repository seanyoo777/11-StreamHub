import { STREAMHUB_ADMIN_SELF_TEST_LINKS } from '../validation/contracts/adminRoutes.js'
import { STREAMHUB_DEV_ROUTES } from '../validation/contracts/routes.js'

export function AdminIaPanel() {
  return (
    <section className="sh-admin-ia" aria-labelledby="admin-ia-heading">
      <h2 id="admin-ia-heading">Admin IA (SCREEN_FLOW)</h2>
      <p className="sh-subtitle">
        Mock route contract — links are navigation targets only (no admin API)
      </p>
      <ul className="sh-admin-links" data-testid="admin-ia-links">
        {STREAMHUB_ADMIN_SELF_TEST_LINKS.map((link) => (
          <li key={link.path}>
            <a
              href={link.path}
              className={
                link.path === STREAMHUB_DEV_ROUTES.selfTest ? 'sh-admin-link-primary' : undefined
              }
              data-testid={`admin-link-${link.path.replace(/\//g, '_')}`}
            >
              {link.path}
            </a>
            <span className="sh-admin-link-label">{link.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
