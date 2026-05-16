import { STREAMHUB_CONTENT_FACTORY_SETTINGS_KEY } from '../trend/trendWatcherTypes.js'

/** @type {Record<string, string>} */
let settingsMemory = {}

/**
 * @typedef {Object} ContentFactorySettings
 * @property {boolean} autoQueueEnabled
 * @property {boolean} operatorApprovalRequired
 * @property {boolean} channelWatcherEnabled
 * @property {boolean} trendWatcherEnabled
 * @property {number} globalDailyClipLimit
 * @property {Record<string, boolean>} categoryEnabled
 * @property {string[]} blockedKeywords
 * @property {boolean} mockOnly
 */

const DEFAULT_SETTINGS = {
  autoQueueEnabled: true,
  operatorApprovalRequired: true,
  channelWatcherEnabled: true,
  trendWatcherEnabled: true,
  globalDailyClipLimit: 50,
  categoryEnabled: {
    market: true,
    politics: true,
    social: true,
    entertainment: true,
    crypto: true,
    global: true,
  },
  blockedKeywords: ['불법', '도박 광고'],
  mockOnly: true,
}

/**
 * @returns {ContentFactorySettings}
 */
export function loadContentFactorySettings() {
  const raw =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(STREAMHUB_CONTENT_FACTORY_SETTINGS_KEY)
      : settingsMemory[STREAMHUB_CONTENT_FACTORY_SETTINGS_KEY]
  if (!raw) return { ...DEFAULT_SETTINGS, categoryEnabled: { ...DEFAULT_SETTINGS.categoryEnabled } }
  try {
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed, categoryEnabled: { ...DEFAULT_SETTINGS.categoryEnabled, ...parsed.categoryEnabled } }
  } catch {
    return { ...DEFAULT_SETTINGS, categoryEnabled: { ...DEFAULT_SETTINGS.categoryEnabled } }
  }
}

/**
 * @param {ContentFactorySettings} settings
 */
export function saveContentFactorySettings(settings) {
  const json = JSON.stringify(settings)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STREAMHUB_CONTENT_FACTORY_SETTINGS_KEY, json)
  } else {
    settingsMemory[STREAMHUB_CONTENT_FACTORY_SETTINGS_KEY] = json
  }
}

const DAILY_KEY = 'streamhub.content_factory_daily_v1'

/**
 * @returns {{ date: string; byChannel: Record<string, number>; global: number }}
 */
function loadDailyCounts() {
  const raw =
    typeof localStorage !== 'undefined' ? localStorage.getItem(DAILY_KEY) : settingsMemory[DAILY_KEY]
  const today = new Date().toISOString().slice(0, 10)
  if (!raw) return { date: today, byChannel: {}, global: 0 }
  try {
    const parsed = JSON.parse(raw)
    if (parsed.date !== today) return { date: today, byChannel: {}, global: 0 }
    return parsed
  } catch {
    return { date: today, byChannel: {}, global: 0 }
  }
}

function saveDailyCounts(row) {
  const json = JSON.stringify(row)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(DAILY_KEY, json)
  } else {
    settingsMemory[DAILY_KEY] = json
  }
}

/**
 * @param {string} channelId
 * @param {number} channelLimit
 */
export function isDailyClipLimitReached(channelId, channelLimit) {
  const settings = loadContentFactorySettings()
  const daily = loadDailyCounts()
  if (daily.global >= settings.globalDailyClipLimit) return true
  const chCount = daily.byChannel[channelId] ?? 0
  return chCount >= channelLimit
}

/**
 * @param {string} channelId
 */
export function incrementDailyClipCount(channelId) {
  const daily = loadDailyCounts()
  daily.byChannel[channelId] = (daily.byChannel[channelId] ?? 0) + 1
  daily.global += 1
  saveDailyCounts(daily)
  return daily
}

/**
 * @param {string} keyword
 */
export function isWatcherKeywordBlocked(keyword) {
  const settings = loadContentFactorySettings()
  const lower = keyword.toLowerCase()
  return settings.blockedKeywords.some((b) => lower.includes(b.toLowerCase()))
}

/**
 * @param {string} category
 */
export function isTrendCategoryEnabled(category) {
  const settings = loadContentFactorySettings()
  return settings.categoryEnabled[category] !== false
}

export function resetContentFactoryRulesForTests() {
  settingsMemory = {}
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STREAMHUB_CONTENT_FACTORY_SETTINGS_KEY)
    localStorage.removeItem(DAILY_KEY)
  }
}
