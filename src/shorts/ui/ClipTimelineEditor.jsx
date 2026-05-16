import { useState } from 'react'
import {
  applyTargetFormatToTimeline,
  exportClipTimelineDraftMock,
  openClipTimelineMock,
  saveClipTimelineMock,
  selectClipTimelineThumbnailMock,
  setClipTimelineInOut,
} from '../editor/clipTimelineHelpers.js'
import { ClipDurationSelector } from './ClipDurationSelector.jsx'
import { OverlayMomentPanel } from './OverlayMomentPanel.jsx'
import { SubtitleTrackPanel } from './SubtitleTrackPanel.jsx'
import { ThumbnailCandidateStrip } from './ThumbnailCandidateStrip.jsx'
import { TimelineScrubber } from './TimelineScrubber.jsx'

/**
 * @param {{
 *   clip: import('../contracts/overlayBridge.js').ShortsClipRecord;
 *   onClose: () => void;
 *   onUpdated?: () => void;
 * }} props
 */
export function ClipTimelineEditor({ clip, onClose, onUpdated }) {
  const [timeline, setTimeline] = useState(() => openClipTimelineMock(clip.id, clip))
  const [exportPreview, setExportPreview] = useState(null)

  const patch = (next) => {
    setTimeline({ ...next })
  }

  return (
    <section className="sh-timeline-editor" data-testid={`clip-timeline-editor-${clip.id}`}>
      <header className="sh-timeline-editor-header">
        <h4>Clip Timeline Editor (mock)</h4>
        <button type="button" className="sh-admin-mock-btn" data-testid="close-timeline-editor" onClick={onClose}>
          Close
        </button>
      </header>
      <p className="sh-timeline-mock-badge">No FFmpeg · no real edit · preview JSON only</p>

      <ClipDurationSelector
        targetFormat={timeline.targetFormat}
        onChange={(fmt) => patch(applyTargetFormatToTimeline({ ...timeline }, fmt))}
      />

      <TimelineScrubber
        durationSec={timeline.durationSec}
        inPointSec={timeline.inPointSec}
        outPointSec={timeline.outPointSec}
        onInChange={(v) => patch(setClipTimelineInOut({ ...timeline }, v, timeline.outPointSec))}
        onOutChange={(v) => patch(setClipTimelineInOut({ ...timeline }, timeline.inPointSec, v))}
      />

      <SubtitleTrackPanel tracks={timeline.subtitleTracks} />
      <OverlayMomentPanel moments={timeline.overlayMoments} />

      <ThumbnailCandidateStrip
        candidates={timeline.thumbnailCandidates}
        selectedId={timeline.selectedThumbnailId}
        onSelect={(id) => {
          const next = { ...timeline }
          patch(selectClipTimelineThumbnailMock(next, id, clip.correlation_id))
        }}
      />

      <div className="sh-timeline-editor-actions">
        <button
          type="button"
          className="sh-admin-mock-btn"
          data-testid="save-timeline-mock"
          onClick={() => {
            saveClipTimelineMock({ ...timeline }, clip.correlation_id)
            onUpdated?.()
          }}
        >
          Save (mock)
        </button>
        <button
          type="button"
          className="sh-admin-mock-btn"
          data-testid="export-shorts-draft"
          onClick={() => {
            const preview = exportClipTimelineDraftMock({ ...timeline }, clip.correlation_id, 'shorts')
            setExportPreview(preview)
            onUpdated?.()
          }}
        >
          Export Shorts Draft
        </button>
        <button
          type="button"
          className="sh-admin-mock-btn"
          data-testid="export-highlight-draft"
          onClick={() => {
            const preview = exportClipTimelineDraftMock({ ...timeline }, clip.correlation_id, 'highlight')
            setExportPreview(preview)
            onUpdated?.()
          }}
        >
          Export Highlight Draft
        </button>
      </div>

      {exportPreview && (
        <pre className="sh-timeline-export-preview" data-testid="timeline-export-preview">
          {JSON.stringify(exportPreview, null, 2)}
        </pre>
      )}
    </section>
  )
}
