import { useCallback, useState } from 'react'
import { MockActionButton } from '../../../admin/pages/AdminPageCommon.jsx'
import { ONEAI_VIRAL_TREND_RADAR_KEY } from '../trendReaderTypes.js'
import {
  loadViralTrendRadarWithAudit,
  readViralTrendRadarFromStorage,
} from '../trendReader.js'
import { importTrendCandidateToOverlayScene } from '../trendReaderImporter.js'
import { TrendOverlayCandidateCard } from './TrendOverlayCandidateCard.jsx'

function readTrendOverlayPanelState(notifyOnDetected) {
  return notifyOnDetected
    ? loadViralTrendRadarWithAudit({ notifyOnDetected: true })
    : readViralTrendRadarFromStorage()
}

/**
 * @param {{ onImported?: () => void }} props
 */
export function ViralTrendOverlayCandidatesPanel({ onImported }) {
  const [panelState, setPanelState] = useState(() => readTrendOverlayPanelState(false))

  const refresh = useCallback((notifyOnDetected = false) => {
    setPanelState(readTrendOverlayPanelState(notifyOnDetected))
  }, [])

  const { trends, lastScanAt, malformedSkipped, momentumIndex } = panelState

  const handleImport = (trend) => {
    importTrendCandidateToOverlayScene(trend)
    onImported?.()
    refresh(false)
  }

  const sorted = [...trends].sort((a, b) => b.overlayPriority - a.overlayPriority)

  return (
    <section className="sh-trend-panel sh-trend-overlay-panel" data-testid="viral-trend-overlay-candidates">
      <div className="sh-trend-header">
        <h2>Viral Trend Overlay Candidates</h2>
        <p className="sh-subtitle">
          Reads <code>{ONEAI_VIRAL_TREND_RADAR_KEY}</code> · queue by overlayPriority (mock)
        </p>
      </div>
      {typeof momentumIndex === 'number' ? (
        <p className="sh-watcher-meta" data-testid="trend-overlay-momentum-index">
          radar momentumIndex: {momentumIndex}
        </p>
      ) : null}
      <div className="sh-shorts-toolbar">
        <MockActionButton
          label="Reload overlay candidates"
          testId="reload-viral-trend-overlay-candidates"
          onClick={() => refresh(true)}
        />
      </div>
      {malformedSkipped > 0 ? (
        <p className="sh-subtitle">Skipped {malformedSkipped} malformed row(s)</p>
      ) : null}
      {lastScanAt ? <p className="sh-watcher-meta">lastScanAt: {lastScanAt}</p> : null}
      {sorted.length === 0 ? (
        <p data-testid="trend-overlay-empty-state">No viral trend overlay candidates.</p>
      ) : (
        <div className="sh-shorts-grid">
          {sorted.map((trend) => (
            <TrendOverlayCandidateCard
              key={trend.id}
              trend={trend}
              onImportOverlay={() => handleImport(trend)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
