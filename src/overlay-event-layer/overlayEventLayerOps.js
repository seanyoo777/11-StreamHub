import { appendOverlayEventLayerAudit } from './overlayEventLayerAudit.js'
import { buildOverlayEventLayerPreviewHtml } from './overlayEventLayerBuilder.js'
import {
  loadOverlayEventLayerConfig,
  saveOverlayEventLayerConfig,
  setSceneOverlayComponentFlag,
} from './overlayEventLayerStore.js'

/**
 * @param {{ sceneId?: string | null; activeSceneHeadline?: string | null }} [input]
 */
export function previewOverlayEventLayer(input = {}) {
  const config = loadOverlayEventLayerConfig()
  const html = buildOverlayEventLayerPreviewHtml({
    config,
    sceneId: input.sceneId ?? null,
    activeSceneHeadline: input.activeSceneHeadline ?? null,
  })

  appendOverlayEventLayerAudit('overlay.event_layer.previewed', {
    correlation_id: `event_layer_preview_${Date.now()}`,
    payload: {
      sceneId: input.sceneId ?? null,
      alert: config.alertBanner.enabled,
      ticker: config.notificationTicker.enabled,
      trendCard: config.viralTrendCard.enabled,
    },
  })

  return { config, previewHtml: html }
}

/**
 * @param {Partial<import('./overlayEventLayerTypes.js').OverlayEventLayerConfig>} patch
 */
export function updateOverlayEventLayerConfig(patch) {
  const current = loadOverlayEventLayerConfig()
  const next = saveOverlayEventLayerConfig({
    ...current,
    ...patch,
    alertBanner: { ...current.alertBanner, ...(patch.alertBanner ?? {}) },
    notificationTicker: {
      ...current.notificationTicker,
      ...(patch.notificationTicker ?? {}),
    },
    viralTrendCard: { ...current.viralTrendCard, ...(patch.viralTrendCard ?? {}) },
  })

  appendOverlayEventLayerAudit('overlay.event_layer.flags_updated', {
    correlation_id: `event_layer_flags_${Date.now()}`,
    payload: {
      alertEnabled: next.alertBanner.enabled,
      tickerEnabled: next.notificationTicker.enabled,
      trendEnabled: next.viralTrendCard.enabled,
    },
  })

  return next
}

/**
 * @param {string} sceneId
 * @param {import('./overlayEventLayerTypes.js').OverlayEventLayerComponent} component
 * @param {boolean} enabled
 */
export function toggleSceneOverlayEventComponent(sceneId, component, enabled) {
  const config = loadOverlayEventLayerConfig()
  const next = setSceneOverlayComponentFlag(config, sceneId, component, enabled)

  appendOverlayEventLayerAudit('overlay.event_layer.flags_updated', {
    correlation_id: `event_layer_scene_${sceneId}_${Date.now()}`,
    payload: { sceneId, component, enabled },
  })

  return next
}

/**
 * @returns {{ pass: boolean; issues: string[] }}
 */
export function runOverlayEventLayerSelfTestChecks() {
  const issues = []
  const config = loadOverlayEventLayerConfig()

  if (!config.mockOnly) issues.push('mockOnly must be true')

  const { previewHtml } = previewOverlayEventLayer()
  if (!previewHtml.includes('MOCK ONLY')) issues.push('preview missing mock badge')
  if (!previewHtml.includes('data-event-component="alert_banner"') && config.alertBanner.enabled) {
    issues.push('alert banner missing')
  }

  const disabled = toggleSceneOverlayEventComponent('scene_test', 'alert_banner', false)
  const htmlOff = buildOverlayEventLayerPreviewHtml({
    config: disabled,
    sceneId: 'scene_test',
  })
  if (htmlOff.includes('data-event-component="alert_banner"')) {
    issues.push('scene flag should hide alert')
  }

  return { pass: issues.length === 0, issues }
}
