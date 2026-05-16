import { MockActionButton } from '../../../admin/pages/AdminPageCommon.jsx'
import {
  buildTrendBreakingTitle,
  buildTrendTickerCaption,
  isTrendImportedToOverlay,
  mapTrendToOverlaySceneType,
} from '../trendReaderImporter.js'
import { TrendMomentumBadge } from './TrendMomentumBadge.jsx'

/**
 * @param {{
 *   trend: import('../trendReaderTypes.js').TrendReaderSnapshot;
 *   onImportOverlay: () => void;
 * }} props
 */
export function TrendOverlayCandidateCard({ trend, onImportOverlay }) {
  const imported = isTrendImportedToOverlay(trend.id)
  const sceneType = mapTrendToOverlaySceneType(trend)

  return (
    <article className="sh-watcher-card" data-testid={`trend-overlay-candidate-${trend.id}`}>
      <header>
        <strong>{buildTrendBreakingTitle(trend)}</strong>
        <span className="sh-pill">scene: {sceneType}</span>
        <TrendMomentumBadge trendLevel={trend.trendLevel} urgencyLevel={trend.urgencyLevel} />
      </header>
      <p>{buildTrendTickerCaption(trend)}</p>
      <p className="sh-watcher-meta">
        overlay priority {trend.overlayPriority} · keyword {trend.keyword}
        {trend.mockOnly ? ' · mock-only' : ''}
      </p>
      <MockActionButton
        label={imported ? 'Already in Overlay Queue' : 'Import to Overlay Scene'}
        testId={`import-trend-overlay-${trend.id}`}
        disabled={imported}
        onClick={onImportOverlay}
      />
    </article>
  )
}
