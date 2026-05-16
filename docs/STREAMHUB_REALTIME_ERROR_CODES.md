# StreamHub 실시간 에러 코드 — 11번 전용

**문서 버전:** 1.0  
**기준일:** 2026-05-14  
**단계:** 기획 8·9단계 — 방송·채팅·후원·입장 계층 **실시간 오류 계약** (구현 아님)

**전제 문서:** `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` (**v1.2** — **`streamhub.error`** 공식 카탈로그 §2.11), `docs/STREAMHUB_ROOM_CONTRACT.md` (**v1.2**), `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`, `docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md` (재연결·resync·`streamhub.error` 역할 분리)  
**참조(접두사·envelope만):** GameHub `../10-GameHub/docs/GAMEHUB_REALTIME_ERROR_CODES.md` (`GH_*`)

**본 문서 범위:** **`SH_*`** 네임스페이스와 공통 **ErrorEnvelope**. 실소켓·서버 코드·DB·결제·토큰·외부 API·대규모 코드는 포함하지 않음.

**절대 금지:** 실제 서버 구현, WebRTC/RTMP 서버 구현, DB 구현, 결제·토큰 구현, 외부 API 연결.

---

## 원칙

| 원칙 | 설명 |
|------|------|
| 서버 권위 | `code` 는 최종 사유; 클라는 **`SH_*` / `GH_*`(재사용 시)** 로 분기한다. |
| `GH_*` 충돌 금지 | StreamHub **제품 전용** 사유는 반드시 **`SH_`** 접두사. `GH_*` 는 GameHub 문서에 정의된 코드만 **그대로 재사용**할 수 있으며, **새 값을 GH_ 로 추가하지 않는다** (11번 소유권 분리). |
| i18n | 사용자 문구는 **`message_key` + 앱 i18n**; 서버 `message` 는 디버그·운영용 선택 필드 (**UI 직접 노출 금지**). |
| 계층 | **방송(스트림)·입장·채팅·후원** 중심. **`moderation.*` 이벤트·신고 큐와 직교** — 뮤트·밴·신고 결과는 별 이벤트/별 코드 체계(`GH_*` 채팅 거절 등)로 처리하고, 본 문서의 `SH_*` 는 **세션 종료·제재와 인과적으로 묶지 않는다**. |

**`STREAMHUB_REALTIME_EVENT_SCHEMA.md` 정합:** `event_type === streamhub.error` 는 **v1.2** 이벤트 카탈로그 **§2.11 공식 항목**이다. Payload 는 본 문서 **§1.2 ErrorEnvelope** 와 **동일**하다. `context.room_id` / `context.session_id` 는 해당 스키마의 `room_id`·`session_id` 와 동일 문자열 규칙을 따른다.

---

## 1. 공통 ErrorEnvelope 구조

논리 페이로드 계약이다. 전송은 WebSocket/SSE 등 **구현 비범위**.

### 1.1 이벤트 `event_type` (공식)

| `event_type` | 용도 |
|--------------|------|
| `streamhub.error` | StreamHub 앱 실시간 계층 전역 오류 — **`STREAMHUB_REALTIME_EVENT_SCHEMA.md` §2.11** 카탈로그와 동일 이름 |

### 1.2 공통 `payload` (ErrorEnvelope)

GameHub `GAMEHUB_REALTIME_ERROR_CODES.md` §1.2 와 **동형**을 권장한다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `code` | string | O | `SH_*` (본 문서) 또는 재사용 시 **`GH_*`** (GameHub 문서에 이미 정의된 코드만). |
| `message` | string | 선택 | 내부/디버그. **UI 직접 노출 금지.** |
| `message_key` | string | 선택 | i18n 키 (§9). |
| `fatal` | bool | O | `true`면 연결 종료·화면 이탈 등 **강한 복구** 권장. |
| `retryable` | bool | O | 동일 액션 재시도 가능 여부(힌트). 표(§8)와 일치해야 함. |
| `server_ms` | int64 | O | 발생 시각(서버). |
| `request_id` | string | 선택 | 클라 correlation / `correlation_id` (`REALTIME_EVENT_SCHEMA` 봉투)와 연계. |
| `context` | object | 선택 | §1.3 |

### 1.3 `context` (선택, 공통 키)

| 키 | 타입 | 설명 |
|----|------|------|
| `room_id` | string | |
| `session_id` | string | 활성·대상 세션 (`stream.started` / `stream.ended` 와 정합). |
| `channel_id` | string | 채팅 시 `stream_chat:{room_id}` (`CHAT_MODERATION_POLICY`). |
| `manifest_url` | string | 재생 URL 관련 오류 시(민감하면 해시만). |

---

## 2. `SH_STREAM_OFFLINE`

| 필드 | 값 |
|------|-----|
| 발생 조건 | `room.status.updated` 가 `offline` 이거나 활성 세션 없음; 재생 불가. |
| `fatal` | false |
| `retryable` | true |
| 제안 `message_key` | `streamhub.error.stream_offline` |

**정합:** `STREAMHUB_ROOM_CONTRACT.md` 의 `OFFLINE` / `ENDED` UI 와 병행 가능. **모더레이션과 직교.**

---

## 3. `SH_STREAM_NOT_FOUND`

| 필드 | 값 |
|------|-----|
| 발생 조건 | `room_id` / 세션에 매핑된 스트림이 없거나 삭제됨. |
| `fatal` | false |
| `retryable` | false |
| 제안 `message_key` | `streamhub.error.stream_not_found` |

---

## 4. `SH_STREAM_REGION_BLOCKED`

| 필드 | 값 |
|------|-----|
| 발생 조건 | 정책·라이선스상 해당 지역에서 시청 불가(컴플라이언스). |
| `fatal` | false |
| `retryable` | false |
| 제안 `message_key` | `streamhub.error.region_blocked` |

---

## 5. `SH_CHAT_SLOWMODE`

| 필드 | 값 |
|------|-----|
| 발생 조건 | 방 단위 **슬로우 모드**(초당/분당 N회 제한)로 전송 거절. |
| `fatal` | false |
| `retryable` | true |
| 제안 `message_key` | `streamhub.error.chat_slowmode` |

**직교:** 개인 **뮤트**(`moderation.muted`)·**밴**과 별개. 뮤트 시 **`GH_AUTH_FORBIDDEN`** + `message_key` (예: `gamehub.error.chat_muted`) 재사용을 우선 (`CHAT_MODERATION_POLICY` §5.1 정신과 동일).

---

## 6. `SH_DONATION_DISABLED`

| 필드 | 값 |
|------|-----|
| 발생 조건 | 방·세션·플랫폼 정책으로 **내부 포인트 후원** 비활성(실결제 아님). |
| `fatal` | false |
| `retryable` | false |
| 제안 `message_key` | `streamhub.error.donation_disabled` |

**직교:** 잔액 부족·원장 거절은 별도 `SH_*` 확장 시 본 문서 버전 bump; **신고·제재와 인과 연결 금지**.

---

## 7. `SH_STREAM_RECONNECTING`

| 필드 | 값 |
|------|-----|
| 발생 조건 | `StreamSession.state === RECONNECTING` 또는 인제스트 단절 유예 중; 재생 일시 실패. |
| `fatal` | false |
| `retryable` | true |
| 제안 `message_key` | `streamhub.error.stream_reconnecting` |

**정합:** `STREAMHUB_ROOM_CONTRACT.md` 의 `ingest_state`·`RECONNECTING` 서술과 정합. **모더레이션 이벤트로 본 코드를 대체하지 않음.**

---

## 8. `retryable` / `fatal` 정책 (공통)

| 조합 | 의미 | 클라 권장 동작 |
|------|------|----------------|
| `fatal: false`, `retryable: true` | 일시적·정책적 백오프 가능 | 지수 백오프 후 재시도 또는 UI “다시 시도”. |
| `fatal: false`, `retryable: false` | 재시도해도 동일 조건이면 실패 | 사용자 안내만; 라우팅 변경. |
| `fatal: true`, `retryable: false` | 세션·인증 등 복구 어려움 | 로그인·홈 이동·소켓 재연결. |

**일관성:** 각 코드 표의 `fatal` / `retryable` 이 본 절과 **모순되지 않게** 유지한다. `SH_STREAM_RECONNECTING` 은 **항상 non-fatal**.

---

## 9. `message_key` 정책

| 규칙 | 설명 |
|------|------|
| 네임스페이스 | `streamhub.error.*` 권장. GameHub 재사용 시 **`gamehub.error.*`** 도 허용. |
| 우선순위 | 서버가 `message_key` 를 주면 **앱 i18n 최우선**; 없으면 `code` → 로컬 테이블 매핑. |
| 인자 | 동적 값은 **별도 필드** 또는 `context` 에 두고, `message_args` 확장은 GameHub envelope 확장 시와 동일하게 문서화한다. |

---

## 10. `GH_*` 와 공통화 가능한 부분

| 영역 | 공통화 |
|------|--------|
| **Envelope** | `fatal`, `retryable`, `server_ms`, `message_key`, `context` — GameHub §1.2 와 **동일 필드명** 권장. |
| **채팅 길이·율 제한** | `GH_CHAT_MESSAGE_TOO_LONG`, `GH_RATE_LIMITED_CHAT` 를 StreamHub 채팅에서 **그대로 재사용** 가능 (`CHAT_MODERATION_POLICY`·`GAMEHUB_CHAT_EVENT_SCHEMA` 참조). |
| **인증** | 세션 만료·토큰 무효 등은 **`GH_AUTH_*`** 재사용을 우선 검토. |
| **파서** | 클라이언트 단일 `RealtimeError` 디코더에서 `code` 첫 토큰으로 `SH_` \| `GH_` 분기. |

**금지:** `GH_STREAM_OFFLINE` 처럼 **의미상 StreamHub 전용**인 문자열을 `GH_` 로 **신규 정의하지 않는다** — 반드시 `SH_*`.

---

## 11. 관리자 로그 정책

| 로그 키 (예시) | 기록 필드 (권장) |
|-----------------|------------------|
| `admin.streamhub.realtime_error` | `code`, `message_key`, `room_id`, `session_id`, `user_id?`, `request_id`, `server_ms`, `fatal`, `retryable` |
| 샘플링 | 고빈도 `SH_STREAM_RECONNECTING` 은 **집계·카운터** 위주, 원문 `message` 는 최소화. |
| PII | IP·UA 는 보존 정책에 따름; **운영 디버그**와 **유저 노출** 분리. |

**모더레이션 로그** (`admin.streamhub.chat_audit` 등)와는 **행 분리** — 동일 요청이면 `request_id` 만 링크.

---

## 관련 문서

- `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` (v1.2 **§2.11 `streamhub.error`** — 본 문서 ErrorEnvelope 와 payload 동일)  
- `docs/STREAMHUB_ADMIN_EVENT_SCHEMA.md` (`admin.streamhub.*` — 감사·신고 큐; `streamhub.error` 와 역할 분리)  
- `docs/STREAMHUB_ROOM_CONTRACT.md`  
- `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`  
- `docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md`  
- `../10-GameHub/docs/GAMEHUB_REALTIME_ERROR_CODES.md`

---

*StreamHub 11번 레포 기획 8·9단계 산출물.*
