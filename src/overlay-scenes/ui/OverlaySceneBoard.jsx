import { useMemo, useState } from 'react'
import { MockActionButton } from '../../admin/pages/AdminPageCommon.jsx'
import { loadShortsQueue } from '../../shorts/shortsQueueStore.js'
import { buildOverlayScene, buildScenePreviewHtml } from '../overlaySceneBuilder.js'
import {
  createOverlaySceneRecord,
  importOverlaySceneFromShortsClip,
  previewOverlayScene,
} from '../overlaySceneOps.js'
import { buildLiveHudSnapshotMock } from '../overlaySceneHudBridge.js'
import {
  getActiveOverlaySceneId,
  getOverlaySceneById,
  loadOverlayScenes,
} from '../overlaySceneStore.js'
import { OVERLAY_LAYOUT_PRESETS, OVERLAY_SCENE_TYPES } from '../overlaySceneTypes.js'
import { OverlayAnimationSelector } from './OverlayAnimationSelector.jsx'
import { OverlayPriorityPanel } from './OverlayPriorityPanel.jsx'
import { OverlayScenePreview } from './OverlayScenePreview.jsx'
import { OverlaySceneQueue } from './OverlaySceneQueue.jsx'
import { ViralTrendOverlayCandidatesPanel } from '../../oneai/trends/ui/ViralTrendOverlayCandidatesPanel.jsx'
import { OverlayTickerEditor } from './OverlayTickerEditor.jsx'
import { OverlayEventLayerBoard } from '../../overlay-event-layer/ui/OverlayEventLayerBoard.jsx'

/**
 * @param {{ onUpdated?: () => void }} [props]
 */
export function OverlaySceneBoard({ onUpdated }) {
  const [sceneType, setSceneType] = useState('breaking_news')
  const [layoutPreset, setLayoutPreset] = useState('breaking_banner')
  const [animationPreset, setAnimationPreset] = useState('flash_urgent')
  const [priority, setPriority] = useState(75)
  const [tickerText, setTickerText] = useState('StreamHub mock ticker · no OBS WebSocket')
  const [headline, setHeadline] = useState('Breaking: mock headline')
  const [tick, setTick] = useState(0)

  void tick
  const refresh = () => {
    setTick((n) => n + 1)
    onUpdated?.()
  }

  const hud = buildLiveHudSnapshotMock()
  const activeId = getActiveOverlaySceneId()
  const activeScene = activeId ? getOverlaySceneById(activeId) : null

  const previewBundle = useMemo(() => {
    if (activeScene) {
      return {
        html: buildScenePreviewHtml(activeScene),
        url: activeScene.browserSourceUrlMock,
      }
    }
    const draft = buildOverlayScene({
      sceneType,
      layoutPreset,
      animationPreset,
      priority,
      tickerText,
      headline,
      subline: 'Draft preview — not saved',
      hudLinks: hud,
    })
    return {
      html: buildScenePreviewHtml(draft),
      url: draft.browserSourceUrlMock,
    }
  }, [activeScene, sceneType, layoutPreset, animationPreset, priority, tickerText, headline, hud])

  const shortsTop = loadShortsQueue()[0]

  return (
    <div className="sh-overlay-board" data-testid="overlay-scene-board">
      <ViralTrendOverlayCandidatesPanel onImported={refresh} />
      <div className="sh-overlay-hud-panel" data-testid="overlay-hud-snapshot">
        <h3>Live HUD snapshot (mock)</h3>
        <ul className="sh-viral-queue-preview">
          <li>Tournament: {hud.tournamentHandle} · rank {hud.tournamentRank}</li>
          <li>Shorts queue: {hud.shortsQueueCount}</li>
          <li>Viral score: {hud.viralScore ?? '—'} ({hud.viralPriority ?? 'n/a'})</li>
          <li>OneAI briefing: {hud.oneAiBriefingHint ?? '—'}</li>
          <li>Stock pick: {hud.stockPickTicker ?? '—'}</li>
        </ul>
      </div>

      <div className="sh-shorts-toolbar">
        <MockActionButton
          label="Create overlay scene"
          testId="create-overlay-scene"
          onClick={() => {
            const scene = buildOverlayScene({
              sceneType,
              layoutPreset,
              animationPreset,
              priority,
              tickerText,
              headline,
              hudLinks: hud,
            })
            createOverlaySceneRecord(scene)
            refresh()
          }}
        />
        {shortsTop ? (
          <MockActionButton
            label="Import top Shorts clip"
            testId="import-shorts-overlay"
            onClick={() => {
              importOverlaySceneFromShortsClip(shortsTop)
              refresh()
            }}
          />
        ) : null}
        {activeId ? (
          <MockActionButton
            label="Refresh preview"
            testId="refresh-overlay-preview"
            onClick={() => {
              previewOverlayScene(activeId)
              refresh()
            }}
          />
        ) : null}
      </div>

      <div className="sh-overlay-compose">
        <label className="sh-overlay-field">
          <span>Scene type</span>
          <select
            value={sceneType}
            onChange={(e) => setSceneType(e.target.value)}
            data-testid="overlay-scene-type-select"
          >
            {OVERLAY_SCENE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="sh-overlay-field">
          <span>Layout</span>
          <select
            value={layoutPreset}
            onChange={(e) => setLayoutPreset(e.target.value)}
            data-testid="overlay-layout-select"
          >
            {OVERLAY_LAYOUT_PRESETS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <OverlayAnimationSelector value={animationPreset} onChange={setAnimationPreset} />
        <OverlayTickerEditor value={tickerText} onChange={setTickerText} />
        <OverlayPriorityPanel priority={priority} onChange={setPriority} />
        <label className="sh-overlay-field">
          <span>Headline</span>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            data-testid="overlay-headline-input"
          />
        </label>
      </div>

      <div className="sh-overlay-layout">
        <OverlayScenePreview
          previewHtml={previewBundle.html}
          browserSourceUrlMock={previewBundle.url}
          active={Boolean(activeScene)}
        />
        <div>
          <p className="sh-subtitle">Scenes stored: {loadOverlayScenes().length} (mock-only)</p>
          <OverlaySceneQueue activeSceneId={activeId} onUpdated={refresh} />
        </div>
      </div>

      <OverlayEventLayerBoard onUpdated={refresh} />
    </div>
  )
}
