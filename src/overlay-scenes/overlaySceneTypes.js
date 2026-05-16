/** OBS Overlay Scene Manager — mock (no OBS WebSocket, no real broadcast) */

export const STREAMHUB_OVERLAY_SCENES_STORAGE_KEY = 'streamhub.overlay_scenes_v1'
export const STREAMHUB_OVERLAY_SCENE_ACTIVE_KEY = 'streamhub.overlay_scene_active_v1'

export const OVERLAY_SCENE_TYPES = Object.freeze([
  'breaking_news',
  'market_alert',
  'ai_stock_pick',
  'top_trader',
  'tournament_result',
  'bj_reaction',
  'shorts_hook',
  'volatility_warning',
  'liquidation_alert',
])

export const OVERLAY_LAYOUT_PRESETS = Object.freeze([
  'lower_third',
  'breaking_banner',
  'side_alert',
  'top_headline',
  'ticker_line',
  'ai_signal_alert',
  'emergency_flash',
])

export const OVERLAY_ANIMATION_PRESETS = Object.freeze([
  'none',
  'slide_in',
  'fade_pulse',
  'flash_urgent',
  'ticker_scroll',
])

export const OVERLAY_SCENE_STATUSES = Object.freeze([
  'draft',
  'queued',
  'previewing',
  'live_mock',
  'archived',
])

export const OVERLAY_SCENE_SOURCES = Object.freeze([
  'streamhub',
  'oneai_broadcast',
  'tournament_winner',
  'obs_browser_mock',
])

export const OVERLAY_SCENE_AUDIT_KINDS = Object.freeze([
  'overlay.scene.created',
  'overlay.scene.queued',
  'overlay.scene.previewed',
  'overlay.scene.priority_updated',
  'overlay.scene.broadcast_mock',
])

export const OVERLAY_SCENE_NOTIFICATION_KINDS = Object.freeze([
  'overlay.breaking.ready',
  'overlay.urgent.queued',
  'overlay.high_priority.detected',
])

export const OVERLAY_SCENE_MOCK_ONLY = true

/**
 * @typedef {typeof OVERLAY_SCENE_TYPES[number]} OverlaySceneType
 * @typedef {typeof OVERLAY_LAYOUT_PRESETS[number]} OverlayLayoutPreset
 * @typedef {typeof OVERLAY_ANIMATION_PRESETS[number]} OverlayAnimationPreset
 * @typedef {typeof OVERLAY_SCENE_STATUSES[number]} OverlaySceneStatus
 * @typedef {Object} OverlaySceneHudLinks
 * @property {boolean} tournamentHud
 * @property {number | null} viralScore
 * @property {string | null} viralPriority
 * @property {number} shortsQueueCount
 * @property {string | null} oneAiBriefingHint
 * @property {string | null} stockPickTicker
 * @property {string | null} linkedClipId
 * @typedef {Object} OverlayScene
 * @property {string} id
 * @property {OverlaySceneType} sceneType
 * @property {string} title
 * @property {typeof OVERLAY_SCENE_SOURCES[number]} overlaySource
 * @property {OverlayLayoutPreset} layoutPreset
 * @property {OverlayAnimationPreset} animationPreset
 * @property {number} priority
 * @property {number} durationSec
 * @property {OverlaySceneStatus} status
 * @property {string} tickerText
 * @property {string} headline
 * @property {string} subline
 * @property {string} browserSourceUrlMock
 * @property {OverlaySceneHudLinks} hudLinks
 * @property {number} createdAt
 * @property {boolean} mockOnly
 */
