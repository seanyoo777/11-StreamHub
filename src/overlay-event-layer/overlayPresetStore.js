import { getOverlayEventLayerStorage } from './overlayEventLayerStore.js'
import { STREAMHUB_OVERLAY_PRESETS_KEY } from './overlayPresetTypes.js'

/**
 * @returns {import('./overlayPresetTypes.js').OverlayPresetStoreSnapshot}
 */
export function createEmptyPresetStore() {
  return {
    presets: [],
    scenePresetMap: {},
    updatedAtMs: Date.now(),
  }
}

/**
 * @returns {import('./overlayPresetTypes.js').OverlayPresetStoreSnapshot}
 */
export function loadOverlayPresetStore() {
  const raw = getOverlayEventLayerStorage().getItem(STREAMHUB_OVERLAY_PRESETS_KEY)
  if (!raw) return createEmptyPresetStore()
  try {
    const parsed = JSON.parse(raw)
    return normalizeOverlayPresetStore(parsed)
  } catch {
    return createEmptyPresetStore()
  }
}

/**
 * @param {unknown} row
 * @returns {import('./overlayPresetTypes.js').OverlayPresetStoreSnapshot}
 */
export function normalizeOverlayPresetStore(row) {
  const base = createEmptyPresetStore()
  if (!row || typeof row !== 'object') return base
  const r = /** @type {Record<string, unknown>} */ (row)

  const presets = Array.isArray(r.presets)
    ? r.presets
        .map((p) => normalizeOverlayPreset(p))
        .filter((p) => p !== null)
    : []

  const scenePresetMap =
    r.scenePresetMap && typeof r.scenePresetMap === 'object'
      ? /** @type {Record<string, string>} */ (
          Object.fromEntries(
            Object.entries(r.scenePresetMap).filter(
              ([, v]) => typeof v === 'string',
            ),
          )
        )
      : {}

  return {
    presets,
    scenePresetMap,
    updatedAtMs: typeof r.updatedAtMs === 'number' ? r.updatedAtMs : Date.now(),
  }
}

/**
 * @param {unknown} row
 * @returns {import('./overlayPresetTypes.js').OverlayPreset | null}
 */
export function normalizeOverlayPreset(row) {
  if (!row || typeof row !== 'object') return null
  const p = /** @type {Record<string, unknown>} */ (row)
  if (typeof p.id !== 'string' || typeof p.name !== 'string') return null

  const alert =
    p.alertBanner && typeof p.alertBanner === 'object' ? p.alertBanner : {}
  const ticker =
    p.notificationTicker && typeof p.notificationTicker === 'object'
      ? p.notificationTicker
      : {}
  const trend = p.viralTrendCard && typeof p.viralTrendCard === 'object' ? p.viralTrendCard : {}
  const components =
    p.components && typeof p.components === 'object' ? p.components : {}

  return {
    id: p.id,
    name: p.name,
    description: typeof p.description === 'string' ? p.description : '',
    templateId: typeof p.templateId === 'string' ? p.templateId : null,
    components: {
      alert_banner: /** @type {{ alert_banner?: boolean }} */ (components).alert_banner !== false,
      notification_ticker:
        /** @type {{ notification_ticker?: boolean }} */ (components).notification_ticker !== false,
      viral_trend_card:
        /** @type {{ viral_trend_card?: boolean }} */ (components).viral_trend_card !== false,
    },
    alertBanner: {
      enabled: /** @type {{ enabled?: boolean }} */ (alert).enabled !== false,
      headline:
        typeof /** @type {{ headline?: string }} */ (alert).headline === 'string'
          ? /** @type {{ headline: string }} */ (alert).headline
          : 'Mock alert',
      subline:
        typeof /** @type {{ subline?: string }} */ (alert).subline === 'string'
          ? /** @type {{ subline: string }} */ (alert).subline
          : '',
      level:
        /** @type {{ level?: string }} */ (alert).level === 'info' ? 'info' : 'urgent',
    },
    notificationTicker: {
      enabled: /** @type {{ enabled?: boolean }} */ (ticker).enabled !== false,
      messages: Array.isArray(/** @type {{ messages?: unknown }} */ (ticker).messages)
        ? /** @type {{ messages: unknown[] }} */ (ticker).messages.filter((m) => typeof m === 'string')
        : [],
    },
    viralTrendCard: {
      enabled: /** @type {{ enabled?: boolean }} */ (trend).enabled !== false,
    },
    mockOnly: p.mockOnly !== false,
    createdAtMs: typeof p.createdAtMs === 'number' ? p.createdAtMs : Date.now(),
  }
}

/**
 * @param {import('./overlayPresetTypes.js').OverlayPresetStoreSnapshot} store
 */
export function saveOverlayPresetStore(store) {
  const next = { ...store, updatedAtMs: Date.now() }
  getOverlayEventLayerStorage().setItem(STREAMHUB_OVERLAY_PRESETS_KEY, JSON.stringify(next))
  return next
}

/**
 * @param {string} presetId
 */
export function getOverlayPresetById(presetId) {
  return loadOverlayPresetStore().presets.find((p) => p.id === presetId) ?? null
}

/**
 * @param {string} sceneId
 */
export function getScenePresetId(sceneId) {
  return loadOverlayPresetStore().scenePresetMap[sceneId] ?? null
}

export function resetOverlayPresetsForTests() {
  saveOverlayPresetStore(createEmptyPresetStore())
}
