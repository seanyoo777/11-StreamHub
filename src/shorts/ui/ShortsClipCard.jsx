import { useState } from 'react'
import { getShortsUploadGuardState } from '../safety/contentSafetyReview.js'
import { ClipTimelineEditor } from './ClipTimelineEditor.jsx'
import { ViralScoreBadge } from '../../viral/ui/ViralScoreBadge.jsx'
import { SafetyReviewPanel } from './SafetyReviewPanel.jsx'
import { CLIP_DETECTION_LABELS } from '../contracts/clipDetection.js'
import { approveShortsClipMock, rejectShortsClipMock, startShortsClipReview } from '../shortsQueueOps.js'

/**
 * @param {{
 *   clip: import('../contracts/overlayBridge.js').ShortsClipRecord;
 *   onUpdated?: () => void;
 * }} props
 */
export function ShortsClipCard({ clip, onUpdated }) {
  const [editorOpen, setEditorOpen] = useState(false)
  const reasonLabel = CLIP_DETECTION_LABELS[clip.detection_reason] ?? clip.detection_reason
  const occurred = new Date(clip.occurred_at_ms).toLocaleString()
  const guard = getShortsUploadGuardState(clip.id)
  const canApproveClip = clip.status === 'reviewing' && guard.canPrepareUpload

  return (
    <article className="sh-shorts-card" data-testid={`shorts-card-${clip.id}`}>
      <div className="sh-shorts-card-preview">
        <span className="sh-shorts-preview-badge">MOCK PREVIEW</span>
        <ViralScoreBadge
          viralScore={clip.viral_score}
          recommendation={clip.viral_recommendation}
          priorityLevel={clip.priority_level}
          recommendedFirst={clip.recommended_first}
        />
        <strong>{clip.preview_title}</strong>
        <p className="sh-shorts-duration">{clip.mock_duration_sec}s (mock)</p>
      </div>
      <dl className="sh-shorts-meta">
        <div>
          <dt>Reason</dt>
          <dd>{reasonLabel}</dd>
        </div>
        <div>
          <dt>Timestamp</dt>
          <dd>{occurred}</dd>
        </div>
        <div>
          <dt>Overlay</dt>
          <dd>
            <code>{clip.overlay_source}</code> · {clip.overlay_route}
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`sh-pill sh-pill-${clip.status.replace('_', '-')}`}>{clip.status}</span>
          </dd>
        </div>
      </dl>
      <SafetyReviewPanel clipId={clip.id} onUpdated={onUpdated} />
      {editorOpen ? (
        <ClipTimelineEditor
          clip={clip}
          onClose={() => setEditorOpen(false)}
          onUpdated={onUpdated}
        />
      ) : (
        <button
          type="button"
          className="sh-admin-mock-btn"
          data-testid={`edit-clip-${clip.id}`}
          onClick={() => setEditorOpen(true)}
        >
          Edit Clip
        </button>
      )}
      <div className="sh-shorts-actions">
        {clip.status === 'queued' && (
          <button
            type="button"
            className="sh-admin-mock-btn"
            data-testid={`review-${clip.id}`}
            onClick={() => {
              startShortsClipReview(clip.id)
              onUpdated?.()
            }}
          >
            Start review
          </button>
        )}
        {clip.status === 'reviewing' && (
          <>
            <button
              type="button"
              className="sh-admin-mock-btn"
              data-testid={`approve-${clip.id}`}
              disabled={!canApproveClip}
              title={canApproveClip ? undefined : guard.reason}
              onClick={() => {
                approveShortsClipMock(clip.id)
                onUpdated?.()
              }}
            >
              Approve (mock)
            </button>
            <button
              type="button"
              className="sh-admin-mock-btn"
              data-testid={`reject-${clip.id}`}
              onClick={() => {
                rejectShortsClipMock(clip.id)
                onUpdated?.()
              }}
            >
              Reject (mock)
            </button>
          </>
        )}
      </div>
    </article>
  )
}
