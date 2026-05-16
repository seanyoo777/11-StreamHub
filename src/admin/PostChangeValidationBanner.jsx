/**
 * @param {{
 *   lastResult: import('../validation/postChangeValidation.js').PostChangeValidationResult | null;
 * }} props
 */
export function PostChangeValidationBanner({ lastResult }) {
  if (!lastResult) return null

  const { validationStatus, actionKind, correlationId, selfTestResult } = lastResult

  return (
    <aside
      className={`sh-post-change-banner sh-post-change-${validationStatus.toLowerCase()}`}
      data-testid="post-change-banner"
    >
      <strong>Post-change validation</strong>
      <span>
        Action <code>{actionKind}</code> → self-test <strong>{validationStatus}</strong>
        {' '}
        (FAIL issues: {selfTestResult.issueCount})
      </span>
      <span className="sh-post-change-corr">
        correlation: <code>{correlationId}</code>
      </span>
      <span className="sh-badge sh-badge-mock">MOCK ONLY · no polling · no WS</span>
    </aside>
  )
}
