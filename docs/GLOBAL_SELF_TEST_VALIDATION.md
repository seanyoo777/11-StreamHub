# Global Self-Test & Validation Rule

**적용 범위:** TetherGet 모노레포 **모든 플랫폼** (01 P2P, 02 TGX, 03 OneAI, … **11 StreamHub** 포함).  
**원칙:** 기능은 **additive only** 로 확장하고, 검증은 **mock-first** 로 유지한다.

---

## 1. 공통 원칙 (10항)

1. 기능 추가 시 반드시 **self-test 가능한 구조**를 만든다.
2. 관리자 기능은 **상태 변경 후 자동 검증** 가능해야 한다 (mock).
3. **mock 기반 diagnostics panel** 을 유지한다.
4. 결과는 **PASS / WARN / FAIL** 로 표시한다.
5. **issue count**, **last checked**, **mock only** 배지를 유지한다.
6. **audit trail** 은 append-only **mock** 구조를 유지한다.
7. **build → lint → test → smoke** 흐름을 유지한다.
8. **WebSocket / live execution 없이도** 검증 가능해야 한다.
9. **feature flag / fallback** 상태를 검증 가능해야 한다.
10. 기존 기능 **삭제 없이** additive only 방식으로 확장한다.

---

## 2. 금지 (Forbidden)

- 실거래 실행
- 실제 정산
- 실온체인 처리
- production destructive action (하드 삭제, 비통제 롤백 등)
- uncontrolled realtime loop (검증 목적의 무제한 폴링·WS 루프)

StreamHub 추가 금지(기획·MVP): 실제 송출·RTMP/WebRTC 서버, 실결제·토큰 발행, 외부 API — `docs/STREAMHUB_MASTER_PLAN.md` §1.3.

---

## 3. 필수 플랫폼 표면 (공통)

모든 플랫폼은 아래 **5개 표면**을 공통 유지한다.

| 표면 | 목적 |
|------|------|
| **Self-Test Center** | 스위트 실행·요약(PASS/WARN/FAIL)·issue count·last checked·mock only |
| **Diagnostics Panel** | 캐시·정합·플래그·이슈 목록 (mock 데이터) |
| **Audit Trail** | append-only mock 이력 (조치·상태 변경 추적) |
| **Feature Flag Validation** | env/플래그·fallback·기본값 검증 |
| **Smoke Test** | build/lint/test/최소 E2E 또는 스크립트 게이트 |

---

## 4. 검증 게이트 (공통)

| 단계 | 권장 명령 (프로젝트별 package.json 에 정의) |
|------|---------------------------------------------|
| lint | `npm run lint` |
| test | `npm test` |
| build | `npm run build` |
| smoke | `npm run smoke` 또는 `npm run release:check` |

실패 시 Self-Test Center 에 **FAIL** 로 반영 가능(구현 단계).

---

## 5. Agent / 기여자 체크리스트

기능·문서 추가 시:

- [ ] Pure validator 또는 `run*SelfTest()` 훅 (mock)
- [ ] 관리자 상태 변경 시 post-change mock validator (해당 시)
- [ ] Diagnostics / Self-Test 카드 갱신
- [ ] build · lint · test 통과
- [ ] WS/live 전용 검증 경로 없음
- [ ] 기존 기능 제거 없음 (additive)

---

## 6. 플랫폼별 상세 문서

| 플랫폼 | 문서 |
|--------|------|
| 01 TetherGet-P2P | `01-TetherGet-P2P/docs/GLOBAL_SELF_TEST_VALIDATION.md` (구현 참조) |
| 02 TGX-CEX | `02-TGX-CEX/docs/GLOBAL_VALIDATION_RULES.md` |
| **11 StreamHub** | `docs/STREAMHUB_SELF_TEST_VALIDATION.md` · P0: `runStreamHubSelfTests()`, `npm run smoke`, `MASTER_MANUAL.md` |

**GLOBAL OPERATIONS CORE (Phase 1):** 모노레포 루트 `docs/GLOBAL_OPERATIONS_CORE.md` · 인벤토리 `docs/INVENTORY_GLOBAL_OPERATIONS_CORE.md` · 루트 `AGENTS.md`.

---

*모노레포 공통 정책 — 구현은 플랫폼별 self-test 문서를 따른다.*
