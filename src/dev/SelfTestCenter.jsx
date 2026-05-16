import { getSelfTestCenterViewModel } from './viewModels.js'

/**
 * @param {{
 *   result: import('../validation/types.js').SelfTestResult | null;
 *   running?: boolean;
 *   onRun: () => void;
 * }} props
 */
export function SelfTestCenter({ result, running = false, onRun }) {
  const vm = getSelfTestCenterViewModel(result)
  const lastChecked = vm.lastCheckedAtMs
    ? new Date(vm.lastCheckedAtMs).toLocaleString()
    : '—'
  const statusClass =
    vm.overall === 'PASS' || vm.overall === 'WARN' || vm.overall === 'FAIL'
      ? `sh-status-${vm.overall.toLowerCase()}`
      : 'sh-status-pending'

  return (
    <section className="sh-self-test-center" aria-labelledby="self-test-heading">
      <header className="sh-self-test-header">
        <div>
          <h1 id="self-test-heading">{vm.title}</h1>
          <p className="sh-subtitle">{vm.subtitle}</p>
        </div>
        <span className="sh-badge sh-badge-mock" data-testid="mock-only-badge">
          {vm.mockOnlyBadge}
        </span>
      </header>

      <div className="sh-summary-grid" data-testid="summary-grid">
        <div className={`sh-status-card ${statusClass}`} data-testid="overall-status">
          <span className="sh-label">Overall</span>
          <strong className="sh-value">{vm.overall}</strong>
        </div>
        <div className="sh-status-card" data-testid="issue-count">
          <span className="sh-label">Issue count (FAIL)</span>
          <strong className="sh-value">{vm.issueCount}</strong>
        </div>
        <div className="sh-status-card" data-testid="warn-count">
          <span className="sh-label">Warnings</span>
          <strong className="sh-value">{vm.warnCount}</strong>
        </div>
        <div className="sh-status-card" data-testid="last-checked">
          <span className="sh-label">Last checked</span>
          <strong className="sh-value sh-value-sm">{lastChecked}</strong>
        </div>
      </div>

      <button type="button" className="sh-run-btn" onClick={onRun} disabled={running}>
        {running ? 'Running…' : 'Run self-tests'}
      </button>
    </section>
  )
}
