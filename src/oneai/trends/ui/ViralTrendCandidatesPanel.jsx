import { useCallback, useState } from 'react'
import { MockActionButton } from '../../../admin/pages/AdminPageCommon.jsx'
import { ONEAI_VIRAL_TREND_RADAR_KEY } from '../trendReaderTypes.js'
import {
  loadViralTrendRadarWithAudit,
  readViralTrendRadarFromStorage,
} from '../trendReader.js'
import { importTrendCandidateToShortsQueue } from '../trendReaderImporter.js'
import { TrendCandidateCard } from './TrendCandidateCard.jsx'

function readTrendPanelState(notifyOnDetected) {
  return notifyOnDetected
    ? loadViralTrendRadarWithAudit({ notifyOnDetected: true })
    : readViralTrendRadarFromStorage()
}

/**
 * @param {{ onImported?: () => void }} props
 */
export function ViralTrendCandidatesPanel({ onImported }) {
  const [panelState, setPanelState] = useState(() => readTrendPanelState(true))

  const refresh = useCallback((notifyOnDetected = false) => {
    setPanelState(readTrendPanelState(notifyOnDetected))
  }, [])

  const { trends, lastScanAt, malformedSkipped, momentumIndex } = panelState

  const handleImport = (trend) => {
    importTrendCandidateToShortsQueue(trend)
    onImported?.()
    refresh(false)
  }

  const sorted = [...trends].sort((a, b) => b.shortPotentialScore - a.shortPotentialScore)

  return (
    <section className="sh-trend-panel" data-testid="viral-trend-candidates">
      <div className="sh-trend-header">
        <h2>Viral Trend Candidates</h2>
        <p className="sh-subtitle">
          Reads <code>{ONEAI_VIRAL_TREND_RADAR_KEY}</code> (03-OneAI Viral Trend Radar, mock-only)
        </p>
      </div>
      {typeof momentumIndex === 'number' ? (
        <p className="sh-watcher-meta" data-testid="trend-momentum-index">
          radar momentumIndex: {momentumIndex}
        </p>
      ) : null}
      <div className="sh-shorts-toolbar">
        <MockActionButton
          label="Reload trends"
          testId="reload-viral-trend-candidates"
          onClick={() => refresh(false)}
        />
      </div>
      {malformedSkipped > 0 ? (
        <p className="sh-subtitle" data-testid="trend-malformed-hint">
          Skipped {malformedSkipped} malformed row(s) (audit: trend.reader.malformed_skipped)
        </p>
      ) : null}
      {lastScanAt ? <p className="sh-watcher-meta">lastScanAt: {lastScanAt}</p> : null}
      {sorted.length === 0 ? (
        <p data-testid="trend-empty-state">
          No viral trend radar data in localStorage — seed from 03-OneAI or self-test.
        </p>
      ) : (
        <div className="sh-shorts-grid">
          {sorted.map((trend) => (
            <TrendCandidateCard
              key={trend.id}
              trend={trend}
              onImportShorts={() => handleImport(trend)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
