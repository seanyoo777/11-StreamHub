import { getDiagnosticsViewModel } from './viewModels.js'

/**
 * @param {{
 *   result: import('../validation/types.js').SelfTestResult | null;
 * }} props
 */
export function DiagnosticsPanel({ result }) {
  const rows = getDiagnosticsViewModel(result)
  const suiteById = new Map((result?.suites ?? []).map((s) => [s.id, s]))

  return (
    <section className="sh-diagnostics" aria-labelledby="diagnostics-heading">
      <h2 id="diagnostics-heading">Diagnostics Panel</h2>
      <p className="sh-subtitle">Contract suites — mock data only</p>

      <ul className="sh-diagnostics-list" data-testid="diagnostics-list">
        {rows.map((row) => {
          const suite = suiteById.get(row.suiteId)

          return (
            <li
              key={row.suiteId}
              className={`sh-diagnostic-row sh-diagnostic-${String(row.status).toLowerCase()}`}
              data-testid={`diagnostic-${row.suiteId}`}
            >
              <div className="sh-diagnostic-head">
                <strong>{row.label}</strong>
                <span className={`sh-pill sh-pill-${String(row.status).toLowerCase()}`}>
                  {row.status}
                </span>
              </div>
              <p className="sh-diagnostic-desc">{row.description}</p>
              <p className="sh-diagnostic-meta">
                <code>{row.suiteId}</code> — pass {row.passCount} / warn {row.warnCount} / fail{' '}
                {row.failCount}
              </p>
              {suite && suite.issues.length > 0 && (
                <details className="sh-diagnostic-details">
                  <summary>Issues ({suite.issues.length})</summary>
                  <ul>
                    {suite.issues
                      .filter((i) => i.status !== 'PASS')
                      .slice(0, 8)
                      .map((i) => (
                        <li key={i.id} className={`sh-issue sh-issue-${i.status.toLowerCase()}`}>
                          [{i.status}] {i.message}
                        </li>
                      ))}
                  </ul>
                </details>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
