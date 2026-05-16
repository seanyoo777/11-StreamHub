# StreamHub — OneAI AI Broadcast bridge (mock)

**Purpose:** 11-StreamHub가 03-OneAI **AI Broadcast / Overlay / Shorts Draft** 계약을 Self-Test로 검증합니다. 런타임 UI는 OneAI에 있으며, StreamHub는 **계약·플래그·감사 액션 이름**만 동기화합니다.

---

## Contract module

`src/validation/contracts/oneAiBridge.js`

- Storage: `oneai.streamhub.overlay`, `oneai.streamhub.shorts_drafts_v1`, `oneai.stockpick.shorts_candidates_v1` (read-only reader stub)
- Overlay routes: `?overlay=event|tournament|winner|shorts`
- Flags: `broadcast.ai_announcer.enabled`, `broadcast.overlay.enabled`, `broadcast.shorts_draft.enabled`, `broadcast.operator_review.enabled`
- Shorts: statuses, upload target labels, `ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH`
- Audit: `streamhub-shorts` · `shorts.draft.status_changed`

---

## Self-Test suite

`runOneAiBroadcastBridgeSuite()` — id `contract.oneai-broadcast-bridge`

Registered in `runStreamHubSelfTests()` (no network, no WebSocket).

---

## Shorts Queue (Auto Clip Detection MVP)

StreamHub **mock auto clip** → Shorts Queue → operator review. 상세: [SHORTS_QUEUE.md](./SHORTS_QUEUE.md)

| 항목 | 값 |
|------|-----|
| Queue storage | `streamhub.shorts_queue_v1` |
| Overlay sync | `oneai.streamhub.overlay` |
| Shorts drafts stub | `oneai.streamhub.shorts_drafts_v1` |
| Admin UI | `/admin/shorts` |
| Suites | `contract.shorts-queue-schema`, `mock.auto-clip-detector`, `mock.shorts-operator-flow` |

OneAI bridge 계약(`oneAiBridge.js`)은 **유지** — Shorts Queue가 overlay/draft localStorage 키를 재사용합니다.

### OneAI Stock Pick Shorts reader (stub)

| 항목 | 값 |
|------|-----|
| Read key | `oneai.stockpick.shorts_candidates_v1` |
| Import tracking | `streamhub.stockpick.imported_v1` |
| Admin UI | `/admin/shorts` — OneAI Stock Pick Candidates |
| Suite | `mock.stockpick-reader-flow` |

상세: [ONEAI_STOCK_PICK_SHORTS_READER.md](./ONEAI_STOCK_PICK_SHORTS_READER.md)

### OBS Overlay Scene Manager (mock)

| 항목 | 값 |
|------|-----|
| Storage | `streamhub.overlay_scenes_v1`, `streamhub.overlay_scene_active_v1` |
| Browser URL mock | `https://streamhub.mock/obs-browser#...` |
| Admin UI | `/admin/overlay-scenes` |
| Suites | `contract.overlay-scene-schema`, `mock.overlay-scene-manager` |

HUD 연동: Shorts queue, Viral scores, OneAI briefing hint, Stock Pick ticker, tournament HUD mock. **OBS WebSocket 없음.**

상세: [OBS_OVERLAY_SCENE_MANAGER.md](./OBS_OVERLAY_SCENE_MANAGER.md)

---

## Content Safety Review (upload guard mock)

클립 queued 시 `src/shorts/safety/contentSafetyReview.js` 가 mock rules로 1차 검열합니다. **외부 AI·실제 업로드 없음.**

| 항목 | 값 |
|------|-----|
| Review storage | `streamhub.content_safety_reviews_v1` |
| Rules | `contentSafetyRules.js` |
| Gate | `approved_mock` 전 `pass` 또는 `approve_after_review.mock` |
| UI | `/admin/shorts` — `SafetyReviewPanel` |

상세: [CONTENT_SAFETY_REVIEW.md](./CONTENT_SAFETY_REVIEW.md)

---

## Clip Timeline Editor (mock)

| 항목 | 값 |
|------|-----|
| Storage | `streamhub.clip_timelines_v1` |
| Formats | shorts 15/30/60 · highlight 300s |
| UI | `/admin/shorts` → Edit Clip |

상세: [CLIP_TIMELINE_EDITOR.md](./CLIP_TIMELINE_EDITOR.md)

---

## OBS integration (operator)

1. OneAI `#ai-broadcast`에서 overlay payload push → `localStorage`.
2. OBS **Browser Source** → OneAI URL + `?overlay=event` (등) + optional `&clean=1`.
3. Shorts 후보는 OneAI에서 생성·검수; StreamHub는 업로드 파이프라인을 **구현하지 않음**.

상세: [03-OneAI/docs/ONEAI_STREAMHUB_BRIDGE.md](../../03-OneAI/docs/ONEAI_STREAMHUB_BRIDGE.md)
