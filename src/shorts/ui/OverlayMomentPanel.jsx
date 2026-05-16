/**
 * @param {{ moments: import('../editor/clipTimelineTypes.js').OverlayMoment[] }} props
 */
export function OverlayMomentPanel({ moments }) {
  return (
    <div className="sh-timeline-panel" data-testid="overlay-moment-panel">
      <span className="sh-timeline-section-label">Overlay timing (mock)</span>
      <ul className="sh-timeline-overlays">
        {moments.map((m) => (
          <li key={m.id} data-testid={`overlay-${m.kind}`}>
            <strong>{m.label}</strong>
            <span>
              @ {m.atSec.toFixed(1)}s
              {m.aiRecommended ? ' · AI recommended' : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
