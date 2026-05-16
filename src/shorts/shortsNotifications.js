import { SHORTS_NOTIFICATION_KINDS } from './contracts/shortsQueueSchema.js'

/**
 * @typedef {Object} ShortsNotification
 * @property {string} id
 * @property {typeof SHORTS_NOTIFICATION_KINDS[number]} kind
 * @property {number} server_ms
 * @property {string} clip_id
 * @property {string} correlation_id
 * @property {Record<string, unknown>} payload
 */

/** @type {ShortsNotification[]} */
const notifications = []

let seq = 0

/**
 * @param {Omit<ShortsNotification, 'id' | 'server_ms'> & { server_ms?: number }} partial
 */
export function appendShortsNotification(partial) {
  if (!SHORTS_NOTIFICATION_KINDS.includes(partial.kind)) {
    throw new Error(`Invalid notification kind: ${partial.kind}`)
  }
  seq += 1
  const row = {
    id: `shorts_notif_${seq}`,
    server_ms: partial.server_ms ?? Date.now(),
    kind: partial.kind,
    clip_id: partial.clip_id,
    correlation_id: partial.correlation_id,
    payload: partial.payload ?? {},
  }
  notifications.push(row)
  return row
}

/** @returns {readonly ShortsNotification[]} */
export function getShortsNotifications() {
  return notifications
}

export function resetShortsNotificationsForTests() {
  notifications.length = 0
  seq = 0
}
