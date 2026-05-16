/** Broadcast mock event overlay layer — no stream automation, no external API */

export const STREAMHUB_OVERLAY_EVENT_LAYER_KEY = 'streamhub.overlay_event_layer_v1'

export const OVERLAY_EVENT_LAYER_COMPONENTS = Object.freeze([
  'alert_banner',
  'notification_ticker',
  'viral_trend_card',
])

export const OVERLAY_EVENT_LAYER_AUDIT_KINDS = Object.freeze([
  'overlay.event_layer.loaded',
  'overlay.event_layer.flags_updated',
  'overlay.event_layer.previewed',
])

export const OVERLAY_EVENT_LAYER_MOCK_ONLY = true

/**
 * @typedef {typeof OVERLAY_EVENT_LAYER_COMPONENTS[number]} OverlayEventLayerComponent
 * @typedef {Object} OverlayEventLayerComponentFlags
 * @property {boolean} [alert_banner]
 * @property {boolean} [notification_ticker]
 * @property {boolean} [viral_trend_card]
 * @typedef {Object} OverlayEventLayerConfig
 * @property {boolean} mockOnly
 * @property {{ enabled: boolean; headline: string; subline: string; level: 'info' | 'urgent' }} alertBanner
 * @property {{ enabled: boolean; messages: string[] }} notificationTicker
 * @property {{ enabled: boolean }} viralTrendCard
 * @property {Record<string, OverlayEventLayerComponentFlags>} sceneComponentFlags
 * @property {number} updatedAtMs
 */
