# Clip Timeline / Highlight Editor (mock)

**버전:** 1.0 (MVP)  
**원칙:** Shorts Queue + Safety Review 위 additive · no FFmpeg · no real edit/upload

---

## 1. 개요

운영자가 클립 **in/out**, 숏츠(15/30/60s)·5분 하이라이트 포맷, 자막·오버레이 타이밍, 썸네일 후보를 mock UI로 조정합니다.

| 금지 | 허용 |
|------|------|
| FFmpeg / 실제 트림 | range slider in/out |
| 이미지 렌더 | thumbnail style 라벨만 |
| 파일 업로드 | export preview JSON |

---

## 2. 도메인 (`src/shorts/editor/`)

**Storage:** `streamhub.clip_timelines_v1`

```text
ClipTimeline {
  clipId, durationSec, inPointSec, outPointSec,
  targetFormat: shorts_15 | shorts_30 | shorts_60 | highlight_300,
  subtitleTracks[], overlayMoments[], thumbnailCandidates[],
  selectedThumbnailId, safeEdited, mockOnly
}
```

| File | Role |
|------|------|
| `clipTimelineTypes.js` | schema · formats · audit/notif |
| `clipTimelineStore.js` | localStorage |
| `clipTimelineHelpers.js` | seed · save · export · AI moments |
| `clipTimelineAudit.js` | append-only audit |

---

## 3. UI (`src/shorts/ui/`)

| Component | 기능 |
|-----------|------|
| `ClipTimelineEditor` | editor shell |
| `TimelineScrubber` | in/out 조절 |
| `ClipDurationSelector` | 15/30/60/300s |
| `SubtitleTrackPanel` | mock 자막 preview |
| `OverlayMomentPanel` | overlay 타이밍 |
| `ThumbnailCandidateStrip` | 후보 선택 |

**경로:** `/admin/shorts` → clip card → **Edit Clip**

---

## 4. AI mock 추천 (overlayMoments)

| detection reason | seed |
|------------------|------|
| `surge_spike` | 급등 순간 |
| `bj_reaction` | BJ 리액션 |
| `league_champion` | 리그 우승 · TOP1 |
| `ai_breaking_alert` | AI 브리핑 강조 |

---

## 5. Thumbnail 후보 (no image gen)

`title_overlay` · `warning_badge` · `top1` · `breaking` · `live` · `surge`

---

## 6. Export mock

| Button | 결과 |
|--------|------|
| Export Shorts Draft | preview JSON (`exportKind: shorts`) |
| Export Highlight Draft | preview JSON + `clip.highlight.ready` notif |

Flags: `mockOnly`, `noFfmpeg`, `noRealUpload`

---

## 7. Audit / Notification

**Audit:** `clip.timeline.opened` · `saved` · `exported` · `thumbnail.selected`

**Notification:** `clip.highlight.ready` · `clip.timeline.review_required`

---

## 8. Self-Test

| Suite | Topic |
|-------|--------|
| `contract.clip-timeline-schema` | formats · thumbnails · validation |
| `mock.clip-timeline-editor` | AI seed · export · audit · no FFmpeg |

---

## 관련

- [SHORTS_QUEUE.md](./SHORTS_QUEUE.md)
- [CONTENT_SAFETY_REVIEW.md](./CONTENT_SAFETY_REVIEW.md)
