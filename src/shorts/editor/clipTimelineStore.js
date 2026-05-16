import { STREAMHUB_CLIP_TIMELINE_STORAGE_KEY } from './clipTimelineTypes.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setClipTimelineStorageAdapter(adapter) {
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
 * @returns {import('./clipTimelineTypes.js').ClipTimeline[]}
 */
export function loadClipTimelines() {
  const raw = getStorage().getItem(STREAMHUB_CLIP_TIMELINE_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * @param {import('./clipTimelineTypes.js').ClipTimeline[]} rows
 */
export function saveClipTimelines(rows) {
  getStorage().setItem(STREAMHUB_CLIP_TIMELINE_STORAGE_KEY, JSON.stringify(rows))
}

/**
 * @param {import('./clipTimelineTypes.js').ClipTimeline} row
 */
export function upsertClipTimeline(row) {
  const rows = loadClipTimelines()
  const idx = rows.findIndex((r) => r.clipId === row.clipId)
  if (idx >= 0) rows[idx] = row
  else rows.push(row)
  saveClipTimelines(rows)
  return row
}

/**
 * @param {string} clipId
 */
export function getClipTimelineByClipId(clipId) {
  return loadClipTimelines().find((r) => r.clipId === clipId) ?? null
}

export function resetClipTimelinesForTests() {
  memoryStorage = {}
  storageAdapter = null
  saveClipTimelines([])
}
