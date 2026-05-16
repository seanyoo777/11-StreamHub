import { useState } from 'react'
import { MockActionButton } from '../../admin/pages/AdminPageCommon.jsx'
import {
  applyOverlayPresetToScene,
  applyOverlaySceneTemplate,
  loadOverlayPresetToConfig,
  saveOverlayPresetFromConfig,
} from '../overlayPresetOps.js'
import { loadOverlayPresetStore, getScenePresetId } from '../overlayPresetStore.js'
import { OVERLAY_SCENE_TEMPLATES } from '../overlayPresetTypes.js'

/**
 * @param {{ sceneId: string | null; onUpdated?: () => void }} props
 */
export function OverlayPresetPanel({ sceneId, onUpdated }) {
  const [tick, setTick] = useState(0)
  const [presetName, setPresetName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(
    OVERLAY_SCENE_TEMPLATES[0]?.id ?? 'breaking_alert_only',
  )
  void tick

  const refresh = () => {
    setTick((n) => n + 1)
    onUpdated?.()
  }

  const store = loadOverlayPresetStore()
  const scenePresetId = sceneId ? getScenePresetId(sceneId) : null

  return (
    <section className="sh-overlay-preset-panel" data-testid="overlay-preset-panel">
      <div className="sh-trend-header">
        <h4>Overlay Preset / Scene Templates</h4>
        <p className="sh-subtitle">
          Save · load mock presets · apply per scene — MOCK ONLY
        </p>
      </div>

      <div className="sh-overlay-preset-templates">
        <label className="sh-field-label" htmlFor="overlay-template-select">
          Scene template
        </label>
        <select
          id="overlay-template-select"
          data-testid="overlay-template-select"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          {OVERLAY_SCENE_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <MockActionButton
          label="Apply template"
          testId="apply-overlay-template"
          onClick={() => {
            applyOverlaySceneTemplate(
              /** @type {import('../overlayPresetTypes.js').OverlaySceneTemplate['id']} */ (
                selectedTemplate
              ),
            )
            refresh()
          }}
        />
      </div>

      <div className="sh-overlay-preset-save">
        <label className="sh-field-label" htmlFor="overlay-preset-name">
          Save current as preset
        </label>
        <input
          id="overlay-preset-name"
          data-testid="overlay-preset-name"
          type="text"
          placeholder="Preset name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        />
        <MockActionButton
          label="Save preset"
          testId="save-overlay-preset"
          disabled={!presetName.trim()}
          onClick={() => {
            saveOverlayPresetFromConfig(presetName.trim())
            setPresetName('')
            refresh()
          }}
        />
      </div>

      {sceneId ? (
        <p className="sh-subtitle" data-testid="scene-preset-hint">
          Active scene: <code>{sceneId}</code>
          {scenePresetId ? (
            <>
              {' '}
              · assigned preset <code>{scenePresetId}</code>
            </>
          ) : (
            ' · no preset assigned'
          )}
        </p>
      ) : (
        <p className="sh-subtitle">Select an active overlay scene to apply presets per scene.</p>
      )}

      <ul className="sh-overlay-preset-list" data-testid="overlay-preset-list">
        {store.presets.length === 0 ? (
          <li className="sh-empty-hint">No saved presets yet.</li>
        ) : (
          store.presets.map((preset) => (
            <li key={preset.id} className="sh-overlay-preset-item">
              <div>
                <strong>{preset.name}</strong>
                {preset.templateId ? (
                  <span className="sh-badge sh-badge-muted"> from {preset.templateId}</span>
                ) : null}
                <div className="sh-preset-components">
                  {preset.components.alert_banner ? 'alert ' : ''}
                  {preset.components.notification_ticker ? 'ticker ' : ''}
                  {preset.components.viral_trend_card ? 'trend' : ''}
                </div>
              </div>
              <div className="sh-shorts-toolbar">
                <MockActionButton
                  label="Load"
                  testId={`load-preset-${preset.id}`}
                  onClick={() => {
                    loadOverlayPresetToConfig(preset.id)
                    refresh()
                  }}
                />
                {sceneId ? (
                  <MockActionButton
                    label="Apply to scene"
                    testId={`apply-preset-scene-${preset.id}`}
                    onClick={() => {
                      applyOverlayPresetToScene(sceneId, preset.id)
                      refresh()
                    }}
                  />
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
