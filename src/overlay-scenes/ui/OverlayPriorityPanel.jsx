/**
 * @param {{ priority: number; onChange: (n: number) => void }} props
 */
export function OverlayPriorityPanel({ priority, onChange }) {
  const level = priority >= 80 ? 'urgent' : priority >= 60 ? 'high' : 'normal'

  return (
    <div className="sh-overlay-priority" data-testid="overlay-priority-panel">
      <label className="sh-overlay-field">
        <span>Priority ({priority})</span>
        <input
          type="range"
          min={0}
          max={100}
          value={priority}
          onChange={(e) => onChange(Number(e.target.value))}
          data-testid="overlay-priority-range"
        />
      </label>
      <span className={`sh-pill sh-overlay-priority-${level}`}>{level}</span>
    </div>
  )
}
