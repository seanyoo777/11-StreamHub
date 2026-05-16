/**
 * @param {{
 *   durationSec: number;
 *   inPointSec: number;
 *   outPointSec: number;
 *   onInChange: (v: number) => void;
 *   onOutChange: (v: number) => void;
 * }} props
 */
export function TimelineScrubber({
  durationSec,
  inPointSec,
  outPointSec,
  onInChange,
  onOutChange,
}) {
  return (
    <div className="sh-timeline-scrubber" data-testid="timeline-scrubber">
      <label className="sh-timeline-field">
        In (sec)
        <input
          type="range"
          min={0}
          max={Math.max(1, durationSec - 1)}
          step={0.5}
          value={inPointSec}
          data-testid="timeline-in-range"
          onChange={(e) => onInChange(Number(e.target.value))}
        />
        <span>{inPointSec.toFixed(1)}s</span>
      </label>
      <label className="sh-timeline-field">
        Out (sec)
        <input
          type="range"
          min={1}
          max={durationSec}
          step={0.5}
          value={outPointSec}
          data-testid="timeline-out-range"
          onChange={(e) => onOutChange(Number(e.target.value))}
        />
        <span>{outPointSec.toFixed(1)}s</span>
      </label>
      <p className="sh-timeline-span" data-testid="timeline-span">
        Selection: {(outPointSec - inPointSec).toFixed(1)}s / source {durationSec}s (mock)
      </p>
    </div>
  )
}

