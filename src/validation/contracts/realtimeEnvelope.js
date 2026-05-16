/** Envelope — docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md §1 */

export const STREAMHUB_ENVELOPE_FIELDS = Object.freeze([
  'schema_version',
  'event_id',
  'event_type',
  'occurred_at',
  'room_id',
  'actor',
  'payload',
  'correlation_id',
])
