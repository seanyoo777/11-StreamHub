import { CONTENT_SAFETY_FLAG_KEYS } from '../safety/contentSafetyTypes.js'

const FLAG_LABELS = {
  misinformation_risk: 'Misinformation risk',
  copyright_risk: 'Copyright risk',
  political_sensitivity: 'Political sensitivity',
  financial_advice_risk: 'Financial advice risk',
  profanity: 'Profanity',
  personal_info: 'Personal info',
  platform_policy_risk: 'Platform policy risk',
}

/**
 * @param {{ flags: Record<string, boolean> }} props
 */
export function ContentFlagList({ flags }) {
  const active = CONTENT_SAFETY_FLAG_KEYS.filter((k) => flags[k])

  if (active.length === 0) {
    return <p className="sh-safety-flags-empty" data-testid="safety-flags-empty">No flags</p>
  }

  return (
    <ul className="sh-safety-flags" data-testid="safety-flag-list">
      {active.map((key) => (
        <li key={key} className="sh-safety-flag-item">
          {FLAG_LABELS[key] ?? key}
        </li>
      ))}
    </ul>
  )
}
