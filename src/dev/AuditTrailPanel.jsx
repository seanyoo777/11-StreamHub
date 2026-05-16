import { useMemo, useState } from 'react'
import { downloadAuditExportClient } from './downloadAuditExport.js'
import { getAuditTrailViewModel } from './viewModels.js'

/**
 * @param {{
 *   entries: readonly import('../validation/types.js').MockAuditEntry[];
 *   refreshKey?: number;
 * }} props
 */
export function AuditTrailPanel({ entries, refreshKey = 0 }) {
  const [kindFilter, setKindFilter] = useState('all')
  const [correlationQuery, setCorrelationQuery] = useState('')

  const vm = useMemo(
    () => getAuditTrailViewModel(entries, { kindFilter, correlationQuery }),
    // refreshKey forces recompute after self-test run appends new audit rows
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional bust when audit grows
    [entries, kindFilter, correlationQuery, refreshKey],
  )

  return (
    <section className="sh-audit-panel" aria-labelledby="audit-panel-heading">
      <header className="sh-audit-panel-header">
        <div>
          <h2 id="audit-panel-heading">Audit Trail</h2>
          <p className="sh-subtitle">
            Append-only mock — {vm.totalCount} total · {vm.filteredCount} shown
          </p>
        </div>
        <span className="sh-badge sh-badge-mock">MOCK ONLY</span>
      </header>

      <div className="sh-audit-filters" data-testid="audit-filters">
        <label className="sh-filter-field">
          <span>Kind</span>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            data-testid="audit-kind-filter"
          >
            {vm.kindOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="sh-filter-field sh-filter-grow">
          <span>correlation_id</span>
          <input
            type="search"
            placeholder="Search correlation_id…"
            value={correlationQuery}
            onChange={(e) => setCorrelationQuery(e.target.value)}
            data-testid="audit-correlation-search"
          />
        </label>
        <button
          type="button"
          className="sh-run-btn sh-export-btn"
          data-testid="audit-export-json"
          onClick={() => {
            downloadAuditExportClient(entries, { kindFilter, correlationQuery })
          }}
        >
          Export JSON (client-only)
        </button>
      </div>

      <div className="sh-audit-preview-block">
        <h3>Recent preview (last 6)</h3>
        <ul className="sh-audit-list" data-testid="audit-preview-list">
          {vm.preview.map((e) => (
            <li key={e.id}>
              <code>{e.kind}</code> — {e.correlation_id}
            </li>
          ))}
        </ul>
      </div>

      <div className="sh-audit-table-wrap">
        <h3>Full list</h3>
        <table className="sh-audit-table" data-testid="audit-full-table">
          <thead>
            <tr>
              <th>kind</th>
              <th>correlation_id</th>
              <th>actor</th>
              <th>server_ms</th>
            </tr>
          </thead>
          <tbody>
            {vm.filtered.length === 0 ? (
              <tr>
                <td colSpan={4}>No entries match filters</td>
              </tr>
            ) : (
              vm.filtered.map((e) => (
                <tr key={e.id} data-testid={`audit-row-${e.id}`}>
                  <td>
                    <code>{e.kind}</code>
                  </td>
                  <td>{e.correlation_id}</td>
                  <td>{e.actor_admin_id}</td>
                  <td>{e.server_ms}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
