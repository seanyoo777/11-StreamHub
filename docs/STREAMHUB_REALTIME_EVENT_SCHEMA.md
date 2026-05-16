# StreamHub 실시간 방송 이벤트 스키마 (기획 3·6·7·9단계)

**문서 버전:** 1.2  
**기준일:** 2026-05-14  
**변경 요약 (1.2):** **`streamhub.error`** 를 이벤트 카탈로그 **§2.11 공식 항목**으로 추가. Payload 는 `docs/STREAMHUB_REALTIME_ERROR_CODES.md` **ErrorEnvelope(§1.2)** 와 **동일**. `SH_*` / `GH_*` 사용 기준·`moderation.*` / `report.created` 와의 **직교** 명시 (`STREAMHUB_REALTIME_ERROR_CODES.md` 와 연결 완료, 기획 9단계). **ROOM_CONTRACT** 상호 참조 **v1.2** (기획 10).

**변경 요약 (1.1):** `docs/STREAMHUB_ROOM_CONTRACT.md` 와 **Room·Session·Presence** 필드 정합. `room.status.updated` 에 `active_session_id`·`live_state` 후보, **`stream.session.updated` (세션 스냅샷) 후보**, `stream.started` / `stream.ended`·`viewer.*` 보강, **모더레이션·신고와 세션 종료 직교** 명시. **(기획 7)** ROOM_CONTRACT **v1.1** §3.2 와 §2.10 `room.status.updated` **Payload 표·`status`↔`live_state` 매핑 표** 상호 참조·**동일 문구** 확정.

**목적:** WebSocket/SSE 등 실시간 채널에서 교환할 **이벤트 이름·페이로드·공통 필드**를 정의한다. 구현 시 본 스키마를 JSON Schema 또는 OpenAPI extension으로 옮길 수 있다.

**전제 (금지·범위):**

- 자체 송출(인제스트) 서버 구축, **WebRTC/RTMP 미디어 서버 구현**, 실제 결제·토큰 발행, 외부 API 연동, **DB 구현**, **대규모 코드 작성**은 본 문서 범위 밖이다.
- `stream.started` / `stream.ended`는 **플랫폼이 관측·승인한 방송 세션 상태**를 나타낸다. RTMP 바이트 수신 자체는 블랙박스일 수 있으며, 이벤트는 **세션 레이어**에서 발행한다.

**Room·Session 계약:** `docs/STREAMHUB_ROOM_CONTRACT.md` — 본 문서의 `session_id`·`ingest_state`·`playback_state`·`StreamSession.state`·시청자 presence 용어는 해당 계약과 **동일 의미**로 쓴다.

**Recovery·Resync:** `docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md` — 재연결 vs resync·`since_*_seq`·스냅샷·갭·재생 복구; **`streamhub.error` 와 역할 분리** (§역할 분리).

---

## 1. 공통 봉투 (Envelope)

모든 이벤트는 아래 최상위 필드를 갖는다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `schema_version` | string | 예 | 예: `"1.2"` (카탈로그 보강 시 마이너 bump) |
| `event_id` | string (UUID) | 예 | 멱등·중복 제거·감사 추적 |
| `event_type` | string | 예 | 본 문서 §2의 이름과 동일 |
| `occurred_at` | string (RFC3339 UTC) | 예 | 이벤트 발생 시각 |
| `room_id` | string | 예* | 방 식별자. 전역 이벤트는 `null` 허용(정책) |
| `actor` | object | 예* | §1.1. 관측만 가능한 이벤트는 시스템 actor |
| `payload` | object | 예 | 이벤트별 본문 |
| `correlation_id` | string | 아니오 | 클라이언트·운영 추적용 |

\* `room_id` / `actor` 가 없는 전역 브로드캐스트가 필요하면 별도 `system.*` 네임스페이스로 확장한다.

### 1.1 `actor` 객체

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | enum | 예 | `"user"` \| `"system"` \| `"admin"` |
| `user_id` | string | 조건 | `type` 이 `user` 일 때 |
| `admin_id` | string | 조건 | `type` 이 `admin` 일 때 |
| `display_handle` | string | 아니오 | UI용 비민감 표시명(스냅샷) |

### 1.2 전달 채널 (개념)

| 채널 | 구독자 | 용도 |
|------|--------|------|
| `room:{room_id}` | 해당 방 시청자·BJ | 채팅·후원·방 상태·모더레이션 알림 |
| `user:{user_id}` | 해당 유저 | 개인 알림(제재·후원 수신 요약 등, 정책 시) |
| `creator:{user_id}` | BJ | 크로스 방 요약은 별도 폴링 또는 집계 토픽 |

동일 `event_type` 이라도 **채널별로 payload 일부를 생략**할 수 있다(예: `viewer.joined` 에서 다른 시청자에게는 집계만).

**`channel_id` (채팅):** `stream_chat:{room_id}` — `docs/STREAMHUB_CHAT_MODERATION_POLICY.md` §1.1.

### 1.3 Room·Session 계약 정합 및 모더레이션 직교

- **Room / Session / Ingest / Playback** 상태 전이는 `docs/STREAMHUB_ROOM_CONTRACT.md` 가 권위다. 실시간 이벤트는 그 **스냅샷·알림**을 전달한다.
- **`moderation.*`**, **`report.created`** 는 **유저·메시지·채팅 채널** 스코프이며 **`stream.ended`·`room.status.updated`·세션 `ENDED` 와 인과적으로 묶지 않는다.**  
  - 예: 채팅 뮤트만으로 방송을 끊지 않음.  
  - 예: 신고 접수만으로 `OFF AIR` 하지 않음(운영 **별 조치**로만 세션 종료).  
- **`streamhub.error`** 는 **실패·거절 알림**용 이벤트(§2.11)이며, **`moderation.*` / `report.created` 와 직교**한다(동일 사건을 오류 코드로만 대체하지 않음; 모더는 별 이벤트·별 로그).  
- 방 `suspended`·관리자 강제 종료는 **`room.status.updated`** + **`stream.ended`** (+ `admin.room.terminated` 등) **한 벌**로 표현하고, 동일 사건을 채팅 모더 이벤트로 **이중 표현하지 않는다** (ROOM_CONTRACT §1.1).

---

## 2. 이벤트 카탈로그

### 2.1 `stream.started`

방송 세션이 **ON AIR** 로 전환되었을 때 발행한다. (`StreamSession.state === LIVE` 진입과 정합; ROOM_CONTRACT §3.1)

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `session_id` | string | 예 | 라이브 세션 고유 ID (`StreamSession.session_id`) |
| `room_id` | string | 아니오 | 봉투와 중복 가능; **스냅샷·로그 수집** 시 payload 단독으로도 해석 가능하게 둘 수 있음 |
| `started_at` | string (RFC3339) | 예 | 세션 시작 시각(봉투와 동일 가능) |
| `playback` | object | 예 | §2.1.1 |
| `title` | string | 아니오 | 방 제목 스냅샷 |
| `category` | string | 아니오 | 카테고리 코드 (`StreamRoom.stream_category` 와 동일 스냅샷 소스) |
| `tags` | string[] | 아니오 | 태그 스냅샷 |
| `reconnect_count` | uint32 | 아니오 | 세션 시작 시점 값(보통 `0`). `StreamSession.reconnect_count` |
| `ingest_state` | string | 아니오 | `StreamSession.ingest_state` 스냅샷(예: `HEALTHY`). 블랙박스 관측. |
| `playback_state` | string | 아니오 | `StreamSession.playback_state` 스냅샷(예: `READY`). |
| `session_state` | string | 아니오 | 권위 세션 상태; `stream.started` 시점에는 보통 `"LIVE"`. (`StreamSession.state` enum) |

**`playback`**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `manifest_url` | string | 예 | HLS/DASH 등 재생 매니페스트(권한 있을 때만 포함 정책) |
| `expires_at` | string | 아니오 | URL 만료 시각(서명 URL인 경우) |

**비고:** 클라이언트는 `room.status.updated` 와 함께 도착할 수 있음 — 순서는 `event_id`·`occurred_at` 으로 정렬하지 않고 **`session_id` + `stream.session.updated`(후보) 또는 `room.status.updated` 단일 소스**를 권장.

---

### 2.2 `stream.ended`

세션이 **종료**되었을 때. (`StreamSession.state` → `ENDED` / `ARCHIVED` 진입과 정합)

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `session_id` | string | 예 | 종료된 세션 ID |
| `room_id` | string | 아니오 | 스냅샷용(§2.1 과 동일) |
| `ended_at` | string (RFC3339) | 예 | 종료 시각 |
| `reason` | enum | 예 | `"bj_stopped"` \| `"signal_lost"` \| `"admin_terminated"` \| `"system"` |
| `reconnect_count` | uint32 | 아니오 | 종료 시점 최종 값 (`StreamSession.reconnect_count`) |
| `ingest_state` | string | 아니오 | 종료 시점 스냅샷(예: `TERMINATED`) |
| `playback_state` | string | 아니오 | 예: `ENDED` |

---

### 2.2a `stream.session.updated` (후보)

세션 권위 상태가 **`CREATED` / `PREPARING` / `LIVE` / `RECONNECTING` / `ENDED` / `ARCHIVED`** 중 하나로 바뀔 때마다(또는 저빈도 배치로) **스냅샷**을 내릴 수 있다. `stream.started`·`stream.ended` 만으로 부족한 UI(재연결 배너 등)를 보완한다.

**Payload (후보)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `session_id` | string | 예 | |
| `room_id` | string | 예 | |
| `state` | string | 예 | `StreamSession.state` (ROOM_CONTRACT §3.1) |
| `reconnect_count` | uint32 | 아니오 | |
| `ingest_state` | string | 아니오 | |
| `playback_state` | string | 아니오 | |
| `updated_at` | string (RFC3339) | 예 | |

**브로드캐스트:** `room:{room_id}` (BJ·시청자); 민감 운영 메타는 생략 가능.

---

### 2.3 `viewer.joined`

시청자가 **방 실시간 채널에 구독**했을 때(“입장”). **Viewer presence** (`ROOM_CONTRACT` §4)와 정렬: 기본 진입은 **`ACTIVE`** 로 간주할 수 있다.

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `viewer_user_id` | string | 예 | 입장 유저(민감하면 방송 채널에서는 해시·익명 ID로 대체) |
| `session_id` | string | 아니오 | 시청 중인 활성 세션(있을 때). `active_session_id` / `live_session_id` 와 동일 값 권장 |
| `presence_state` | enum | 아니오 | `"ACTIVE"` \| `"IDLE"` \| `"DISCONNECTED"` \| `"RECONNECTING"` — **joined 직후**에는 보통 `"ACTIVE"` |
| `client` | object | 아니오 | §2.3.1 |
| `presence_seq` | integer | 아니오 | 순서 보장용 단조 증가값 |

**`client` (선택)**

| 필드 | 타입 | 설명 |
|------|------|------|
| `platform` | enum | `"web"` \| `"ios"` \| `"android"` \| `"desktop"` |
| `app_version` | string | 클라이언트 버전 |

**Presence 정합 (ROOM_CONTRACT §4):**

| `presence_state` (또는 서버 내부 상태) | `viewer.joined` / 기타 |
|----------------------------------------|-------------------------|
| `ACTIVE` | 구독 성공 직후 기본 |
| `IDLE` | 선택: 하트비트 기반 전환 시 **별 이벤트 후보** `viewer.presence_updated`(문서화만, v1.2+) |
| `DISCONNECTED` | `viewer.left` `reason: disconnect` 직전·유예 중 표현은 구현 선택 |
| `RECONNECTING` | 동일 `viewer_user_id` 재구독 시도 중; 중복 `joined` 억제 정책과 병행(ROOM_CONTRACT §6.2) |

**브로드캐스트 정책:** 타인에게 `viewer_user_id` 를 숨기고 `viewer_count_delta: +1` 만 보내는 **축약 이벤트**로 대체 가능 — 그 경우 `event_type` 은 동일하고 payload 프로파일만 `"public"` / `"bj"` 로 나눈다.

---

### 2.4 `viewer.left`

구독 해제·타임아웃·강퇴로 인한 **퇴장**. Presence **종료**와 정합.

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `viewer_user_id` | string | 예 | 퇴장 유저(정책에 따라 축약) |
| `session_id` | string | 아니오 | 퇴장 시점 활성 세션 |
| `reason` | enum | 예 | `"leave"` \| `"disconnect"` \| `"kicked"` \| `"banned"` |
| `presence_seq` | integer | 아니오 | |

**`reason` ↔ presence (ROOM_CONTRACT §4):** `leave` → 정상 종료; `disconnect` → 전송 끊김; `kicked` / `banned` → BJ·모더·제재와 연계 시 동일 세션 재입장 불가 등은 **ROOM_CONTRACT** 따름. `moderation.muted` 단독으로는 `viewer.left` 를 요구하지 않음(§1.3).

---

### 2.5 `chat.message`

채팅 한 줄.

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `message_id` | string | 예 | 채팅 메시지 고유 ID |
| `channel_id` | string | 예 | 원칙: `stream_chat:{room_id}` (`CHAT_MODERATION_POLICY`) |
| `author` | object | 예 | `{ "user_id", "handle", "badges": [] }` 스냅샷 |
| `body` | string | 예 | 본문(길이 상한 정책) |
| `kind` | enum | 예 | `"user"` \| `"system"` \| `"donation_highlight"` |
| `reply_to` | string | 아니오 | 상위 `message_id` (스레드 미지원 시 생략) |
| `client_nonce` | string | 아니오 | 낙관적 UI 중복 제거 |

**시스템 메시지:** `author` 는 시스템 계정 또는 `kind: "system"` 만 채운다.

---

### 2.6 `donation.sent`

내부 포인트/코인 후원이 **커밋**되었을 때.

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `donation_id` | string | 예 | 후원 트랜잭션 ID |
| `from_user_id` | string | 예 | 후원자 |
| `to_user_id` | string | 예 | BJ(방 소유자) |
| `amount` | object | 예 | §2.6.1 |
| `fee` | object | 예 | §2.6.2 |
| `message` | string | 아니오 | 짧은 메시지(모더레이션 대상) |
| `anonymous` | boolean | 아니오 | 공개 채팅에 핸들 숨김 등 |
| `linked_chat_message_id` | string | 아니오 | `chat.message` 하이라이트와 연결 |

**`amount`**

| 필드 | 타입 | 설명 |
|------|------|------|
| `unit` | enum | `"point"` \| `"coin"` (플랫폼 정의) |
| `value` | string (decimal) | 문자열 권장 — 부동소수 오차 방지 |

**`fee`**

| 필드 | 타입 | 설명 |
|------|------|------|
| `platform_rate` | string | 예: `"0.05"` (비율) |
| `platform_amount` | string | 플랫폼 수수료 절대량 |
| `recipient_amount` | string | BJ 수령분 |

실제 결제 없음 — 위 수치는 **내부 원장** 기준이다.

---

### 2.7 `moderation.muted`

특정 유저의 **채팅 일시 금지**(타임아웃 포함). **세션·방 종료와 직교** (§1.3).

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `target_user_id` | string | 예 | 대상 |
| `scope` | enum | 예 | `"room"` \| `"global"` (global 은 드묾) |
| `until` | string (RFC3339) | 아니오 | null 이면 운영자 수동 해제까지 |
| `reason_code` | string | 아니오 | 내부 코드 |
| `public_notice` | string | 아니오 | 채팅에 노출할 짧은 시스템 문구 |

---

### 2.8 `moderation.banned`

**방 또는 플랫폼** 단위 강한 제재(입장 불가·계정 정지 등 정책에 매핑). `kick_presence: true` 일 때만 **presence·`viewer.left`** 와 연계; 그 외 **세션 `ENDED` 와 별개**(§1.3).

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `target_user_id` | string | 예 | |
| `scope` | enum | 예 | `"room"` \| `"platform"` |
| `ban_id` | string | 예 | 제재 레코드 ID |
| `expires_at` | string | 아니오 | 영구면 생략 |
| `reason_code` | string | 아니오 | |
| `kick_presence` | boolean | 아니오 | true 이면 즉시 `viewer.left` 유발 가능 |

---

### 2.9 `report.created`

신고가 **접수**되었을 때. **일반 시청자에게는 브로드캐스트하지 않는 것이 기본.** **세션 종료와 직교** (§1.3).

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `report_id` | string | 예 | |
| `reporter_user_id` | string | 예 | |
| `room_id` | string | 예 | `CHAT_MODERATION_POLICY` §4.2 정렬 |
| `channel_id` | string | 아니오 | 메시지 신고 시 `stream_chat:{room_id}` 권장 |
| `subject_type` | enum | 예 | `"user"` \| `"room"` \| `"message"` |
| `subject_id` | string | 예 | 대상 ID(메시지면 `message_id`) |
| `category` | enum | 예 | `"spam"` \| `"hate"` \| `"sexual"` \| `"violence"` \| `"copyright"` \| `"other"` |
| `note` | string | 아니오 | 자유 설명 |

**수신 채널:** `admin:reports` 또는 내부 큐만. BJ에게는 **익명 카운트만** 별도 이벤트로 줄지 여부는 운영 정책.

---

### 2.10 `room.status.updated`

방 **메타·노출 상태**가 바뀌었을 때(ON AIR 와 별도로 **목록·검색에 영향**).

**상호 참조:** `StreamRoom.live_state` 의 방 단위 정의·조건은 `docs/STREAMHUB_ROOM_CONTRACT.md` **§3.2** 첫 표와 **동일 권위**이다. 아래 **`status` ↔ `live_state` 매핑** 표는 ROOM **§3.2** 후반 표와 **동일 문구**를 공유한다.

**Payload**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `status` | enum | 예 | `"live"` \| `"offline"` \| `"scheduled"` \| `"hidden"` \| `"suspended"` |
| `live_session_id` | string | 아니오 | `live` 일 때 현재 세션 (**1.0 호환**) |
| `active_session_id` | string | 아니오 | **1.1 후보:** 활성 `StreamSession.session_id`. `live_session_id` 와 **동일 값이면 필드 하나만**내도 됨 |
| `live_state` | string | 아니오 | **1.1 후보:** `StreamRoom.live_state` 스냅샷 (`OFFLINE` \| `PREPARING` \| `LIVE` \| `RECONNECTING` \| `ENDED` \| `ARCHIVED`). 클라가 목록 카드만 갱신할 때 유용 |
| `title` | string | 아니오 | 변경 스냅샷 |
| `category` | string | 아니오 | |
| `viewer_count` | integer | 아니오 | 집계 스냅샷(과장 방지 정책 시 반올림) |

#### `room.status.updated.status` ↔ `StreamRoom.live_state` 매핑 (정합)

| `status` (이벤트) | `live_state` (후보, `StreamRoom.live_state`) | 비고 |
|-------------------|-----------------------------------------------|------|
| `offline` | `OFFLINE` 또는 `ENDED` | 제품이 “방금 종료” 버퍼를 쓰면 `ENDED` 후 `OFFLINE` |
| `live` | `LIVE` | 활성 세션 ON AIR |
| `scheduled` | `PREPARING` 또는 세션 `CREATED` | 예약·준비 UI |
| `hidden` | (불변 또는 이전 값 유지) | **노출**만 제한; 세션 상태와 독립 |
| `suspended` | 운영 강제; 세션은 종료 쪽 | `stream.ended`·`admin.*` 와 같은 운영 사건과 페어 |

(위 매핑 표의 **헤더·셀 문구·열 구성**은 `docs/STREAMHUB_ROOM_CONTRACT.md` v1.2 **§3.2** 후반 **「`status` ↔ `live_state` 매핑 (정합)」** 표와 **완전히 동일**하다.)

`stream.started` / `stream.ended` 와의 관계: **단일 UI 상태 머신**은 `room.status.updated` 및(선택) **`stream.session.updated`** 를 우선 소비하고, 플레이어 URL은 `stream.started` 를 따른다.

---

### 2.11 `streamhub.error`

애플리케이션 계층 **실시간 오류**를 통지한다. 성공 이벤트(`stream.started`, `room.status.updated` 등)를 **대체하지 않으며**, §2.1·§2.2·§2.10 의 **의미·필드 정의를 변경하지 않는다**.

**Payload**

- 본 이벤트의 `payload` 는 `docs/STREAMHUB_REALTIME_ERROR_CODES.md` **§1.2 공통 `payload` (ErrorEnvelope)** 와 **필드명·의미·필수 여부가 동일**하다. (`code`, `message`, `message_key`, `fatal`, `retryable`, `server_ms`, `request_id`, `context`)

**`code` 접두사 기준**

| 접두사 | 사용 |
|--------|------|
| **`SH_*`** | 방송·세션·시청(재생)·후원 등 **StreamHub 제품 전용** 사유. 정의·`fatal`/`retryable`/`message_key` 는 `STREAMHUB_REALTIME_ERROR_CODES.md` §2–§7. |
| **`GH_*`** | GameHub `GAMEHUB_REALTIME_ERROR_CODES.md` 에 **이미 정의된** 인증·권한·채팅 공통 등 **재사용 가능** 코드만. StreamHub 전용 의미를 `GH_` 로 **신규 정의하지 않는다**. |

**`moderation.*` / `report.created` 와의 직교**

- `streamhub.error` 는 **요청 거절·일시 실패·정책 안내** 등에 쓰이고, **`moderation.muted` / `moderation.banned` / `report.created`** 와 **인과적으로 묶지 않는다**. (예: 뮤트는 모더 이벤트 + 필요 시 `GH_AUTH_FORBIDDEN` 등; 슬로우 모드는 `SH_CHAT_SLOWMODE` — `STREAMHUB_REALTIME_ERROR_CODES.md` §5.)
- 신고 접수·세션 OFF AIR 는 §1.3 원칙 유지.

**예시 `code` 값 (비전량):** `SH_STREAM_OFFLINE`, `SH_STREAM_RECONNECTING`, `SH_CHAT_SLOWMODE`, `SH_DONATION_DISABLED` — 전체 목록은 `STREAMHUB_REALTIME_ERROR_CODES.md`.

**브로드캐스트:** `room:{room_id}` 또는 `user:{user_id}` (대상자만). `event_id`·멱등은 §5.

---

## 3. 관리자 제재 (추가 이벤트 후보)

운영 도구와 실시간 방을 일치시키기 위한 확장. MVP에서는 생략 가능. **감사·큐 원장** 수준의 정식 계약은 `docs/STREAMHUB_ADMIN_EVENT_SCHEMA.md` (`admin.streamhub.*`) 를 권위로 한다.

| `event_type` | 설명 | Payload 하이라이트 |
|--------------|------|---------------------|
| `admin.room.terminated` | 관리자 강제 종료(후보·레거시 별칭) | `reason_code`, `session_id`, `room_id` — **권장 감사 kind:** `admin.streamhub.stream_force_ended` (`ADMIN_EVENT_SCHEMA` §7) |
| `admin.user.suspended` | 계정 정지 | `until`, `reason_code` |
| `admin.fee.updated` | 내부 수수료 정책 변경 알림(브로드캐스트 제한) | 정책 버전 번호 |

---

## 4. GameHub / OneAI 연동 후보

외부 연동은 구현하지 않되, **같은 봉투**로 수신하면 클라이언트가 확장 처리할 수 있게 네임스페이스를 둔다.

### 4.1 GameHub (후보)

| `event_type` | 방향 | Payload 요약 |
|--------------|------|--------------|
| `gamehub.state.snapshot` | GameHub → Room | `game_id`, `payload` (자유 JSON, 크기 상한 필수), `sequence` |
| `gamehub.event.highlight` | GameHub → Room | `title`, `body`, `severity`, `ttl_seconds` |

**`actor.type`:** `"system"` 이고 `actor.user_id` 없음. `room_id` 필수.

### 4.2 OneAI (후보)

| `event_type` | 방향 | Payload 요약 |
|--------------|------|--------------|
| `oneai.chat.summary` | OneAI → BJ 전용 채널 | `summary`, `window_start`, `window_end`, `confidence` |
| `oneai.session.recap` | OneAI → BJ 또는 방 아카이브 | `bullets[]`, `session_id` |

**비고:** AI 결과는 **저빈도**·**옵트인**을 전제로 하며, 채팅 원문 전체를 payload에 넣지 않고 **참조 ID**만 두는 방식을 권장한다.

---

## 5. 순서·멱등·보안

- **순서:** 같은 `room_id` 내에서는 `presence_seq` / 채팅 `message_id` 사전식이 아닌 **서버 단조 시퀀스** 하나를 권장. 세션 상태는 **`stream.session.updated`** 또는 **`room.status.updated`** 의 `updated_at` / 봉투 `occurred_at` 으로 보조.  
- **멱등:** `event_id` 로 클라이언트·서버 중복 처리. `donation_id` 는 원장과 1:1.  
- **권한:** `playback.manifest_url` · 타인 `viewer_user_id` · `report.created` 는 **채널·역할별 필터** 필수.  
- **크기:** `gamehub.state.snapshot.payload` 및 `chat.message.body` · **`streamhub.error`** 의 `message` 에 **바이트 상한**을 둔다.

---

## 6. 예시 (한 방에서의 이벤트 흐름, 축약)

1. `room.status.updated` `{ status: "live", active_session_id, live_state: "LIVE" }`  
2. `stream.session.updated` (후보) `{ state: "LIVE", ingest_state, playback_state }`  
3. `stream.started` `{ session_id, reconnect_count: 0, ingest_state, playback_state, session_state: "LIVE", ... }`  
4. (선택) `streamhub.error` `{ code: "SH_STREAM_RECONNECTING", retryable: true, ... }` — 인제스트 유예 시  
5. `viewer.joined` `{ presence_state: "ACTIVE", session_id, ... }`  
6. `chat.message` …  
7. `donation.sent` → 연결 시 `chat.message` `kind: "donation_highlight"` 추가 발행 가능  
8. `moderation.muted` → **세션 유지**; 대상 유저 `user:{id}` 에도 통지 가능  
9. `stream.ended` → `room.status.updated` `{ status: "offline", live_state: "OFFLINE" }`

---

## 관련 문서

- `docs/STREAMHUB_ROOM_CONTRACT.md` (v1.2 §3.2·§1.1 — 본 문서 §2.10·§1.3 상호 참조)  
- `docs/STREAMHUB_REALTIME_ERROR_CODES.md` (ErrorEnvelope·`SH_*` / `GH_*` — 본 문서 **§2.11 `streamhub.error`** 와 payload 동일)  
- `docs/STREAMHUB_MASTER_PLAN.md`  
- `docs/STREAMHUB_SCREEN_FLOW.md`  
- `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`  
- `docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md` (재연결·resync·갭·재생 복구)  
- `docs/STREAMHUB_ADMIN_EVENT_SCHEMA.md` (`admin.streamhub.*` — §3 관리자 후보·감사와 연계)

---

*StreamHub 11번 레포 기획 3·6·7·9단계 산출물.*
