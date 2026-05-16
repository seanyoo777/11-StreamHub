import {
  ONEAI_STREAMHUB_OVERLAY_STORAGE_KEY,
  ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY,
} from '../validation/contracts/oneAiBridge.js'
import { buildOneAiShortsDraftStub } from './contracts/overlayBridge.js'

/**
 * Client-only localStorage sync for OneAI bridge (no upload).
 * @param {import('./contracts/overlayBridge.js').ShortsClipRecord} clip
 * @param {Record<string, unknown>} overlayPayload
 */
export function pushOverlayToLocalStorage(clip, overlayPayload) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    ONEAI_STREAMHUB_OVERLAY_STORAGE_KEY,
    JSON.stringify({
      updated_at_ms: Date.now(),
      clip_id: clip.id,
      overlay_source: clip.overlay_source,
      payload: overlayPayload,
      mock_only: true,
    }),
  )
}

/**
 * @param {import('./contracts/overlayBridge.js').ShortsClipRecord} clip
 */
export function appendOneAiShortsDraftStub(clip) {
  if (typeof localStorage === 'undefined') return
  const stub = buildOneAiShortsDraftStub(clip)
  let list = []
  try {
    const raw = localStorage.getItem(ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY)
    if (raw) list = JSON.parse(raw)
    if (!Array.isArray(list)) list = []
  } catch {
    list = []
  }
  list.push(stub)
  localStorage.setItem(ONEAI_STREAMHUB_SHORTS_DRAFTS_KEY, JSON.stringify(list))
}
