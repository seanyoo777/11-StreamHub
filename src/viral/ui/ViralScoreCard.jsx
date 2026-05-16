/**
 * @param {{ score: import('../viralScoreTypes.js').ViralScore }} props
 */
export function ViralScoreCard({ score }) {
  return (
    <article className="sh-viral-card" data-testid={`viral-card-${score.contentId}`}>
      <header>
        <strong>{score.contentId}</strong>
        <span className="sh-pill">{score.recommendation}</span>
      </header>
      <p className="sh-viral-meta">
        viral {score.viralScore} · CTR {score.ctrScore} · engagement {score.engagementScore} · urgency{' '}
        {score.urgencyScore}
      </p>
      <p className="sh-viral-meta">
        pattern {score.repeatPatternScore} · risk {score.riskScore} · {score.priorityLevel}
        {score.recommendedFirst ? ' · FIRST' : ''}
      </p>
    </article>
  )
}
