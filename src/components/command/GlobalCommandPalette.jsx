import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  appendCommandPaletteAudit,
  closeCommandPalette,
  createDefaultCommandExecutor,
  filterCommands,
  isCommandPaletteOpen,
  openCommandPalette,
  readRecentCommandIds,
  saveRecentCommandId,
  subscribeCommandPaletteStore,
} from '@tetherget/global-command-palette-core'
import { buildStreamHubCommandRegistry } from '../../command/commandRegistry.js'
import {
  isStreamHubCommandKeyboardShortcutEnabled,
  isStreamHubCommandPaletteEnabled,
} from '../../command/commandFeatureFlags.js'

function subscribeOpen(onStore) {
  return subscribeCommandPaletteStore(onStore)
}

function getOpenSnapshot() {
  return isCommandPaletteOpen()
}

export function GlobalCommandButton() {
  if (!isStreamHubCommandPaletteEnabled()) return null
  const hint = isStreamHubCommandKeyboardShortcutEnabled() ? 'Ctrl+K' : undefined
  return (
    <button
      type="button"
      data-testid="global-command-button"
      aria-label="Open command palette"
      className="sh-command-btn"
      onClick={() => openCommandPalette('streamhub')}
    >
      ⌕ Search{hint ? ` (${hint})` : ''}
    </button>
  )
}

// Hook colocated with palette UI (shared shortcut wiring).
// eslint-disable-next-line react-refresh/only-export-components
export function useStreamHubCommandShortcut() {
  useEffect(() => {
    if (!isStreamHubCommandPaletteEnabled() || !isStreamHubCommandKeyboardShortcutEnabled()) return
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return
      const tag = e.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      e.preventDefault()
      openCommandPalette('streamhub')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export function GlobalCommandPalette() {
  const open = useSyncExternalStore(subscribeOpen, getOpenSnapshot, () => false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const registry = useMemo(() => buildStreamHubCommandRegistry(), [])
  const recentIds = useMemo(() => (open ? readRecentCommandIds() : []), [open])
  const execute = useMemo(() => createDefaultCommandExecutor(), [])

  const displayItems = useMemo(() => {
    let items = filterCommands(registry, query)
    if (!query.trim()) {
      const map = new Map(registry.map((c) => [c.id, c]))
      const recent = recentIds.map((id) => map.get(id)).filter((c) => c?.enabled)
      const set = new Set(recent.map((r) => r.id))
      items = [...recent, ...items.filter((c) => !set.has(c.id))]
    }
    return items
  }, [registry, query, recentIds])

  const handleClose = useCallback(() => {
    closeCommandPalette('streamhub')
    setQuery('')
    setActiveIndex(0)
  }, [])

  const runCommand = useCallback(
    (item) => {
      appendCommandPaletteAudit('command.executed', 'streamhub', item.id, item.target)
      execute(item)
      saveRecentCommandId('streamhub', item.id)
      handleClose()
    },
    [execute, handleClose],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, displayItems.length - 1)))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && displayItems[activeIndex]) {
        e.preventDefault()
        runCommand(displayItems[activeIndex])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, displayItems, activeIndex, runCommand, handleClose])

  if (!isStreamHubCommandPaletteEnabled() || !open) return null

  return (
    <div className="sh-command-overlay">
      <button
        type="button"
        data-testid="global-command-backdrop"
        className="sh-command-backdrop"
        aria-label="Close"
        onClick={handleClose}
      />
      <div role="dialog" aria-modal data-testid="global-command-palette" className="sh-command-dialog">
        <input
          data-testid="global-command-input"
          type="search"
          autoFocus
          placeholder="Search commands…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
          }}
          className="sh-command-input"
        />
        <div className="sh-command-results" role="listbox">
          {displayItems.length === 0 ? (
            <p data-testid="global-command-empty" className="sh-command-empty">
              No commands found
            </p>
          ) : (
            displayItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                data-testid={`global-command-result-${item.id}`}
                className={`sh-command-result${index === activeIndex ? ' sh-command-result--active' : ''}`}
                onClick={() => runCommand(item)}
              >
                <span className="sh-command-result-title">{item.title}</span>
                <span className="sh-command-result-sub">{item.subtitle}</span>
              </button>
            ))
          )}
        </div>
        <p className="sh-command-foot">MOCK ONLY · no search API</p>
      </div>
    </div>
  )
}
