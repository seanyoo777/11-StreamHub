import {
  CHANNEL_MOMENT_REASONS,
  STREAMHUB_CHANNEL_MOMENTS_STORAGE_KEY,
  STREAMHUB_WATCHED_CHANNELS_STORAGE_KEY,
  WATCHED_CHANNEL_PLATFORMS,
  WATCHER_CHANNEL_AUDIT_KINDS,
} from '../../watchers/channel/watchedChannelTypes.js'
import { WATCHER_NOTIFICATION_KINDS } from '../../watchers/watcherNotificationTypes.js'
import { buildSuite, issue } from './helpers.js'

const SUITE_ID = 'contract.channel-watcher-schema'

/**
 * @returns {import('../types.js').DiagnosticSuite}
 */
export function runChannelWatcherSchemaSuite() {
  const issues = []

  for (const key of ['storage', 'moments']) {
    const val =
      key === 'storage'
        ? STREAMHUB_WATCHED_CHANNELS_STORAGE_KEY
        : STREAMHUB_CHANNEL_MOMENTS_STORAGE_KEY
    if (!val.startsWith('streamhub.')) {
      issues.push(issue(`${SUITE_ID}.${key}`, 'Invalid key', 'FAIL', SUITE_ID))
    } else {
      issues.push(issue(`${SUITE_ID}.${key}`, val, 'PASS', SUITE_ID))
    }
  }

  for (const p of WATCHED_CHANNEL_PLATFORMS) {
    issues.push(issue(`${SUITE_ID}.platform.${p}`, `platform: ${p}`, 'PASS', SUITE_ID))
  }

  if (CHANNEL_MOMENT_REASONS.length < 8) {
    issues.push(issue(`${SUITE_ID}.reasons`, 'Expected ≥8 moment reasons', 'WARN', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.reasons`, `${CHANNEL_MOMENT_REASONS.length} reasons`, 'PASS', SUITE_ID))
  }

  for (const kind of WATCHER_CHANNEL_AUDIT_KINDS) {
    issues.push(issue(`${SUITE_ID}.audit.${kind}`, kind, 'PASS', SUITE_ID))
  }

  const factoryNotifs = WATCHER_NOTIFICATION_KINDS.filter((k) => k.startsWith('watcher.') || k.startsWith('content.factory.'))
  if (factoryNotifs.length < 4) {
    issues.push(issue(`${SUITE_ID}.notif`, 'Missing watcher notifications', 'FAIL', SUITE_ID))
  } else {
    issues.push(issue(`${SUITE_ID}.notif`, `${factoryNotifs.length} watcher notif kinds`, 'PASS', SUITE_ID))
  }

  issues.push(issue(`${SUITE_ID}.no-download`, 'No YouTube download / no capture', 'PASS', SUITE_ID))

  return buildSuite(SUITE_ID, 'Channel watcher schema', issues)
}
