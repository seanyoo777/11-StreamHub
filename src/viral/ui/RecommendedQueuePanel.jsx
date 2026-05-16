import { buildViralRecommendationsMock } from '../viralLearningEngine.js'
import { loadViralScores } from '../viralScoreStore.js'
import { getPriorityQueuePreview } from '../viralQueueBridge.js'

export function RecommendedQueuePanel() {
  const { queue } = getPriorityQueuePreview()
  const scores = loadViralScores()
  const tips = buildViralRecommendationsMock(scores)

  return (
    <section className="sh-viral-panel" data-testid="recommended-queue-panel">
      <h3>Auto recommendations (mock)</h3>
      <ul className="sh-viral-rec-list">
        {tips.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <h4>Priority queue preview</h4>
      <ol className="sh-viral-queue-preview" data-testid="priority-queue-preview">
        {queue.slice(0, 8).map((clip) => (
          <li key={clip.id}>
            {clip.preview_title} — viral {clip.viral_score ?? '—'} ({clip.priority_level ?? 'P3'})
            {clip.recommended_first ? ' ★' : ''}
          </li>
        ))}
      </ol>
    </section>
  )
}
