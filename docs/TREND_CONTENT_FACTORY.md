# Trend Content Factory (mock)

**원칙:** no news crawl · no external API · operator approval before publish

---

## Trend sources (mock)

| sourceType | Label |
|------------|--------|
| `realtime_search_mock` | 실시간 검색어 |
| `latest_news_mock` | 최신 뉴스 |
| `market_surge_drop_mock` | 시장 급등락 |
| `politics_issue_mock` | 정치 이슈 |
| `global_issue_mock` | 글로벌 이슈 |
| `crypto_stock_keyword_mock` | 코인/주식 |

---

## TrendContentCandidate

`keyword` · `category` · `urgency` · `publicInterestScore` · `suggestedTitle` · `suggestedScript` · `suggestedHashtags` · `riskLevel`

**Storage:** `streamhub.trend_candidates_v1`

---

## Content Factory pipeline

```
watcher detects moment/trend
  → detectMockClip (Shorts Queue)
  → createContentSafetyReviewForClip
  → openClipTimelineMock
  → operator review (/admin/shorts)
```

**모듈:** `src/watchers/trend/trendContentFactory.js`

---

## Daily limit

- Per-channel `dailyClipLimit`
- Global `globalDailyClipLimit` in factory settings
- Counter: `streamhub.content_factory_daily_v1` (resets by date)

---

## Title / hashtag mock

`buildContentSuggestions()` — 5 titles · shorts/highlight titles · hashtags · thumbnail text · 3s hook

---

## Safety guard

정치/뉴스/금융 → caption에 `출처: mock` · Content Safety Review 필수 · `block_mock` → upload prep 불가

---

## Audit / Notification

**Audit:** `watcher.trend.detected` · `content.factory.draft_created` · `content.factory.daily_limit_reached` · `content.factory.safety_blocked`

**Notification:** `watcher.moment.detected` · `watcher.trend.detected` · `watcher.urgent_issue.detected` · `content.factory.short_created` · `content.factory.daily_limit_reached` · `content.factory.safety_review_required`

---

## Self-Test

| Suite | Topic |
|-------|--------|
| `contract.channel-watcher-schema` | channel domain |
| `contract.trend-watcher-schema` | trend domain |
| `mock.content-factory-flow` | queue · safety · timeline |
| `mock.viral-score-engine` | viral score · queue priority |

Draft 생성 후 `scoreAndPrioritizeClip` — `docs/VIRAL_SCORE_ENGINE.md`
