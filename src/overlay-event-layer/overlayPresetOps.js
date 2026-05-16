import { appendOverlayEventLayerAudit } from './overlayEventLayerAudit.js'
import {
  loadOverlayEventLayerConfig,
  saveOverlayEventLayerConfig,
} from './overlayEventLayerStore.js'
import { appendOverlayPresetAudit } from './overlayPresetAudit.js'
import {
  getOverlayPresetById,
  loadOverlayPresetStore,
  saveOverlayPresetStore,
} from './overlayPresetStore.js'
import { OVERLAY_EVENT_LAYER_MOCK_ONLY } from './overlayEventLayerTypes.js'
import { OVERLAY_SCENE_TEMPLATES } from './overlayPresetTypes.js'

/**
 * @param {typeof OVERLAY_SCENE_TEMPLATES[number]['id']} templateId
 */
export function getOverlaySceneTemplate(templateId) {
  return OVERLAY_SCENE_TEMPLATES.find((t) => t.id === templateId) ?? null
}

/**
 * @param {import('./overlayPresetTypes.js').OverlayPreset} preset
 * @returns {import('./overlayEventLayerTypes.js').OverlayEventLayerConfig}
 */
export function configPatchFromPreset(preset) {
  return {
    mockOnly: OVERLAY_EVENT_LAYER_MOCK_ONLY,
    alertBanner: {
      enabled: preset.components.alert_banner ?? preset.alertBanner.enabled,
      headline: preset.alertBanner.headline,
      subline: preset.alertBanner.subline,
      level: preset.alertBanner.level,
    },
    notificationTicker: {
      enabled: preset.components.notification_ticker ?? preset.notificationTicker.enabled,
      messages: [...preset.notificationTicker.messages],
    },
    viralTrendCard: {
      enabled: preset.components.viral_trend_card ?? preset.viralTrendCard.enabled,
    },
  }
}

/**
 * @param {typeof OVERLAY_SCENE_TEMPLATES[number]['id']} templateId
 */
export function applyOverlaySceneTemplate(templateId) {
  const template = getOverlaySceneTemplate(templateId)
  if (!template) throw new Error(`Unknown template: ${templateId}`)

  const current = loadOverlayEventLayerConfig()
  const next = saveOverlayEventLayerConfig({
    ...current,
    ...configPatchFromPreset({
      id: `from_template_${templateId}`,
      name: template.name,
      description: template.description,
      templateId,
      components: { ...template.components },
      alertBanner: {
        enabled: template.components.alert_banner,
        headline: template.alertBanner.headline,
        subline: template.alertBanner.subline,
        level: template.alertBanner.level,
      },
      notificationTicker: {
        enabled: template.components.notification_ticker,
        messages: [...template.tickerMessages],
      },
      viralTrendCard: { enabled: template.components.viral_trend_card },
      mockOnly: true,
      createdAtMs: Date.now(),
    }),
  })

  appendOverlayPresetAudit('overlay.preset.template_applied', {
    correlation_id: `template_${templateId}_${Date.now()}`,
    payload: { templateId, components: template.components },
  })

  return next
}

/**
 * @param {string} name
 * @param {string} [description]
 */
export function saveOverlayPresetFromConfig(name, description = '') {
  const config = loadOverlayEventLayerConfig()
  const createdAtMs = Date.now()
  const id = `preset_${name.replace(/\s+/g, '_').toLowerCase()}_${createdAtMs}`

  const preset = {
    id,
    name,
    description,
    templateId: null,
    components: {
      alert_banner: config.alertBanner.enabled,
      notification_ticker: config.notificationTicker.enabled,
      viral_trend_card: config.viralTrendCard.enabled,
    },
    alertBanner: { ...config.alertBanner },
    notificationTicker: {
      enabled: config.notificationTicker.enabled,
      messages: [...config.notificationTicker.messages],
    },
    viralTrendCard: { ...config.viralTrendCard },
    mockOnly: true,
    createdAtMs,
  }

  const store = loadOverlayPresetStore()
  store.presets = [...store.presets.filter((p) => p.id !== id), preset]
  saveOverlayPresetStore(store)

  appendOverlayPresetAudit('overlay.preset.saved', {
    correlation_id: `preset_save_${id}`,
    payload: { presetId: id, name },
  })

  return preset
}

/**
 * @param {string} presetId
 */
export function loadOverlayPresetToConfig(presetId) {
  const preset = getOverlayPresetById(presetId)
  if (!preset) throw new Error(`Preset not found: ${presetId}`)

  const current = loadOverlayEventLayerConfig()
  const next = saveOverlayEventLayerConfig({
    ...current,
    ...configPatchFromPreset(preset),
  })

  appendOverlayPresetAudit('overlay.preset.loaded', {
    correlation_id: `preset_load_${presetId}`,
    payload: { presetId },
  })

  return { preset, config: next }
}

/**
 * @param {string} sceneId
 * @param {string} presetId
 */
export function applyOverlayPresetToScene(sceneId, presetId) {
  const preset = getOverlayPresetById(presetId)
  if (!preset) throw new Error(`Preset not found: ${presetId}`)

  const store = loadOverlayPresetStore()
  store.scenePresetMap = { ...store.scenePresetMap, [sceneId]: presetId }
  saveOverlayPresetStore(store)

  const current = loadOverlayEventLayerConfig()
  const sceneFlags = {
    alert_banner: Boolean(preset.components.alert_banner),
    notification_ticker: Boolean(preset.components.notification_ticker),
    viral_trend_card: Boolean(preset.components.viral_trend_card),
  }

  const next = saveOverlayEventLayerConfig({
    ...current,
    ...configPatchFromPreset(preset),
    sceneComponentFlags: {
      ...current.sceneComponentFlags,
      [sceneId]: sceneFlags,
    },
  })

  appendOverlayPresetAudit('overlay.preset.applied_to_scene', {
    correlation_id: `preset_scene_${sceneId}_${presetId}`,
    payload: { sceneId, presetId, components: preset.components },
  })

  appendOverlayEventLayerAudit('overlay.event_layer.flags_updated', {
    correlation_id: `preset_flags_${sceneId}`,
    payload: { sceneId, presetId, sceneFlags },
  })

  return { preset, config: next }
}

/**
 * @returns {{ pass: boolean; issues: string[] }}
 */
export function runOverlayPresetSelfTestChecks() {
  const issues = []

  const afterTemplate = applyOverlaySceneTemplate('breaking_alert_only')
  if (afterTemplate.alertBanner.enabled !== true || afterTemplate.notificationTicker.enabled !== false) {
    issues.push('breaking_alert_only template mismatch')
  }

  const preset = saveOverlayPresetFromConfig('Self-test preset')
  const loaded = loadOverlayPresetToConfig(preset.id)
  if (!loaded.config.alertBanner.enabled) issues.push('preset load failed')

  const applied = applyOverlayPresetToScene('scene_preset_test', preset.id)
  if (getOverlayPresetById(preset.id)?.id !== preset.id) issues.push('preset missing after apply')
  if (!applied.config.sceneComponentFlags.scene_preset_test) issues.push('scene flags missing')

  return { pass: issues.length === 0, issues }
}
