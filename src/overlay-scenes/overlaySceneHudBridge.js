import { readStockPickCandidatesFromStorage } from '../oneai/stockpick/stockPickReader.js'
import { loadShortsQueue } from '../shorts/shortsQueueStore.js'
import { getViralScoreByContentId } from '../viral/viralScoreStore.js'

/**
 * Mock Live HUD snapshot for overlay scene builder.
 * @returns {import('./overlaySceneTypes.js').OverlaySceneHudLinks & { tournamentRank: number; tournamentHandle: string }}
 */
export function buildLiveHudSnapshotMock() {
  const queue = loadShortsQueue()
  const top = queue[0]
  const viral = top ? getViralScoreByContentId(top.id) : null
  const stock = readStockPickCandidatesFromStorage().candidates[0]

  return {
    tournamentHud: true,
    tournamentRank: 1,
    tournamentHandle: '@mock_champion',
    viralScore: viral?.viralScore ?? top?.viral_score ?? null,
    viralPriority: viral?.priorityLevel ?? top?.priority_level ?? null,
    shortsQueueCount: queue.length,
    oneAiBriefingHint: top?.overlay_source === 'oneai_broadcast' ? top.preview_title : 'OneAI briefing (mock)',
    stockPickTicker: stock?.performanceSnapshot?.ticker ?? stock?.title ?? null,
    linkedClipId: top?.id ?? null,
  }
}

/** @typedef {import('../shorts/contracts/overlayBridge.js').ShortsClipRecord} ShortsClipRecord */

/**
 * @param {ShortsClipRecord} clip
 */
export function mapClipToOverlaySceneType(clip) {
  switch (clip.detection_reason) {
    case 'ai_breaking_alert':
      return 'breaking_news'
    case 'oneai_stock_pick':
      return 'ai_stock_pick'
    case 'viral_trend':
      return 'breaking_news'
    case 'league_champion':
      return 'tournament_result'
    case 'high_pnl':
    case 'surge_spike':
      return 'market_alert'
    case 'plunge_drop':
    case 'liquidation_alert':
      return 'liquidation_alert'
    case 'bj_reaction':
      return 'bj_reaction'
    default:
      return 'shorts_hook'
  }
}

/**
 * @param {ShortsClipRecord} clip
 */
export function buildHudLinksFromClip(clip) {
  const viral = getViralScoreByContentId(clip.id)
  return {
    ...buildLiveHudSnapshotMock(),
    viralScore: viral?.viralScore ?? clip.viral_score ?? null,
    viralPriority: viral?.priorityLevel ?? clip.priority_level ?? null,
    linkedClipId: clip.id,
  }
}
