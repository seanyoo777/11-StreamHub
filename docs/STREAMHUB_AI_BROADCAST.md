# StreamHub — OneAI AI Broadcast bridge (mock)

**Purpose:** 11-StreamHub가 03-OneAI **AI Broadcast / Overlay / Shorts Draft** 계약을 Self-Test로 검증합니다. 런타임 UI는 OneAI에 있으며, StreamHub는 **계약·플래그·감사 액션 이름**만 동기화합니다.

---

## Contract module

`src/validation/contracts/oneAiBridge.js`

- Storage: `oneai.streamhub.overlay`, `oneai.streamhub.shorts_drafts_v1`
- Overlay routes: `?overlay=event|tournament|winner|shorts`
- Flags: `broadcast.ai_announcer.enabled`, `broadcast.overlay.enabled`, `broadcast.shorts_draft.enabled`, `broadcast.operator_review.enabled`
- Shorts: statuses, upload target labels, `ONEAI_SHORTS_FORBIDDEN_AUTO_PUBLISH`
- Audit: `streamhub-shorts` · `shorts.draft.status_changed`

---

## Self-Test suite

`runOneAiBroadcastBridgeSuite()` — id `contract.oneai-broadcast-bridge`

Registered in `runStreamHubSelfTests()` (no network, no WebSocket).

---

## OBS integration (operator)

1. OneAI `#ai-broadcast`에서 overlay payload push → `localStorage`.
2. OBS **Browser Source** → OneAI URL + `?overlay=event` (등) + optional `&clean=1`.
3. Shorts 후보는 OneAI에서 생성·검수; StreamHub는 업로드 파이프라인을 **구현하지 않음**.

상세: [03-OneAI/docs/ONEAI_STREAMHUB_BRIDGE.md](../../03-OneAI/docs/ONEAI_STREAMHUB_BRIDGE.md)
