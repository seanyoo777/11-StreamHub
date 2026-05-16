# StreamHub Shorts Queue — Auto Clip Detection (mock)

**버전:** 1.0 (MVP)  
**원칙:** mock-first · localStorage · no FFmpeg · no upload APIs

---

## 1. 개요

방송 중 “좋은 장면”을 **mock 감지**하여 Shorts Queue 후보를 생성하고, 운영자가 **승인/거절(mock)** 하는 흐름입니다.

| 금지 | 허용 |
|------|------|
| 실제 영상 분석 | mock detection 이벤트 |
| FFmpeg | mock duration (초) |
| YouTube/TikTok 업로드 | `approved_mock` 상태만 |

---

## 2. Auto Clip Detector

**모듈:** `src/shorts/autoClipDetector.js`

| reason key | 라벨 (UI) |
|------------|-----------|
| `surge_spike` | 급등 |
| `plunge_drop` | 급락 |
| `league_champion` | 리그 우승 |
| `high_pnl` | 큰 수익률 |
| `bj_reaction` | BJ 리액션 |
| `liquidation_alert` | liquidation alert |
| `ai_breaking_alert` | AI breaking alert |
| `oneai_stock_pick` | OneAI Stock Pick (import stub) |
| `viral_trend` | Viral Trend Radar (import stub) |

`detectMockClip({ reason, room_id?, overlay_source?, contentOverrides? })` → queue + **content safety review** + audit + notification + overlay localStorage sync.

**OneAI Stock Pick reader:** 03-OneAI 가 쓴 `oneai.stockpick.shorts_candidates_v1` 를 `/admin/shorts` 에서 읽고 **Import to Shorts Queue** — `docs/ONEAI_STOCK_PICK_SHORTS_READER.md`

**Viral Trend Radar reader:** 03-OneAI 가 쓴 `tetherget.viral_trend_radar_v1` 를 `/admin/shorts` · `/admin/overlay-scenes` 에서 읽고 import — `docs/VIRAL_TREND_READER.md`

---

## 3. Shorts Queue Store

**키:** `streamhub.shorts_queue_v1` (localStorage)

| status | 의미 |
|--------|------|
| `queued` | 감지 직후 |
| `reviewing` | 운영자 검수 시작 |
| `approved_mock` | mock 승인 |
| `rejected_mock` | mock 거절 |

**모듈:** `src/shorts/shortsQueueStore.js` · `src/shorts/shortsQueueOps.js`

---

## 4. Queue UI

**경로:** `/admin/shorts`

- **Viral Trend Candidates** — trend reader stub (`src/oneai/trends/*`)
- **OneAI Stock Pick Candidates** — reader stub (`src/oneai/stockpick/*`)
- clip preview card (mock)
- 발생 이유 · timestamp · overlay source · mock duration
- `SafetyReviewPanel` — risk score · flags · suggested fixes
- **Edit Clip** → `ClipTimelineEditor` (mock timeline, no FFmpeg)
- Start review / Approve (mock, safety-gated) / Reject (mock)

---

## 5. Overlay 연결

| source | payload builder | OneAI route (참고) |
|--------|-----------------|-------------------|
| `streamhub` | `buildStreamHubOverlayPayload` | `?overlay=event` |
| `oneai_broadcast` | `buildOneAiBroadcastOverlayPayload` | `?overlay=shorts` |
| `tournament_winner` | `buildTournamentWinnerOverlayPayload` | `?overlay=winner` |

**localStorage (client-only):**

- `oneai.streamhub.overlay` — 최신 overlay payload
- `oneai.streamhub.shorts_drafts_v1` — draft stub append

---

## 6. Notifications (in-memory mock)

| kind | 시점 |
|------|------|
| `shorts.clip.queued` | 감지 |
| `shorts.operator.review_needed` | review 시작 |
| `shorts.clip.approved_mock` | mock 승인 |
| `content.safety.*` | safety review (see `CONTENT_SAFETY_REVIEW.md`) |
| `stockpick.*` | OneAI stock pick reader (import / safety required) |

---

## 7. Content Safety gate

클립 `Approve (mock)` 전 `src/shorts/safety/contentSafetyReview.js` 가 verdict 확인:

- `pass` → 승인 가능
- `needs_review` → `approve_after_review.mock` 필요
- `block_mock` → 승인 불가

자세한 내용: `docs/CONTENT_SAFETY_REVIEW.md`

---

## 8. Audit (append-only)

| kind | 시점 |
|------|------|
| `clip.detected` | 감지 |
| `clip.review.started` | 검수 시작 |
| `clip.approved.mock` | 승인 |
| `clip.rejected.mock` | 거절 |

`src/shorts/shortsAudit.js` → `mockAuditTrail`

---

## 9. Self-Test suites

| Suite ID | 모듈 |
|----------|------|
| `contract.shorts-queue-schema` | `shortsQueueSchemaSuite.js` |
| `contract.content-safety-schema` | `contentSafetySchemaSuite.js` |
| `mock.content-safety-engine` | `mockContentSafetyEngineSuite.js` |
| `mock.content-safety-shorts-gate` | `contentSafetyShortsGateSuite.js` |
| `mock.auto-clip-detector` | `autoClipDetectorSuite.js` |
| `mock.shorts-operator-flow` | `shortsOperatorFlowSuite.js` |
| `contract.clip-timeline-schema` | `clipTimelineSchemaSuite.js` |
| `mock.clip-timeline-editor` | `clipTimelineEditorSuite.js` |
| `mock.stockpick-reader-flow` | `stockPickReaderFlowSuite.js` |
| `contract.viral-score-schema` | `viralScoreSchemaSuite.js` |
| `mock.viral-score-engine` | `viralScoreEngineSuite.js` |
| `contract.overlay-scene-schema` | `overlaySceneSchemaSuite.js` |
| `mock.overlay-scene-manager` | `overlaySceneManagerSuite.js` |
| `contract.viral-trend-reader-schema` | `viralTrendReaderSchemaSuite.js` |
| `mock.viral-trend-reader-flow` | `trendReaderFlowSuite.js` |

클립 카드: `ViralScoreBadge` · `priority_level` · `recommended_first` — queue는 viral score 순 정렬.

`npm run smoke` · `npm test` 에 포함.

---

## 관련 문서

- `docs/CONTENT_SAFETY_REVIEW.md`
- `docs/CLIP_TIMELINE_EDITOR.md`
- `docs/AI_CHANNEL_WATCHER.md`
- `docs/TREND_CONTENT_FACTORY.md`
- `docs/STREAMHUB_AI_BROADCAST.md`
- `docs/ONEAI_STOCK_PICK_SHORTS_READER.md`
- `docs/VIRAL_SCORE_ENGINE.md`
- `../03-OneAI/docs/ONEAI_STREAMHUB_BRIDGE.md`
