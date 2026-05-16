import {
  CONTENT_SAFETY_RISK_THRESHOLDS,
} from '../../shorts/safety/contentSafetyTypes.js'
import { analyzeContentSafetyMock } from '../../shorts/safety/contentSafetyRules.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'mock.content-safety-engine'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runMockContentSafetyEngineSuite() {
  const issues = []

  const safe = analyzeContentSafetyMock({
    title: 'Highlight',
    caption: '출처: mock wire · neutral recap',
    transcript: '',
    sourceType: 'news',
  })
  if (safe.verdict === 'pass' && safe.riskScore < CONTENT_SAFETY_RISK_THRESHOLDS.NEEDS_REVIEW_MIN) {
    issues.push(issue(`${SUITE_ID}.safe`, `Safe pass riskScore=${safe.riskScore}`, 'PASS', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.safe`, `Unexpected verdict ${safe.verdict}`, 'FAIL', SUITE_ID))
  }

  const hype = analyzeContentSafetyMock({
    title: 'Trade tip',
    caption: '100% 수익 무조건 확정',
    transcript: '',
    sourceType: 'market',
  })
  if (!hype.flags.financial_advice_risk) {
    issues.push(issue(`${SUITE_ID}.hype.flag`, 'Missing financial flag', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.hype.flag`, 'Financial hype flagged', 'PASS', SUITE_ID))
  }
  if (hype.riskScore < 30) {
    issues.push(issue(`${SUITE_ID}.hype.score`, 'Hype score too low', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.hype.score`, `Hype riskScore=${hype.riskScore}`, 'PASS', SUITE_ID))
  }

  const political = analyzeContentSafetyMock({
    title: 'Election recap',
    caption: '선거 정당 대통령 이슈',
    transcript: '',
    sourceType: 'politics',
  })
  if (!political.flags.political_sensitivity) {
    issues.push(issue(`${SUITE_ID}.political`, 'Political flag missing', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.political`, 'Political sensitivity OK', 'PASS', SUITE_ID))
  }

  const banned = analyzeContentSafetyMock({
    title: 'Bad',
    caption: '씨발',
    transcript: '',
    sourceType: 'bj',
  })
  if (!banned.flags.profanity) {
    issues.push(issue(`${SUITE_ID}.banned`, 'Banned phrase not detected', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.banned`, 'Banned phrase detected', 'PASS', SUITE_ID))
  }

  const block = analyzeContentSafetyMock({
    title: 'Scam',
    caption: '100% 수익 무조건 확정 · 무단 복제 전체 영상 · 010-1234-5678',
    transcript: '가짜뉴스',
    sourceType: 'market',
  })
  if (block.verdict !== 'block_mock') {
    issues.push(issue(`${SUITE_ID}.block`, `Expected block_mock got ${block.verdict}`, 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.block`, 'block_mock verdict OK', 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.no-upload`, 'Engine mock-only (no upload API)', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Mock content safety engine', issues)
}
