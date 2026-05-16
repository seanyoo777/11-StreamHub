import { readViralTrendRadarFromStorage } from '../oneai/trends/trendReader.js'
import { isOverlayEventComponentEnabled } from './overlayEventLayerStore.js'

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * @param {{
 *   config: import('./overlayEventLayerTypes.js').OverlayEventLayerConfig;
 *   sceneId?: string | null;
 *   activeSceneHeadline?: string | null;
 * }} input
 */
export function buildOverlayEventLayerPreviewHtml(input) {
  const { config, sceneId = null, activeSceneHeadline = null } = input
  const showAlert = isOverlayEventComponentEnabled(config, sceneId, 'alert_banner')
  const showTicker = isOverlayEventComponentEnabled(config, sceneId, 'notification_ticker')
  const showTrend = isOverlayEventComponentEnabled(config, sceneId, 'viral_trend_card')

  const trend = readViralTrendRadarFromStorage().trends[0]
  const tickerText = config.notificationTicker.messages.join('  ·  ')
  const alertClass = config.alertBanner.level === 'urgent' ? 'alert-urgent' : 'alert-info'

  const alertBlock = showAlert
    ? `<div class="event-alert ${alertClass}" data-event-component="alert_banner">
        <strong>${escapeHtml(activeSceneHeadline ?? config.alertBanner.headline)}</strong>
        <span>${escapeHtml(config.alertBanner.subline)}</span>
      </div>`
    : ''

  const tickerBlock = showTicker
    ? `<div class="event-ticker" data-event-component="notification_ticker"><span class="event-ticker-text">${escapeHtml(tickerText)}</span></div>`
    : ''

  const trendBlock =
    showTrend && trend
      ? `<aside class="event-trend-card" data-event-component="viral_trend_card">
          <div class="event-trend-label">Viral Trend</div>
          <div class="event-trend-keyword">${escapeHtml(trend.keyword)}</div>
          <div class="event-trend-meta">${escapeHtml(trend.trendLevel)} · P${trend.overlayPriority} · ${escapeHtml(trend.category)}</div>
        </aside>`
      : showTrend
        ? `<aside class="event-trend-card event-trend-empty" data-event-component="viral_trend_card">No trend in radar storage (mock)</aside>`
        : ''

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:transparent;color:#fff;overflow:hidden}
    .stage{position:relative;width:100vw;height:100vh;background:linear-gradient(180deg,rgba(0,0,0,.35),transparent)}
    .mock-badge{position:absolute;top:8px;left:8px;font-size:10px;padding:4px 8px;background:#7c3aed;border-radius:4px;letter-spacing:.04em;font-weight:700}
    .event-alert{position:absolute;top:12%;left:50%;transform:translateX(-50%);min-width:60%;padding:12px 20px;border-radius:8px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.4)}
    .event-alert strong{display:block;font-size:1.1rem;margin-bottom:4px}
    .event-alert span{font-size:.85rem;opacity:.92}
    .alert-urgent{background:linear-gradient(90deg,#b91c1c,#dc2626);border:2px solid #fecaca}
    .alert-info{background:rgba(30,58,138,.92);border:2px solid #93c5fd}
    .event-ticker{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.82);padding:8px 0;overflow:hidden;white-space:nowrap}
    .event-ticker-text{display:inline-block;padding-left:100%;animation:ticker-scroll 18s linear infinite}
    .event-trend-card{position:absolute;right:4%;top:22%;width:min(28%,280px);padding:12px 14px;background:rgba(15,23,42,.92);border-left:4px solid #22c55e;border-radius:8px}
    .event-trend-label{font-size:.7rem;text-transform:uppercase;opacity:.8;margin-bottom:4px}
    .event-trend-keyword{font-size:1.05rem;font-weight:700}
    .event-trend-meta{font-size:.8rem;margin-top:6px;opacity:.9}
    .event-trend-empty{border-color:#64748b;font-size:.85rem}
    .scene-hint{position:absolute;bottom:36px;left:8px;font-size:10px;opacity:.75}
    @keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-100%)}}
  </style></head><body>
  <div class="stage">
    <div class="mock-badge">MOCK ONLY · EVENT LAYER</div>
    ${alertBlock}
    ${trendBlock}
    ${tickerBlock}
    ${sceneId ? `<div class="scene-hint">scene: ${escapeHtml(sceneId)}</div>` : ''}
  </div></body></html>`
}
