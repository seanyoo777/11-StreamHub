import { MockActionButton } from '../../../admin/pages/AdminPageCommon.jsx'
import { isStockPickCandidateImported } from '../stockPickImporter.js'

/**
 * @param {{
 *   candidate: import('../stockPickReaderTypes.js').StockPickShortsCandidate;
 *   onImport: () => void;
 * }} props
 */
export function StockPickCandidateCard({ candidate, onImport }) {
  const perf = candidate.performanceSnapshot ?? {}
  const imported = isStockPickCandidateImported(candidate.id)

  return (
    <article className="sh-watcher-card" data-testid={`stockpick-candidate-${candidate.id}`}>
      <header>
        <strong>{candidate.title}</strong>
        {candidate.reviewRequired !== false ? (
          <span className="sh-pill sh-pill-warn">review required</span>
        ) : (
          <span className="sh-pill">mock</span>
        )}
      </header>
      <p className="sh-stockpick-hook">{candidate.hookText}</p>
      <p>{candidate.caption}</p>
      <p className="sh-watcher-meta">
        duration: {candidate.suggestedDuration} · scenario: {candidate.scenarioKind}
        {perf.ticker ? ` · ${perf.ticker}` : ''}
        {typeof perf.returnPct === 'number' ? ` · return ${perf.returnPct}%` : ''}
        {typeof perf.maxReturnPct === 'number' ? ` · max ${perf.maxReturnPct}%` : ''}
      </p>
      <p className="sh-stockpick-risk">{candidate.riskText}</p>
      <MockActionButton
        label={imported ? 'Already in Shorts Queue' : 'Import to Shorts Queue'}
        testId={`import-stockpick-${candidate.id}`}
        disabled={imported}
        onClick={onImport}
      />
    </article>
  )
}
