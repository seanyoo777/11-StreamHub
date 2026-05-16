# StreamHub Self-Test & Validation — 11번 전용

**문서 버전:** 1.4  
**기준일:** 2026-05-15  
**단계:** P3 Mock admin shell + post-change validation (mock-first, additive only)

**상위 정책:** `docs/GLOBAL_SELF_TEST_VALIDATION.md`  
**전제 기획:** `STREAMHUB_MASTER_PLAN.md`, `STREAMHUB_REALTIME_EVENT_SCHEMA.md` (v1.2), `STREAMHUB_ROOM_CONTRACT.md` (v1.2), `STREAMHUB_CHAT_MODERATION_POLICY.md`, `STREAMHUB_REALTIME_ERROR_CODES.md`, `STREAMHUB_ADMIN_EVENT_SCHEMA.md`, `STREAMHUB_RECOVERY_RESYNC_CONTRACT.md`

**절대 금지:** 실거래·실정산·실온체인·실송출/WebSocket/RTMP 서버·DB·production destructive action·uncontrolled realtime loop.

---

## 1. StreamHub 검증 철학

| 항목 | 정책 |
|------|------|
| Live 없이 검증 | **mock 이벤트 피드** + **계약 스키마 정합** + **순수 함수 validator** 로 PASS/WARN/FAIL |
| 오류 vs recovery | `streamhub.error` (`SH_*`/`GH_*`) 검증과 **resync 스냅샷** 검증은 **별 스위트** (`RECOVERY_RESYNC_CONTRACT`, `REALTIME_ERROR_CODES`) |
| 관리자 | `admin.streamhub.*` 는 **append-only mock audit** + 조치 후 **post-change validator** |
| additive | 기존 화면·계약 필드 **삭제 금지**; 플래그로 비활성만 |

---

## 2. 필수 5대 표면 (목표 구현)

| 표면 | StreamHub 역할 (mock) | 구현 위치 |
|------|------------------------|-----------|
| **Self-Test Center** | 계약·플래그·관리자 mock 시나리오 일괄 실행 | `src/dev/SelfTestCenter.jsx` · `/dev/self-test` |
| **Diagnostics Panel** | 스위트별 PASS/WARN/FAIL·issue 요약 | `src/dev/DiagnosticsPanel.jsx` |
| **Audit Trail** | `admin.streamhub.*` + 운영 조치 **append-only** 목록 | `src/dev/AuditTrailPanel.jsx` — kind 필터·correlation 검색·preview 6건 |
| **Feature Flag Validation** | `STREAMHUB_RECOVERY_RESYNC_CONTRACT` §10 플래그·env | `src/validation/contracts/featureFlags.js` + suite `feature-flags` |
| **Smoke Test** | `npm run build` · `npm run lint` · `npm test` · 계약 스모크 | `scripts/smoke.mjs` · `npm run smoke` |

**UI 공통 요소:** PASS / WARN / FAIL · **issue count** · **last checked** · **MOCK ONLY** 배지.

---

## 3. Self-Test 스위트 (계약 검증, mock)

WebSocket·live 송출 **없이** 실행 가능한 스위트 초안.

| Suite ID | 검증 대상 | PASS 조건 (요약) |
|----------|-----------|------------------|
| `contract.realtime-schema` | `STREAMHUB_REALTIME_EVENT_SCHEMA` 필수 `event_type` | §2 카탈로그·§2.11 ErrorEnvelope 필드 존재 |
| `contract.room-session` | `ROOM_CONTRACT` ↔ `room.status.updated` 매핑 | §3.2 표와 REALTIME §2.10 **동형** |
| `contract.chat-seq` | `CHAT_MODERATION_POLICY` `chat_seq` / `channel_id` | `stream_chat:{room_id}` 규칙 |
| `contract.error-codes` | `SH_*` 표 vs `streamhub.error` | `SH_STREAM_*` 등 정의·fatal/retryable 일관 |
| `contract.admin-events` | `ADMIN_EVENT_SCHEMA` 8종 `kind` | envelope 필수 필드 |
| `contract.recovery` | `RECOVERY_RESYNC` vs `streamhub.error` 직교 | resync ≠ error 단독 완료 |
| `contract.moderation-orthogonal` | `moderation.*` ≠ session OFF AIR 단독 | 문서 §1.3·CHAT §4 일치 |
| `mock.admin.report-flow` | `report_created` → `report_status_changed` | mock 큐 OPEN→ACTIONED (메모리) |
| `mock.admin.force-end` | `stream_force_ended` + `stream.ended` reason | `admin_terminated` 페어 |
| `feature-flags` | recovery 플래그 기본값 | 문서 §10 플래그 읽기·fallback |

실패 시 **FAIL**, 경고(미구현·deprecated)는 **WARN**.

---

## 4. Diagnostics Panel (mock)

표시 항목 초안:

| 섹션 | 내용 |
|------|------|
| **Room / Session** | mock `room_id`, `live_state`, `active_session_id`, `StreamSession.state` |
| **Realtime** | 마지막 mock `event_type`, `schema_version` |
| **Chat** | `channel_id`, `last_chat_seq`, 갭 여부 |
| **Errors** | 최근 `streamhub.error` `code` (mock) |
| **Resync** | `APP_SYNCED` 여부, `since_chat_seq` (mock) |
| **Issues** | issue count, 목록 |

---

## 5. Audit Trail (append-only mock)

| 항목 | 정책 |
|------|------|
| 저장 | in-memory 또는 `localStorage` **mock only** |
| 연산 | **append** 만; 수정·삭제 UI는 “보정 이벤트”로 **새 행** |
| 필드 | `kind`, `server_ms`, `actor_admin_id`, `correlation_id`, `payload` 요약 (`ADMIN_EVENT_SCHEMA`) |
| 연계 | `admin.streamhub.chat_audit`, `report_status_changed`, `stream_force_ended` 등 |

---

## 6. Feature Flag Validation

`STREAMHUB_RECOVERY_RESYNC_CONTRACT.md` §10 및 구현 env 예:

| Flag (예) | self-test 검증 |
|-----------|----------------|
| `streamhub.recovery.gap_replay_enabled` | boolean·기본값 |
| `streamhub.recovery.force_full_on_reconnect` | reconnect 시 full snapshot 경로 |
| `streamhub.recovery.reset_chat_seq_on_new_session` | 세션 경계 |
| `VITE_STREAMHUB_MOCK_ONLY` | **항상 true** in dev (MOCK ONLY 배지) |

---

## 7. Smoke / build 흐름

| Gate | 현재(11번) | 비고 |
|------|-----------|------|
| `npm run build` | Vite | 유지 |
| `npm run lint` | eslint | `src/validation`, `scripts`, `tests` 포함 |
| `npm test` | `node --test tests/` | `runStreamHubSelfTests` |
| `npm run smoke` | `node scripts/smoke.mjs` | mock-only contract validators |

**문서 단계:** 계약 JSON/fixture 없이도 **markdown 상호참조 lint** 스크립트를 smoke 로 둘 수 있음(구현 RFC).

---

## 8. 관리자 post-change 검증 (mock)

| 조치 | post-change validator (mock) |
|------|------------------------------|
| 신고 `ACTIONED` | 큐 `status` + optional `chat_audit` 행 존재 |
| `user_muted` / `user_banned` | audit + (선택) `moderation.*` mock 이벤트 |
| `stream_force_ended` | mock `StreamSession.state` ENDED + `stream.ended` fixture |
| `room_locked` | mock `room` locked 플래그 |

실패 시 Self-Test Center **FAIL**; live WS **불필요**.

---

## 9. 금지·직교 (재확인)

- Self-test 가 **실제 RTMP·결제·온체인** 을 호출하지 않음.
- Self-test 가 **uncontrolled WS subscribe loop** 를 돌리지 않음 (한 번의 mock 피드 재생만 허용).
- `streamhub.error` 만으로 **resync 완료** 로 표시하지 않음 (`RECOVERY_RESYNC_CONTRACT`).

---

## 9.1 P0/P1 구현 파일 (2026-05-15)

### P1 Dev UI

| 경로 | 역할 |
|------|------|
| `src/dev/SelfTestDevPage.jsx` | `/dev/self-test` 페이지 |
| `src/dev/SelfTestCenter.jsx` | PASS/WARN/FAIL·issue count·last checked·MOCK ONLY |
| `src/dev/DiagnosticsPanel.jsx` | diagnostics 섹션 (11 suites) |
| `src/dev/viewModels.js` | 패널 view model (테스트 가능) |
| `src/dev/diagnosticsMeta.js` | 섹션 ↔ suite ID 매핑 |
| `src/validation/suites/realtimeSchemaSuite.js` | `contract.realtime-schema` |
| `src/validation/suites/adminMockFlowSuite.js` | `mock.admin.flow` |

### P2 확장

| 경로 | 역할 |
|------|------|
| `src/dev/AuditTrailPanel.jsx` | 전체 audit·kind 필터·correlation 검색·preview 6 |
| `src/dev/RoomSessionDiagnostics.jsx` | live_state·session·chat_seq·recovery MOCK 카드 |
| `src/dev/AdminIaPanel.jsx` | `/admin/*` 링크 + self-test |
| `src/validation/mockAuditFilters.js` | audit 필터 — `@tetherget/mock-audit-core` `filterAuditEntries` |
| `src/validation/mockRoomSession.js` | mock room/session 스냅샷 |
| `src/validation/contracts/adminRoutes.js` | SCREEN_FLOW §9 admin paths |
| `src/validation/suites/roomSessionContractSuite.js` | `contract.room-session` |
| `src/validation/suites/chatSeqContractSuite.js` | `contract.chat-seq` |
| `src/validation/suites/adminForceEndSuite.js` | `mock.admin.force-end` |
| `src/validation/suites/adminIaRouteSuite.js` | `contract.admin-ia` |

### P3 Mock admin shell

| 경로 | 역할 |
|------|------|
| `src/admin/MockAdminShell.jsx` | `/admin/dashboard` … `/admin/recovery` shell |
| `src/admin/pages/*` | mock read-only admin pages + action buttons |
| `src/validation/postChangeValidation.js` | 조치 후 self-test 1회 + audit |
| `src/validation/mockAdminActions.js` | mock admin action 진입점 |
| `src/validation/auditExport.js` | JSON export — `@tetherget/mock-audit-core` `buildAuditExportPayload` (`streamhub`, client-only) |
| `src/dev/downloadAuditExport.js` | 브라우저 다운로드 (업로드 없음) |
| `src/dev/RoomSessionScenarioToggle.jsx` | dev self-test 시나리오 버튼 |
| `src/validation/mockRoomSessionScenarios.js` | RECONNECTING / OFFLINE / APP_SYNCED / FORCE_ENDED |
| `src/validation/suites/scenarioToggleSuite.js` | `mock.scenario-toggle` |

**Post-change:** polling·WebSocket 금지 — `performMockAdminAction` → `runPostChangeValidation` → `runStreamHubSelfTests()` 1회.

---

## 9.2 P0 구현 파일 (2026-05-15)

| 경로 | 역할 |
|------|------|
| `src/validation/types.js` | `SelfTestResult`, `DiagnosticSuite`, `DiagnosticIssue`, `MockAuditEntry` (JSDoc) |
| `src/validation/runStreamHubSelfTests.js` | 진입점 |
| `src/validation/mockAuditTrail.js` | append-only mock audit |
| `src/validation/contracts/*` | routes, SH_*, flags, recovery, events |
| `src/validation/suites/*` | P0 스위트 5종 |
| `scripts/smoke.mjs` | smoke gate |
| `tests/runStreamHubSelfTests.test.js` | node:test |
| `AGENTS.md` / `MASTER_MANUAL.md` | 에이전트·운영 매뉴얼 |

---

## 10. 구현 로드맵 (additive)

| 순위 | 산출 |
|------|------|
| P0 | `runStreamHubSelfTests()` pure module + PASS/WARN/FAIL — **완료** (`src/validation/`) |
| P1 | Dev route **Self-Test Center** + MOCK ONLY 배지 — **완료** (`/dev/self-test`) |
| P2 | Audit Trail UI + Room/Session diagnostics + Admin IA panel — **완료** |
| P3 | Mock admin shell + post-change validation + audit export — **완료** |
| P4 | E2E·실제 admin API 연동 (금지 범위 외 until approved) |
| P3 | `npm test` contract suites |
| P4 | Admin tab 연동 (`SCREEN_FLOW` `/admin/*`) |

---

## 관련 문서

- `docs/GLOBAL_SELF_TEST_VALIDATION.md`  
- `docs/STREAMHUB_MASTER_PLAN.md`  
- `docs/STREAMHUB_SCREEN_FLOW.md` (관리자 화면)  
- `../01-TetherGet-P2P/docs/GLOBAL_SELF_TEST_VALIDATION.md` (참조 구현)

---

*StreamHub 11번 — Global Self-Test 정책 적용 산출물.*
