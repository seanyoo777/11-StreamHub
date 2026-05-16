# StreamHub Room·Session·Presence 계약 — 11번 전용

**문서 버전:** 1.2  
**기준일:** 2026-05-14  
**변경 요약 (1.2):** 전제 문서 `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` **v1.2** 기준으로 갱신. **`streamhub.error`** (§2.11)는 **Room·Session 상태 전이를 대체하지 않음** (기획 10단계).  
**변경 요약 (1.1):** `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` **v1.1** §2.10 `room.status.updated` 와 **`active_session_id` / `live_state` / `live_session_id`** 문구·의미 **완전 정합** 및 상호 참조(기획 7단계).  
**단계:** 기획 5·7·10단계 — 방(`StreamRoom`)·방송 세션(`StreamSession`)·시청자 프레즌스·스트리머 소유권 **서버 권위 계약** (구현 아님)

**전제 문서:** `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` (**v1.2**; §2.10 `room.status.updated`·§2.11 `streamhub.error`), `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`, `docs/STREAMHUB_SCREEN_FLOW.md`  
**참조(형식만):** GameHub `../10-GameHub/docs/GAMEHUB_ROOM_CONTRACT.md` — 본 문서는 **스트림·세션 중심**으로 재구성하며 테이블·게임 룰은 포함하지 않음.

---

## 절대 금지 (본 문서·후속 구현 공통)

- 실제 송출(인제스트) 서버 구현, WebRTC/RTMP 미디어 서버 구현  
- DB 스키마·마이그레이션 구현  
- 결제·토큰 구현  
- 외부 API 연결  

인제스트·CDN·트랜스코딩은 **블랙박스**이며, 본 계약은 **`ingest_state` / `playback_state`** 등 **관측 가능한 상태 필드**만 다룬다.

---

## 1. StreamRoom 구조

**정의:** 목록·URL·메타데이터가 붙는 **지속적 방송방** 단위. 한 `room_id` 는 시간에 따라 **여러 `StreamSession`** 을 가질 수 있다(재방송마다 새 세션 권장).

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `room_id` | string | O | 불변 식별자. `STREAMHUB_REALTIME_EVENT_SCHEMA.md` 의 `room_id`·`room:{room_id}` 구독과 동일. |
| `creator_user_id` | string | O | 방 소유 BJ(스트리머). 소유권 이전은 별도 정책. |
| `stream_category` | string | O | 카테고리 코드(예: `game`, `talk`, `irl`). `stream.started` payload `category` 와 동일 스냅샷 소스. |
| `visibility` | enum | O | `public` \| `unlisted` \| `private`(초대만) 등 — 검색·목록 노출 제어. |
| `tags` | string[] | 선택 | 검색·추천용. `stream.started` 의 `tags` 스냅샷과 정렬. |
| `live_state` | enum | O | **UI·목록용 요약 상태** (§3.1). 활성 세션이 없을 때는 `OFFLINE` (§3.1). |

### 1.1 `channel_id` / `room_id` 규칙 (정렬)

| 용도 | 규칙 | 출처 정합 |
|------|------|-----------|
| 실시간 방 버스 | `room:{room_id}` | `STREAMHUB_REALTIME_EVENT_SCHEMA.md` §1.2 |
| 채팅 전용 | `stream_chat:{room_id}` | `STREAMHUB_CHAT_MODERATION_POLICY.md` §1.1 |
| `room_id` | 모든 이벤트·신고·모더 메타의 공통 키 | `report.created` 확장 시 `room_id` 필수 (`CHAT_MODERATION_POLICY` §4.2) |

**충돌 방지:** `moderation.*` / `report.created` 는 **유저·메시지·채널** 단위이며 **Room lifecycle·방송 세션 종료(`stream.ended` 등)와 직교**한다. 방 `suspended` 는 채팅·재생·입장을 막을 수 있으나, **동일 사건을 채팅 모더 이벤트로 이중 표현하지 않는다**(운영은 `room.status.updated` + `admin.*` 한 벌).

**실시간 오류:** `streamhub.error` (`STREAMHUB_REALTIME_EVENT_SCHEMA.md` §2.11)는 **클라이언트 안내·요청 거절**용이며, **`room.status.updated`·`stream.started`·`stream.ended`** 가 정의하는 **Room·Session 상태 전이를 대체하지 않는다**.

---

## 2. StreamSession 구조

**정의:** 한 번의 “켜짐~꺼짐” 방송 실행 단위. `stream.started` / `stream.ended` 의 **`session_id`** 가 가리키는 엔티티.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `session_id` | string | O | 불변. 실시간 이벤트 `stream.started`·`stream.ended` payload 와 동일. |
| `room_id` | string | O | 소속 방. |
| `started_at` | string (RFC3339) | 조건 | `LIVE` 진입 시각. `PREPARING` 단계에서는 null 허용. |
| `ended_at` | string (RFC3339) | 조건 | `ENDED`·`ARCHIVED` 후 확정. |
| `reconnect_count` | uint32 | O | 세션당 인제스트 단절 후 복구 성공 횟수(§6). |
| `ingest_state` | enum | O | 블랙박스 관측 결과 (§2.1). |
| `playback_state` | enum | O | 매니페스트·CDN 관측 (§2.2). |

### 2.1 `ingest_state` (블랙박스 관측)

| 값 | 의미 |
|-----|------|
| `UNKNOWN` | 아직 관측 전. |
| `NO_SIGNAL` | 송출 키는 있으나 미디어 미수신. |
| `HEALTHY` | 정상 수신(정책 임계 이상). |
| `DEGRADED` | 비트레이트·프레임 드롭 등 품질 저하(선택). |
| `DISCONNECTED` | 신호 단절. |
| `TERMINATED` | 세션 종료로 인제스트 종료. |

### 2.2 `playback_state`

| 값 | 의미 |
|-----|------|
| `NOT_READY` | 매니페스트 미노출. |
| `READY` | `stream.started` 의 `playback.manifest_url` 발급 가능 상태. |
| `STALLED` | 재생 불가·지연 과다(관측). |
| `ENDED` | 재생 종료. |

---

## 3. 상태 전이

### 3.1 `StreamSession.state` (권위 enum — 사용자 지정 6값)

```
CREATED → PREPARING ⇄ RECONNECTING
        ↓
       LIVE ⇄ RECONNECTING
        ↓
      ENDED → ARCHIVED
```

| 상태 | 의미 |
|------|------|
| `CREATED` | 세션 레코드만 생성(키 발급·타이틀 확정 등). |
| `PREPARING` | BJ 송출 준비; 아직 시청자에게 `LIVE` 로 노출하지 않거나 “준비중” 배지. |
| `LIVE` | ON AIR. `stream.started` 발행 시점과 정합. |
| `RECONNECTING` | 인제스트 `DISCONNECTED` 등으로 **유예 구간**(§6); UI “일시 끊김”. |
| `ENDED` | 정상·비정상 종료. `stream.ended` + `ended_at` 확정. |
| `ARCHIVED` | 메타 보존·감사용 동결; 실시간 구독은 `room` 채널 정책에 따라 종료. |

### 3.2 `StreamRoom.live_state` 정합

| `StreamRoom.live_state` | 조건 |
|-------------------------|------|
| `OFFLINE` | 활성 `session_id` 없음 또는 마지막 세션 `ENDED`/`ARCHIVED` 이후. |
| `PREPARING` | 활성 세션 `state ∈ {CREATED, PREPARING}` . |
| `LIVE` | 활성 세션 `state === LIVE` . |
| `RECONNECTING` | 활성 세션 `state === RECONNECTING` . |
| `ENDED` | (선택) 방 UI에서 “방금 종료” 버퍼; 곧 `OFFLINE` 으로 전환 가능. |
| `ARCHIVED` | 방 자체가 보관·비노출(운영). |

**`room.status.updated` 페이로드 (`docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` v1.2 §2.10):** 선택 필드 **`live_session_id`**, **`active_session_id`**, **`live_state`** 의 타입·필수 여부·한글 설명은 해당 절 **Payload 표와 동일 문구**이다(본 계약은 중복 전재하지 않음).

#### `status` ↔ `live_state` 매핑 (정합)

| `status` (이벤트) | `live_state` (후보, `StreamRoom.live_state`) | 비고 |
|-------------------|-----------------------------------------------|------|
| `offline` | `OFFLINE` 또는 `ENDED` | 제품이 “방금 종료” 버퍼를 쓰면 `ENDED` 후 `OFFLINE` |
| `live` | `LIVE` | 활성 세션 ON AIR |
| `scheduled` | `PREPARING` 또는 세션 `CREATED` | 예약·준비 UI |
| `hidden` | (불변 또는 이전 값 유지) | **노출**만 제한; 세션 상태와 독립 |
| `suspended` | 운영 강제; 세션은 종료 쪽 | `stream.ended`·`admin.*` 와 같은 운영 사건과 페어 |

(위 표의 **헤더·셀 문구·열 구성**은 `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` v1.2 §2.10 **「`room.status.updated.status` ↔ `StreamRoom.live_state` 매핑 (정합)」** 표와 **완전히 동일**하다.)

---

## 4. Viewer presence 정책

**정의:** 시청자가 **`room:{room_id}` 실시간 구독**을 맺은 것에 대한 서버 권위 상태. `viewer.joined` / `viewer.left` (`STREAMHUB_REALTIME_EVENT_SCHEMA.md` §2.3–2.4)와 정렬.

| 상태 | 의미 |
|------|------|
| `ACTIVE` | 구독 중·최근 하트비트(또는 메시지)로 **활동** 판정. |
| `IDLE` | 구독은 유지하나 일정 시간 **무활동**(채팅·재생 상호작용 없음; 정책 정의). |
| `DISCONNECTED` | 전송 계층 끊김; 유예 전. |
| `RECONNECTING` | 끊김 후 유예 내 재구독 시도 중. |

**`viewer.left` `reason` 매핑 (정합):** `leave` → 정상; `disconnect` → `DISCONNECTED`/`RECONNECTING` 경유; `kicked` → BJ/모더 킥; `banned` → `moderation.banned` 와 연계 시 동일 세션에서 재입장 불가.

**모더레이션과 충돌 금지:** `moderation.muted` 는 **채팅 송신**만 막을 수 있음 — presence `ACTIVE` 유지 가능. `moderation.banned` + `kick_presence` 가 true 이면 presence를 종료하고 `viewer.left` 를 발행.

---

## 5. Streamer ownership 정책

| 역할 | `user_id` 바인딩 | 권한(요약) |
|------|------------------|------------|
| `owner` | `creator_user_id` | 방 메타 수정, 송출 키, 세션 시작/종료, 모더 위임, (정책 시) 메시지 hidden. |
| `moderator` | 별도 목록 | 방 **채팅·시청자 킥** 등 BJ가 위임한 범위만; `room_id`/`stream_chat:{room_id}` 스코프. |
| `guest_host` (후보) | 초대된 공동 호스트 | 제한 송출 또는 메타만; **동일 세션에 단일 인제스트 소스** 원칙이면 “송출 권한”은 UI만 또는 `owner` 전용으로 제한(제품 결정). |

**단일 권위:** `ingest_state`·`StreamSession.state` 전이 중 **LIVE / ENDED / 관리자 종료**는 `owner` 또는 `system`/`admin` 만 트리거한다. `moderator` 가 세션을 강제 종료할지 여부는 **기본 비허용** 권장.

---

## 6. Reconnect 정책

### 6.1 세션(`RECONNECTING`)

1. `ingest_state` 가 `DISCONNECTED` 로 전이하면 `StreamSession.state` → `RECONNECTING` (from `LIVE`).  
2. **유예 시간 `T_reconnect`:** 이 안에 `HEALTHY` 복귀 시 `LIVE`, `reconnect_count += 1`.  
3. 초과 시 `ENDED`, `stream.ended` `reason`: `signal_lost` (또는 정책에 따라 `system`).  
4. BJ가 명시 “방송 종료” 시 즉시 `ENDED` — `reconnect_count` 불증가.

### 6.2 시청자(`viewer`)

- 클라이언트는 동일 `room_id` 로 WS 재구독; 서버는 `viewer.joined` 재발행 또는 `RECONNECTING` 내 **중복 입장 억제** 정책(동일 `user_id` 단일 presence).  
- `since_chat_seq` 등 채팅 갭 복구는 `STREAMHUB_CHAT_MODERATION_POLICY.md` §3.2 — **상세:** `docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md` §4·§7.

---

## 7. Room lifecycle

```
[Room 생성] → CREATED (메타 편집)
          → ACTIVE (공개 가능)
          → (선택) SUSPENDED (관리자)
          → ARCHIVED | DELETED(정책)
```

- **Room `CREATED`** 와 **Session `CREATED`** 이름이 겹치므로 문서·코드에서는 **`room_lifecycle`** 과 **`session.state`** 를 **다른 필드명**으로 구분한다(본 절은 방 껍데기 전용).  
- **활성 세션이 있을 때** 방을 `ARCHIVED` 로 내리면 §10 관리자 절차를 따른다.

---

## 8. 모바일/PC 차이

| 항목 | 모바일 | PC |
|------|--------|-----|
| 상태 표시 | 상단 배지(`LIVE`/`RECONNECTING`) + 풀스크린 시 최소화 | 플레이어 옆 상태 텍스트 |
| `RECONNECTING` | 전체 화면 오버레이·짧은 문구 + `message_key` | 동일 + BJ 대시보드에 상세 타이머(선택) |
| Presence | 백그라운드 시 `DISCONNECTED` 빠름 — 유예 짧게 할지 정책 | 상대적으로 안정 |
| BJ 송출 | `PREPARING` 안내 카드 단순화 | RTMP·키·상태 한 화면 |

---

## 9. GameHub / OneAI 연동 가능성

### 9.1 GameHub

| 영역 | 연동 |
|------|------|
| `room_id` | GameHub `room_id` 와 **문자열 네임스페이스 분리** 권장 (`gh_` / `sh_` 접두 등) — ID 충돌 방지. |
| Presence | GameHub 테이블 presence 와 **다른 스코프**; “관전 중인 GameHub 테이블” 메타만 `StreamRoom.tags` 또는 별도 확장 필드로 표시(구현 아님). |
| 이벤트 | `STREAMHUB_REALTIME_EVENT_SCHEMA.md` §4 `gamehub.state.snapshot` 등 **저빈도** 이벤트만 동일 버스에 태울 수 있음. |

### 9.2 OneAI

- 세션 `ENDED` → `ARCHIVED` 전 **`oneai.session.recap`** (기획 3단계) 입력으로 **메타만** 전달; 채팅 원문은 정책·옵트인.  
- **Live 중** 요약은 BJ 전용 채널·저빈도만.

---

## 10. 관리자 강제 종료 / 강제 OFF AIR 정책

### 10.1 동작

1. 관리자 **강제 OFF AIR:** 활성 `StreamSession` 을 `ENDED` 로 전환, `ingest_state` → `TERMINATED`, `playback_state` → `ENDED`.  
2. **`stream.ended`** 발행: `reason: admin_terminated` (`STREAMHUB_REALTIME_EVENT_SCHEMA.md` §2.2).  
3. **`room.status.updated`:** `status: suspended` 또는 `offline` (제품 정책).  
4. **`viewer.left`** 또는 방 단위 구독 해제 브로드캐스트는 정책 선택.

### 10.2 모더레이션과의 경계

- **채팅만 정지**하는 조치는 `moderation.muted` 등으로 처리 — **세션 상태를 건드리지 않음**.  
- **방 전체 중단**은 본 절의 **세션·room 상태**만 변경; `report.created` 큐와는 **별 트랜잭션**(동일 사건이면 감사 로그에서만 링크).

### 10.3 이벤트 보강 (기획 3단계 §3와 정합)

| 이벤트 | 용도 |
|--------|------|
| `admin.room.terminated` | 관리자 강제 종료 요약(선택 확장) |
| `stream.ended` | 시청자·BJ 플레이어 동기 |
| `room.status.updated` | 목록·검색 |

---

## 11. 요약 다이어그램 (텍스트)

```
StreamRoom (persistent)
    └── StreamSession #1 (ENDED → ARCHIVED)
    └── StreamSession #2 (LIVE ↔ RECONNECTING → ENDED)
            └── ingest/playback (black box)
            └── viewers: ACTIVE | IDLE | DISCONNECTED | RECONNECTING
```

---

## 관련 문서

- `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` (v1.2 §2.10 `room.status.updated`·§2.11 `streamhub.error` — 본 문서 §3.2·§1.1과 상호 참조)  
- `docs/STREAMHUB_ADMIN_EVENT_SCHEMA.md` (`admin.streamhub.stream_force_ended` 등 강제 종료 감사)  
- `docs/STREAMHUB_RECOVERY_RESYNC_CONTRACT.md` (§6.2·§1.2·§2 재연결)  
- `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`  
- `../10-GameHub/docs/GAMEHUB_ROOM_CONTRACT.md`

---

*StreamHub 11번 레포 기획 5·7·10단계 산출물.*
