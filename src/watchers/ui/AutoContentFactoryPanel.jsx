/**
 * @param {{ onRunChannel: () => void; onRunTrend: () => void; lastResult?: string }} props
 */
export function AutoContentFactoryPanel({ onRunChannel, onRunTrend, lastResult }) {
  return (
    <section className="sh-watcher-panel" data-testid="auto-content-factory-panel">
      <h3>Content Factory (mock pipeline)</h3>
      <p className="sh-watcher-mock-note">
        moment/trend → Shorts Queue → Safety Review → Timeline draft (no download / no upload)
      </p>
      <div className="sh-watcher-factory-actions">
        <button type="button" className="sh-admin-mock-btn" data-testid="run-channel-pipeline" onClick={onRunChannel}>
          Run channel pipeline
        </button>
        <button type="button" className="sh-admin-mock-btn" data-testid="run-trend-pipeline" onClick={onRunTrend}>
          Run trend pipeline
        </button>
      </div>
      {lastResult && (
        <p className="sh-watcher-last-result" data-testid="factory-last-result">
          {lastResult}
        </p>
      )}
    </section>
  )
}
