/**
 * @param {{ riskScore: number; verdict: string }} props
 */
export function RiskScoreBadge({ riskScore, verdict }) {
  const tier =
    riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : riskScore > 0 ? 'low' : 'none'

  return (
    <span
      className={`sh-safety-risk sh-safety-risk-${tier}`}
      data-testid="safety-risk-badge"
      title={`Verdict: ${verdict}`}
    >
      Risk {riskScore}
      <span className="sh-safety-verdict">{verdict}</span>
    </span>
  )
}
