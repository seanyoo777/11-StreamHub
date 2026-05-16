# AI Channel Watcher (mock)

**원칙:** no YouTube download · no broadcast capture · no external API

---

## WatchedChannel

**Storage:** `streamhub.watched_channels_v1`

| Field | Notes |
|-------|--------|
| `channelId` | unique id |
| `platform` | youtube · soop · twitch · custom |
| `watchMode` | live · upload · both |
| `dailyClipLimit` | per-channel cap |
| `preferredFormats` | shorts_60 · highlight_300 |
| `keywords` | mock watch terms |
| `riskLevel` | low · medium · high |

**Seed channels:** 박호두 · 투자 방송 · BJ 이벤트 · 뉴스 브리핑 (mock)

---

## ChannelMoment

감지 reason: `chat_surge` · `bj_reaction` · `surge_mention` · `plunge_mention` · `pnl_mention` · `breaking_news` · `tournament_win` · `coupon_win` · `ai_briefing_highlight`

**모듈:** `src/watchers/channel/*`

---

## Audit

`watcher.channel.added` · `watcher.channel.enabled` · `watcher.moment.detected`

---

## UI

`/admin/watchers` — Channel cards · detect moment · factory settings

See [TREND_CONTENT_FACTORY.md](./TREND_CONTENT_FACTORY.md) · [VIRAL_SCORE_ENGINE.md](./VIRAL_SCORE_ENGINE.md)
