/**
 * @param {{
 *   keywords: import('../trend/trendWatcherTypes.js').TrendKeyword[];
 *   onDetect: (keywordId: string) => void;
 * }} props
 */
export function TrendKeywordPanel({ keywords, onDetect }) {
  return (
    <section className="sh-watcher-panel" data-testid="trend-keyword-panel">
      <h3>Trend keywords (mock)</h3>
      <ul className="sh-trend-keyword-list">
        {keywords.map((k) => (
          <li key={k.keywordId}>
            <strong>{k.keyword}</strong>
            <span>
              {k.category} · {k.sourceType}
            </span>
            <button
              type="button"
              className="sh-admin-mock-btn"
              data-testid={`detect-trend-${k.keywordId}`}
              disabled={!k.enabled}
              onClick={() => onDetect(k.keywordId)}
            >
              Detect trend
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
