import { loadOverlaySceneQueue } from '../overlaySceneStore.js'
import { OverlaySceneCard } from './OverlaySceneCard.jsx'

/**
 * @param {{ activeSceneId: string | null; onUpdated?: () => void }} props
 */
export function OverlaySceneQueue({ activeSceneId, onUpdated }) {
  const queue = loadOverlaySceneQueue()

  return (
    <section data-testid="overlay-scene-queue">
      <h3>Overlay queue ({queue.length})</h3>
      {queue.length === 0 ? (
        <p>No scenes — create from HUD links or import from Shorts.</p>
      ) : (
        <div className="sh-shorts-grid">
          {queue.map((scene) => (
            <OverlaySceneCard
              key={scene.id}
              scene={scene}
              active={scene.id === activeSceneId}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}
    </section>
  )
}
