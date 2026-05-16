import {
  applyContentSafetyEditSuggestionMock,
  approveContentSafetyAfterReviewMock,
  getShortsUploadGuardState,
  rejectContentSafetyDueToPolicyMock,
} from '../safety/contentSafetyReview.js'
import { getContentSafetyReviewByClipId } from '../safety/contentSafetyStore.js'
import { ContentFlagList } from './ContentFlagList.jsx'
import { RiskScoreBadge } from './RiskScoreBadge.jsx'
import { SuggestedFixCard } from './SuggestedFixCard.jsx'

/**
 * @param {{
 *   clipId: string;
 *   onUpdated?: () => void;
 * }} props
 */
export function SafetyReviewPanel({ clipId, onUpdated }) {
  const review = getContentSafetyReviewByClipId(clipId)
  const guard = getShortsUploadGuardState(clipId)

  if (!review) {
    return (
      <section className="sh-safety-panel" data-testid="safety-review-panel">
        <p className="sh-safety-missing">No safety review (mock)</p>
      </section>
    )
  }

  const editApplied = review.operatorDecision === 'edit_suggestion_applied.mock'

  return (
    <section className="sh-safety-panel" data-testid="safety-review-panel">
      <header className="sh-safety-panel-header">
        <h4>Content Safety (mock)</h4>
        <RiskScoreBadge riskScore={review.riskScore} verdict={review.verdict} />
      </header>
      <p className="sh-safety-source">
        Source: <code>{review.sourceType}</code>
      </p>
      <ContentFlagList flags={review.flags} />
      <p className="sh-safety-guard-hint" data-testid="safety-guard-hint">
        Upload prep: {guard.canPrepareUpload ? 'allowed (mock)' : guard.reason}
      </p>
      {review.suggestedFixes.length > 0 && (
        <div className="sh-safety-fixes">
          {review.suggestedFixes.map((fix, index) => (
            <SuggestedFixCard
              key={`${fix.reason}-${index}`}
              fix={fix}
              applied={editApplied}
              onApply={
                review.verdict !== 'block_mock'
                  ? () => {
                      applyContentSafetyEditSuggestionMock(clipId, index)
                      onUpdated?.()
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}
      {review.verdict === 'needs_review' && (
        <div className="sh-safety-operator-actions" data-testid="safety-operator-actions">
          <button
            type="button"
            className="sh-admin-mock-btn"
            data-testid={`safety-approve-${clipId}`}
            onClick={() => {
              approveContentSafetyAfterReviewMock(clipId)
              onUpdated?.()
            }}
          >
            Approve after review (mock)
          </button>
          <button
            type="button"
            className="sh-admin-mock-btn"
            data-testid={`safety-reject-${clipId}`}
            onClick={() => {
              rejectContentSafetyDueToPolicyMock(clipId)
              onUpdated?.()
            }}
          >
            Reject policy (mock)
          </button>
        </div>
      )}
      {review.verdict === 'block_mock' && (
        <p className="sh-safety-blocked" data-testid="safety-blocked-msg">
          Blocked (mock) — upload preparation not available
        </p>
      )}
    </section>
  )
}
