# StreamHub Overlay Presets / Scene Template Manager

Additive extension on top of the **Broadcast Event Overlay Layer**. Existing event-layer behavior is unchanged; presets add save/load mock storage, built-in scene templates, and per-scene preset application.

## Scope (mock-only)

| Included | Excluded |
|----------|----------|
| Save/load overlay presets (local storage mock) | OBS WebSocket / Browser Source automation |
| Four built-in scene templates (alert / ticker / viral combos) | Real broadcast or stream start/stop |
| Apply preset to active overlay scene + scene flags | `setInterval` / polling |
| Append-only audit (`overlay.preset.*`) | External API calls |

`mockOnly` remains enforced on event-layer config and presets.

## Storage

| Key | Purpose |
|-----|---------|
| `streamhub.overlay_event_layer_v1` | Event layer config (unchanged) |
| `streamhub.overlay_presets_v1` | Saved presets + `scenePresetMap` |

## Built-in scene templates

| Template ID | Components |
|-------------|------------|
| `breaking_alert_only` | Alert banner only |
| `ticker_news_strip` | Alert + notification ticker |
| `viral_trend_focus` | Ticker + viral trend card |
| `full_event_stack` | Alert + ticker + viral trend card |

Templates update global event-layer toggles and copy fields (headline, ticker messages). They do not start any broadcast.

## Preset operations

- **Save preset** — snapshot current event-layer config into `presets[]`
- **Load preset** — merge preset into global config
- **Apply to scene** — set `scenePresetMap[sceneId]`, merge config, set `sceneComponentFlags[sceneId]` from preset component toggles

## Audit kinds (append-only)

- `overlay.preset.saved`
- `overlay.preset.loaded`
- `overlay.preset.applied_to_scene`
- `overlay.preset.template_applied`

## UI

`/admin/overlay-scenes` → **Broadcast Event Overlay Layer** board includes **Overlay Preset / Scene Templates** panel (`data-testid="overlay-preset-panel"`).

## Self-test suites

| Suite ID | Role |
|----------|------|
| `contract.overlay-preset-schema` | Keys, templates, audit kinds, no-api guards |
| `mock.overlay-preset-manager` | Template apply, save/load, scene map, audit flow |

## Module layout

```
src/overlay-event-layer/
  overlayPresetTypes.js
  overlayPresetStore.js
  overlayPresetOps.js
  overlayPresetAudit.js
  ui/OverlayPresetPanel.jsx
```

See also: [STREAMHUB_OVERLAY_EVENT_LAYER.md](./STREAMHUB_OVERLAY_EVENT_LAYER.md), [OBS_OVERLAY_SCENE_MANAGER.md](./OBS_OVERLAY_SCENE_MANAGER.md).
