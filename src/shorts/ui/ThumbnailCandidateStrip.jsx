/**
 * @param {{
 *   candidates: import('../editor/clipTimelineTypes.js').ThumbnailCandidate[];
 *   selectedId: string | null;
 *   onSelect: (id: string) => void;
 * }} props
 */
export function ThumbnailCandidateStrip({ candidates, selectedId, onSelect }) {
  return (
    <div className="sh-timeline-thumbs" data-testid="thumbnail-candidate-strip">
      <span className="sh-timeline-section-label">Thumbnail candidates (mock — no image gen)</span>
      <div className="sh-timeline-thumb-row">
        {candidates.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`sh-timeline-thumb${selectedId === c.id ? ' sh-timeline-thumb-selected' : ''}`}
            data-testid={`thumb-${c.style}`}
            onClick={() => onSelect(c.id)}
          >
            <span className="sh-thumb-style">{c.style}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
