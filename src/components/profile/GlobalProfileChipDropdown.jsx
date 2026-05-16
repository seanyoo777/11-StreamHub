import {
  appendProfileDropdownAudit,
  buildProfileDropdownDetailRows,
  buildProfileDropdownMetaRows,
  listProfileDropdownQuickLinks,
} from '@tetherget/global-profile-chip-core'
import { STREAMHUB_ADMIN_SHELL_ROUTES } from '../../validation/contracts/adminRoutes.js'
import { STREAMHUB_DEV_ROUTES } from '../../validation/contracts/routes.js'

const PLATFORM = 'streamhub'

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   view: import('@tetherget/global-profile-chip-core').ProfileChipView;
 *   profile: import('@tetherget/global-profile-chip-core').GlobalUserProfileRow;
 * }} props
 */
export function GlobalProfileChipDropdown({ open, onClose, view, profile }) {
  if (!open) return null

  const detailRows = buildProfileDropdownDetailRows(PLATFORM, profile, view)
  const metaRows = buildProfileDropdownMetaRows(view)
  const links = listProfileDropdownQuickLinks(PLATFORM, { admin: true })

  const closeWith = (reason) => {
    appendProfileDropdownAudit(PLATFORM, 'profile.dropdown.closed', reason)
    onClose()
  }

  const onLink = (id) => {
    appendProfileDropdownAudit(PLATFORM, 'profile.dropdown.link_clicked', id)
    if (id === 'oneai-hub') {
      const hub = import.meta.env?.VITE_ONEAI_PROFILE_HUB_URL
      if (typeof hub === 'string' && hub.startsWith('http')) {
        window.open(hub, '_blank', 'noopener,noreferrer')
      }
    } else if (id === 'my-page') {
      window.location.assign('/')
    } else if (id === 'help') {
      window.location.assign(STREAMHUB_DEV_ROUTES.selfTest)
    } else if (id === 'admin') {
      window.location.assign(STREAMHUB_ADMIN_SHELL_ROUTES.dashboard)
    }
    onClose()
  }

  return (
    <>
      <button
        type="button"
        className="sh-profile-dropdown-backdrop"
        aria-label="Close profile menu"
        data-testid="profile-chip-dropdown-backdrop"
        onClick={() => closeWith('backdrop')}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Profile menu"
        data-testid="profile-chip-dropdown"
        className="sh-profile-dropdown-panel"
      >
        <div className="sh-profile-dropdown-header">
          <div>
            <p className="sh-profile-chip-name">{view.nickname}</p>
            <p className="sh-profile-chip-meta">
              Lv.{view.oneAiLevel} · {view.platformBadge}
            </p>
          </div>
          <button
            type="button"
            data-testid="profile-chip-dropdown-close"
            className="sh-profile-dropdown-close"
            onClick={() => closeWith('close-button')}
          >
            닫기
          </button>
        </div>
        <dl className="sh-profile-dropdown-dl">
          {detailRows.map((row) => (
            <div key={row.label} className="sh-profile-dropdown-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <dl className="sh-profile-dropdown-dl sh-profile-dropdown-meta">
          {metaRows.map((row) => (
            <div key={row.label} className="sh-profile-dropdown-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <nav className="sh-profile-dropdown-nav">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              data-testid={`profile-chip-dropdown-link-${link.id}`}
              className="sh-profile-dropdown-link"
              onClick={() => onLink(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <p className="sh-profile-dropdown-foot">Read-only mock · global-profile-chip</p>
      </div>
    </>
  )
}
