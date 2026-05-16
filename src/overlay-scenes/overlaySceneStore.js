import {
  STREAMHUB_OVERLAY_SCENE_ACTIVE_KEY,
  STREAMHUB_OVERLAY_SCENES_STORAGE_KEY,
} from './overlaySceneTypes.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setOverlaySceneStorageAdapter(adapter) {
  storageAdapter = adapter
}

export function getOverlaySceneStorage() {
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
 * @returns {import('./overlaySceneTypes.js').OverlayScene[]}
 */
export function loadOverlayScenes() {
  const raw = getOverlaySceneStorage().getItem(STREAMHUB_OVERLAY_SCENES_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * @param {import('./overlaySceneTypes.js').OverlayScene[]} rows
 */
export function saveOverlayScenes(rows) {
  getOverlaySceneStorage().setItem(STREAMHUB_OVERLAY_SCENES_STORAGE_KEY, JSON.stringify(rows))
}

/**
 * @param {import('./overlaySceneTypes.js').OverlayScene} scene
 */
export function upsertOverlayScene(scene) {
  const rows = loadOverlayScenes()
  const idx = rows.findIndex((s) => s.id === scene.id)
  if (idx >= 0) rows[idx] = scene
  else rows.push(scene)
  saveOverlayScenes(rows)
  return scene
}

/**
 * @param {string} sceneId
 */
export function getOverlaySceneById(sceneId) {
  return loadOverlayScenes().find((s) => s.id === sceneId) ?? null
}

/**
 * @returns {import('./overlaySceneTypes.js').OverlayScene[]}
 */
export function loadOverlaySceneQueue() {
  return [...loadOverlayScenes()]
    .filter((s) => s.status !== 'archived')
    .sort((a, b) => b.priority - a.priority || b.createdAt - a.createdAt)
}

/**
 * @param {string | null} sceneId
 */
export function setActiveOverlaySceneId(sceneId) {
  getOverlaySceneStorage().setItem(
    STREAMHUB_OVERLAY_SCENE_ACTIVE_KEY,
    JSON.stringify({ sceneId, switchedAtMs: Date.now() }),
  )
}

/**
 * @returns {string | null}
 */
export function getActiveOverlaySceneId() {
  const raw = getOverlaySceneStorage().getItem(STREAMHUB_OVERLAY_SCENE_ACTIVE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed?.sceneId === 'string' ? parsed.sceneId : null
  } catch {
    return null
  }
}

export function resetOverlayScenesForTests() {
  memoryStorage = {}
  storageAdapter = null
  saveOverlayScenes([])
  getOverlaySceneStorage().removeItem?.(STREAMHUB_OVERLAY_SCENE_ACTIVE_KEY)
  if (!getOverlaySceneStorage().removeItem) {
    getOverlaySceneStorage().setItem(STREAMHUB_OVERLAY_SCENE_ACTIVE_KEY, '')
  }
}
