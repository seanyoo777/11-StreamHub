import {
  OVERLAY_EVENT_LAYER_MOCK_ONLY,
  STREAMHUB_OVERLAY_EVENT_LAYER_KEY,
} from './overlayEventLayerTypes.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setOverlayEventLayerStorageAdapter(adapter) {
  storageAdapter = adapter
}

export function getOverlayEventLayerStorage() {
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
 * @returns {import('./overlayEventLayerTypes.js').OverlayEventLayerConfig}
 */
export function createDefaultOverlayEventLayerConfig() {
  return {
    mockOnly: OVERLAY_EVENT_LAYER_MOCK_ONLY,
    alertBanner: {
      enabled: true,
      headline: 'StreamHub mock alert',
      subline: 'Operator review — not live broadcast',
      level: 'urgent',
    },
    notificationTicker: {
      enabled: true,
      messages: [
        'Shorts queue mock · Viral trend radar · No OBS WebSocket',
        'Overlay event layer · MOCK ONLY',
      ],
    },
    viralTrendCard: { enabled: true },
    sceneComponentFlags: {},
    updatedAtMs: Date.now(),
  }
}

/**
 * @returns {import('./overlayEventLayerTypes.js').OverlayEventLayerConfig}
 */
export function loadOverlayEventLayerConfig() {
  const raw = getOverlayEventLayerStorage().getItem(STREAMHUB_OVERLAY_EVENT_LAYER_KEY)
  if (!raw) return createDefaultOverlayEventLayerConfig()
  try {
    const parsed = JSON.parse(raw)
    return normalizeOverlayEventLayerConfig(parsed)
  } catch {
    return createDefaultOverlayEventLayerConfig()
  }
}

/**
 * @param {unknown} row
 * @returns {import('./overlayEventLayerTypes.js').OverlayEventLayerConfig}
 */
export function normalizeOverlayEventLayerConfig(row) {
  const base = createDefaultOverlayEventLayerConfig()
  if (!row || typeof row !== 'object') return base
  const r = /** @type {Record<string, unknown>} */ (row)

  const alert = r.alertBanner && typeof r.alertBanner === 'object' ? r.alertBanner : {}
  const ticker =
    r.notificationTicker && typeof r.notificationTicker === 'object' ? r.notificationTicker : {}
  const trend = r.viralTrendCard && typeof r.viralTrendCard === 'object' ? r.viralTrendCard : {}

  return {
    mockOnly: r.mockOnly !== false,
    alertBanner: {
      enabled: /** @type {{ enabled?: boolean }} */ (alert).enabled !== false,
      headline:
        typeof /** @type {{ headline?: string }} */ (alert).headline === 'string'
          ? /** @type {{ headline: string }} */ (alert).headline
          : base.alertBanner.headline,
      subline:
        typeof /** @type {{ subline?: string }} */ (alert).subline === 'string'
          ? /** @type {{ subline: string }} */ (alert).subline
          : base.alertBanner.subline,
      level:
        /** @type {{ level?: string }} */ (alert).level === 'info' ? 'info' : 'urgent',
    },
    notificationTicker: {
      enabled: /** @type {{ enabled?: boolean }} */ (ticker).enabled !== false,
      messages: Array.isArray(/** @type {{ messages?: unknown }} */ (ticker).messages)
        ? /** @type {{ messages: unknown[] }} */ (ticker).messages.filter((m) => typeof m === 'string')
        : base.notificationTicker.messages,
    },
    viralTrendCard: {
      enabled: /** @type {{ enabled?: boolean }} */ (trend).enabled !== false,
    },
    sceneComponentFlags:
      r.sceneComponentFlags && typeof r.sceneComponentFlags === 'object'
        ? /** @type {Record<string, import('./overlayEventLayerTypes.js').OverlayEventLayerComponentFlags>} */ (
            r.sceneComponentFlags
          )
        : {},
    updatedAtMs: typeof r.updatedAtMs === 'number' ? r.updatedAtMs : Date.now(),
  }
}

/**
 * @param {import('./overlayEventLayerTypes.js').OverlayEventLayerConfig} config
 */
export function saveOverlayEventLayerConfig(config) {
  const next = { ...config, updatedAtMs: Date.now(), mockOnly: OVERLAY_EVENT_LAYER_MOCK_ONLY }
  getOverlayEventLayerStorage().setItem(STREAMHUB_OVERLAY_EVENT_LAYER_KEY, JSON.stringify(next))
  return next
}

/**
 * @param {import('./overlayEventLayerTypes.js').OverlayEventLayerConfig} config
 * @param {string | null} sceneId
 * @param {import('./overlayEventLayerTypes.js').OverlayEventLayerComponent} component
 */
export function isOverlayEventComponentEnabled(config, sceneId, component) {
  if (sceneId && config.sceneComponentFlags[sceneId]?.[component] !== undefined) {
    return Boolean(config.sceneComponentFlags[sceneId][component])
  }
  switch (component) {
    case 'alert_banner':
      return config.alertBanner.enabled
    case 'notification_ticker':
      return config.notificationTicker.enabled
    case 'viral_trend_card':
      return config.viralTrendCard.enabled
    default:
      return false
  }
}

/**
 * @param {import('./overlayEventLayerTypes.js').OverlayEventLayerConfig} config
 * @param {string} sceneId
 * @param {import('./overlayEventLayerTypes.js').OverlayEventLayerComponent} component
 * @param {boolean} enabled
 */
export function setSceneOverlayComponentFlag(config, sceneId, component, enabled) {
  const flags = { ...(config.sceneComponentFlags[sceneId] ?? {}), [component]: enabled }
  return saveOverlayEventLayerConfig({
    ...config,
    sceneComponentFlags: { ...config.sceneComponentFlags, [sceneId]: flags },
  })
}

export function resetOverlayEventLayerForTests() {
  memoryStorage = {}
  storageAdapter = null
  saveOverlayEventLayerConfig(createDefaultOverlayEventLayerConfig())
}
