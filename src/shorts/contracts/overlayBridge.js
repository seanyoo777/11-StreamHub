import {
  ONEAI_STREAMHUB_OVERLAY_STORAGE_KEY,
  ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY,
  ONEAI_STREAM_OVERLAY_ROUTES,
} from '../../validation/contracts/oneAiBridge.js'
import { CLIP_DETECTION_LABELS } from './clipDetection.js'

/**
 * @typedef {Object} ShortsClipRecord
 * @property {string} id
 * @property {string} status
 * @property {string} detection_reason
 * @property {number} occurred_at_ms
 * @property {string} room_id
 * @property {number} mock_duration_sec
 * @property {string} overlay_source
 * @property {string} overlay_route
 * @property {Record<string, unknown>} overlay_payload
 * @property {string} correlation_id
 * @property {string} preview_title
 */

/**
 * @param {ShortsClipRecord} clip
 */
export function buildStreamHubOverlayPayload(clip) {
  return {
    schema_version: '1.0',
    platform: 'streamhub',
    mock_only: true,
    clip_id: clip.id,
    room_id: clip.room_id,
    headline: clip.preview_title,
    reason: clip.detection_reason,
    reason_label: CLIP_DETECTION_LABELS[clip.detection_reason] ?? clip.detection_reason,
    occurred_at_ms: clip.occurred_at_ms,
    duration_sec: clip.mock_duration_sec,
    correlation_id: clip.correlation_id,
  }
}

/**
 * @param {ShortsClipRecord} clip
 */
export function buildOneAiBroadcastOverlayPayload(clip) {
  return {
    schema_version: '1.0',
    platform: 'oneai',
    bridge: 'broadcast',
    mock_only: true,
    storage_key: ONEAI_STREAMHUB_OVERLAY_STORAGE_KEY,
    overlay_mode: 'shorts_moment',
    overlay_route: ONEAI_STREAM_OVERLAY_ROUTES.shorts_moment,
    clip_id: clip.id,
    announcer_hint: `Shorts moment: ${clip.preview_title}`,
    payload: buildStreamHubOverlayPayload(clip),
  }
}

/**
 * @param {ShortsClipRecord} clip
 * @param {{ winner_handle?: string; tournament_name?: string }} [extra]
 */
export function buildTournamentWinnerOverlayPayload(clip, extra = {}) {
  return {
    schema_version: '1.0',
    platform: 'streamhub',
    overlay_mode: 'tournament',
    mock_only: true,
    clip_id: clip.id,
    winner_handle: extra.winner_handle ?? '@mock_champion',
    tournament_name: extra.tournament_name ?? 'Mock League Finals',
    headline: clip.preview_title,
    correlation_id: clip.correlation_id,
  }
}

/**
 * @param {ShortsClipRecord} clip
 * @param {'streamhub' | 'oneai_broadcast' | 'tournament_winner'} source
 */
export function buildOverlayPayloadForSource(clip, source) {
  if (source === 'oneai_broadcast') return buildOneAiBroadcastOverlayPayload(clip)
  if (source === 'tournament_winner') {
    return buildTournamentWinnerOverlayPayload(clip)
  }
  return buildStreamHubOverlayPayload(clip)
}

/**
 * @param {ShortsClipRecord} clip
 */
export function buildOneAiShortsDraftStub(clip) {
  return {
    id: clip.id,
    clip_id: clip.id,
    status: 'needs_review',
    title: clip.preview_title,
    mock_only: true,
    upload_targets: [],
    correlation_id: clip.correlation_id,
    storage_key: ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY,
  }
}
