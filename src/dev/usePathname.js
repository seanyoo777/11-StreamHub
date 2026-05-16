import { useEffect, useState } from 'react'

export function usePathname() {
  const [pathname, setPathname] = useState(
    () => (typeof window !== 'undefined' ? window.location.pathname : '/'),
  )

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return pathname
}

/** @param {string} path */
export function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
