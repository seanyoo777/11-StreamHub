/** SH_* — docs/STREAMHUB_REALTIME_ERROR_CODES.md */

export const STREAMHUB_ERROR_ENVELOPE_FIELDS = Object.freeze([
  'code',
  'message',
  'message_key',
  'fatal',
  'retryable',
  'server_ms',
  'request_id',
  'context',
])

export const SH_ERROR_CODES = Object.freeze({
  SH_STREAM_OFFLINE: {
    fatal: false,
    retryable: true,
    messageKey: 'streamhub.error.stream_offline',
  },
  SH_STREAM_NOT_FOUND: {
    fatal: false,
    retryable: false,
    messageKey: 'streamhub.error.stream_not_found',
  },
  SH_STREAM_REGION_BLOCKED: {
    fatal: false,
    retryable: false,
    messageKey: 'streamhub.error.region_blocked',
  },
  SH_CHAT_SLOWMODE: {
    fatal: false,
    retryable: true,
    messageKey: 'streamhub.error.chat_slowmode',
  },
  SH_DONATION_DISABLED: {
    fatal: false,
    retryable: false,
    messageKey: 'streamhub.error.donation_disabled',
  },
  SH_STREAM_RECONNECTING: {
    fatal: false,
    retryable: true,
    messageKey: 'streamhub.error.stream_reconnecting',
  },
})

export const SH_ERROR_CODE_KEYS = Object.freeze(Object.keys(SH_ERROR_CODES))
