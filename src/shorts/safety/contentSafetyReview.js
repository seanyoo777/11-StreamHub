import { appendMockAuditEntry } from '../../validation/mockAuditTrail.js'
import { appendShortsNotification } from '../shortsNotifications.js'
import { runContentSafetyRules } from './contentSafetyRules.js'
import {
  getContentSafetyReviewByClipId,
  upsertContentSafetyReview,
} from './contentSafetyStore.js'
import {
  CONTENT_SAFETY_AUDIT_KINDS,
  CONTENT_SAFETY_MOCK_ONLY,
  CONTENT_SAFETY_OPERATOR_DECISIONS,
} from './contentSafetyTypes.js'

/**
 * @param {import('../contracts/overlayBridge.js').ShortsClipRecord} clip
 */
export function inferSourceTypeFromClip(clip) {
  switch (clip.detection_reason) {
    case 'ai_breaking_alert':
      return 'news'
    case 'bj_reaction':
      return 'bj'
    case 'league_champion':
      return 'tournament'
    default:
      return 'market'
  }
}

/**
 * @param {import('../contracts/overlayBridge.js').ShortsClipRecord} clip
 * @param {{ title?: string; caption?: string; transcript?: string; sourceType?: string }} [overrides]
 */
export function buildContentDraftFromClip(clip, overrides = {}) {
  const sourceType = overrides.sourceType ?? inferSourceTypeFromClip(clip)
  return {
    title: overrides.title ?? clip.preview_title,
    caption:
      overrides.caption ??
      `Mock caption — ${clip.detection_reason} · ${clip.mock_duration_sec}s highlight`,
    transcript: overrides.transcript ?? '',
    sourceType,
  }
}

/**
 * @param {typeof CONTENT_SAFETY_AUDIT_KINDS[number]} kind
 * @param {{ clipId: string; reviewId: string; correlationId: string; payload?: Record<string, unknown> }} input
 */
function appendContentSafetyAudit(kind, input) {
  if (!CONTENT_SAFETY_AUDIT_KINDS.includes(kind)) {
    throw new Error(`Invalid content safety audit kind: ${kind}`)
  }
  return appendMockAuditEntry({
    kind,
    actor_admin_id: 'mock_content_safety_operator',
    correlation_id: input.correlationId,
    payload: {
      clip_id: input.clipId,
      review_id: input.reviewId,
      mockOnly: true,
      ...(input.payload ?? {}),
    },
  })
}

/**
 * @param {import('../contracts/overlayBridge.js').ShortsClipRecord} clip
 * @param {{ title?: string; caption?: string; transcript?: string; sourceType?: string }} [contentOverrides]
 */
export function createContentSafetyReviewForClip(clip, contentOverrides = {}) {
  const draft = buildContentDraftFromClip(clip, contentOverrides)
  const analysis = runContentSafetyRules(draft)
  const reviewedAtMs = Date.now()
  const reviewId = `safety_review_${clip.id}_${reviewedAtMs}`

  /** @type {import('./contentSafetyTypes.js').ContentSafetyReview} */
  const review = {
    id: reviewId,
    clipId: clip.id,
    title: draft.title,
    caption: draft.caption,
    transcript: draft.transcript,
    sourceType: /** @type {import('./contentSafetyTypes.js').ContentSafetySourceType} */ (
      draft.sourceType
    ),
    riskScore: analysis.riskScore,
    verdict: analysis.verdict,
    flags: analysis.flags,
    suggestedFixes: analysis.suggestedFixes,
    operatorDecision: null,
    operatorDecisionAtMs: null,
    correlationId: clip.correlation_id,
    reviewedAtMs,
    mockOnly: CONTENT_SAFETY_MOCK_ONLY,
  }

  upsertContentSafetyReview(review)

  appendContentSafetyAudit('content.safety.reviewed', {
    clipId: clip.id,
    reviewId,
    correlationId: clip.correlation_id,
    payload: {
      verdict: review.verdict,
      riskScore: review.riskScore,
      sourceType: review.sourceType,
    },
  })

  const activeFlags = Object.entries(review.flags)
    .filter(([, v]) => v)
    .map(([k]) => k)

  if (activeFlags.length > 0) {
    appendContentSafetyAudit('content.safety.flagged', {
      clipId: clip.id,
      reviewId,
      correlationId: clip.correlation_id,
      payload: { flags: activeFlags, riskScore: review.riskScore },
    })
  }

  if (review.verdict === 'block_mock') {
    appendContentSafetyAudit('content.safety.blocked_mock', {
      clipId: clip.id,
      reviewId,
      correlationId: clip.correlation_id,
      payload: { riskScore: review.riskScore },
    })
    appendShortsNotification({
      kind: 'content.safety.high_risk',
      clip_id: clip.id,
      correlation_id: clip.correlation_id,
      payload: { verdict: review.verdict, riskScore: review.riskScore },
    })
  } else if (review.verdict === 'needs_review') {
    appendShortsNotification({
      kind: 'content.safety.review_required',
      clip_id: clip.id,
      correlation_id: clip.correlation_id,
      payload: { riskScore: review.riskScore },
    })
  }

  return review
}

/**
 * @param {string} clipId
 */
export function getShortsUploadGuardState(clipId) {
  const review = getContentSafetyReviewByClipId(clipId)
  if (!review) {
    return { canPrepareUpload: false, reason: 'missing_safety_review', review: null }
  }
  if (review.verdict === 'block_mock') {
    return { canPrepareUpload: false, reason: 'block_mock', review }
  }
  if (review.verdict === 'needs_review') {
    const approved =
      review.operatorDecision === CONTENT_SAFETY_OPERATOR_DECISIONS[0]
    return {
      canPrepareUpload: approved,
      reason: approved ? 'approved_after_review' : 'operator_review_required',
      review,
    }
  }
  return { canPrepareUpload: true, reason: 'pass', review }
}

/**
 * @param {string} clipId
 */
export function assertCanApproveShortsClipMock(clipId) {
  const state = getShortsUploadGuardState(clipId)
  if (!state.canPrepareUpload) {
    throw new Error(`Shorts approve blocked (mock): ${state.reason}`)
  }
  return state.review
}

/**
 * @param {string} clipId
 */
export function approveContentSafetyAfterReviewMock(clipId) {
  const review = getContentSafetyReviewByClipId(clipId)
  if (!review) throw new Error(`Safety review not found for clip: ${clipId}`)
  if (review.verdict === 'block_mock') {
    throw new Error('Cannot approve blocked content (mock)')
  }

  review.operatorDecision = 'approve_after_review.mock'
  review.operatorDecisionAtMs = Date.now()
  upsertContentSafetyReview(review)

  appendContentSafetyAudit('content.safety.approved_after_review', {
    clipId,
    reviewId: review.id,
    correlationId: review.correlationId,
    payload: { riskScore: review.riskScore, priorVerdict: review.verdict },
  })

  appendShortsNotification({
    kind: 'content.safety.approved_after_review',
    clip_id: clipId,
    correlation_id: review.correlationId,
    payload: { review_id: review.id },
  })

  return review
}

/**
 * @param {string} clipId
 */
export function rejectContentSafetyDueToPolicyMock(clipId) {
  const review = getContentSafetyReviewByClipId(clipId)
  if (!review) throw new Error(`Safety review not found for clip: ${clipId}`)

  review.operatorDecision = 'reject_due_to_policy.mock'
  review.operatorDecisionAtMs = Date.now()
  upsertContentSafetyReview(review)

  appendContentSafetyAudit('content.safety.blocked_mock', {
    clipId,
    reviewId: review.id,
    correlationId: review.correlationId,
    payload: { operator: 'reject_due_to_policy.mock' },
  })

  return review
}

/**
 * @param {string} clipId
 * @param {number} suggestionIndex
 */
export function applyContentSafetyEditSuggestionMock(clipId, suggestionIndex = 0) {
  const review = getContentSafetyReviewByClipId(clipId)
  if (!review) throw new Error(`Safety review not found for clip: ${clipId}`)

  const fix = review.suggestedFixes[suggestionIndex]
  if (!fix) throw new Error(`No suggested fix at index ${suggestionIndex}`)

  if (fix.field === 'title') review.title = fix.after
  if (fix.field === 'caption') review.caption = fix.after
  if (fix.field === 'transcript') review.transcript = fix.after

  const analysis = runContentSafetyRules({
    title: review.title,
    caption: review.caption,
    transcript: review.transcript,
    sourceType: review.sourceType,
  })

  review.riskScore = analysis.riskScore
  review.verdict = analysis.verdict
  review.flags = analysis.flags
  review.suggestedFixes = analysis.suggestedFixes
  review.operatorDecision = 'edit_suggestion_applied.mock'
  review.operatorDecisionAtMs = Date.now()
  upsertContentSafetyReview(review)

  appendContentSafetyAudit('content.safety.reviewed', {
    clipId,
    reviewId: review.id,
    correlationId: review.correlationId,
    payload: { reapplied: true, verdict: review.verdict, riskScore: review.riskScore },
  })

  return review
}
