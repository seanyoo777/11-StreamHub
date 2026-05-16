import { MockActionButton } from '../../admin/pages/AdminPageCommon.jsx'
import {
  broadcastOverlaySceneMock,
  previewOverlayScene,
  queueOverlayScene,
  updateOverlayScenePriority,
} from '../overlaySceneOps.js'

/**
 * @param {{ scene: import('../overlaySceneTypes.js').OverlayScene; active: boolean; onUpdated?: () => void }} props
 */
export function OverlaySceneCard({ scene, active, onUpdated }) {
  return (
    <article className="sh-overlay-card" data-testid={`overlay-card-${scene.id}`}>
      <header>
        <h4>{scene.title}</h4>
        <span className="sh-pill">{scene.sceneType}</span>
        <span className="sh-pill">{scene.status}</span>
      </header>
      <dl className="sh-shorts-meta">
        <dt>Layout</dt>
        <dd>{scene.layoutPreset}</dd>
        <dt>Priority</dt>
        <dd>{scene.priority}</dd>
        <dt>Source</dt>
        <dd>{scene.overlaySource}</dd>
      </dl>
      <p className="sh-overlay-headline">{scene.headline}</p>
      <div className="sh-shorts-actions">
        <MockActionButton
          label="Preview"
          testId={`preview-${scene.id}`}
          onClick={() => {
            previewOverlayScene(scene.id)
            onUpdated?.()
          }}
        />
        <MockActionButton
          label="Queue"
          testId={`queue-${scene.id}`}
          onClick={() => {
            queueOverlayScene(scene.id)
            onUpdated?.()
          }}
        />
        <MockActionButton
          label="Broadcast mock"
          testId={`broadcast-${scene.id}`}
          onClick={() => {
            broadcastOverlaySceneMock(scene.id)
            onUpdated?.()
          }}
        />
        <MockActionButton
          label="Priority +10"
          testId={`priority-${scene.id}`}
          onClick={() => {
            updateOverlayScenePriority(scene.id, Math.min(100, scene.priority + 10))
            onUpdated?.()
          }}
        />
      </div>
      {active ? <p className="sh-overlay-active-note">Active in browser source mock</p> : null}
    </article>
  )
}
