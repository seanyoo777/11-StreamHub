# Viral Score Engine (mock)

**버전:** 1.0 (MVP)  
**원칙:** mock-first · localStorage · no YouTube/analytics API · operator approval before publish

---

## 1. 개요

Channel Watcher / Trend Factory / Shorts detection 으로 생성된 콘텐츠 후보에 **바이럴 점수**를 부여하고 Shorts Queue **우선순위**를 자동 계산합니다.

| 금지 | 허용 |
|------|------|
| YouTube Analytics API | keyword/mock 가중치 |
| 실제 조회수 API | pattern learning snapshot |
| 자동 업로드 | queue sort + operator review |

---

## 2. 도메인 (`src/viral/`)

| 모듈 | 역할 |
|------|------|
| `viralScoreTypes.js` | ViralScore · PatternLearningSnapshot · audit/notif |
| `viralScoreStore.js` | `streamhub.viral_scores_v1` · `streamhub.viral_patterns_v1` |
| `viralScoreCalculator.js` | CTR/engagement/urgency/controversy/pattern 점수 |
| `viralLearningEngine.js` | 반복 성공 패턴 학습 mock |
| `viralScoreAudit.js` | append-only audit |
| `viralQueueBridge.js` | clip scoring + queue prioritize |

### ViralScore 필드

`viralScore`, `ctrScore`, `engagementScore`, `urgencyScore`, `controversyScore`, `repeatPatternScore`, `riskScore`, `recommendation` (`strong_candidate` | `watch_candidate` | `low_priority`), `priorityLevel` (P0–P3), `recommendedFirst`

### Keyword 가산 (mock)

긴급 · 폭락 · 급등 · TOP1 · 실시간 · 반전 · AI 포착 · 공포/탐욕 · 브리핑 · 리액션 · 속보 등

---

## 3. 파이프라인

```
watcher / detectMockClip / stock pick import
  → createContentSafetyReviewForClip
  → scoreAndPrioritizeClip
  → learnFromViralScore
  → prioritizeShortsQueueByViralScore
  → operator review (/admin/shorts)
```

Factory 경로는 `detectMockClip({ skipViralScore: true })` 후 richer metadata 로 `scoreAndPrioritizeClip` 호출.

---

## 4. UI

| 경로 | 컴포넌트 |
|------|----------|
| `/admin/viral` | ViralScoreBoard · ViralTrendChartMock · PatternLearningPanel · RecommendedQueuePanel |
| `/admin/shorts` | ShortsClipCard + ViralScoreBadge · priority-sorted queue |

---

## 5. Audit / Notification

| Audit | Notification |
|-------|----------------|
| `viral.score.calculated` | `viral.high_candidate.detected` |
| `viral.content.recommended` | `viral.recommended.first` |
| `viral.pattern.learned` | `viral.urgent_trend.detected` |
| `viral.queue.prioritized` | |

---

## 6. Self-Test

| Suite ID | 파일 |
|----------|------|
| `contract.viral-score-schema` | `viralScoreSchemaSuite.js` |
| `mock.viral-score-engine` | `viralScoreEngineSuite.js` |

`tests/viralScore.test.js` · `npm run smoke`

---

## 관련 문서

- `docs/AI_CHANNEL_WATCHER.md`
- `docs/TREND_CONTENT_FACTORY.md`
- `docs/SHORTS_QUEUE.md`
- `docs/CONTENT_SAFETY_REVIEW.md`
