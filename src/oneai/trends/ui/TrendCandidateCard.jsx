import { MockActionButton } from '../../../admin/pages/AdminPageCommon.jsx'
import {
  buildTrendBreakingTitle,
  buildTrendShortsHook,
  buildTrendTickerCaption,
  isTrendImportedToShorts,
} from '../trendReaderImporter.js'
import { TrendMomentumBadge } from './TrendMomentumBadge.jsx'

/**
 * @param {{
 *   trend: import('../trendReaderTypes.js').TrendReaderSnapshot;
 *   onImportShorts: () => void;
 * }} props
 */
export function TrendCandidateCard({ trend, onImportShorts }) {
  const imported = isTrendImportedToShorts(trend.id)

  return (
    <article className="sh-watcher-card" data-testid={`trend-candidate-${trend.id}`}>
      <header>
        <strong>{buildTrendBreakingTitle(trend)}</strong>
        <TrendMomentumBadge trendLevel={trend.trendLevel} urgencyLevel={trend.urgencyLevel} />
      </header>
      <p className="sh-trend-hook">{buildTrendShortsHook(trend)}</p>
      <p>{buildTrendTickerCaption(trend)}</p>
      <p className="sh-watcher-meta">
        category: {trend.category} · shorts {trend.shortPotentialScore} · briefing{' '}
        {trend.briefingPotentialScore} · overlay priority {trend.overlayPriority}
        {trend.relatedThemes.length > 0 ? ` · themes: ${trend.relatedThemes.join(', ')}` : ''}
      </p>
      <MockActionButton
        label={imported ? 'Already in Shorts Queue' : 'Import to Shorts Queue'}
        testId={`import-trend-shorts-${trend.id}`}
        disabled={imported}
        onClick={onImportShorts}
      />
    </article>
  )
}
