/**
 * Mock title / hashtag / hook suggestions (no AI API).
 * @param {{ reason?: string; category?: string; channelName?: string; keyword?: string }} ctx
 */
export function buildContentSuggestions(ctx = {}) {
  const base = ctx.keyword ?? ctx.channelName ?? ctx.reason ?? 'mock'
  const titles = [
    `방금 나온 긴급 이슈 — ${base}`,
    '이 장면은 꼭 봐야 합니다',
    '오늘 시장이 흔들린 이유',
    'BJ 리액션 터진 순간',
    'TOP1 역전 장면',
  ]

  return {
    titles,
    shortsTitle: titles[0],
    highlightTitle: `5분 요약 — ${base}`,
    hashtags: ['#mock', '#streamhub', '#shorts', `#${String(base).replace(/\s+/g, '')}`],
    thumbnailText: titles[4],
    hook3sec: '잠깐! 이 장면 놓치면 안 됩니다 (mock)',
    mockOnly: true,
  }
}
