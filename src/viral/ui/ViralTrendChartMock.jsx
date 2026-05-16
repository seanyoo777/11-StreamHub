import { loadViralScores } from '../viralScoreStore.js'

export function ViralTrendChartMock() {
  const scores = [...loadViralScores()].sort((a, b) => b.viralScore - a.viralScore).slice(0, 6)

  return (
    <section className="sh-viral-panel" data-testid="viral-trend-chart-mock">
      <h3>Viral score chart (mock)</h3>
      <div className="sh-viral-chart" role="img" aria-label="Mock bar chart">
        {scores.length === 0 ? (
          <p>No scores yet — run watcher or detect clip.</p>
        ) : (
          scores.map((s) => (
            <div key={s.contentId} className="sh-viral-bar-wrap">
              <div className="sh-viral-bar" style={{ height: `${Math.max(8, s.viralScore)}%` }} />
              <span className="sh-viral-bar-label">{s.viralScore}</span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
