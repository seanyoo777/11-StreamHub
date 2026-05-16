# StreamHub Master Manual (11번)

**버전:** P3 Mock admin shell + post-change validation  
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

### 3.6 스위트 (P0–P3, 12종)

| Suite ID | 모듈 |
|----------|------|
| `contract.route-ia` | `suites/routeContractSuite.js` |
| `contract.admin-ia` | `suites/adminIaRouteSuite.js` |
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

### 3.7 Mock audit trail

- 모듈: `src/validation/mockAuditTrail.js`
- 연산: **append only** — `tryDeleteMockAuditEntry()` 는 항상 `false`
- Self-test 시 기록 kind:
  - `admin.streamhub.self_test_run`
  - `admin.streamhub.recovery_resync_check`

### 3.8 로드맵

| 순위 | 내용 |
|------|------|
| P0 | pure runner + smoke + test — 완료 |
| P1 | Dev Self-Test Center UI — 완료 |
| P2 | Audit Trail + Room/Session + Admin IA — 완료 |
| P3 | Mock admin shell + post-change + export — 완료 |
| P4 | E2E·Vitest 컴포넌트 테스트 (선택) |

---

## 4. Agent 규칙

`AGENTS.md` — additive only, mock-first, global self-test 준수.

---

*11-StreamHub — planning + P0 validation skeleton.*
