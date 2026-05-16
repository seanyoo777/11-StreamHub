# StreamHub 관리자 이벤트 스키마 (`admin.streamhub.*`) — 11번 전용

**문서 버전:** 1.0  
**기준일:** 2026-05-14  
**단계:** 기획 11단계 — 운영·감사·신고·방송 제어 **관리자 전용** 이벤트 계약 (구현 아님)

**전제 문서:** `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` (v1.2), `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`, `docs/STREAMHUB_ROOM_CONTRACT.md` (v1.2), `docs/STREAMHUB_REALTIME_ERROR_CODES.md` (`streamhub.error`·`SH_*` / `GH_*`)  
**참조(형식·필드 정렬):** `../10-GameHub/docs/GAMEHUB_ADMIN_EVENT_SCHEMA.md` (`admin.gamehub.*`)

**본 문서 범위:** **`admin.streamhub.*`** 논리 envelope·payload·상관 ID·감사 보존. 실관리자 서버·DB·권한(RBAC)·외부 API·대규모 코드는 포함하지 않음.

**절대 금지:** 실제 관리자 서버 구현, DB 구현, 권한 시스템 구현, 외부 API 연결.

---

## 역할 분리 (일반 이벤트·오류와의 관계)

| 스트림 / 이벤트 | 수신자 | 용도 |
|-----------------|--------|------|
| `stream.*`, `room.status.updated`, `chat.message`, `moderation.*`, `report.created` (일반) | 시청자·BJ·(신고는 admin 큐만) | **사용자 가시** 상태·모더·신고 접수 |
| **`admin.streamhub.*`** | **운영/모더 전용 클라**·append-only 로그 싱크 | 감사·큐·**플랫폼 조치** 원장 |
| **`streamhub.error`** + `SH_*` / `GH_*` | 인증된 일반 앱 클라 | 요청 실패·일시 오류 (`REALTIME_ERROR_CODES`) |

**충돌 금지 (`REALTIME_ERROR_CODES` 와):**

- `streamhub.error` 는 **클라이언트 복구 UX**용 ErrorEnvelope 이다.  
- **`admin.streamhub.*`** 는 **운영 감사·티켓**용이며 `SH_*` 코드를 **payload 에 혼입하지 않는다**(동일 사건이면 `correlation_id` 만 링크).  
- `admin.streamhub.realtime_error` 로그 행(`REALTIME_ERROR_CODES` §11)과 본 스키마 이벤트는 **목적이 다름** — 중복 적재 시 `request_id` / `correlation_id` 로 연결.

**`moderation.*` / `report.created` 정합:** BJ·모더가 발행하는 `moderation.muted` 등과 **직교**; **플랫폼 관리자**가 동일 조치를 했을 때는 사용자 가시 이벤트 + **`admin.streamhub.chat_audit`** (또는 `user_muted` / `user_banned`) **쌍**을 권장한다. `report.created` 는 일반 버스 비공개 시 **`admin.streamhub.report_created`** 가 큐 적재 본문이 된다 (`CHAT_MODERATION_POLICY` §4.2).

---

## 공통 envelope (`AdminStreamhubEvent`)

GameHub `AdminGamehubEvent` 와 **동형**을 권장한다 (`GAMEHUB_ADMIN_EVENT_SCHEMA.md` 공통 envelope).

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `schema_version` | string | O | 예: `"streamhub.admin_event.v1"` |
| `kind` | string | O | 아래 §1–§8 의 `admin.streamhub.*` |
| `server_ms` | int64 | O | 서버 시각 |
| `correlation_id` | string (uuid) | O | **한 업무 흐름** 묶음 (§9) |
| `request_id` | string | 선택 | 클라/BFF 상관 ID (§9) |
| `actor_admin_id` | string | O | 조치 주체(운영 계정 ID) |
| `payload` | object | O | `kind` 별 |

**전송:** 운영자 전용 채널 `admin:streamhub` 또는 `admin:room:{room_id}` (정책). **일반 시청 앱에는 기본 미전달.**

---

## 1. `admin.streamhub.report_created`

신고 큐 적재. `report.created`(일반 버스)와 **동형 payload**를 권장하며, `CHAT_MODERATION_POLICY` §4.2·GameHub `admin.gamehub.report_created` 와 필드를 맞춘다.

| `payload` 필드 | 타입 | 필수 | 설명 |
|----------------|------|------|------|
| `report_id` | string | O | |
| `reporter_user_id` | string | O | |
| `room_id` | string | O | |
| `channel_id` | string | 선택 | `stream_chat:{room_id}` 권장 |
| `subject_type` | string | O | `user` \| `room` \| `message` |
| `subject_id` | string | O | 메시지면 `message_id` |
| `target_message_id` | string | 선택 | GameHub 큐 통합 시 `subject_id` 와 동일값 허용 |
| `reason_code` | string | O | |
| `detail` | string | 선택 | |
| `client_intent_id` | string | 선택 | |
| `request_id` | string | 선택 | |
| `status` | string | O | 보통 `OPEN` |
| `source` | string | 선택 | 제품 구분 시 `"streamhub"` |

---

## 2. `admin.streamhub.report_status_changed`

티켓 상태 전이 (`GAMEHUB_MODERATION_FLOW.md` §2 상태 enum 재사용 권장).

| `payload` 필드 | 타입 | 필수 |
|----------------|------|------|
| `report_id` | string | O |
| `from_status` | string | O |
| `to_status` | string | O |
| `actor_admin_id` | string | O | 래퍼와 중복 시 **래퍼 우선** |
| `note` | string | 선택 |

---

## 3. `admin.streamhub.chat_audit`

채팅·모더 **조치** 감사. `admin.gamehub.chat_audit` 와 **동형 필드** 권장.

| `payload` 필드 | 타입 | 필수 | 설명 |
|----------------|------|------|------|
| `action` | string | O | 예: `hide`, `delete`, `mute`, `unmute`, `warn`, `report_resolve`, `slowmode_on` |
| `message_id` | string | 선택 | |
| `channel_id` | string | 선택 | |
| `room_id` | string | 선택 | |
| `target_user_id` | string | 선택 | |
| `reason_code` | string | O | |
| `metadata` | object | 선택 | 비PII |

---

## 4. `admin.streamhub.user_muted`

**운영자**가 부여한 뮤트(감사·큐). 사용자 가시 `moderation.muted` 와 **별 레이어** — 동일 조치 시 둘 다 적재 가능하나 **인과는 `correlation_id`** 로만 연결.

| `payload` 필드 | 타입 | 필수 |
|----------------|------|------|
| `target_user_id` | string | O |
| `scope` | string | O | `chat_channel` \| `room` \| `platform` |
| `channel_id` | string | `scope=chat_channel` 일 때 |
| `room_id` | string | 선택 |
| `until_server_ms` | int64 | 선택 | null 정책은 제품 정의 |
| `reason_code` | string | O |

---

## 5. `admin.streamhub.user_banned`

**운영자** 밴(계정·방·플랫폼). `moderation.banned`(실시간 알림)와 별도.

| `payload` 필드 | 타입 | 필수 |
|----------------|------|------|
| `target_user_id` | string | O |
| `scope` | string | O | `room` \| `platform` |
| `ban_id` | string | O |
| `expires_at` | string | 선택 | RFC3339; 영구 시 생략 정책 |
| `reason_code` | string | O |
| `kick_presence` | bool | 선택 | true 시 `viewer.left` 유발은 **실시간 스키마** 쪽과 페어 |

---

## 6. `admin.streamhub.room_locked`

방 **신규 입장·송출** 잠금 등(메타). `room.status.updated` 의 `hidden` / `suspended` 와 별개로 **운영 플래그**만 기록할 때 사용 가능.

| `payload` 필드 | 타입 | 필수 |
|----------------|------|------|
| `room_id` | string | O |
| `locked` | bool | O |
| `reason_code` | string | O |
| `expires_at` | string | 선택 |

---

## 7. `admin.streamhub.stream_force_ended`

관리자 **강제 OFF AIR** 감사. `STREAMHUB_ROOM_CONTRACT.md` §10·`stream.ended` `reason: admin_terminated` 와 **페어**로 발행 권장.

| `payload` 필드 | 타입 | 필수 |
|----------------|------|------|
| `room_id` | string | O |
| `session_id` | string | O | 종료 대상 세션 |
| `reason_code` | string | O | |
| `note` | string | 선택 | 내부 |

**이름 정렬:** `STREAMHUB_REALTIME_EVENT_SCHEMA.md` §3 의 후보 `admin.room.terminated` 가 있으면, **본 `kind` 를 권장 표준**으로 두고 레거시 별칭은 구현 RFC에서만 다룬다.

---

## 8. `admin.streamhub.system_notice`

전역 또는 방 단위 **운영 공지** 메타(배너·긴급 안내). 채팅 `chat.message` system 과 혼동 시 **채널 분리**.

| `payload` 필드 | 타입 | 필수 |
|----------------|------|------|
| `notice_id` | string | O |
| `scope` | string | O | `global` \| `room` |
| `room_id` | string | `scope=room` 일 때 |
| `severity` | string | O | `info` \| `warning` \| `critical` |
| `message_key` | string | O | i18n |
| `message_args` | object | 선택 |
| `starts_at` / `ends_at` | string | 선택 | RFC3339 |

---

## 9. `correlation_id` / `request_id` 정책

| ID | 용도 |
|-----|------|
| `correlation_id` | **서버 발급 권장 UUID** — 한 신고 처리·한 강제 종료 세션처럼 **여러 `admin.streamhub.*` 행**을 묶음. |
| `request_id` | 클라/BFF가 **멱등·재시도** 시 동일 값 재전송. 운영 액션 API와 1:1 매핑 가능. |
| `report_id` / `ban_id` / `session_id` | **도메인 식별자**; `correlation_id` 와 혼동 금지. |

**`streamhub.error`:** ErrorEnvelope 의 `request_id` 가 본 envelope 의 `request_id` 와 같을 수 있음 — **사고 조사 시 조인 키**로만 사용.

---

## 10. Audit 보존 정책

| 원칙 | 설명 |
|------|------|
| append-only | `admin.streamhub.*` 는 **삭제보다 보존**이 기본; 정정은 **새 이벤트**로. |
| 보존 기간 | 신고·밴·강제 종료는 **장기**; `system_notice` 는 `ends_at` 후 아카이브. |
| PII | `note`·`detail` 에 **PII 최소화**; 필요 시 별도 보안 스토어 참조 ID만. |
| 샘플링 | `chat_audit` 고빈도는 **집계** 우선; 메시지 원문은 `CHAT_MODERATION_POLICY` §9 정신. |

---

## 11. GameHub `admin.gamehub.*` 와 공통화 가능한 부분

| 영역 | 공통화 |
|------|--------|
| **Envelope** | `schema_version`, `kind`, `server_ms`, `correlation_id`, `request_id`, `actor_admin_id`, `payload` |
| **신고 큐** | `report_created` / `report_status_changed` payload **동형** + `source` |
| **chat_audit** | `action`, `message_id`, `channel_id`, `room_id`, `target_user_id`, `reason_code`, `metadata` |
| **통합 운영 콘솔** | 단일 파서에서 `kind` 접두사 `admin.gamehub.` \| `admin.streamhub.` 분기 |

**비공유:** GameHub `table_id`·게임 룰; StreamHub **`session_id`**, **`stream_chat:`**, **`stream.ended`** 페어.

---

## 관련 문서

- `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md`  
- `docs/STREAMHUB_REALTIME_ERROR_CODES.md`  
- `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`  
- `docs/STREAMHUB_ROOM_CONTRACT.md`  
- `../10-GameHub/docs/GAMEHUB_ADMIN_EVENT_SCHEMA.md`

---

*StreamHub 11번 레포 기획 11단계 산출물.*
