# OneAI Viral Trend Radar Reader (StreamHub stub)

**버전:** 1.0 (MVP)  
**원칙:** 11번 StreamHub only · read-only from OneAI localStorage · mock-first · no upload · no broadcast

---

## 1. 개요

03-OneAI **Viral Trend Radar** 가 `tetherget.viral_trend_radar_v1` 에 저장한 트렌드 스냅샷을  
11번 StreamHub 가 **읽기 전용**으로 표시하고, **Shorts Queue** / **OBS Overlay Scene** mock 파이프라인에 연결합니다.

| 금지 | 허용 |
|------|------|
| 03-OneAI 코드 수정 | localStorage 읽기 |
| 외부 API · RTMP · OBS WebSocket | mock queue + audit + in-memory notification |
| 실제 Shorts 업로드/송출 | operator import stub |

---

## 2. Storage contract

| 키 | 작성자 | 용도 |
|----|--------|------|
| `tetherget.viral_trend_radar_v1` | 03-OneAI | `{ trends[], lastScanAt?, momentumIndex? }` |
| `streamhub.trend.imported_shorts_v1` | 11 StreamHub | Shorts import 완료 trend id 목록 |
| `streamhub.trend.imported_overlay_v1` | 11 StreamHub | Overlay import 완료 trend id 목록 |

**모듈:** `src/oneai/trends/trendReaderTypes.js` · `trendReader.js` · `trendReaderImporter.js` · `trendReaderAudit.js`

### TrendReaderSnapshot

| 필드 | 설명 |
|------|------|
| `id` | 후보 id |
| `keyword` | 트렌드 키워드 |
| `category` | stock · crypto · breaking_news · … |
| `trendLevel` | emerging · rising · viral · peak · cooling |
| `urgencyLevel` | low · medium · high · urgent |
| `shortPotentialScore` | 0–100 Shorts 잠재 점수 |
| `briefingPotentialScore` | 0–100 브리핑 잠재 |
| `overlayPriority` | 0–100 Overlay 큐 우선순위 |
| `relatedThemes` | 연관 테마 문자열 배열 |
| `relatedTickers` | (optional) 티커 |
| `mockOnly` | 기본 true |

Malformed row / invalid JSON → skip + audit `trend.reader.malformed_skipped`.

---

## 3. Shorts Queue 연결

**경로:** `/admin/shorts` — **Viral Trend Candidates** 패널

Import 시 clip 필드:

- `detection_reason: viral_trend`
- `overlay_source: oneai_broadcast`
- `import_source: viral_trend_radar`

자동 생성 (importer):

- shorts hook · ticker caption · breaking title · urgency badge
- content safety review · clip timeline (`shorts_30`) · viral score bridge
- overlay localStorage sync (`oneai.streamhub.overlay` / shorts drafts)

**UI:** `ViralTrendCandidatesPanel` · `TrendCandidateCard` · `TrendMomentumBadge`

---

## 4. Overlay Scene 연결

**경로:** `/admin/overlay-scenes` — **Viral Trend Overlay Candidates**

`mapTrendToOverlaySceneType(trend)`:

| 조건 | sceneType |
|------|-----------|
| breaking_news · urgent | `breaking_news` |
| market_alert · macro · commodity | `market_alert` |
| stock · ai | `ai_stock_pick` |
| 기타 | `shorts_hook` |

`importTrendCandidateToOverlayScene` → `createOverlaySceneRecord` + `queueOverlayScene` (priority = `overlayPriority`).

**UI:** `ViralTrendOverlayCandidatesPanel` · `TrendOverlayCandidateCard`

---

## 5. Audit

| kind | 시점 |
|------|------|
| `trend.reader.loaded` | storage 읽기 |
| `trend.candidate.detected` | 후보 1건 이상 |
| `trend.imported_to_shorts_mock` | Shorts import |
| `trend.imported_to_overlay_mock` | Overlay import |
| `trend.reader.malformed_skipped` | parse/skip |

---

## 6. Notifications (shorts bus)

| kind | 조건 |
|------|------|
| `trend.urgent.imported` | urgency `urgent` + Shorts import |
| `trend.high_shorts_potential` | `shortPotentialScore >= 75` |
| `trend.overlay_priority.detected` | `overlayPriority >= 70` (load 또는 overlay import) |

`SHORTS_NOTIFICATION_KINDS` 에 등록 (`shortsQueueSchema.js`).

---

## 7. Self-test

| Suite ID | 파일 |
|----------|------|
| `contract.viral-trend-reader-schema` | `viralTrendReaderSchemaSuite.js` |
| `mock.viral-trend-reader-flow` | `trendReaderFlowSuite.js` |

검증: schema · malformed skip · Shorts import · overlay queue · audit kinds · no API · no broadcast · mock-only.

**단위 테스트:** `tests/trendReader.test.js`

---

## 8. 관련 문서

- `docs/SHORTS_QUEUE.md`
- `docs/OBS_OVERLAY_SCENE_MANAGER.md`
- `docs/ONEAI_STOCK_PICK_SHORTS_READER.md` (동일 reader 패턴)
- `MASTER_MANUAL.md` § 3.6.5
