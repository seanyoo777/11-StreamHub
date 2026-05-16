/** Recovery contract constants — docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md */

export const TRANSPORT_STATES = Object.freeze([
  'TRANSPORT_DISCONNECTED',
  'TRANSPORT_CONNECTING',
  'TRANSPORT_CONNECTED',
  'APP_SYNCED',
])

export const SESSION_STATES = Object.freeze([
  'CREATED',
  'PREPARING',
  'LIVE',
  'RECONNECTING',
  'ENDED',
  'ARCHIVED',
])

export const RESYNC_REQUIRED_CODES = Object.freeze(['GH_RESYNC_REQUIRED'])

/** streamhub.error must not alone imply resync complete */
export const RESYNC_ORTHOGONAL_ERROR_CODES = Object.freeze([
  'SH_STREAM_RECONNECTING',
  'SH_STREAM_OFFLINE',
])
