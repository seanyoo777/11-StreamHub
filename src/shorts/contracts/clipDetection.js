/** Mock auto clip detection reasons — no video analysis */

export const CLIP_DETECTION_REASONS = Object.freeze({
  SURGE_SPIKE: 'surge_spike',
  PLUNGE_DROP: 'plunge_drop',
  LEAGUE_CHAMPION: 'league_champion',
  HIGH_PNL: 'high_pnl',
  BJ_REACTION: 'bj_reaction',
  LIQUIDATION_ALERT: 'liquidation_alert',
  AI_BREAKING_ALERT: 'ai_breaking_alert',
  ONEAI_STOCK_PICK: 'oneai_stock_pick',
  VIRAL_TREND: 'viral_trend',
})

/** @type {Record<string, string>} */
export const CLIP_DETECTION_LABELS = Object.freeze({
  [CLIP_DETECTION_REASONS.SURGE_SPIKE]: '급등',
  [CLIP_DETECTION_REASONS.PLUNGE_DROP]: '급락',
  [CLIP_DETECTION_REASONS.LEAGUE_CHAMPION]: '리그 우승',
  [CLIP_DETECTION_REASONS.HIGH_PNL]: '큰 수익률',
  [CLIP_DETECTION_REASONS.BJ_REACTION]: 'BJ 리액션',
  [CLIP_DETECTION_REASONS.LIQUIDATION_ALERT]: 'liquidation alert',
  [CLIP_DETECTION_REASONS.AI_BREAKING_ALERT]: 'AI breaking alert',
  [CLIP_DETECTION_REASONS.ONEAI_STOCK_PICK]: 'OneAI Stock Pick',
  [CLIP_DETECTION_REASONS.VIRAL_TREND]: 'Viral Trend Radar',
})

export const CLIP_DETECTION_REASON_KEYS = Object.freeze(Object.values(CLIP_DETECTION_REASONS))

export const DEFAULT_MOCK_CLIP_DURATION_SEC = 15
