import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { MockAdminShell } from './admin/MockAdminShell.jsx'
import { isAdminShellPath, resolveAdminPageId } from './admin/resolveAdminPage.js'
import { SelfTestDevPage } from './dev/SelfTestDevPage.jsx'
import { usePathname } from './dev/usePathname.js'
import { STREAMHUB_ADMIN_SHELL_ROUTES } from './validation/contracts/adminRoutes.js'
import { STREAMHUB_DEV_ROUTES } from './validation/contracts/routes.js'
import './App.css'

function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>StreamHub</h1>
          <p>
            MVP shell — mock-first planning.{' '}
            <a href={STREAMHUB_DEV_ROUTES.selfTest} className="sh-home-dev-link">
              Self-Test Center
            </a>
            {' · '}
            <a href={STREAMHUB_ADMIN_SHELL_ROUTES.dashboard} className="sh-home-dev-link">
              Mock Admin
            </a>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((c) => c + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks" />

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Planning contracts in <code>docs/</code></p>
        </div>
      </section>

      <div className="ticks" />
      <section id="spacer"></section>
    </>
  )
}

function App() {
  const pathname = usePathname()

  if (pathname === STREAMHUB_DEV_ROUTES.selfTest) {
    return <SelfTestDevPage />
  }

  if (isAdminShellPath(pathname)) {
    return <MockAdminShell pageId={resolveAdminPageId(pathname)} />
  }

  return <HomePage />
}

export default App
