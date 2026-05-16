/**
 * @param {{
 *   fix: { field: string; before: string; after: string; reason: string };
 *   onApply?: () => void;
 *   applied?: boolean;
 * }} props
 */
export function SuggestedFixCard({ fix, onApply, applied }) {
  return (
    <div className="sh-safety-fix-card" data-testid={`safety-fix-${fix.reason}`}>
      <p className="sh-safety-fix-reason">{fix.reason}</p>
      <div className="sh-safety-before-after">
        <div>
          <span className="sh-safety-label">Before</span>
          <p>{fix.before}</p>
        </div>
        <div>
          <span className="sh-safety-label">After (mock)</span>
          <p>{fix.after}</p>
        </div>
      </div>
      {onApply && (
        <button
          type="button"
          className="sh-admin-mock-btn"
          data-testid={`apply-fix-${fix.reason}`}
          disabled={applied}
          onClick={onApply}
        >
          {applied ? 'Applied (mock)' : 'Apply suggestion (mock)'}
        </button>
      )}
    </div>
  )
}
