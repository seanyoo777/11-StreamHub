# StreamHub 채팅·모더레이션 재사용 정책 (기획 4단계)

**문서 버전:** 1.0  
**기준일:** 2026-05-14  
**목적:** StreamHub의 `chat.message`, `report.created`, `moderation.*` (`docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md`)를 **GameHub** `docs/GAMEHUB_CHAT_EVENT_SCHEMA.md`(**CHAT_EVENT_SCHEMA**)·`docs/GAMEHUB_MODERATION_FLOW.md`와 **필드·순서·신고 플로우** 관점에서 정렬한다.

**금지:** 실제 채팅 서버 구현, DB 구현, 외부 API, 결제·토큰 구현.

**참조 (10번 GameHub 레포):** `GAMEHUB_CHAT_EVENT_SCHEMA.md`, `GAMEHUB_MODERATION_FLOW.md`, `GAMEHUB_REALTIME_ERROR_CODES.md` (`GH_*`).  
**참조 (11번 StreamHub 레포):** `STREAMHUB_REALTIME_EVENT_SCHEMA.md`, `STREAMHUB_SCREEN_FLOW.md`.

---

## 1. StreamHub 채팅 채널 구조

### 1.1 `channel_id` 규칙 (GameHub 부록과 동형)

| 제품 | 권장 `channel_id` 패턴 | 비고 |
|------|-------------------------|------|
| GameHub | `room_chat:{room_id}`, `table_chat:{room_id}:{table_id}` | CHAT_EVENT_SCHEMA §2·부록 |
| **StreamHub** | **`stream_chat:{room_id}`** | 방송 **라이브 방** 단위 채팅. `room_id` 는 StreamHub 방 ID와 동일 문자열 사용. |

- **구독 키:** 클라이언트는 `channel_id` 단위로 채팅 스트림을 구독한다. GameHub와 **문자열 규칙만 다르고 파서는 공유**한다 (CHAT_EVENT_SCHEMA §10).
- **`table_id`:** StreamHub 기본 제품에는 **없음** (`null` 생략). Game-integrated 뷰에서만 선택적으로 확장 가능(별도 RFC).

### 1.2 실시간 버스와의 관계

- `STREAMHUB_REALTIME_EVENT_SCHEMA.md` 의 최상위 **`event_type`** (`chat.message` 등)은 **제품 횡단 봉투**로 유지할 수 있다.
- **채팅 본문**은 그 `payload` 안에 CHAT_EVENT_SCHEMA와 **동형인 하위 객체**를 넣거나, 별도 스트림에서 **`kind === streamhub.chat_message`**(권장 이름)으로만 송신한다는 **이중 표현** 중 하나를 구현 단계에서 택한다.
- 본 정책서의 **정렬 기준**은 하위 객체가 GameHub의 **`gamehub.chat_message` payload + envelope 필드**(`chat_seq`, `message_type`, `message_key` …)를 **최대한 그대로** 만족하는 것이다.

---

## 2. CHAT_EVENT_SCHEMA와 재사용 가능한 필드

### 2.1 Envelope (채팅 전용 레이어)

GameHub 채팅 래퍼(CHAT_EVENT_SCHEMA §1)와 아래처럼 **1:1 대응**시킨다.

| GameHub (`gamehub.chat.*`) | StreamHub (채팅 레이어) | 비고 |
|----------------------------|-------------------------|------|
| `schema_version` | `schema_version` | StreamHub는 예: `"streamhub.chat_event.v1"` — **값은 다르게**, 필드 의미 동일 |
| `kind` | `kind` | `streamhub.chat_message` 등 |
| `server_ms` | `server_ms` | `occurred_at` 과 병행 가능; **정렬·갭 복구**는 `chat_seq` 우선 |
| `channel_id` | `channel_id` | §1.1 `stream_chat:{room_id}` |
| `room_id` | `room_id` | StreamHub 방 ID |
| `table_id` | — | 사용 안 함 |
| `chat_seq` | `chat_seq` | §3 |
| `payload` | `payload` | §2.2 |

### 2.2 `kind === gamehub.chat_message` 동형 `payload` (메시지 본체)

CHAT_EVENT_SCHEMA §4와 필드 이름을 맞춘다.

| 필드 | 재사용 |
|------|--------|
| `message_id` | 예 — 불변 ID |
| `message_type` | 예 — `user` \| `system` \| `admin` \| `moderation` |
| `sender_user_id` | 예 — `user` 일 때 필수 |
| `body` | 예 — 표시용 최종 문자열(필터 후) |
| `message_key` | 예 — `system` / `admin` / `moderation` 에서 우선 |
| `message_args` | 예 — i18n 치환 |
| `reply_to_message_id` | 예 — StreamHub `reply_to` 명칭 **폐기 권장**, GameHub 명과 통일 |
| `client_intent_id` | 예 — `send_chat` / StreamHub 송신 인텐트와 상관 |

**StreamHub `STREAMHUB_REALTIME_EVENT_SCHEMA.md` §2.5 정렬 메모**

| 현재 StreamHub (`chat.message`) | 정렬 후 |
|-----------------------------------|---------|
| `author` 객체 | `sender_user_id` + UI용 배지는 **`message_args`** 또는 별도 확장 필드 `author_snapshot`(문서화 시 GameHub와 diff 최소화를 위해 **선택**으로만) |
| `kind` (`user` \| `system` \| `donation_highlight`) | **`message_type`** 으로 통일. 후원 하이라이트는 `message_type: "moderation"` + `message_key: "streamhub.chat.donation_highlight"` + `message_args` (금액·후원자 표시명 등) 권장 |
| `client_nonce` | `client_intent_id` 와 **동일 역할**이면 하나로 통합; 둘 다 필요하면 nonce는 `message_args` 내부 |

---

## 3. `message_id` / `chat_seq` / `channel_id` 정책

### 3.1 `message_id`

| 규칙 | 설명 |
|------|------|
| 발급 | **서버 권위** 불변 ID |
| 용도 | 신고(`target_message_id`), 삭제/숨김, 스레드 `reply_to_message_id`, 감사 로그 |
| 정렬 키로 사용 | **금지** — 순서는 `chat_seq` |

### 3.2 `chat_seq`

CHAT_EVENT_SCHEMA §3 / `GAMEHUB_ROOM_CONTRACT.md` §9 원칙을 StreamHub에 **그대로 적용**한다.

| 규칙 | 설명 |
|------|------|
| 스코프 | **`channel_id` 당 단일 열** |
| 단조성 | `uint64`, **건너뛰기 없음** |
| 삭제/숨김 | 기존 시퀀스 **재사용 금지** — 변경은 `streamhub.chat_message_hidden` / `streamhub.chat_message_deleted` / `streamhub.chat_message_updated` 로 통지 |
| 재연결 | 클라이언트는 `since_chat_seq` 로 갭 복구; 갭 과대 시 **스냅샷** 이벤트(동형: `gamehub.chat_message_list_snapshot` → `streamhub.chat_message_list_snapshot`) — **공통 정책:** `docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md` §4·§5·§7 |

### 3.3 `channel_id`

| 규칙 | 설명 |
|------|------|
| 형식 | `stream_chat:{room_id}` 고정(부록 접미사 `_v2` 는 마이그레이션 문서에서만) |
| `room_id` 와 혼동 | `room_id` 는 비즈니스 키; **채팅 구독 키는 항상 `channel_id`** |

---

## 4. `report.created`와 GameHub 신고 흐름 비교

### 4.1 GameHub (요약)

| 단계 | 산출 |
|------|------|
| 인텐트 | `gamehub.report_chat` (`GAMEHUB_LOBBY_EVENT_SCHEMA.md` §14.3) |
| 큐 적재 | `admin.gamehub.report_created` — `target_message_id`, `channel_id`, `room_id`, `reporter_user_id`, `reason_code`, `detail?`, `status: OPEN` 등 (CHAT_EVENT_SCHEMA §7.1, MODERATION_FLOW §1) |
| 선택 브로드캐스트 | `gamehub.chat_message_reported` — 일반 클라 **송신 생략** 권장 |
| 신고자 피드백 | `gamehub.report_ack` 선택 + `message_key` 토스트 |

### 4.2 StreamHub `report.created` 정렬

`STREAMHUB_REALTIME_EVENT_SCHEMA.md` §2.9 를 아래처럼 **필드 의미를 GameHub에 맞춘다**.

| StreamHub | GameHub 대응 | 조치 |
|-----------|--------------|------|
| `subject_type === "message"` | 신고 대상이 메시지 | `subject_id` → **`target_message_id`** 와 동일 값 |
| `subject_type === "user"` / `"room"` | 메시지 외 신고 | GameHub는 메시지 중심; StreamHub만 허용 시 **`target_message_id` null** + `subject_type`/`subject_id` 를 admin 큐 메타로 유지 |
| `category` | `reason_code` | **매핑 테이블** 고정 (예: `spam` → `GH_REPORT_SPAM` 또는 `streamhub.reason.spam` — 구현 전 `reason_code` 문자열 계약만 통일) |
| `note` | `detail` | 동의어 |
| (누락) | `channel_id`, `room_id` | **필수 추가** — `stream_chat:{room_id}` / `room_id` |
| `report_id` | `report_id` | 동일 |
| `reporter_user_id` | `reporter_user_id` | 동일 |

**관리자 이벤트 이름:** 제품 간 큐 통합 시 `admin.streamhub.report_created` 를 `admin.gamehub.report_created` 와 **동형 payload**로 두고, `source: "streamhub"` 만 구분해도 된다.

### 4.3 브로드캐스트 정책

- 일반 `room:{room_id}` 구독자에게 **`report.created` 원문 송신 금지**(기존 StreamHub 정책 유지) = GameHub MODERATION_FLOW §1.3·§1.2 와 동일 철학.
- 선택: 모더 전용 채널에 `streamhub.chat_message_reported` (**GameHub `gamehub.chat_message_reported` 동형**)만 송신.

---

## 5. Mute / Ban / Hidden / Deleted 정책

### 5.1 용어 매핑

| 개념 | GameHub 이벤트 / 효과 | StreamHub (`STREAMHUB_REALTIME_EVENT_SCHEMA`) | 정렬 방향 |
|------|------------------------|--------------------------------------------------|-----------|
| **Mute** (채팅만) | `gamehub.chat_user_muted` / `unmuted` | `moderation.muted` | **페이로드 정렬:** `until` ↔ `until_server_ms`(ms 단위 권장), `channel_id` 명시, `target_user_id` 동일 |
| **Ban** (넓은 범위) | MODERATION_FLOW §5.3 | `moderation.banned` | `scope: room|platform` 유지; 플랫폼 밴은 GameHub `Ban` 과 동일 계층 |
| **Kick** (세션 퇴장) | `player_left_room` 등 | `viewer.left` + `reason: kicked` | 방송에서는 **프레즌스 퇴장**으로 매핑 |
| **Hidden** (소프트) | `gamehub.chat_message_hidden` | *(신규 권장)* **`streamhub.chat_message_hidden`** | 동일 `chat_seq` 자리 placeholder (CHAT_EVENT_SCHEMA §7, MODERATION_FLOW §4) |
| **Deleted** (하드) | `gamehub.chat_message_deleted` | *(신규 권장)* **`streamhub.chat_message_deleted`** | 목록 제거; `chat_seq` 불변 |
| **내용 패치** | `gamehub.chat_message_updated` | **`streamhub.chat_message_updated`** | 마스킹 결과 반영 등 |

`STREAMHUB_REALTIME_EVENT_SCHEMA.md` 의 `moderation.muted` / `moderation.banned` 는 **제품 횡단 `event_type`** 으로 유지하되, 채팅 UI 레이어에서는 위 GameHub 동형 **`kind`** 이벤트를 **추가로** 보내 **단일 파서**를 택하는 것을 권장한다.

### 5.2 역할 필드 (`hidden_by_role` / `deleted_by_role`)

CHAT_EVENT_SCHEMA §7과 동일 enum: `user` \| `moderator` \| `admin` \| `system`.

- **BJ 주도 숨김/삭제(방 정책 허용 시):** `moderator` 또는 제품 정의 `streamer` — 구현 전 문서에 **한 enum 값으로 고정**할지 결정(권장: GameHub와 통합 큐를 쓸 경우 `moderator` 로 흡수).

### 5.3 금칙어·자동 필터

- **거절:** `streamhub.chat_message_rejected` (`gamehub.chat_message_rejected` 동형) — `client_intent_id`, `code` (`GH_RATE_LIMITED_CHAT`, `GH_CHAT_MESSAGE_TOO_LONG` 등), `message_key`
- **마스킹 후 송신:** `streamhub.chat_message_masked` (`gamehub.chat_message_masked` 동형)

원문 로그는 §9.

---

## 6. BJ/스트리머 권한과 관리자 권한 차이

| 권한 | 범위 | 허용 액션 (채팅 관점) | 이벤트·로그 |
|------|------|----------------------|-------------|
| **시청자** | 없음 | 신고 제출 | `report.created` → admin 큐 |
| **BJ** | **해당 `room_id` / `stream_chat:{room_id}`** | 타임아웃式 mute, 킥(퇴장), (정책 시) 메시지 hidden | `moderation.muted`, `viewer.left`, `streamhub.chat_message_hidden` + **`streamer`/`moderator` 역할** |
| **모더레이터(방 외)** | 운영이 부여한 다방 | 큐 검토, hidden/deleted/mute/ban | `admin.*`, `hidden_by_role: admin` |
| **관리자** | 플랫폼 | 계정 정지, 방 `suspended`, 강제 종료 | `moderation.banned`, `admin.room.terminated`, `admin.streamhub.chat_audit` |

**원칙:** 사용자에게 보이는 문구는 **`message_key` + i18n** (MODERATION_FLOW 머리말·CHAT_EVENT_SCHEMA §5.1 과 동일).

---

## 7. 모바일/PC 표시 정책

GameHub CHAT_EVENT_SCHEMA §8 및 MODERATION_FLOW §7을 **기본으로 재사용**하고, StreamHub 전용만 보조한다.

| 항목 | 정책 |
|------|------|
| 정렬 | `chat_seq` 오름차순 (양 플랫폼 공통) |
| `system` / `admin` / `moderation` | 별도 버블·아이콘; **`message_key` 기반 i18n** |
| 후원 하이라이트 | `message_type`/`message_key` 로 구분된 **강조 버블** (과도한 색 대비 주의) |
| 신고 UX | 모바일: 롱프레스 → 바텀시트 / PC: 컨텍스트 메뉴 (MODERATION_FLOW §7) |
| 뮤트 배너 | 입력창 비활성 + `message_key` (양 플랫폼 동일) |
| Hidden placeholder | 유저에게는 `message_key` 만(예: `gamehub.chat.message_hidden` 과 **동일 키 재사용** 가능) |

---

## 8. `message_key` i18n 정책

| 규칙 | 설명 |
|------|------|
| 네임스페이스 | `streamhub.*` 는 방송 전용; GameHub와 **문구를 공유**할 수 있으면 `gamehub.*` 키 **재사용 허용** |
| 우선순위 | 서버가 주면 **`message_key` + `message_args`** 가 UI 최우선; 없으면 `GH_*` → 로컬 테이블 (CHAT_EVENT_SCHEMA §5.1) |
| 직접 노출 금지 | 서버 자유 텍스트 `message` 는 **디버그·운영용**; 최종 UI에 직접 붙이지 않음 |
| 후원·제재 | `streamhub.chat.donation_highlight`, `streamhub.error.chat_muted`, `streamhub.report.received` 등 **목록화** 후 번역 리소스에 등록 |

---

## 9. 금칙어/신고/제재 로그

### 9.1 GameHub 기준 (재사용)

- **`admin.gamehub.chat_audit`**: `action`, `message_id`, `target_user_id?`, `reason_code`, `server_ms` (CHAT_EVENT_SCHEMA §9)
- **신고 큐**: `admin.gamehub.report_created`, `admin.gamehub.report_status_changed` (MODERATION_FLOW §6)
- **거절·길이 초과**: 원문 저장 불필요; `user_id`, `channel_id`, `code`, `body_length` 등 (CHAT_EVENT_SCHEMA §9 하단)

### 9.2 StreamHub 병렬 키

| 로그/이벤트 키 | 용도 |
|----------------|------|
| `admin.streamhub.chat_audit` | StreamHub 채팅 조치 감사 (필드는 `admin.gamehub.chat_audit` 와 동형 권장) |
| `admin.streamhub.report_created` | `report.created` 와 동형 payload + `source` |
| 금칙어 자동 조치 | `action: filter_auto_mask` 등 `reason_code` 로만 저장; 원문 **옵트아웃** 가능 |

**보존:** 신고·제재 로그는 감사 목적상 **보존 기간 명시**; 일반 `user` 채팅 원문은 샘플링 정책 (CHAT_EVENT_SCHEMA §9).

---

## 10. GameHub와 공통화 가능한 모듈 후보 (구현 시 이름만)

**문서·계약만 공유하고 코드 저장소는 분리**해도 되는 단위다.

| 모듈 후보 | 입력/출력 | 비고 |
|-----------|------------|------|
| **Chat envelope 파서** | `schema_version`, `kind`, `channel_id`, `chat_seq`, `payload` | `channel_id` 접두사로 `room_chat` vs `stream_chat` 분기 |
| **메시지 리스트 VM** | `chat_seq` 정렬, 스냅샷 병합 | 가상 스크롤·최근 N (CHAT_EVENT_SCHEMA §8) |
| **신고 바텀시트/컨텍스트 메뉴** | `reason_code` 목록, `target_message_id` | 모바일/PC 분기만 스킨 |
| **Mute 배너** | `until_server_ms` + `message_key` | |
| **Placeholder 렌더러** | hidden/deleted/update 패치 | `message_key` 단일 진입점 |
| **에러 매핑** | `GH_RATE_LIMITED_CHAT`, `GH_CHAT_MESSAGE_TOO_LONG` | `GAMEHUB_REALTIME_ERROR_CODES.md` 와 동일 코드 재사용 권장 |

---

## 11. 스키마 문서 간 차이 해소 (다음 버전 bump 시)

1. `STREAMHUB_REALTIME_EVENT_SCHEMA.md` §2.5 `chat.message` 에 **`chat_seq`**, **`message_type`**, **`message_key`**, **`sender_user_id`** 추가 및 `kind`→`message_type` 통합 안내.  
2. §2.9 `report.created` 에 **`channel_id`**, **`room_id`**, **`reason_code`**(또는 `category`→`reason_code` 매핑 표) 명시.  
3. §2.7–2.8 과 §5 **mute/ban** 을 `streamhub.chat_user_muted` 동형 이벤트와 **병기**할지 결정.

---

## 관련 문서

- `../10-GameHub/docs/GAMEHUB_CHAT_EVENT_SCHEMA.md`  
- `../10-GameHub/docs/GAMEHUB_MODERATION_FLOW.md`  
- `STREAMHUB_REALTIME_EVENT_SCHEMA.md`  
- `STREAMHUB_ADMIN_EVENT_SCHEMA.md` (`admin.streamhub.*` 감사·신고 큐)  
- `STREAMHUB_RECOVERY_RESYNC_CONTRACT.md`  
- `STREAMHUB_SCREEN_FLOW.md`

---

*StreamHub 11번 레포 기획 4단계 산출물.*
