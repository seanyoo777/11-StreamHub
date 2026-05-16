# StreamHub Recovery·Resync 공통 계약 — 11번 전용

**문서 버전:** 1.0  
**기준일:** 2026-05-14  
**단계:** 기획 12단계 — 재접속·스냅샷·이벤트 갭·재생 복구 (구현 아님)

**전제 문서:** `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md` (v1.2), `docs/STREAMHUB_ROOM_CONTRACT.md` (v1.2), `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`, `docs/STREAMHUB_REALTIME_ERROR_CODES.md` (`streamhub.error`, `SH_*` / `GH_*`)  
**참조(형식·seq·갭):** `../10-GameHub/docs/GAMEHUB_RECOVERY_RESYNC_CONTRACT.md`

**본 문서 범위:** **전송 계층 재연결**과 **앱 상태 재동기화(resync)** 의 역할 분리, 스코프별 `seq`·**권위 스냅샷(authoritative snapshot)**·갭·**재생(playback) 복구** 정책. WebSocket·WebRTC·RTMP·DB·자동 복구 코드는 포함하지 않음.

**절대 금지:** 실제 WebRTC 구현, RTMP 서버 구현, WebSocket 구현, DB 구현, 자동 복구 코드 구현.

**권위 원칙:** 시청 UI·방 메타·채팅 목록의 최종 상태는 **서버가 내려준 스냅샷**이 기준이며, 끊김 동안 로컬 추론으로 `LIVE`·동시 시청자 수·채팅을 **덮어쓰지 않는다**.

---

## 역할 분리 (핵심)

| 개념 | 담당 | 목적 |
|------|------|------|
| **자동 재연결 (reconnect)** | 전송 계층·클라 런타임 | `room:{room_id}` 등 구독 채널을 **다시 붙임**. 성공해도 앱 상태 정합은 보장하지 않음. |
| **재동기화 (resync)** | 애플리케이션 계약 | 붙은 뒤 **authoritative snapshot** + (선택) 이벤트 재생으로 UI 정합. |
| **재생 복구 (playback recovery)** | 플레이어·CDN 계층 | HLS/DASH **매니페스트·버퍼** 재시도; `StreamSession`·실시간 이벤트와 **별 트랙**. |
| **강제 재동기화** | 서버 판단 또는 resync 코드 | 갭 과대·버전 불일치 시 **풀 스냅샷만** 허용. |

**`streamhub.error` 와 충돌 금지**

| 메커니즘 | 역할 |
|----------|------|
| **`streamhub.error`** (`REALTIME_EVENT_SCHEMA` §2.11, `REALTIME_ERROR_CODES`) | 단발 **요청 거절·일시 실패** 안내 (`SH_STREAM_RECONNECTING` 등). **상태 원장을 대체하지 않음.** |
| **Recovery / resync** (본 문서) | 끊김 후 **권위 스냅샷·seq 재생**으로 클라 모델 **교체**. |

동일 끊김 사건에서 `SH_STREAM_RECONNECTING` 토스트와 **resync 스냅샷**을 함께 쓸 수 있으나, **오류 이벤트만으로 resync 완료를 대체하지 않는다**.

**금지 혼동:** “소켓 재연결 성공”만으로 이전 로컬 `LIVE`·채팅·`manifest_url` 을 유지하지 않는다. **resync 완료(`APP_SYNCED`)** 전에는 “동기화 중” 표시.

---

## 1. Reconnect 상태

### 1.1 전송 계층 (클라 내부, 논리)

| 상태 | 의미 |
|------|------|
| `TRANSPORT_DISCONNECTED` | 실시간 채널 끊김; 백오프 재시도 중일 수 있음. |
| `TRANSPORT_CONNECTING` | 핸드셰이크·인증·구독 복구 중. |
| `TRANSPORT_CONNECTED` | 바이트 채널 살아 있음. **≠ 앱 동기화 완료.** |
| `APP_SYNCED` | 해당 `room_id`(및 필요 시 `channel_id`)에 **authoritative snapshot** 적용 완료. |

### 1.2 방송 세션 (`ROOM_CONTRACT` §3·§6)

| `StreamSession.state` | reconnect / resync UI |
|-----------------------|------------------------|
| `RECONNECTING` | 인제스트 유예; `SH_STREAM_RECONNECTING` 가능; **플레이어**는 버퍼·매니페스트 재시도(§2). |
| `LIVE` | 정상 ON AIR (`stream.started` 와 정합). |
| `ENDED` / `ARCHIVED` | resync 시 **종료 스냅샷**; 재생 URL 갱신 금지(새 세션 필요). |

`StreamRoom.live_state` 의 `RECONNECTING` 은 **목록·배지용**; 클라 resync 완료 전에는 `room.status.updated` 스냅샷을 **서버 권위로 교체**한다.

### 1.3 시청자 presence (`ROOM_CONTRACT` §4, `viewer.*`)

| `presence_state` | 의미 |
|------------------|------|
| `DISCONNECTED` | 전송 끊김; 유예 전. |
| `RECONNECTING` | 동일 `user_id` 재구독 시도; **중복 `viewer.joined` 억제** 권장. |
| `ACTIVE` / `IDLE` | 구독 유지(활동 여부만 다름). |

`viewer.left` `reason: disconnect` 는 전송 끊김; **영구 퇴장이 아니면** resync 후 `viewer.joined` 재발행 또는 presence만 `ACTIVE` 복귀(정책).

### 1.4 인증·세션

- `GH_AUTH_SESSION_EXPIRED`, `GH_AUTH_TOKEN_INVALID` 등 (`REALTIME_ERROR_CODES` §10) → 전송 재연결만으로 부족; **재인증 후 resync** 순서 고정.

---

## 2. Playback reconnect 정책

**정의:** CDN·플레이어가 **미디어 세그먼트**를 다시 받는 과정. **실시간 이벤트 resync**와 분리한다.

| 항목 | 정책 |
|------|------|
| 트리거 | 네트워크 변동, 탭 백그라운드, `ingest_state` `DISCONNECTED`·`RECONNECTING`, 매니페스트 만료 |
| 매니페스트 | `stream.started` 의 `playback.manifest_url` 이 **권위**; 만료 시 **새 URL**은 `stream.started` 또는 `stream.session.updated` 재수신 후에만 교체 |
| 세션 불일치 | 로컬 재생 중 `session_id` ≠ 서버 스냅샷 → **플레이어 정지** + resync 후 재개 |
| 오류 코드 | 일시: `streamhub.error` `SH_STREAM_RECONNECTING` (`retryable: true`); 종료: `SH_STREAM_OFFLINE` |
| WebRTC/RTMP | 본 문서는 **재생 URL·상태 이벤트**만; 인코더·인제스트 구현은 블랙박스 (`ROOM_CONTRACT`) |

**원칙:** 플레이어 자동 재시도는 **허용**(클라 UX); 그 결과만으로 `StreamSession.state` 를 `LIVE`로 **추론하지 않는다**.

---

## 3. Authoritative snapshot 정책

### 3.1 정의

| 항목 | 정책 |
|------|------|
| **Authoritative snapshot** | 서버가 생성한 **한 시점의 스코프 전체 진실**; 클라는 적용 후 로컬 모델을 **교체**(atomic replace 권장). |
| `snapshot_type` | `full` \| `patch` — **재연결·강제 resync** 시에는 **`full` 권장** (§6). |
| seq 필드 | 스냅샷에 **“반영한 마지막 seq”** 포함 (`presence_seq`, `chat_seq`, 세션 메타 버전 등). |

### 3.2 스코프별 스냅샷 종류 (StreamHub)

| 스코프 | 이벤트 / 문서 | 스냅샷 (권장 `kind` / `event_type`) |
|--------|----------------|--------------------------------------|
| 방·세션 메타 | `room.status.updated`, `stream.session.updated` (후보) | **`streamhub.room_snapshot`** (후보) — `room_id`, `active_session_id`, `live_state`, `status`, `title`, `playback` 요약 |
| 방송 시작·종료 | `stream.started`, `stream.ended` | 라이브 중 **풀 resync** 시 `stream.started` 동형 필드 재전달 또는 room 스냅샷에 `playback` 포함 |
| 채팅 (`channel_id`) | `CHAT_MODERATION_POLICY` §3 | **`streamhub.chat_message_list_snapshot`** (`gamehub.chat_message_list_snapshot` 동형) |
| 시청 집계 | `viewer.joined` / `viewer.left` | 스냅샷에 `viewer_count` 등 **집계만** (개별 `viewer_user_id` 는 정책·역할별) |

**비밀·역할:** `playback.manifest_url`·타인 `viewer_user_id` 는 **채널·역할 필터** (`REALTIME_EVENT_SCHEMA` §5).

---

## 4. `since_*_seq` 정책

클라→서버 **재동기 요청**에 넣는 “마지막으로 적용한 seq” (스코프별 필드명 고정).

| 스코프 | 클라 보관 | 요청 필드 | 서버 응답 |
|--------|-----------|-----------|-----------|
| 방 실시간 (`room:{room_id}`) | `last_presence_seq` (또는 통합 `room_stream_seq` — 구현 RFC) | `since_presence_seq` | `presence_seq` 이벤트 재생 **또는** `streamhub.room_snapshot` |
| 채팅 (`stream_chat:{room_id}`) | `last_chat_seq` | **`since_chat_seq`** | `chat.message` / `streamhub.chat_message` 스트림 재생 **또는** `streamhub.chat_message_list_snapshot` |
| (선택) 세션 메타 | `last_session_revision` | `since_session_revision` | `stream.session.updated` 재생 또는 room full snapshot |

**규칙**

- 서버는 `since` **이하**는 재전송하지 않음; **`since + 1`부터** 단조 재생 (`CHAT_MODERATION_POLICY` §3.2).
- 클라 `since` **unknown** 또는 서버 `current` 보다 크면 → **풀 스냅샷** (stale client).
- **`chat_seq` 와 `presence_seq` 혼용 금지** — 스코프·채널별 **독립 열**.

**재동기 요청 envelope (논리, 구현 비범위)**

| 필드 | 설명 |
|------|------|
| `user_id` | |
| `room_id` | |
| `session_id` | 알고 있으면 (활성 세션) |
| `channel_id` | 채팅 resync 시 `stream_chat:{room_id}` |
| `since_chat_seq` / `since_presence_seq` | 스코프별 |
| `client_last_server_ms` | 선택 |

---

## 5. Event gap 처리

### 5.1 갭 정의

- 채팅: `last_chat_seq = N`, 서버 `current_chat_seq = M`, **`M > N + 1`** → 갭.
- presence(또는 room 스트림 seq): 동일 패턴.

### 5.2 처리 분기

| 조건 | 서버 동작 | 클라 동작 |
|------|-----------|-----------|
| `M - N <= gap_replay_max` (구현 파라미터, 예: 50) | `N+1 .. M` **append-only** 재생 | 순서 적용 후 `last_*_seq = M` |
| `M - N > gap_replay_max` | **풀 스냅샷만**; 재생 생략 | 로컬 상태 **교체**; resync 코드 통지(§5.3) |
| `N > M` (stale) | 풀 스냅샷 | “동기화 중” → 교체 |

### 5.3 Resync required 코드

| 코드 | 사용 |
|------|------|
| **`GH_RESYNC_REQUIRED`** | GameHub 문서에 정의됨 — StreamHub에서 **갭 과대·재생 거부** 시 **재사용 권장** (`REALTIME_ERROR_CODES` §10, `retryable: true`). |
| **`SH_RESYNC_REQUIRED`** (후보) | StreamHub 전용 메시지 키가 필요할 때만 `REALTIME_ERROR_CODES` v1.1+ 에 추가; **의미는 `GH_*` 와 동일**. |

**`SH_STREAM_RECONNECTING` 과 구분:** 인제스트·재생 **일시** 실패(§2); **갭·스냅샷 교체**는 resync required 쪽.

---

## 6. Full snapshot vs patch 정책

| 상황 | 권장 |
|------|------|
| 일상 라이브 (`room.status.updated` 일부 필드) | **patch** 허용 |
| 최초 방 입장 | **full** room + chat snapshot |
| 전송 재연결 직후 | **full** (feature flag로 강제 가능, §10) |
| `GH_RESYNC_REQUIRED` / 갭 과대 | **full only** |
| `StreamSession` `ENDED` | **full** 종료 메타; 재생 중 patch 금지 |

Patch 적용 시에도 **정합성 필드**(`session_id`, `live_state`, `active_session_id`)는 **항상** 포함하거나 full과 함께 내려야 한다.

---

## 7. Chat replay 정책

| 항목 | 정책 |
|------|------|
| 채널 | `stream_chat:{room_id}` (`CHAT_MODERATION_POLICY` §1.1) |
| 정렬 | `chat_seq` 오름차순 only |
| 재연결 | `since_chat_seq` → 갭 재생 또는 `streamhub.chat_message_list_snapshot` |
| 삭제·숨김 | 재생 중에도 **append-only**; 숨김은 `streamhub.chat_message_hidden` / `updated` 로 **새 이벤트** (`CHAT_MODERATION_POLICY` §5) |
| 세션 경계 | `session_id` 변경 시 **chat full snapshot** 권장 (`ROOM_CONTRACT` §6.2) |
| 모더레이션 | `moderation.*` 는 replay와 **직교**; replay는 **메시지 스트림**만 |

---

## 8. Viewer / spectator 재동기화

StreamHub는 GameHub **테이블 관전**과 달리 **방송 시청** 중심이다. “Spectator” = **비착석 시청자**로 통일한다.

| 항목 | 정책 |
|------|------|
| 구독 | `room:{room_id}` + (선택) `stream_chat:{room_id}` |
| 스냅샷 | 플레이어·방 메타·채팅은 **동일 resync 플로우**; BJ 전용 필드는 **역할 필터** |
| `viewer_user_id` | 공개 채널에는 **집계·익명화** (`viewer.joined` 축약 프로파일, `REALTIME_EVENT_SCHEMA` §2.3) |
| 중복 입장 | `RECONNECTING` 유예 내 **단일 presence** (`ROOM_CONTRACT` §6.2) |
| 강퇴·밴 | resync **중단** → `viewer.left` / `GH_AUTH_FORBIDDEN`; 스냅샷으로 복구하지 않음 |

**(선택) 지연 관전:** GameHub `spectator_delay_sec` 동형이 필요하면 feature flag로만 도입(§10).

---

## 9. Append-only event 원칙

- 서버 **이벤트 로그**는 append-only; `chat_seq`·`presence_seq` **재사용·감소 없음** (`CHAT_MODERATION_POLICY` §3.2).
- 클라 재생 중 **역순 적용 금지**; 스냅샷 적용 시 **단일 atomic replace** 권장.
- **정정**은 **새 이벤트** 또는 **새 full snapshot** (`stream.session.updated`, `room.status.updated`, admin 감사와 동일 철학).
- `stream.ended` 이후 과거 `session_id` 이벤트를 “취소”하는 patch **금지**.

---

## 10. Feature flag 정책

구현 시 서버/클라 설정 (이름은 구현에서 확정).

| Flag (예) | 효과 |
|-----------|------|
| `streamhub.recovery.gap_replay_enabled` | `false`면 갭 시 **항상 full snapshot** |
| `streamhub.recovery.gap_replay_max` | §5.2 임계치 |
| `streamhub.recovery.force_full_on_reconnect` | 재연결마다 room+chat **full** |
| `streamhub.recovery.chat_snapshot_on_resync` | 채팅 full을 room resync와 동시 |
| `streamhub.recovery.playback_resume_after_resync` | `APP_SYNCED` 후에만 플레이어 play |
| `streamhub.recovery.reset_chat_seq_on_new_session` | 새 `session_id` 시 `chat_seq` 리셋 |

**문서 버전:** `schema_version` (`streamhub.chat_event.v1`, `REALTIME_EVENT_SCHEMA` 봉투) 과 호환성 표에 기록.

---

## 11. 모바일 / PWA reconnect UX

| 단계 | UX |
|------|-----|
| 끊김 감지 | 비차단 배너 “연결 끊김”; **전송 자동 재연결** 시도. |
| 세션 `RECONNECTING` | `message_key` / `SH_STREAM_RECONNECTING`; 플레이어 **버퍼링** 오버레이(§2). |
| Resync 중 | “상태 동기화 중…”; **authoritative snapshot** 전 채팅 입력·후원 **잠금** 가능(정책). |
| 완료 | `APP_SYNCED`; `last_chat_seq`·방 메타 갱신; 플레이어 재개. |
| 실패 반복 | 재인증 CTA 또는 방 퇴장; `SH_STREAM_OFFLINE` / `GH_AUTH_*`. |
| PWA 백그라운드 | 포그라운드 복귀 시 **`since_*_seq` resync**; 백그라운드만으로 LIVE 유지 **가정하지 않음**. |
| iOS 절전 | presence `DISCONNECTED` 빠름 — **짧은 유예** 후 full snapshot 권장 (`ROOM_CONTRACT` §8). |

PC는 동일 상태 머신; 레이아웃만 토스트·사이드 패널 (`SCREEN_FLOW` §7).

---

## 12. GameHub와 공통화 가능한 부분

| 요소 | 공통화 |
|------|--------|
| `TRANSPORT_*` / `APP_SYNCED` | 클라 상태 머신 공유 |
| `since_*_seq` + `gap_replay_max` + full snapshot | 동일 알고리즘 |
| `GH_RESYNC_REQUIRED`, `GH_AUTH_*` | `REALTIME_ERROR_CODES` §10 |
| `streamhub.chat_message_list_snapshot` | `gamehub.chat_message_list_snapshot` **동형** |
| Append-only·갭 분기 | `GAMEHUB_RECOVERY_RESYNC_CONTRACT` §4·§8 |

**비공유:** GameHub `event_seq`·테이블·좌석; StreamHub **`session_id`**, **`playback`**, **`ingest_state`**, **`stream_chat:`**.

---

## 부록: 권장 클라이언트 resync 상태 머신

```
TRANSPORT_DISCONNECTED
  → (auto reconnect) → TRANSPORT_CONNECTED
      → REQUEST_SYNC(since_chat_seq, since_presence_seq, session_id?)
          → gap replay OK → apply events → APP_SYNCED → playback.resume (flag)
          → gap too large / GH_RESYNC_REQUIRED → REQUEST_FULL_SNAPSHOT → APP_SYNCED
      → parallel: player buffering (SH_STREAM_RECONNECTING) — does not skip resync
  → AUTH_FAIL → REAUTH → REQUEST_SYNC ...
```

---

## 관련 문서

- `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md`  
- `docs/STREAMHUB_ROOM_CONTRACT.md`  
- `docs/STREAMHUB_CHAT_MODERATION_POLICY.md`  
- `docs/STREAMHUB_REALTIME_ERROR_CODES.md`  
- `../10-GameHub/docs/GAMEHUB_RECOVERY_RESYNC_CONTRACT.md`

---

*StreamHub 11번 레포 기획 12단계 산출물.*
