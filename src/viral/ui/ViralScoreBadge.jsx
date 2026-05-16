/**
 * @param {{ viralScore?: number; recommendation?: string; priorityLevel?: string; recommendedFirst?: boolean }} props
 */
export function ViralScoreBadge({ viralScore, recommendation, priorityLevel, recommendedFirst }) {
  if (viralScore == null) return null

  const recClass =
    recommendation === 'strong_candidate'
      ? 'sh-viral-strong'
      : recommendation === 'watch_candidate'
        ? 'sh-viral-watch'
        : 'sh-viral-low'

  return (
    <div className="sh-viral-badges" data-testid="viral-score-badge">
      <span className={`sh-pill sh-viral-score ${recClass}`}>Viral {viralScore}</span>
      {priorityLevel ? <span className="sh-pill sh-viral-priority">{priorityLevel}</span> : null}
      {recommendedFirst ? (
        <span className="sh-pill sh-viral-first" data-testid="recommended-first-badge">
          Recommended first
        </span>
      ) : null}
    </div>
  )
}
