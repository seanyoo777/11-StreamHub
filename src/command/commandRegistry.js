import { STREAMHUB_ADMIN_SHELL_ROUTES } from '../validation/contracts/adminRoutes.js'
import { STREAMHUB_DEV_ROUTES } from '../validation/contracts/routes.js'

/** @returns {import('@tetherget/global-command-palette-core').CommandItem[]} */
export function buildStreamHubCommandRegistry() {
  const oneAiHub =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_ONEAI_PROFILE_HUB_URL
      ? String(import.meta.env.VITE_ONEAI_PROFILE_HUB_URL)
      : 'http://127.0.0.1:5173/#profile'

  return [
    {
      id: 'sh-admin-shorts',
      title: 'Admin Shorts Queue',
      subtitle: `StreamHub · ${STREAMHUB_ADMIN_SHELL_ROUTES.shorts}`,
      category: 'admin',
      platformId: 'streamhub',
      keywords: ['shorts', 'queue', 'clip', 'admin'],
      actionType: 'route',
      target: STREAMHUB_ADMIN_SHELL_ROUTES.shorts,
      enabled: true,
      mockOnly: true,
    },
    {
      id: 'sh-overlay-guide',
      title: 'Overlay Guide',
      subtitle: 'StreamHub · overlay bridge mock (shorts)',
      category: 'broadcast',
      platformId: 'streamhub',
      keywords: ['overlay', 'oneai', 'broadcast', 'guide'],
      actionType: 'route',
      target: `${STREAMHUB_ADMIN_SHELL_ROUTES.shorts}#overlay-guide`,
      enabled: true,
      mockOnly: true,
    },
    {
      id: 'sh-self-test',
      title: 'Self-Test',
      subtitle: `StreamHub · ${STREAMHUB_DEV_ROUTES.selfTest}`,
      category: 'admin',
      platformId: 'streamhub',
      keywords: ['self-test', 'diagnostics', 'validation'],
      actionType: 'route',
      target: STREAMHUB_DEV_ROUTES.selfTest,
      enabled: true,
      mockOnly: true,
    },
    {
      id: 'sh-admin',
      title: 'StreamHub Admin',
      subtitle: `StreamHub · ${STREAMHUB_ADMIN_SHELL_ROUTES.dashboard}`,
      category: 'admin',
      platformId: 'streamhub',
      keywords: ['admin', 'dashboard', 'operator'],
      actionType: 'route',
      target: STREAMHUB_ADMIN_SHELL_ROUTES.dashboard,
      enabled: true,
      mockOnly: true,
    },
    {
      id: 'sh-oneai-profile',
      title: 'OneAI Profile',
      subtitle: 'OneAI Profile Hub (mock link)',
      category: 'profile',
      platformId: 'oneai',
      keywords: ['oneai', 'profile', 'hub'],
      actionType: 'external_mock',
      target: oneAiHub,
      enabled: true,
      mockOnly: true,
    },
    {
      id: 'sh-help-mock',
      title: 'Help',
      subtitle: 'StreamHub · planning docs (mock)',
      category: 'help',
      platformId: 'streamhub',
      keywords: ['help', 'docs', 'guide'],
      actionType: 'route',
      target: '/',
      enabled: true,
      mockOnly: true,
    },
  ]
}
