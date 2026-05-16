# OBS Overlay Scene Manager (mock)

StreamHub admin tool for **OBS Browser Source–style** overlay scenes. No OBS WebSocket, no real broadcast, no external APIs.

## Admin UI

- Path: `/admin/overlay-scenes`
- Page: `OverlaySceneManagerPage` → `OverlaySceneBoard`

## Domain (`src/overlay-scenes/`)

| Module | Role |
|--------|------|
| `overlaySceneTypes.js` | Scene types, layouts, animations, audit/notif kinds |
| `overlaySceneStore.js` | `localStorage` scenes + active scene id |
| `overlaySceneBuilder.js` | Scene factory, preview HTML, browser URL mock |
| `overlaySceneHudBridge.js` | Live HUD snapshot (tournament, viral, shorts, OneAI, stock pick) |
| `overlaySceneOps.js` | Create, queue, preview, priority, broadcast mock |
| `overlaySceneAudit.js` | Append-only mock audit |
| `overlaySceneSelfTest.js` | Inline validation helper |

## OverlayScene shape

- `id`, `sceneType`, `title`, `overlaySource`, `layoutPreset`, `animationPreset`
- `priority`, `durationSec`, `status`, `tickerText`, `headline`, `subline`
- `browserSourceUrlMock`, `hudLinks`, `createdAt`, `mockOnly: true`

## Scene types (9)

`breaking_news`, `market_alert`, `ai_stock_pick`, `top_trader`, `tournament_result`, `bj_reaction`, `shorts_hook`, `volatility_warning`, `liquidation_alert`

## Layout presets (7)

`lower_third`, `breaking_banner`, `side_alert`, `top_headline`, `ticker_line`, `ai_signal_alert`, `emergency_flash`

## Browser Source mock

- URL: `https://streamhub.mock/obs-browser#...` (hash query: overlay route, `scene_id`, `layout`, `mock=1`)
- Preview: iframe `srcDoc` from `buildScenePreviewHtml()`
- Scene switch: `setActiveOverlaySceneId` + status `previewing` / `live_mock`

## Live HUD links

- Tournament HUD mock (`tournamentHud`, rank, handle)
- Viral Score Engine (`viralScore`, `viralPriority`)
- Shorts queue count + linked clip
- OneAI briefing hint
- Stock pick ticker (from `oneai.stockpick.shorts_candidates_v1` reader)

Import from Shorts: `importOverlaySceneFromShortsClip(clip)` maps `detection_reason` → `sceneType`.

**Viral Trend Radar reader:** `/admin/overlay-scenes` — **Viral Trend Overlay Candidates** reads `tetherget.viral_trend_radar_v1` and imports by `overlayPriority`. See `docs/VIRAL_TREND_READER.md`.

### Viral Trend Radar

- UI: `ViralTrendOverlayCandidatesPanel` on `/admin/overlay-scenes`
- Import: `importTrendCandidateToOverlayScene(trend)` from `src/oneai/trends/trendReaderImporter.js`
- Sorted by `overlayPriority`; auto `queueOverlayScene`

See [VIRAL_TREND_READER.md](./VIRAL_TREND_READER.md).

## Audit

- `overlay.scene.created`
- `overlay.scene.queued`
- `overlay.scene.previewed`
- `overlay.scene.priority_updated`
- `overlay.scene.broadcast_mock`

## Notifications (shorts bus)

- `overlay.breaking.ready`
- `overlay.urgent.queued`
- `overlay.high_priority.detected`

Registered in `SHORTS_NOTIFICATION_KINDS` via `shortsQueueSchema.js`.

## Self-test suites

| Suite ID | File |
|----------|------|
| `contract.overlay-scene-schema` | `overlaySceneSchemaSuite.js` |
| `mock.overlay-scene-manager` | `overlaySceneManagerSuite.js |

## Safety

- `mockOnly: true` on every scene
- No OBS WebSocket client
- No stream ingest/outgest APIs
