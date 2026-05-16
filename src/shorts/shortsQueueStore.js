import { STREAMHUB_SHORTS_QUEUE_STORAGE_KEY, SHORTS_QUEUE_STATUSES } from './contracts/shortsQueueSchema.js'

/**
 * @typedef {import('./contracts/overlayBridge.js').ShortsClipRecord} ShortsClipRecord
 */

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setShortsQueueStorageAdapter(adapter) {
  storageAdapter = adapter
}

function getStorage() {
  if (storageAdapter) return storageAdapter
  if (typeof localStorage !== 'undefined') {
    return {
      getItem: (k) => localStorage.getItem(k),
      setItem: (k, v) => localStorage.setItem(k, v),
    }
  }
  return {
    getItem: (k) => memoryStorage[k] ?? null,
    setItem: (k, v) => {
      memoryStorage[k] = v
    },
  }
}

/**
 * @returns {ShortsClipRecord[]}
 */
export function loadShortsQueue() {
  const raw = getStorage().getItem(STREAMHUB_SHORTS_QUEUE_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

/**
 * @param {ShortsClipRecord[]} clips
 */
export function saveShortsQueue(clips) {
  getStorage().setItem(STREAMHUB_SHORTS_QUEUE_STORAGE_KEY, JSON.stringify(clips))
}

/**
 * @param {ShortsClipRecord} clip
 */
export function appendShortsQueueClip(clip) {
  const queue = loadShortsQueue()
  queue.push(clip)
  saveShortsQueue(queue)
  return clip
}

/**
 * @param {string} clipId
 * @param {typeof SHORTS_QUEUE_STATUSES[number]} status
 */
export function updateShortsQueueClipStatus(clipId, status) {
  const queue = loadShortsQueue()
  const row = queue.find((c) => c.id === clipId)
  if (!row) return null
  if (!SHORTS_QUEUE_STATUSES.includes(status)) {
    throw new Error(`Invalid shorts queue status: ${status}`)
  }
  row.status = status
  saveShortsQueue(queue)
  return row
}

/**
 * @param {string} clipId
 */
export function getShortsQueueClip(clipId) {
  return loadShortsQueue().find((c) => c.id === clipId) ?? null
}

/**
 * @param {string} clipId
 * @param {Record<string, unknown>} patch
 */
export function updateShortsQueueClipFields(clipId, patch) {
  const queue = loadShortsQueue()
  const row = queue.find((c) => c.id === clipId)
  if (!row) return null
  Object.assign(row, patch)
  saveShortsQueue(queue)
  return row
}

export function resetShortsQueueForTests() {
  memoryStorage = {}
  storageAdapter = null
  saveShortsQueue([])
}
