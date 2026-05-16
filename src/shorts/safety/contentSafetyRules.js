import {
  CONTENT_SAFETY_FLAG_KEYS,
  CONTENT_SAFETY_RISK_THRESHOLDS,
} from './contentSafetyTypes.js'

const BANNED_PHRASES = Object.freeze(['욕설', 'shit', 'fuck', '씨발'])

const FINANCIAL_HYPE_PHRASES = Object.freeze([
  '100% 수익',
  '무조건',
  '확정',
  'guaranteed profit',
  '원금 보장',
])

const EXAGGERATION_PHRASES = Object.freeze(['역대급', '충격', '폭발적', 'never seen'])

const COPYRIGHT_RISK_PHRASES = Object.freeze([
  '무단 복제',
  '전체 영상',
  'full reupload',
  'clip theft',
])

const MISINFORMATION_PHRASES = Object.freeze(['가짜뉴스', '확인되지 않음', 'unverified leak'])

const POLITICAL_KEYWORDS = Object.freeze(['선거', '정당', '대통령', 'election'])

const PERSONAL_INFO_PATTERNS = Object.freeze([
  /010-\d{4}-\d{4}/,
  /주민번호/,
  /phone number/i,
])

const PLATFORM_POLICY_PHRASES = Object.freeze(['도박 광고', 'illegal stream'])

const SOURCE_ATTRIBUTION_MARKERS = Object.freeze(['출처', 'source:', '기사', 'via @'])

/**
 * Mock rules engine — no external AI.
 * @param {{ title: string; caption: string; transcript: string; sourceType: string }} input
 */
export function runContentSafetyRules(input) {
  const combinedRaw = [input.title, input.caption, input.transcript].join(' ')

  /** @type {import('./contentSafetyTypes.js').ContentSafetyFlags} */
  const flags = Object.fromEntries(CONTENT_SAFETY_FLAG_KEYS.map((k) => [k, false]))

  let riskScore = 0
  const hits = []

  const add = (points, flagKey, label) => {
    riskScore += points
    if (flagKey) flags[flagKey] = true
    hits.push(label)
  }

  if (containsAny(combinedRaw, BANNED_PHRASES)) {
    add(25, 'profanity', 'banned_phrase')
  }

  if (containsAny(combinedRaw, FINANCIAL_HYPE_PHRASES)) {
    add(30, 'financial_advice_risk', 'financial_hype')
  }

  if (containsAny(combinedRaw, EXAGGERATION_PHRASES)) {
    add(15, 'misinformation_risk', 'exaggeration')
  }

  if (containsAny(combinedRaw, COPYRIGHT_RISK_PHRASES)) {
    add(25, 'copyright_risk', 'copyright_phrase')
  }

  if (containsAny(combinedRaw, MISINFORMATION_PHRASES)) {
    add(25, 'misinformation_risk', 'misinformation_phrase')
  }

  if (containsAny(combinedRaw, PLATFORM_POLICY_PHRASES)) {
    add(20, 'platform_policy_risk', 'platform_policy')
  }

  for (const pattern of PERSONAL_INFO_PATTERNS) {
    if (pattern.test(combinedRaw)) {
      add(30, 'personal_info', 'personal_info_pattern')
      break
    }
  }

  const politicalHit =
    input.sourceType === 'politics' || containsAny(combinedRaw, POLITICAL_KEYWORDS)
  if (politicalHit) {
    add(20, 'political_sensitivity', 'political_sensitivity')
  }

  const needsSource = ['news', 'market', 'politics'].includes(input.sourceType)
  if (needsSource && !containsAny(combinedRaw, SOURCE_ATTRIBUTION_MARKERS)) {
    add(15, 'misinformation_risk', 'missing_source_attribution')
  }

  riskScore = Math.min(100, riskScore)

  /** @type {import('./contentSafetyTypes.js').ContentSafetyVerdict} */
  let verdict = 'pass'
  if (riskScore >= CONTENT_SAFETY_RISK_THRESHOLDS.BLOCK_MOCK_MIN) {
    verdict = 'block_mock'
  } else if (riskScore >= CONTENT_SAFETY_RISK_THRESHOLDS.NEEDS_REVIEW_MIN) {
    verdict = 'needs_review'
  }

  return {
    riskScore,
    verdict,
    flags,
    suggestedFixes: buildSuggestedFixes(input, flags, hits),
    mockOnly: true,
    engine: 'streamhub.shorts_content_safety_rules_v1',
    hits,
  }
}

/** @deprecated alias — tests / legacy imports */
export const analyzeContentSafetyMock = runContentSafetyRules

/**
 * @param {string} haystack
 * @param {readonly string[]} needles
 */
function containsAny(haystack, needles) {
  const lower = haystack.toLowerCase()
  return needles.some((n) => lower.includes(n.toLowerCase()))
}

/**
 * @param {{ title: string; caption: string; transcript: string; sourceType: string }} input
 * @param {import('./contentSafetyTypes.js').ContentSafetyFlags} flags
 * @param {string[]} hits
 */
function buildSuggestedFixes(input, flags, hits) {
  /** @type {import('./contentSafetyTypes.js').ContentSafetySuggestedFix[]} */
  const fixes = []

  if (flags.financial_advice_risk) {
    fixes.push({
      field: 'caption',
      before: input.caption,
      after: input.caption
        .replace(/100% 수익/gi, '과거 성과 (mock)')
        .replace(/무조건|확정/gi, '참고용')
        .concat(' · 투자 권유 아님 (mock)'),
      reason: 'financial_hype',
    })
  }

  if (flags.misinformation_risk && hits.includes('missing_source_attribution')) {
    fixes.push({
      field: 'caption',
      before: input.caption,
      after: `${input.caption} · 출처: mock wire (검증 필요)`,
      reason: 'source_attribution',
    })
  }

  if (flags.copyright_risk) {
    fixes.push({
      field: 'title',
      before: input.title,
      after: input.title.replace(/전체 영상|무단 복제/gi, '[편집 하이라이트 mock]'),
      reason: 'copyright',
    })
  }

  if (flags.profanity) {
    fixes.push({
      field: 'caption',
      before: input.caption,
      after: input.caption.replace(/씨발|shit|fuck/gi, '[redacted]'),
      reason: 'profanity',
    })
  }

  return fixes
}
