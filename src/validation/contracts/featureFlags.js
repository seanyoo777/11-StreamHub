/** Feature flags — docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md §10 */

export const STREAMHUB_FEATURE_FLAGS = Object.freeze({
  'streamhub.recovery.gap_replay_enabled': {
    defaultValue: true,
    type: 'boolean',
  },
  'streamhub.recovery.gap_replay_max': {
    defaultValue: 50,
    type: 'number',
    min: 1,
    max: 500,
  },
  'streamhub.recovery.force_full_on_reconnect': {
    defaultValue: false,
    type: 'boolean',
  },
  'streamhub.recovery.chat_snapshot_on_resync': {
    defaultValue: true,
    type: 'boolean',
  },
  'streamhub.recovery.playback_resume_after_resync': {
    defaultValue: true,
    type: 'boolean',
  },
  'streamhub.recovery.reset_chat_seq_on_new_session': {
    defaultValue: false,
    type: 'boolean',
  },
  VITE_STREAMHUB_MOCK_ONLY: {
    defaultValue: true,
    type: 'boolean',
    requiredInDev: true,
  },
})

export const STREAMHUB_FEATURE_FLAG_KEYS = Object.freeze(Object.keys(STREAMHUB_FEATURE_FLAGS))
