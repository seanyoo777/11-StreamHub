import { OVERLAY_EVENT_LAYER_COMPONENTS } from '../overlayEventLayerTypes.js'
import { isOverlayEventComponentEnabled } from '../overlayEventLayerStore.js'
import { toggleSceneOverlayEventComponent } from '../overlayEventLayerOps.js'

const COMPONENT_LABELS = {
  alert_banner: 'Alert banner',
  notification_ticker: 'Notification ticker',
  viral_trend_card: 'Viral trend card',
}

/**
 * @param {{
 *   config: import('../overlayEventLayerTypes.js').OverlayEventLayerConfig;
 *   sceneId: string | null;
 *   onUpdated?: () => void;
 * }} props
 */
export function EventLayerSceneFlags({ config, sceneId, onUpdated }) {
  if (!sceneId) {
    return (
      <p className="sh-subtitle" data-testid="event-layer-no-scene">
        Select an active overlay scene to set per-scene component flags.
      </p>
    )
  }

  return (
    <div className="sh-event-layer-flags" data-testid="event-layer-scene-flags">
      <h4>Scene overlay flags · {sceneId}</h4>
      <ul className="sh-event-layer-flag-list">
        {OVERLAY_EVENT_LAYER_COMPONENTS.map((component) => {
          const enabled = isOverlayEventComponentEnabled(config, sceneId, component)
          return (
            <li key={component}>
              <label>
                <input
                  type="checkbox"
                  checked={enabled}
                  data-testid={`event-flag-${component}`}
                  onChange={(e) => {
                    toggleSceneOverlayEventComponent(sceneId, component, e.target.checked)
                    onUpdated?.()
                  }}
                />
                {COMPONENT_LABELS[component]}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
