/**
 * @param {{ candidate: import('../trend/trendWatcherTypes.js').TrendContentCandidate }} props
 */
export function TrendContentCandidateCard({ candidate }) {
  return (
    <article className="sh-watcher-card" data-testid={`trend-candidate-${candidate.trendId}`}>
      <header>
        <strong>{candidate.suggestedTitle}</strong>
        <span className="sh-pill">{candidate.urgency}</span>
      </header>
      <p>{candidate.suggestedAngle}</p>
      <p className="sh-watcher-meta">
        {candidate.keyword} · {candidate.category} · score {candidate.publicInterestScore} · risk{' '}
        {candidate.riskLevel}
      </p>
      <p className="sh-watcher-hashtags">{candidate.suggestedHashtags.join(' ')}</p>
    </article>
  )
}
