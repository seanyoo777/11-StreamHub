/** Maps suite IDs to Diagnostics Panel sections */

export const DIAGNOSTICS_SECTIONS = Object.freeze([
  { suiteId: 'contract.route-ia', label: 'Route contract', description: 'SCREEN_FLOW IA routes' },
  {
    suiteId: 'contract.oneai-broadcast-bridge',
    label: 'OneAI broadcast bridge',
    description: 'overlay + shorts drafts localStorage keys',
  },
  {
    suiteId: 'contract.shorts-queue-schema',
    label: 'Shorts queue schema',
    description: 'localStorage queue · statuses · audit/notif kinds',
  },
  {
    suiteId: 'contract.content-safety-schema',
    label: 'Content safety schema',
    description: 'verdicts · flags · risk thresholds · mock-only',
  },
  {
    suiteId: 'mock.content-safety-engine',
    label: 'Content safety engine',
    description: 'banned phrases · hype · political · block_mock',
  },
  {
    suiteId: 'mock.content-safety-shorts-gate',
    label: 'Content safety gate',
    description: 'Shorts approve blocked until operator OK',
  },
  {
    suiteId: 'mock.auto-clip-detector',
    label: 'Auto clip detector',
    description: 'Mock detection · overlay · notifications',
  },
  {
    suiteId: 'mock.shorts-operator-flow',
    label: 'Shorts operator flow',
    description: 'reviewing · approved_mock · rejected_mock',
  },
  {
    suiteId: 'contract.clip-timeline-schema',
    label: 'Clip timeline schema',
    description: 'formats · thumbnails · audit/notif kinds',
  },
  {
    suiteId: 'mock.clip-timeline-editor',
    label: 'Clip timeline editor',
    description: 'in/out · export preview · no FFmpeg',
  },
  {
    suiteId: 'contract.channel-watcher-schema',
    label: 'Channel watcher',
    description: 'watched channels · moments · no download',
  },
  {
    suiteId: 'contract.trend-watcher-schema',
    label: 'Trend watcher',
    description: 'keywords · candidates · title mock',
  },
  {
    suiteId: 'mock.content-factory-flow',
    label: 'Content factory',
    description: 'queue · safety · timeline · daily limit',
  },
  {
    suiteId: 'mock.stockpick-reader-flow',
    label: 'Stock pick reader',
    description: 'oneai.stockpick.* · import · safety · timeline',
  },
  {
    suiteId: 'contract.viral-score-schema',
    label: 'Viral score schema',
    description: 'scores · patterns · audit/notif · no API',
  },
  {
    suiteId: 'mock.viral-score-engine',
    label: 'Viral score engine',
    description: 'scoring · learning · queue priority',
  },
  {
    suiteId: 'contract.overlay-scene-schema',
    label: 'Overlay scene schema',
    description: 'scene types · layouts · audit/notif · mock-only',
  },
  {
    suiteId: 'mock.overlay-scene-manager',
    label: 'Overlay scene manager',
    description: 'browser source preview · HUD · queue · no OBS',
  },
  {
    suiteId: 'contract.viral-trend-reader-schema',
    label: 'Viral trend reader schema',
    description: 'tetherget.viral_trend_radar_v1 · audit/notif · read-only',
  },
  {
    suiteId: 'mock.viral-trend-reader-flow',
    label: 'Viral trend reader flow',
    description: 'shorts + overlay import · malformed skip · mock-only',
  },
  {
    suiteId: 'contract.overlay-event-layer-schema',
    label: 'Overlay event layer schema',
    description: 'alert · ticker · trend card · scene flags · mock-only',
  },
  {
    suiteId: 'mock.overlay-event-layer',
    label: 'Overlay event layer',
    description: 'broadcast mock layer · per-scene on/off · no automation',
  },
  {
    suiteId: 'contract.overlay-preset-schema',
    label: 'Overlay preset schema',
    description: 'templates · preset store · scene map · mock-only',
  },
  {
    suiteId: 'mock.overlay-preset-manager',
    label: 'Overlay preset manager',
    description: 'save/load · apply per scene · audit append-only',
  },
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
