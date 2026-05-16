/**
 * OneAI (03) ↔ StreamHub (11) mock bridge contract.
 * Overlay + shorts drafts are browser localStorage on the OneAI origin;
 * StreamHub validates keys/routes only (no network, no upload APIs).
 */

export const ONEAI_STREAMHUB_OVERLAY_STORAGE_KEY = 'oneai.streamhub.overlay'

export const ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY = 'oneai.streamhub.shorts_drafts_v1'

/** Query params served by OneAI App.tsx standalone overlay routes. */
export const ONEAI_STREAM_OVERLAY_ROUTES = Object.freeze({
  event: '?overlay=event',
  tournament: '?overlay=tournament',
  winner: '?overlay=winner',
  shorts_moment: '?overlay=shorts',
})

export const ONEAI_STREAM_OVERLAY_ROUTE_KEYS = Object.freeze(
  Object.keys(ONEAI_STREAM_OVERLAY_ROUTES),
)

export const ONEAI_BROADCAST_FEATURE_FLAGS = Object.freeze({
  'broadcast.ai_announcer.enabled': { defaultValue: true, type: 'boolean' },
  'broadcast.overlay.enabled': { defaultValue: true, type: 'boolean' },
  'broadcast.shorts_draft.enabled': { defaultValue: true, type: 'boolean' },
  'broadcast.operator_review.enabled': { defaultValue: true, type: 'boolean' },
})

export const ONEAI_BROADCAST_FEATURE_FLAG_KEYS = Object.freeze(
  Object.keys(ONEAI_BROADCAST_FEATURE_FLAGS),
)

export const ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH = true

export const ONEAI_SHORTS_DRAFT_STATUSES = Object.freeze([
  'draft',
  'needs_review',
  'approved_mock',
  'upload_ready_mock',
])

export const ONEAI_SHORTS_UPLOAD_TARGETS = Object.freeze([
  'youtube_shorts',
  'instagram_reels',
  'tiktok',
])

export const ONEAI_SHORTS_AUDIT_ACTION = 'shorts.draft.status_changed'

export const ONEAI_SHORTS_AUDIT_ENTITY_ID = 'streamhub-shorts'
