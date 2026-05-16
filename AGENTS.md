# AGENTS.md — 11 StreamHub

## PROJECT OVERVIEW

Project Number: **11** = StreamHub (live viewing, chat, moderation — mock-first MVP)

Current role:

- Planning contracts (realtime, room, admin, recovery)
- Mock-first self-test / validation skeleton
- Vite + React shell (no real broadcast/payment/on-chain)

---

## CORE RULES

- Do NOT remove existing features or planning docs (additive only)
- Keep `npm run build`, `npm run lint`, `npm test`, `npm run smoke` passing
- Mock/demo mode first — no real RTMP/WebSocket loops, payment, or settlement
- Security-first; contract docs are source of truth until wired to backend
- Self-test must run without live WebSocket or broadcast

---

## GLOBAL SELF-TEST & VALIDATION

Monorepo ops index: `../docs/GLOBAL_OPERATIONS_CORE.md` (inventory, draft packages, lifecycles).

Follow `docs/GLOBAL_SELF_TEST_VALIDATION.md` on every change:

- `runStreamHubSelfTests()` — pure module, PASS / WARN / FAIL
- Mock audit trail — append-only (`src/validation/mockAuditTrail.js`)
- Feature flags — `src/validation/contracts/featureFlags.js`
- Smoke — `npm run smoke` (no network)

StreamHub mapping:

| Surface | P0 location |
|---------|-------------|
| Self-Test runner | `src/validation/runStreamHubSelfTests.js` |
| Dev UI | `/dev/self-test` — Center, Diagnostics, Audit, scenarios |
| Mock admin | `/admin/dashboard` … `/admin/recovery` — post-change validation on action |
| Audit export | `auditExport.js` + `downloadAuditExportClient` (client-only JSON) |
| Suites | `src/validation/suites/*` |
| Mock audit | `src/validation/mockAuditTrail.js` |
| Smoke | `scripts/smoke.mjs` |

Details: `docs/STREAMHUB_SELF_TEST_VALIDATION.md`, `MASTER_MANUAL.md` § Self-Test.

---

## REQUIRED DOCUMENT RULE

When architecture or contracts change, update the relevant `docs/STREAMHUB_*.md` and cross-references in `MASTER_MANUAL.md`.

---

## KEY DOCS

- `docs/STREAMHUB_MASTER_PLAN.md`
- `docs/STREAMHUB_REALTIME_EVENT_SCHEMA.md`
- `docs/STREAMHUB_ROOM_CONTRACT.md`
- `docs/STREAMHUB_SELF_TEST_VALIDATION.md`
- `docs/GLOBAL_SELF_TEST_VALIDATION.md`
