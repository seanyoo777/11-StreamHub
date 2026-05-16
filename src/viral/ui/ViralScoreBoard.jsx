import { loadViralScores } from '../viralScoreStore.js'
import { prioritizeShortsQueueByViralScore } from '../viralQueueBridge.js'
import { MockActionButton } from '../../admin/pages/AdminPageCommon.jsx'
import { ViralScoreCard } from './ViralScoreCard.jsx'
import { PatternLearningPanel } from './PatternLearningPanel.jsx'
import { RecommendedQueuePanel } from './RecommendedQueuePanel.jsx'
import { ViralTrendChartMock } from './ViralTrendChartMock.jsx'

/**
 * @param {{ onUpdated?: () => void }} [props]
 */
export function ViralScoreBoard({ onUpdated }) {
  const scores = [...loadViralScores()].sort((a, b) => b.viralScore - a.viralScore)

  return (
    <div className="sh-viral-board" data-testid="viral-score-board">
      <div className="sh-shorts-toolbar">
        <MockActionButton
          label="Re-prioritize Shorts Queue"
          testId="reprioritize-viral-queue"
          onClick={() => {
            prioritizeShortsQueueByViralScore()
            onUpdated?.()
          }}
        />
      </div>
      <div className="sh-viral-grid">
        <ViralTrendChartMock />
        <PatternLearningPanel />
        <RecommendedQueuePanel />
      </div>
      <h3>Scored content</h3>
      <div className="sh-shorts-grid">
        {scores.length === 0 ? (
          <p>No viral scores — content factory or shorts detection will populate.</p>
        ) : (
          scores.map((score) => <ViralScoreCard key={score.contentId} score={score} />)
        )}
      </div>
    </div>
  )
}
