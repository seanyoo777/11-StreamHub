import { useCallback, useState } from 'react'
import { MockActionButton } from '../../../admin/pages/AdminPageCommon.jsx'
import { ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY } from '../stockPickReaderTypes.js'
import {
  loadStockPickCandidatesWithAudit,
  readStockPickCandidatesFromStorage,
} from '../stockPickReader.js'
import { importStockPickCandidateToQueue } from '../stockPickImporter.js'
import { StockPickCandidateCard } from './StockPickCandidateCard.jsx'

function readStockPickPanelState(notifyOnFound) {
  return notifyOnFound
    ? loadStockPickCandidatesWithAudit({ notifyOnFound: true })
    : readStockPickCandidatesFromStorage()
}

/**
 * @param {{ onImported?: () => void }} props
 */
export function StockPickCandidatesPanel({ onImported }) {
  const [panelState, setPanelState] = useState(() => readStockPickPanelState(true))

  const refresh = useCallback((notifyOnFound = false) => {
    setPanelState(readStockPickPanelState(notifyOnFound))
  }, [])

  const { candidates, lastGeneratedAt, malformedSkipped } = panelState

  const handleImport = (candidate) => {
    importStockPickCandidateToQueue(candidate)
    onImported?.()
    refresh(false)
  }

  return (
    <section className="sh-stockpick-panel" data-testid="oneai-stockpick-candidates">
      <div className="sh-stockpick-header">
        <h2>OneAI Stock Pick Candidates</h2>
        <p className="sh-subtitle">
          Reads <code>{ONEAI_STOCKPICK_SHORTS_CANDIDATES_KEY}</code> (03-OneAI writer, mock-only)
        </p>
      </div>
      <div className="sh-shorts-toolbar">
        <MockActionButton
          label="Reload candidates"
          testId="reload-stockpick-candidates"
          onClick={() => refresh(false)}
        />
      </div>
      {malformedSkipped > 0 ? (
        <p className="sh-subtitle" data-testid="stockpick-malformed-hint">
          Skipped {malformedSkipped} malformed row(s) (audit: stockpick.reader.malformed_skipped)
        </p>
      ) : null}
      {lastGeneratedAt ? (
        <p className="sh-watcher-meta">lastGeneratedAt: {lastGeneratedAt}</p>
      ) : null}
      {candidates.length === 0 ? (
        <p data-testid="stockpick-empty-state">
          No OneAI stock pick candidates in localStorage — seed from 03-OneAI or self-test.
        </p>
      ) : (
        <div className="sh-shorts-grid">
          {candidates.map((candidate) => (
            <StockPickCandidateCard
              key={candidate.id}
              candidate={candidate}
              onImport={() => handleImport(candidate)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
