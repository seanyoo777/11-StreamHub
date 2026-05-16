import { useMemo, useState } from 'react'
import { MockActionButton } from '../../admin/pages/AdminPageCommon.jsx'
import { getActiveOverlaySceneId, getOverlaySceneById } from '../../overlay-scenes/overlaySceneStore.js'
import { loadOverlayEventLayerConfig } from '../overlayEventLayerStore.js'
import { buildOverlayEventLayerPreviewHtml } from '../overlayEventLayerBuilder.js'
import { previewOverlayEventLayer, updateOverlayEventLayerConfig } from '../overlayEventLayerOps.js'
import { EventLayerPreview } from './EventLayerPreview.jsx'
import { EventLayerSceneFlags } from './EventLayerSceneFlags.jsx'
import { OverlayPresetPanel } from './OverlayPresetPanel.jsx'

/**
 * @param {{ onUpdated?: () => void }} [props]
 */
export function OverlayEventLayerBoard({ onUpdated }) {
  const [tick, setTick] = useState(0)
  void tick

  const refresh = () => {
    setTick((n) => n + 1)
    onUpdated?.()
  }

  const config = loadOverlayEventLayerConfig()
  const activeId = getActiveOverlaySceneId()
  const activeScene = activeId ? getOverlaySceneById(activeId) : null

  const previewHtml = useMemo(() => {
    return buildOverlayEventLayerPreviewHtml({
      config,
      sceneId: activeId,
      activeSceneHeadline: activeScene?.headline ?? null,
    })
  }, [config, activeId, activeScene?.headline])

  return (
    <section className="sh-event-layer-board" data-testid="overlay-event-layer-board">
      <div className="sh-trend-header">
        <h3>Broadcast Event Overlay Layer</h3>
        <p className="sh-subtitle">
          Mock alert · ticker · viral trend card — static preview, no stream automation
        </p>
      </div>

      <div className="sh-shorts-toolbar">
        <MockActionButton
          label="Refresh preview"
          testId="refresh-event-layer-preview"
          onClick={() => {
            previewOverlayEventLayer({
              sceneId: activeId,
              activeSceneHeadline: activeScene?.headline ?? null,
            })
            refresh()
          }}
        />
      </div>

      <div className="sh-event-layer-global-toggles">
        <label>
          <input
            type="checkbox"
            checked={config.alertBanner.enabled}
            data-testid="event-global-alert"
            onChange={(e) => {
              updateOverlayEventLayerConfig({
                alertBanner: { ...config.alertBanner, enabled: e.target.checked },
              })
              refresh()
            }}
          />
          Global alert banner
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.notificationTicker.enabled}
            data-testid="event-global-ticker"
            onChange={(e) => {
              updateOverlayEventLayerConfig({
                notificationTicker: {
                  ...config.notificationTicker,
                  enabled: e.target.checked,
                },
              })
              refresh()
            }}
          />
          Global notification ticker
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.viralTrendCard.enabled}
            data-testid="event-global-trend"
            onChange={(e) => {
              updateOverlayEventLayerConfig({
                viralTrendCard: { enabled: e.target.checked },
              })
              refresh()
            }}
          />
          Global viral trend card
        </label>
      </div>

      <EventLayerSceneFlags config={config} sceneId={activeId} onUpdated={refresh} />

      <OverlayPresetPanel sceneId={activeId} onUpdated={refresh} />

      <EventLayerPreview previewHtml={previewHtml} />
    </section>
  )
}
