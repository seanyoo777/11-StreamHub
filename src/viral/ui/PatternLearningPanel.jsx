import { getTopLearningPatterns } from '../viralLearningEngine.js'

export function PatternLearningPanel() {
  const patterns = getTopLearningPatterns()

  return (
    <section className="sh-viral-panel" data-testid="pattern-learning-panel">
      <h3>Pattern learning (mock)</h3>
      <ul className="sh-viral-pattern-list">
        {patterns.map((p) => (
          <li key={p.pattern} data-testid={`pattern-${p.pattern}`}>
            <strong>{p.label ?? p.pattern}</strong>
            <span>
              avg {p.averageScore} · success {p.successCount} · last{' '}
              {new Date(p.lastDetectedAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
