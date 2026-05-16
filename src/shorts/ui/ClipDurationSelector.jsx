import { CLIP_TIMELINE_FORMAT_MAX_SEC, CLIP_TIMELINE_TARGET_FORMATS } from '../editor/clipTimelineTypes.js'

const FORMAT_LABELS = {
  shorts_15: 'Shorts 15s',
  shorts_30: 'Shorts 30s',
  shorts_60: 'Shorts 60s',
  highlight_300: 'Highlight 5m',
}

/**
 * @param {{
 *   targetFormat: string;
 *   onChange: (format: import('../editor/clipTimelineTypes.js').ClipTimelineTargetFormat) => void;
 * }} props
 */
export function ClipDurationSelector({ targetFormat, onChange }) {
  return (
    <div className="sh-timeline-formats" data-testid="clip-duration-selector">
      <span className="sh-timeline-section-label">Target format</span>
      <div className="sh-timeline-format-btns">
        {CLIP_TIMELINE_TARGET_FORMATS.map((fmt) => (
          <button
            key={fmt}
            type="button"
            className={`sh-admin-mock-btn${targetFormat === fmt ? ' sh-timeline-format-active' : ''}`}
            data-testid={`format-${fmt}`}
            onClick={() => onChange(fmt)}
          >
            {FORMAT_LABELS[fmt]} (max {CLIP_TIMELINE_FORMAT_MAX_SEC[fmt]}s)
          </button>
        ))}
      </div>
    </div>
  )
}
