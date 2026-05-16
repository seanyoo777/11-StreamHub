import { useCallback, useState } from 'react'
import { getMockAuditEntries } from '../validation/mockAuditTrail.js'
import { AdminNav } from './AdminNav.jsx'
import { PostChangeValidationBanner } from './PostChangeValidationBanner.jsx'
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx'
import { AdminReportsPage } from './pages/AdminReportsPage.jsx'
import { AdminRoomsPage } from './pages/AdminRoomsPage.jsx'
import { AdminFeesPage } from './pages/AdminFeesPage.jsx'
import { AdminRecoveryPage } from './pages/AdminRecoveryPage.jsx'
import { AdminShortsQueuePage } from './pages/AdminShortsQueuePage.jsx'
import { AdminWatchersPage } from './pages/AdminWatchersPage.jsx'
import { AdminViralPage } from './pages/AdminViralPage.jsx'
import { OverlaySceneManagerPage } from './pages/OverlaySceneManagerPage.jsx'
import { GlobalProfileChip } from '../components/profile/GlobalProfileChip.jsx'
import { GlobalCommandButton } from '../components/command/GlobalCommandPalette.jsx'
import '../dev/selfTestDev.css'
import './adminShell.css'

/**
 * @param {{ pageId: import('./resolveAdminPage.js').AdminPageId }} props
 */
export function MockAdminShell({ pageId }) {
  const [postChange, setPostChange] = useState(null)
  const [busy, setBusy] = useState(false)
  const [sessionTick, setSessionTick] = useState(0)

  const onPostChange = useCallback((result) => {
    setPostChange(result)
    setSessionTick((n) => n + 1)
  }, [])

  const runAction = useCallback(
    (fn) => {
      setBusy(true)
      try {
        fn()
      } finally {
        setBusy(false)
      }
    },
    [],
  )

  const activeId = pageId ?? 'dashboard'
  void sessionTick
  void getMockAuditEntries()

  let page = <AdminDashboardPage />
  if (activeId === 'reports') {
    page = (
      <AdminReportsPage
        busy={busy}
        onPostChange={(r) => runAction(() => onPostChange(r))}
      />
    )
  } else if (activeId === 'rooms') {
    page = (
      <AdminRoomsPage busy={busy} onPostChange={(r) => runAction(() => onPostChange(r))} />
    )
  } else if (activeId === 'fees') {
    page = <AdminFeesPage busy={busy} onPostChange={(r) => runAction(() => onPostChange(r))} />
  } else if (activeId === 'recovery') {
    page = (
      <AdminRecoveryPage
        busy={busy}
        onPostChange={(r) => runAction(() => onPostChange(r))}
        onSessionChange={() => setSessionTick((n) => n + 1)}
      />
    )
  } else if (activeId === 'shorts') {
    page = <AdminShortsQueuePage />
  } else if (activeId === 'watchers') {
    page = <AdminWatchersPage />
  } else if (activeId === 'viral') {
    page = <AdminViralPage />
  } else if (activeId === 'overlayScenes') {
    page = <OverlaySceneManagerPage />
  }

  return (
    <main className="sh-admin-shell" data-testid="mock-admin-shell">
      <header className="sh-admin-shell-header">
        <h1>StreamHub Admin</h1>
        <div className="sh-admin-shell-header-actions">
          <GlobalCommandButton />
          <GlobalProfileChip />
          <span className="sh-badge sh-badge-mock">MOCK ONLY</span>
        </div>
      </header>
      <AdminNav activePageId={activeId} />
      <PostChangeValidationBanner lastResult={postChange} />
      {page}
    </main>
  )
}
