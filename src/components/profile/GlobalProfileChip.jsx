import { useEffect, useMemo, useRef, useState } from 'react'
import {
  appendProfileChipAudit,
  appendProfileDropdownAudit,
  DEFAULT_ONEAI_PROFILE_HUB_PATH,
  isProfileChipDropdownEnabled,
  isProfileChipEnabled,
  isProfileCrossAppLinkEnabled,
} from '@tetherget/global-profile-chip-core'
import { useProfileChipLive } from '../../hooks/useProfileChipLive.js'
import { GlobalProfileChipDropdown } from './GlobalProfileChipDropdown.jsx'

/**
 * @param {{ compact?: boolean }} props
 */
export function GlobalProfileChip({ compact = false }) {
  const enabled = useMemo(() => isProfileChipEnabled(), [])
  const dropdownEnabled = useMemo(() => isProfileChipDropdownEnabled(), [])
  const { view, profile, pulse } = useProfileChipLive('streamhub')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const renderedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    if (renderedRef.current) return
    renderedRef.current = true
    appendProfileChipAudit('profile.chip.rendered', 'streamhub', `source=${view.source}`)
    if (view.isMockProfile) appendProfileChipAudit('profile.chip.fallback_used', 'streamhub')
  }, [enabled, view.source, view.isMockProfile])

  useEffect(() => {
    if (!dropdownOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        appendProfileDropdownAudit('streamhub', 'profile.dropdown.closed', 'escape')
        setDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dropdownOpen])

  if (!enabled) return null

  const chipBody = (
    <>
      <span className="sh-profile-chip-avatar" style={{ background: view.avatarColor }} aria-hidden />
      {!compact ? (
        <span className="sh-profile-chip-text">
          <span className="sh-profile-chip-name">{view.nickname}</span>
          <span className="sh-profile-chip-meta">
            Lv.{view.oneAiLevel} · {view.platformBadge}
          </span>
        </span>
      ) : (
        <span className="sh-profile-chip-name">{view.nickname}</span>
      )}
      {view.isMockProfile ? <span className="sh-badge sh-badge-mock">mock profile</span> : null}
    </>
  )

  if (dropdownEnabled) {
    return (
      <div className="sh-profile-chip-wrap">
        <button
          type="button"
          data-testid={compact ? 'profile-chip-compact' : 'profile-chip'}
          data-profile-chip-variant="dropdown"
          aria-expanded={dropdownOpen}
          aria-haspopup="dialog"
          className={`sh-profile-chip${compact ? ' sh-profile-chip--compact' : ''}${pulse ? ' profile-chip-sync-pulse' : ''}`}
          aria-label={`Profile ${view.nickname}`}
          onClick={() => {
            setDropdownOpen((prev) => {
              const next = !prev
              appendProfileDropdownAudit(
                'streamhub',
                next ? 'profile.dropdown.opened' : 'profile.dropdown.closed',
                next ? 'chip-click' : 'chip-click-toggle-off',
              )
              return next
            })
          }}
        >
          {chipBody}
        </button>
        <GlobalProfileChipDropdown
          open={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          view={view}
          profile={profile}
        />
      </div>
    )
  }

  const onLegacyClick = () => {
    appendProfileChipAudit('profile.chip.link_clicked', 'streamhub')
    if (isProfileCrossAppLinkEnabled()) {
      const hub = import.meta.env?.VITE_ONEAI_PROFILE_HUB_URL ?? DEFAULT_ONEAI_PROFILE_HUB_PATH
      if (typeof hub === 'string' && hub.startsWith('http')) {
        window.open(hub, '_blank', 'noopener,noreferrer')
      }
    }
  }

  return (
    <button
      type="button"
      data-testid={compact ? 'profile-chip-compact' : 'profile-chip'}
      data-profile-chip-variant="link"
      className={`sh-profile-chip${compact ? ' sh-profile-chip--compact' : ''}${pulse ? ' profile-chip-sync-pulse' : ''}`}
      aria-label={`Profile ${view.nickname}`}
      onClick={onLegacyClick}
    >
      {chipBody}
    </button>
  )
}
