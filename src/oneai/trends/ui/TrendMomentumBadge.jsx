/**
 * @param {{
 *   trendLevel: import('../trendReaderTypes.js').TrendLevel;
 *   urgencyLevel?: import('../trendReaderTypes.js').TrendUrgencyLevel;
 *   momentumIndex?: number | null;
 * }} props
 */
export function TrendMomentumBadge({ trendLevel, urgencyLevel, momentumIndex }) {
  const levelClass =
    trendLevel === 'viral' || trendLevel === 'peak'
      ? 'sh-trend-momentum-hot'
      : trendLevel === 'cooling'
        ? 'sh-trend-momentum-cool'
        : 'sh-trend-momentum-rise'

  return (
    <span className="sh-trend-momentum-wrap" data-testid="trend-momentum-badge">
      <span className={`sh-pill sh-trend-momentum ${levelClass}`}>{trendLevel}</span>
      {urgencyLevel === 'urgent' || urgencyLevel === 'high' ? (
        <span className="sh-pill sh-pill-warn">{urgencyLevel}</span>
      ) : null}
      {typeof momentumIndex === 'number' ? (
        <span className="sh-pill">momentum {momentumIndex}</span>
      ) : null}
    </span>
  )
}
