/** Overlay preset / scene template manager — mock-only */

export const STREAMHUB_OVERLAY_PRESETS_KEY = 'streamhub.overlay_presets_v1'

export const OVERLAY_PRESET_AUDIT_KINDS = Object.freeze([
  'overlay.preset.saved',
  'overlay.preset.loaded',
  'overlay.preset.applied_to_scene',
  'overlay.preset.template_applied',
])

export const OVERLAY_PRESET_TEMPLATE_IDS = Object.freeze([
  'breaking_alert_only',
  'ticker_news_strip',
  'viral_trend_focus',
  'full_event_stack',
])

/**
 * @typedef {import('./overlayEventLayerTypes.js').OverlayEventLayerComponentFlags} OverlayPresetComponents
 * @typedef {Object} OverlaySceneTemplate
 * @property {typeof OVERLAY_PRESET_TEMPLATE_IDS[number]} id
 * @property {string} name
 * @property {string} description
 * @property {OverlayPresetComponents} components
 * @property {{ headline: string; subline: string; level: 'info' | 'urgent' }} alertBanner
 * @property {string[]} tickerMessages
 * @typedef {Object} OverlayPreset
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {typeof OVERLAY_PRESET_TEMPLATE_IDS[number] | null} [templateId]
 * @property {OverlayPresetComponents} components
 * @property {{ enabled: boolean; headline: string; subline: string; level: 'info' | 'urgent' }} alertBanner
 * @property {{ enabled: boolean; messages: string[] }} notificationTicker
 * @property {{ enabled: boolean }} viralTrendCard
 * @property {boolean} mockOnly
 * @property {number} createdAtMs
 * @typedef {Object} OverlayPresetStoreSnapshot
 * @property {OverlayPreset[]} presets
 * @property {Record<string, string>} scenePresetMap
 * @property {number} updatedAtMs
 */

export const OVERLAY_SCENE_TEMPLATES = Object.freeze(
  /** @type {OverlaySceneTemplate[]} */ ([
    {
      id: 'breaking_alert_only',
      name: 'Breaking alert only',
      description: 'Urgent banner — no ticker or trend card',
      components: {
        alert_banner: true,
        notification_ticker: false,
        viral_trend_card: false,
      },
      alertBanner: {
        headline: '[Breaking] Mock headline',
        subline: 'Operator template — alert only',
        level: 'urgent',
      },
      tickerMessages: [],
    },
    {
      id: 'ticker_news_strip',
      name: 'Ticker news strip',
      description: 'Alert + bottom ticker',
      components: {
        alert_banner: true,
        notification_ticker: true,
        viral_trend_card: false,
      },
      alertBanner: {
        headline: 'Market watch mock',
        subline: 'Ticker template',
        level: 'info',
      },
      tickerMessages: ['BTC mock · ETH mock · StreamHub operator feed'],
    },
    {
      id: 'viral_trend_focus',
      name: 'Viral trend focus',
      description: 'Trend card + optional ticker',
      components: {
        alert_banner: false,
        notification_ticker: true,
        viral_trend_card: true,
      },
      alertBanner: {
        headline: 'Trend radar',
        subline: 'Viral focus template',
        level: 'info',
      },
      tickerMessages: ['Viral Trend Radar · mock-only'],
    },
    {
      id: 'full_event_stack',
      name: 'Full event stack',
      description: 'Alert + ticker + viral trend card',
      components: {
        alert_banner: true,
        notification_ticker: true,
        viral_trend_card: true,
      },
      alertBanner: {
        headline: 'Full stack mock alert',
        subline: 'All components enabled',
        level: 'urgent',
      },
      tickerMessages: ['Full overlay preset · MOCK ONLY · no broadcast'],
    },
  ]),
)
