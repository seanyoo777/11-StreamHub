/** Watcher + content factory notification kinds (merged into shorts notifications) */

export const WATCHER_NOTIFICATION_KINDS = Object.freeze([
  'watcher.moment.detected',
  'watcher.trend.detected',
  'watcher.urgent_issue.detected',
  'content.factory.short_created',
  'content.factory.daily_limit_reached',
  'content.factory.safety_review_required',
])
