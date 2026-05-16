/** Shorts queue — localStorage mock store schema */

import { CONTENT_SAFETY_NOTIFICATION_KINDS } from '../safety/contentSafetyTypes.js'
import { CLIP_TIMELINE_NOTIFICATION_KINDS } from '../editor/clipTimelineTypes.js'
import { WATCHER_NOTIFICATION_KINDS } from '../../watchers/watcherNotificationTypes.js'
import { STOCKPICK_READER_NOTIFICATION_KINDS } from '../../oneai/stockpick/stockPickReaderTypes.js'
import { VIRAL_NOTIFICATION_KINDS } from '../../viral/viralScoreTypes.js'
import { OVERLAY_SCENE_NOTIFICATION_KINDS } from '../../overlay-scenes/overlaySceneTypes.js'
import { TREND_READER_NOTIFICATION_KINDS } from '../../oneai/trends/trendReaderTypes.js'

export const STREAMHUB_SHORTS_QUEUE_STORAGE_KEY = 'streamhub.shorts_queue_v1'

export const SHORTS_QUEUE_STATUSES = Object.freeze([
  'queued',
  'reviewing',
  'approved_mock',
  'rejected_mock',
])

export const SHORTS_OVERLAY_SOURCES = Object.freeze([
  'streamhub',
  'oneai_broadcast',
  'tournament_winner',
])

export const SHORTS_CLIP_AUDIT_KINDS = Object.freeze([
  'clip.detected',
  'clip.review.started',
  'clip.approved.mock',
  'clip.rejected.mock',
])

export const SHORTS_NOTIFICATION_KINDS = Object.freeze([
  'shorts.clip.queued',
  'shorts.operator.review_needed',
  'shorts.clip.approved_mock',
  ...CONTENT_SAFETY_NOTIFICATION_KINDS,
  ...CLIP_TIMELINE_NOTIFICATION_KINDS,
  ...WATCHER_NOTIFICATION_KINDS,
  ...STOCKPICK_READER_NOTIFICATION_KINDS,
  ...VIRAL_NOTIFICATION_KINDS,
  ...OVERLAY_SCENE_NOTIFICATION_KINDS,
  ...TREND_READER_NOTIFICATION_KINDS,
])
