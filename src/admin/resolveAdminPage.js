import { STREAMHUB_ADMIN_SHELL_ROUTES } from '../validation/contracts/adminRoutes.js'

/** @typedef {'dashboard' | 'reports' | 'rooms' | 'fees' | 'recovery' | null} AdminPageId */

/**
 * @param {string} pathname
 * @returns {AdminPageId}
 */
export function resolveAdminPageId(pathname) {
  const entries = Object.entries(STREAMHUB_ADMIN_SHELL_ROUTES)
  for (const [id, path] of entries) {
    if (pathname === path) return /** @type {AdminPageId} */ (id)
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return 'dashboard'
  }
  return null
}

/**
 * @param {string} pathname
 */
export function isAdminShellPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}
