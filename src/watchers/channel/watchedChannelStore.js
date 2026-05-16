import {
  STREAMHUB_CHANNEL_MOMENTS_STORAGE_KEY,
  STREAMHUB_WATCHED_CHANNELS_STORAGE_KEY,
  WATCHER_CHANNEL_MOCK_ONLY,
} from './watchedChannelTypes.js'

/** @type {Record<string, string>} */
let memoryStorage = {}

/** @type {{ getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } | null} */
let storageAdapter = null

export function setWatchedChannelStorageAdapter(adapter) {
  storageAdapter = adapter
}

function getStorage() {
  if (storageAdapter) return storageAdapter
  if (typeof localStorage !== 'undefined') {
    return {
      getItem: (k) => localStorage.getItem(k),
      setItem: (k, v) => localStorage.setItem(k, v),
    }
  }
  return {
    getItem: (k) => memoryStorage[k] ?? null,
    setItem: (k, v) => {
      memoryStorage[k] = v
    },
  }
}

function loadJson(key) {
  const raw = getStorage().getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveJson(key, rows) {
  getStorage().setItem(key, JSON.stringify(rows))
}

/**
 * @returns {import('./watchedChannelTypes.js').WatchedChannel[]}
 */
export function loadWatchedChannels() {
  return loadJson(STREAMHUB_WATCHED_CHANNELS_STORAGE_KEY)
}

/**
 * @param {import('./watchedChannelTypes.js').WatchedChannel[]} rows
 */
export function saveWatchedChannels(rows) {
  saveJson(STREAMHUB_WATCHED_CHANNELS_STORAGE_KEY, rows)
}

/**
 * @param {import('./watchedChannelTypes.js').WatchedChannel} channel
 */
export function upsertWatchedChannel(channel) {
  const rows = loadWatchedChannels()
  const idx = rows.findIndex((c) => c.channelId === channel.channelId)
  if (idx >= 0) rows[idx] = channel
  else rows.push(channel)
  saveWatchedChannels(rows)
  return channel
}

/**
 * @param {string} channelId
 */
export function getWatchedChannelById(channelId) {
  return loadWatchedChannels().find((c) => c.channelId === channelId) ?? null
}

/**
 * @returns {import('./watchedChannelTypes.js').ChannelMoment[]}
 */
export function loadChannelMoments() {
  return loadJson(STREAMHUB_CHANNEL_MOMENTS_STORAGE_KEY)
}

/**
 * @param {import('./watchedChannelTypes.js').ChannelMoment} moment
 */
export function appendChannelMoment(moment) {
  const rows = loadChannelMoments()
  rows.push(moment)
  saveJson(STREAMHUB_CHANNEL_MOMENTS_STORAGE_KEY, rows)
  return moment
}

export function seedDefaultWatchedChannels() {
  if (loadWatchedChannels().length > 0) return loadWatchedChannels()

  const seeds = [
    {
      channelId: 'ch_bak_hodu_mock',
      channelName: '박호두 mock channel',
      platform: 'youtube',
      watchMode: 'both',
      enabled: true,
      dailyClipLimit: 5,
      preferredFormats: ['shorts_60', 'highlight_300'],
      keywords: ['호두', '시장', '급등'],
      riskLevel: 'medium',
      mockOnly: WATCHER_CHANNEL_MOCK_ONLY,
    },
    {
      channelId: 'ch_invest_broadcast_mock',
      channelName: '투자 방송 mock channel',
      platform: 'soop',
      watchMode: 'live',
      enabled: true,
      dailyClipLimit: 8,
      preferredFormats: ['shorts_60'],
      keywords: ['수익률', '급등', '급락'],
      riskLevel: 'high',
      mockOnly: WATCHER_CHANNEL_MOCK_ONLY,
    },
    {
      channelId: 'ch_bj_event_mock',
      channelName: 'BJ 이벤트 mock channel',
      platform: 'twitch',
      watchMode: 'live',
      enabled: true,
      dailyClipLimit: 10,
      preferredFormats: ['shorts_60'],
      keywords: ['리액션', '쿠폰', '당첨'],
      riskLevel: 'low',
      mockOnly: WATCHER_CHANNEL_MOCK_ONLY,
    },
    {
      channelId: 'ch_news_briefing_mock',
      channelName: '뉴스 브리핑 mock channel',
      platform: 'youtube',
      watchMode: 'upload',
      enabled: true,
      dailyClipLimit: 6,
      preferredFormats: ['highlight_300'],
      keywords: ['긴급', '브리핑', '속보'],
      riskLevel: 'high',
      mockOnly: WATCHER_CHANNEL_MOCK_ONLY,
    },
  ]

  saveWatchedChannels(seeds)
  return seeds
}

export function resetWatchedChannelsForTests() {
  memoryStorage = {}
  storageAdapter = null
  saveWatchedChannels([])
  saveJson(STREAMHUB_CHANNEL_MOMENTS_STORAGE_KEY, [])
}
