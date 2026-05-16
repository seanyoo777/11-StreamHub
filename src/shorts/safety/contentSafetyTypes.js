/** Content Safety Review — types & contracts (mock upload guard) */

export const STREAMHUB_CONTENT_SAFETY_STORAGE_KEY = 'streamhub.content_safety_reviews_v1'

export const CONTENT_SAFETY_SOURCE_TYPES = Object.freeze([
  'news',
  'market',
  'politics',
  'bj',
  'tournament',
  'fortune',
])

export const CONTENT_SAFETY_VERDICTS = Object.freeze([
  'pass',
  'needs_review',
  'block_mock',
])

export const CONTENT_SAFETY_FLAG_KEYS = Object.freeze([
  'misinformation_risk',
  'copyright_risk',
  'political_sensitivity',
  'financial_advice_risk',
  'profanity',
  'personal_info',
  'platform_policy_risk',
])

export const CONTENT_SAFETY_OPERATOR_DECISIONS = Object.freeze([
  'approve_after_review.mock',
  'reject_due_to_policy.mock',
  'edit_suggestion_applied.mock',
])

export const CONTENT_SAFETY_AUDIT_KINDS = Object.freeze([
  'content.safety.reviewed',
  'content.safety.flagged',
  'content.safety.approved_after_review',
  'content.safety.blocked_mock',
])

export const CONTENT_SAFETY_NOTIFICATION_KINDS = Object.freeze([
  'content.safety.high_risk',
  'content.safety.review_required',
  'content.safety.approved_after_review',
])

export const CONTENT_SAFETY_RISK_THRESHOLDS = Object.freeze({
  NEEDS_REVIEW_MIN: 40,
  BLOCK_MOCK_MIN: 70,
})

export const CONTENT_SAFETY_MOCK_ONLY = true

/**
 * @typedef {typeof CONTENT_SAFETY_SOURCE_TYPES[number]} ContentSafetySourceType
 * @typedef {typeof CONTENT_SAFETY_VERDICTS[number]} ContentSafetyVerdict
 * @typedef {typeof CONTENT_SAFETY_OPERATOR_DECISIONS[number]} ContentSafetyOperatorDecision
 * @typedef {Record<typeof CONTENT_SAFETY_FLAG_KEYS[number], boolean>} ContentSafetyFlags
 * @typedef {{ field: 'title' | 'caption' | 'transcript'; before: string; after: string; reason: string }} ContentSafetySuggestedFix
 * @typedef {Object} ContentSafetyReview
 * @property {string} id
 * @property {string} clipId
 * @property {string} title
 * @property {string} caption
 * @property {string} transcript
 * @property {ContentSafetySourceType} sourceType
 * @property {number} riskScore
 * @property {ContentSafetyVerdict} verdict
 * @property {ContentSafetyFlags} flags
 * @property {ContentSafetySuggestedFix[]} suggestedFixes
 * @property {ContentSafetyOperatorDecision | null} operatorDecision
 * @property {number | null} operatorDecisionAtMs
 * @property {string} correlationId
 * @property {number} reviewedAtMs
 * @property {boolean} mockOnly
 */

/**
 * @param {unknown} value
 * @returns {value is ContentSafetySourceType}
 */
export function isContentSafetySourceType(value) {
  return typeof value === 'string' && CONTENT_SAFETY_SOURCE_TYPES.includes(value)
}

/**
 * @param {unknown} value
 * @returns {value is ContentSafetyVerdict}
 */
export function isContentSafetyVerdict(value) {
  return typeof value === 'string' && CONTENT_SAFETY_VERDICTS.includes(value)
}

/**
 * @param {Record<string, unknown>} flags
 */
export function validateContentSafetyFlags(flags) {
  for (const key of CONTENT_SAFETY_FLAG_KEYS) {
    if (typeof flags[key] !== 'boolean') {
      throw new Error(`Invalid content safety flag: ${key}`)
    }
  }
}
