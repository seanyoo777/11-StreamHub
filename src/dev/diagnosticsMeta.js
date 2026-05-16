/** Maps suite IDs to Diagnostics Panel sections */

export const DIAGNOSTICS_SECTIONS = Object.freeze([
  { suiteId: 'contract.route-ia', label: 'Route contract', description: 'SCREEN_FLOW IA routes' },
  {
    suiteId: 'contract.admin-ia',
    label: 'Admin IA routes',
    description: '/admin/* SCREEN_FLOW paths + self-test link',
  },
  {
    suiteId: 'contract.room-session',
    label: 'Room / session',
    description: 'live_state, session states, status mapping',
  },
  {
    suiteId: 'contract.chat-seq',
    label: 'Chat seq',
    description: 'stream_chat:{room_id}, since_chat_seq',
  },
  {
    suiteId: 'contract.error-codes',
    label: 'SH error contract',
    description: 'streamhub.error SH_* codes',
  },
  {
    suiteId: 'contract.recovery-resync',
    label: 'Recovery resync',
    description: 'Transport / APP_SYNCED / chat channel',
  },
  {
    suiteId: 'contract.realtime-schema',
    label: 'Realtime schema',
    description: 'Event catalog, stream_chat, recovery events',
  },
  { suiteId: 'feature-flags', label: 'Feature flags', description: 'Recovery flags + MOCK ONLY' },
  {
    suiteId: 'audit.append-only',
    label: 'Audit append-only',
    description: 'Mock audit trail growth, no delete',
  },
  {
    suiteId: 'mock.admin.flow',
    label: 'Admin mock flow',
    description: 'Report queue + admin.streamhub.* audit',
  },
  {
    suiteId: 'mock.admin.force-end',
    label: 'Admin force-end',
    description: 'stream_force_ended + admin_terminated pair',
  },
  {
    suiteId: 'mock.scenario-toggle',
    label: 'Scenario toggles',
    description: 'RECONNECTING / OFFLINE / APP_SYNCED / FORCE_ENDED',
  },
])
