# StreamHub Overlay Event Layer (mock)

Broadcast-screen **mock event overlay** composited above OBS Browser Source scenes. Additive to Shorts Queue, Overlay Scene Manager, and Viral Trend Reader.

## Components

| Layer | Description |
|-------|-------------|
| Alert banner | Top urgent/info headline + subline |
| Notification ticker | Bottom scrolling operator messages (CSS only) |
| Viral trend card | Side card from `tetherget.viral_trend_radar_v1` top trend |
| MOCK ONLY badge | Always shown in preview |

## Scene flags

- Global toggles: enable/disable each component for all scenes
- Per-scene overrides: `sceneComponentFlags[sceneId]` — when active scene is set, operator can override on `/admin/overlay-scenes`

Storage: `streamhub.overlay_event_layer_v1`

## Safety

- `mockOnly: true` on config
- No OBS WebSocket / no stream ingest
- No `setInterval` / polling / realtime infinite JS loops
- No external API calls
- Ticker uses CSS animation in static `srcDoc` preview only

## Audit

- `overlay.event_layer.loaded` (via preview/flags flows)
- `overlay.event_layer.flags_updated`
- `overlay.event_layer.previewed`

## Self-test

| Suite | File |
|-------|------|
| `contract.overlay-event-layer-schema` | `overlayEventLayerSchemaSuite.js` |
| `mock.overlay-event-layer` | `overlayEventLayerFlowSuite.js` |

## Code map

`src/overlay-event-layer/` · UI: `OverlayEventLayerBoard` on `/admin/overlay-scenes`

See [OBS_OVERLAY_SCENE_MANAGER.md](./OBS_OVERLAY_SCENE_MANAGER.md) · [VIRAL_TREND_READER.md](./VIRAL_TREND_READER.md).
