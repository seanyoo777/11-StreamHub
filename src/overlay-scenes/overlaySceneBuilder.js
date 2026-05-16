import { ONEAI_STREAM_OVERLAY_ROUTES } from '../validation/contracts/oneAiBridge.js'
import {
  OVERLAY_ANIMATION_PRESETS,
  OVERLAY_LAYOUT_PRESETS,
  OVERLAY_SCENE_MOCK_ONLY,
  OVERLAY_SCENE_TYPES,
} from './overlaySceneTypes.js'

const SCENE_TYPE_LABELS = {
  breaking_news: 'Breaking News',
  market_alert: 'Market Alert',
  ai_stock_pick: 'AI Stock Pick',
  top_trader: 'Top Trader',
  tournament_result: 'Tournament Result',
  bj_reaction: 'BJ Reaction',
  shorts_hook: 'Shorts Hook',
  volatility_warning: 'Volatility Warning',
  liquidation_alert: 'Liquidation Alert',
}

const SCENE_TYPE_DEFAULT_LAYOUT = {
  breaking_news: 'breaking_banner',
  market_alert: 'side_alert',
  ai_stock_pick: 'ai_signal_alert',
  top_trader: 'lower_third',
  tournament_result: 'top_headline',
  bj_reaction: 'lower_third',
  shorts_hook: 'ticker_line',
  volatility_warning: 'emergency_flash',
  liquidation_alert: 'emergency_flash',
}

/**
 * @param {import('./overlaySceneTypes.js').OverlaySceneType} sceneType
 */
export function mapSceneTypeToOverlayRoute(sceneType) {
  switch (sceneType) {
    case 'tournament_result':
    case 'top_trader':
      return ONEAI_STREAM_OVERLAY_ROUTES.tournament
    case 'ai_stock_pick':
    case 'shorts_hook':
      return ONEAI_STREAM_OVERLAY_ROUTES.shorts_moment
    case 'breaking_news':
    case 'market_alert':
    case 'volatility_warning':
    case 'liquidation_alert':
      return ONEAI_STREAM_OVERLAY_ROUTES.event
    default:
      return ONEAI_STREAM_OVERLAY_ROUTES.event
  }
}

/**
 * @param {import('./overlaySceneTypes.js').OverlayScene} scene
 */
export function buildBrowserSourceUrlMock(scene) {
  const route = mapSceneTypeToOverlayRoute(scene.sceneType)
  const params = new URLSearchParams({
    overlay: route.replace('?overlay=', ''),
    scene_id: scene.id,
    layout: scene.layoutPreset,
    mock: '1',
    clean: '1',
  })
  return `https://streamhub.mock/obs-browser#${params.toString()}`
}

/**
 * @param {import('./overlaySceneTypes.js').OverlayScene} scene
 */
export function buildScenePreviewHtml(scene) {
  const anim =
    scene.animationPreset === 'flash_urgent'
      ? 'animation: flash 1s infinite;'
      : scene.animationPreset === 'fade_pulse'
        ? 'animation: pulse 2s infinite;'
        : scene.animationPreset === 'ticker_scroll'
          ? 'animation: scroll 12s linear infinite;'
          : ''

  const layoutClass = `layout-${scene.layoutPreset}`

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:transparent;color:#fff;overflow:hidden}
    .stage{width:100vw;height:100vh;position:relative;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent)}
    .lower_third{position:absolute;bottom:8%;left:5%;padding:12px 20px;background:rgba(99,102,241,.85);border-radius:8px;${anim}}
    .breaking_banner{position:absolute;top:0;left:0;right:0;padding:16px;background:#dc2626;text-align:center;font-weight:700;${anim}}
    .side_alert{position:absolute;right:4%;top:30%;max-width:28%;padding:14px;background:rgba(15,23,42,.9);border-left:4px solid #f59e0b;${anim}}
    .top_headline{position:absolute;top:10%;left:50%;transform:translateX(-50%);padding:10px 24px;background:rgba(0,0,0,.75);${anim}}
    .ticker_line{position:absolute;bottom:0;left:0;right:0;padding:8px;background:rgba(0,0,0,.8);white-space:nowrap;${anim}}
    .ai_signal_alert{position:absolute;top:20%;left:5%;padding:12px 16px;border:2px solid #22c55e;background:rgba(0,0,0,.8);${anim}}
    .emergency_flash{position:absolute;inset:10%;border:3px solid #ef4444;display:flex;align-items:center;justify-content:center;text-align:center;background:rgba(127,29,29,.4);${anim}}
    .hud{position:absolute;top:8px;right:8px;font-size:11px;opacity:.85;background:rgba(0,0,0,.5);padding:6px 8px;border-radius:4px}
    @keyframes flash{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
    @keyframes scroll{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
  </style></head><body><div class="stage">
    <div class="${layoutClass} ${scene.layoutPreset}">
      <div style="font-size:1.25rem;font-weight:700">${escapeHtml(scene.headline)}</div>
      <div style="font-size:.9rem;margin-top:4px;opacity:.9">${escapeHtml(scene.subline)}</div>
    </div>
    <div class="hud">HUD mock · viral ${scene.hudLinks?.viralScore ?? '—'} · queue ${scene.hudLinks?.shortsQueueCount ?? 0}</div>
  </div></body></html>`
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * @param {{
 *   sceneType: import('./overlaySceneTypes.js').OverlaySceneType;
 *   title?: string;
 *   headline?: string;
 *   subline?: string;
 *   tickerText?: string;
 *   overlaySource?: import('./overlaySceneTypes.js').OverlayScene['overlaySource'];
 *   layoutPreset?: import('./overlaySceneTypes.js').OverlayLayoutPreset;
 *   animationPreset?: import('./overlaySceneTypes.js').OverlayAnimationPreset;
 *   priority?: number;
 *   durationSec?: number;
 *   hudLinks?: import('./overlaySceneTypes.js').OverlaySceneHudLinks;
 * }} input
 */
export function buildOverlayScene(input) {
  const sceneType = OVERLAY_SCENE_TYPES.includes(input.sceneType)
    ? input.sceneType
    : 'breaking_news'
  const createdAt = Date.now()
  const id = `overlay_scene_${sceneType}_${createdAt}`
  const layoutPreset =
    input.layoutPreset && OVERLAY_LAYOUT_PRESETS.includes(input.layoutPreset)
      ? input.layoutPreset
      : /** @type {import('./overlaySceneTypes.js').OverlayLayoutPreset} */ (
          SCENE_TYPE_DEFAULT_LAYOUT[sceneType] ?? 'lower_third'
        )

  const scene = {
    id,
    sceneType,
    title: input.title ?? SCENE_TYPE_LABELS[sceneType] ?? sceneType,
    overlaySource: input.overlaySource ?? 'obs_browser_mock',
    layoutPreset,
    animationPreset:
      input.animationPreset && OVERLAY_ANIMATION_PRESETS.includes(input.animationPreset)
        ? input.animationPreset
        : sceneType === 'breaking_news' || sceneType === 'liquidation_alert'
          ? 'flash_urgent'
          : 'slide_in',
    priority: input.priority ?? 50,
    durationSec: input.durationSec ?? 15,
    status: /** @type {import('./overlaySceneTypes.js').OverlaySceneStatus} */ ('draft'),
    tickerText: input.tickerText ?? '',
    headline: input.headline ?? input.title ?? SCENE_TYPE_LABELS[sceneType],
    subline: input.subline ?? 'StreamHub mock overlay — operator review',
    browserSourceUrlMock: '',
    hudLinks: input.hudLinks ?? {
      tournamentHud: false,
      viralScore: null,
      viralPriority: null,
      shortsQueueCount: 0,
      oneAiBriefingHint: null,
      stockPickTicker: null,
      linkedClipId: null,
    },
    createdAt,
    mockOnly: OVERLAY_SCENE_MOCK_ONLY,
  }

  scene.browserSourceUrlMock = buildBrowserSourceUrlMock(scene)
  return scene
}
