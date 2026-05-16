# OneAI Stock Pick Shorts Reader (StreamHub stub)

**버전:** 1.0 (MVP)  
**원칙:** 11번 StreamHub only · read-only from OneAI localStorage · mock-first · no upload

---

## 1. 개요

03-OneAI **AI Stock Pick** 이 `oneai.stockpick.shorts_candidates_v1` 에 저장한 Shorts 후보를  
11번 StreamHub `/admin/shorts` 에서 **읽기 전용**으로 표시하고, **Import to Shorts Queue** 로 기존 Shorts 파이프라인에 mock 연결합니다.

| 금지 | 허용 |
|------|------|
| 03-OneAI 코드 수정 | localStorage 읽기 |
| 실제 영상 생성/업로드 | mock queue clip + safety + timeline |
| 외부 API | audit · in-memory notification |

---

## 2. Storage contract

| 키 | 작성자 | 용도 |
|----|--------|------|
| `oneai.stockpick.shorts_candidates_v1` | 03-OneAI | 후보 스냅샷 `{ candidates[], lastGeneratedAt? }` |
| `streamhub.stockpick.imported_v1` | 11 StreamHub | import 완료 candidate id 목록 |

**모듈:** `src/oneai/stockpick/stockPickReaderTypes.js` · `stockPickReader.js`

### Candidate fields (UI 표시)

| 필드 | 설명 |
|------|------|
| `title` | 카드 제목 |
| `hookText` | 훅 문구 |
| `caption` | 캡션 |
| `suggestedDuration` | `shorts_30` · `shorts_60` · `highlight_300` |
| `performanceSnapshot` | ticker · returnPct 등 (mock) |
| `riskText` | 면책/리스크 문구 |
| `reviewRequired` | 운영자 검수 필요 표시 |

Malformed row는 skip + audit `stockpick.reader.malformed_skipped`.

---

## 3. UI

**경로:** `/admin/shorts` — 섹션 **OneAI Stock Pick Candidates**

- empty state: 후보 없음
- **Reload candidates** — 재읽기 + audit `stockpick.reader.loaded`
- 카드별 **Import to Shorts Queue** (중복 import 비활성)

**컴포넌트:** `src/oneai/stockpick/ui/StockPickCandidatesPanel.jsx` · `StockPickCandidateCard.jsx`

---

## 4. Import to Shorts Queue (mock)

**모듈:** `src/oneai/stockpick/stockPickImporter.js`

1. `appendShortsQueueClip` — `detection_reason: oneai_stock_pick`
2. `overlay_source: oneai_broadcast` · `import_source: oneai_stock_pick`
3. `createContentSafetyReviewForClip` — caption/transcript에 `riskText` 포함
4. `seedClipTimelineForStockPick` — duration → timeline format 매핑
5. overlay localStorage sync + OneAI shorts draft stub (기존 bridge)
6. audit `stockpick.reader.imported_to_queue`

### Timeline duration mapping

| `suggestedDuration` | mock clip sec | timeline `targetFormat` |
|---------------------|---------------|-------------------------|
| `shorts_30` | 30 | `shorts_30` |
| `shorts_60` | 60 | `shorts_60` |
| `highlight_300` | 300 | `highlight_300` (5분 mock seed) |

---

## 5. Content Safety 연결

- `riskText` + `hookText` 가 safety review `caption` / `transcript` 에 포함됨
- mock rules (`contentSafetyRules.js`) 로 `financial_advice_risk` · `platform_policy_risk` 등 플래그 검사
- `reviewRequired` 또는 verdict ≠ `pass` 시 notification `stockpick.safety_review_required`

자세한 gate: `docs/CONTENT_SAFETY_REVIEW.md`

---

## 6. Audit & notifications

| Audit kind | 시점 |
|------------|------|
| `stockpick.reader.loaded` | 후보 로드 |
| `stockpick.reader.imported_to_queue` | queue import |
| `stockpick.reader.malformed_skipped` | JSON/row skip |

| Notification kind | 시점 |
|-------------------|------|
| `stockpick.candidate.found` | 후보 1건 이상 (패널 mount) |
| `stockpick.imported_to_queue` | import 완료 |
| `stockpick.safety_review_required` | safety 검수 필요 |

---

## 7. Self-Test

| Suite ID | 파일 |
|----------|------|
| `mock.stockpick-reader-flow` | `stockPickReaderFlowSuite.js` |

검증: storage key · empty · malformed skip · import · safety mapping · timeline · no upload.

`npm run smoke` · `npm test` (`tests/stockPickReader.test.js`) 포함.

---

## 관련 문서

- `docs/SHORTS_QUEUE.md`
- `docs/CONTENT_SAFETY_REVIEW.md`
- `docs/STREAMHUB_AI_BROADCAST.md`
- `../03-OneAI/docs/ONEAI_STOCK_PICK_SHORTS_BRIDGE.md`
