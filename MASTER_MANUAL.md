# StreamHub Master Manual (11번)

**버전:** Shorts Queue MVP (auto clip mock)  
**기준일:** 2026-05-15

---

## 1. 프로젝트 개요

StreamHub는 라이브 시청·채팅·모더레이션·내부 후원(모의)을 위한 11번 플랫폼이다. 현재 단계는 **기획 계약 + mock-first 검증 골격**이며, 실송출·실결제·온체인은 범위 밖이다.

---

## 2. 문서 인덱스

| 문서 | 용도 |
|------|------|
| `docs/STREAMHUB_MASTER_PLAN.md` | 로드맵·범위 |
| `docs/STREAMHUB_SCREEN_FLOW.md` | 화면 IA·라우트 |
| `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` | 실시간 이벤트 |
| `docs/STREAMHUB_ROOM_CONTRACT.md` | 방·세션 |
| `docs/STREAMHUB_CHAT_MODERATION_POLICY.md` | 채팅·제재 |
| `docs/STREAMHUB_REALTIME_ERROR_CODES.md` | `SH_*` / `streamhub.error` |
| `docs/STREAMHUB_ADMIN_EVENT_SCHEMA.md` | `admin.streamhub.*` |
| `docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md` | 재연결·resync |
| `docs/STREAMHUB_SELF_TEST_VALIDATION.md` | 11번 self-test |
| `docs/GLOBAL_SELF_TEST_VALIDATION.md` | 모노레포 공통 정책 |

---

## 3. Self-Test (P0)

### 3.1 실행

```bash
npm run smoke    # contract validators, no network
npm test         # node:test on runStreamHubSelfTests
npm run lint
npm run build
```

### 3.2 진입점

- **`runStreamHubSelfTests(options?)`** — `src/validation/runStreamHubSelfTests.js`
- 반환: `overall`, `issueCount`, `warnCount`, `passCount`, `lastCheckedAtMs`, `mockOnly`, `suites`, `issues`

### 3.3 Dev UI

| 경로 | 설명 |
|------|------|
| `/dev/self-test` | Self-Test Center + Diagnostics + Audit + Room/Session + scenarios |
| `/admin/dashboard` | Mock admin shell (reports, rooms, fees, recovery) |
| `src/admin/MockAdminShell.jsx` | Admin nav + post-change banner |

### 3.4 Post-change validation

1. Mock admin action (`performMockAdminAction`)
2. `runPostChangeValidation` — `runStreamHubSelfTests()` **1회**
3. Audit append: `admin.streamhub.post_change_validation`
4. **금지:** polling, WebSocket, server upload

### 3.5 Audit export (client-only)

- `buildAuditExportPayload` / `downloadAuditExportClient`
- kind + correlation_id 필터 반영
- JSON 파일 로컬 다운로드만

### 3.6 Shorts Queue (auto clip mock)

| 경로 | 설명 |
|------|------|
| `/admin/shorts` | Shorts Queue UI |
| `src/shorts/autoClipDetector.js` | mock 감지 |
| `src/shorts/shortsQueueStore.js` | `streamhub.shorts_queue_v1` |
| `docs/SHORTS_QUEUE.md` | 상세 계약 |

### 3.6.5 Viral Score Engine (mock)

| 경로 | 설명 |
|------|------|
| `/admin/viral` | Viral score board · pattern learning · queue preview |
| `src/viral/*` | calculator · learning · queue bridge |
| `docs/VIRAL_SCORE_ENGINE.md` | scoring · priority · audit |

### 3.6.4 OneAI Stock Pick Shorts reader (stub)

| 경로 | 설명 |
|------|------|
| `/admin/shorts` | OneAI Stock Pick Candidates 섹션 |
| `src/oneai/stockpick/*` | reader · import · audit |
| `oneai.stockpick.shorts_candidates_v1` | 03-OneAI writer (read-only) |
| `docs/ONEAI_STOCK_PICK_SHORTS_READER.md` | import · safety · timeline |

### 3.6.6 Viral Trend Radar reader (stub)

| 경로 | 설명 |
|------|------|
| `/admin/shorts` | Viral Trend Candidates → Shorts import |
| `/admin/overlay-scenes` | Viral Trend Overlay Candidates |
| `src/oneai/trends/*` | reader · importer · audit · UI |
| `tetherget.viral_trend_radar_v1` | 03-OneAI writer (read-only) |
| `docs/VIRAL_TREND_READER.md` | shorts · overlay · audit · self-test |

### 3.6.3 AI Channel Watcher / Trend Factory (mock)

| 경로 | 설명 |
|------|------|
| `/admin/watchers` | Channel + Trend watcher UI |
| `src/watchers/channel/*` | WatchedChannel · moment detection |
| `src/watchers/trend/*` | Trend keywords · content factory |
| `docs/AI_CHANNEL_WATCHER.md` | channel watcher |
| `docs/TREND_CONTENT_FACTORY.md` | trend factory pipeline |

### 3.6.2 Clip Timeline Editor (mock)

| 경로 | 설명 |
|------|------|
| `src/shorts/editor/*` | timeline store · rules · export preview |
| `src/shorts/ui/ClipTimelineEditor.jsx` | in/out · formats · subtitles · thumbnails |
| `docs/CLIP_TIMELINE_EDITOR.md` | audit · notification · self-test |

### 3.6.1 Content Safety Review (upload guard mock)

| 경로 | 설명 |
|------|------|
| `src/shorts/safety/contentSafetyRules.js` | 금칙어·과장·정치·저작권 mock |
| `src/shorts/safety/contentSafetyReview.js` | review 생성 · operator mock · Shorts gate |
| `streamhub.content_safety_reviews_v1` | localStorage |
| `docs/CONTENT_SAFETY_REVIEW.md` | risk score · verdict · audit |

### 3.7 스위트 (30종)

| Suite ID | 모듈 |
|----------|------|
| `contract.route-ia` | `suites/routeContractSuite.js` |
| `contract.oneai-broadcast-bridge` | `suites/oneAiBroadcastBridgeSuite.js` |
| `contract.admin-ia` | `suites/adminIaRouteSuite.js` |
| `contract.shorts-queue-schema` | `suites/shortsQueueSchemaSuite.js` |
| `contract.content-safety-schema` | `suites/contentSafetySchemaSuite.js` |
| `mock.content-safety-engine` | `suites/mockContentSafetyEngineSuite.js` |
| `mock.content-safety-shorts-gate` | `suites/contentSafetyShortsGateSuite.js` |
| `mock.auto-clip-detector` | `suites/autoClipDetectorSuite.js` |
| `mock.shorts-operator-flow` | `suites/shortsOperatorFlowSuite.js` |
| `contract.clip-timeline-schema` | `suites/clipTimelineSchemaSuite.js` |
| `mock.clip-timeline-editor` | `suites/clipTimelineEditorSuite.js` |
| `contract.channel-watcher-schema` | `suites/channelWatcherSchemaSuite.js` |
| `contract.trend-watcher-schema` | `suites/trendWatcherSchemaSuite.js` |
| `mock.content-factory-flow` | `suites/contentFactoryFlowSuite.js` |
| `mock.stockpick-reader-flow` | `suites/stockPickReaderFlowSuite.js` |
| `contract.viral-score-schema` | `suites/viralScoreSchemaSuite.js` |
| `mock.viral-score-engine` | `suites/viralScoreEngineSuite.js` |
| `contract.overlay-scene-schema` | `suites/overlaySceneSchemaSuite.js` |
| `mock.overlay-scene-manager` | `suites/overlaySceneManagerSuite.js` |
| `contract.viral-trend-reader-schema` | `suites/viralTrendReaderSchemaSuite.js` |
| `mock.viral-trend-reader-flow` | `suites/trendReaderFlowSuite.js` |
| `contract.room-session` | `suites/roomSessionContractSuite.js` |
| `contract.chat-seq` | `suites/chatSeqContractSuite.js` |
| `contract.error-codes` | `suites/streamhubErrorContractSuite.js` |
| `contract.recovery-resync` | `suites/recoveryResyncContractSuite.js` |
| `contract.realtime-schema` | `suites/realtimeSchemaSuite.js` |
| `feature-flags` | `suites/featureFlagSuite.js` |
| `audit.append-only` | `suites/auditAppendOnlySuite.js` |
| `mock.admin.flow` | `suites/adminMockFlowSuite.js` |
| `mock.admin.force-end` | `suites/adminForceEndSuite.js` |
| `mock.scenario-toggle` | `suites/scenarioToggleSuite.js` |

### 3.8 Mock audit trail

- 모듈: `src/validation/mockAuditTrail.js`
- 연산: **append only** — `tryDeleteMockAuditEntry()` 는 항상 `false`
- Self-test 시 기록 kind:
  - `admin.streamhub.self_test_run`
  - `admin.streamhub.recovery_resync_check`

### 3.9 로드맵

| 순위 | 내용 |
|------|------|
| P0 | pure runner + smoke + test — 완료 |
| P1 | Dev Self-Test Center UI — 완료 |
| P2 | Audit Trail + Room/Session + Admin IA — 완료 |
| P3 | Mock admin shell + post-change + export — 완료 |
| Shorts MVP | Auto clip + queue + operator mock — 완료 |
| P4 | E2E·Vitest · optional real OneAI OBS wiring |

---

## 4. Agent 규칙

`AGENTS.md` — additive only, mock-first, global self-test 준수.

---

*11-StreamHub — planning + P0 validation skeleton.*
