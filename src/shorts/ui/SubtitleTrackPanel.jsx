/**
 * @param {{ tracks: import('../editor/clipTimelineTypes.js').SubtitleTrack[] }} props
 */
export function SubtitleTrackPanel({ tracks }) {
  return (
    <div className="sh-timeline-panel" data-testid="subtitle-track-panel">
      <span className="sh-timeline-section-label">Subtitle preview (mock)</span>
      <ul className="sh-timeline-subtitles">
        {tracks.map((track) => (
          <li key={track.id} data-testid={`subtitle-${track.id}`}>
            <span className={track.emphasis ? 'sh-sub-emphasis' : ''}>{track.text}</span>
            <code>
              {track.startSec.toFixed(1)}s – {track.endSec.toFixed(1)}s
            </code>
          </li>
        ))}
      </ul>
    </div>
  )
}
