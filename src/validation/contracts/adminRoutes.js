/** Admin IA — docs/STREAMHUB_SCREEN_FLOW.md §9 */

import { STREAMHUB_DEV_ROUTES } from './routes.js'

export const STREAMHUB_ADMIN_ROUTES = Object.freeze({
  dashboard: '/admin/dashboard',
  reports: '/admin/reports',
  users: '/admin/users',
  rooms: '/admin/rooms',
  chat: '/admin/chat',
  banners: '/admin/banners',
  fees: '/admin/fees',
  recovery: '/admin/recovery',
  shorts: '/admin/shorts',
  watchers: '/admin/watchers',
  viral: '/admin/viral',
  overlayScenes: '/admin/overlay-scenes',
})

/** P3 mock admin shell primary pages */
export const STREAMHUB_ADMIN_SHELL_ROUTES = Object.freeze({
  dashboard: '/admin/dashboard',
  reports: '/admin/reports',
  rooms: '/admin/rooms',
  fees: '/admin/fees',
  recovery: '/admin/recovery',
  shorts: '/admin/shorts',
  watchers: '/admin/watchers',
  viral: '/admin/viral',
  overlayScenes: '/admin/overlay-scenes',
})

export const STREAMHUB_ADMIN_SHELL_PATHS = Object.freeze(
  Object.values(STREAMHUB_ADMIN_SHELL_ROUTES),
)

export const STREAMHUB_ADMIN_ROUTE_KEYS = Object.freeze(Object.keys(STREAMHUB_ADMIN_ROUTES))

export const STREAMHUB_ADMIN_ROUTE_PATHS = Object.freeze(Object.values(STREAMHUB_ADMIN_ROUTES))

/** Admin shell + dev self-test link targets */
export const STREAMHUB_ADMIN_SELF_TEST_LINKS = Object.freeze([
  { path: STREAMHUB_DEV_ROUTES.selfTest, label: 'Self-Test Center (mock)' },
  ...STREAMHUB_ADMIN_ROUTE_PATHS.map((path) => ({
    path,
    label: path.replace('/admin/', ''),
  })),
])
