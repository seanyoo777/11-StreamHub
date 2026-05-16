# Content Safety Review / Upload Guard (mock)

**버전:** 1.0 (MVP)  
**원칙:** mock-first · no external AI · no real upload · operator approval before public mock

---

## 1. 개요

자동 생성된 쇼츠/브리핑/뉴스 문구를 **업로드 전** mock AI 검열합니다. 실제 OpenAI/Moderation API 호출 없음.

| 금지 | 허용 |
|------|------|
| YouTube/TikTok 업로드 | `approved_mock` + safety `pass` / operator OK |
| 외부 검열 API | `mockContentSafetyEngine` 규칙 |
| 운영자 승인 없이 공개 | `approve_after_review.mock` |

---

## 2. 도메인

**저장 키:** `streamhub.content_safety_reviews_v1`

| 필드 | 설명 |
|------|------|
| `clipId` | Shorts queue clip id |
| `title` | 제목 |
| `caption` | 캡션 |
| `transcript` | 스크립트 mock |
| `sourceType` | `news` · `market` · `politics` · `bj` · `tournament` · `fortune` |
| `riskScore` | 0–100 |
| `verdict` | `pass` · `needs_review` · `block_mock` |
| `flags` | 7종 (아래) |
| `suggestedFixes` | before/after mock 수정안 |
| `operator_decision` | 운영자 mock 결정 |

**Flags:** `misinformation_risk`, `copyright_risk`, `political_sensitivity`, `financial_advice_risk`, `profanity`, `personal_info`, `platform_policy_risk`

---

## 3. Risk score (mock)

| 규칙 | 점수 |
|------|------|
| 금칙어/욕설 | +25 (`profanity`) |
| 금융 과장 (`100% 수익`, `무조건`, `확정`) | +30 |
| 과장 표현 | +15 |
| 저작권 위험 문구 | +25 |
| 가짜뉴스/미검증 | +25 |
| 정치 키워드 / `politics` source | +20 |
| 개인정보 패턴 | +30 |
| 플랫폼 정책 문구 | +20 |
| news/market/politics 출처 누락 | +15 |

**Verdict:**

- `riskScore` ≥ 70 → `block_mock`
- `riskScore` ≥ 40 → `needs_review`
- else → `pass`

---

## 4. Shorts Queue 연동

1. `detectMockClip()` → queue + **자동** `createContentSafetyReviewForClip()`
2. **OneAI Stock Pick import** (`stockPickImporter.js`) — `riskText`·`hookText`를 caption/transcript에 포함 · `financial_advice_risk` / `platform_policy_risk` mock flags
3. `pass` → Shorts `Approve (mock)` 가능 (status `reviewing`일 때)
4. `needs_review` → `approve_after_review.mock` 후 clip 승인
5. `block_mock` → clip 승인 불가

Viral Score Engine 은 `riskScore` 를 viral 계산에 반영합니다 — `docs/VIRAL_SCORE_ENGINE.md`

**모듈:** `src/shorts/safety/*` · UI `src/shorts/ui/SafetyReviewPanel.jsx` on `/admin/shorts`

| File | Role |
|------|------|
| `contentSafetyTypes.js` | schema · flags · audit/notif kinds |
| `contentSafetyRules.js` | mock rules engine |
| `contentSafetyReview.js` | create review · operator flow · Shorts gate |
| `contentSafetyStore.js` | `streamhub.content_safety_reviews_v1` |

---

## 5. 운영자 플로우 (mock)

| Action | Id |
|--------|-----|
| 검수 후 승인 | `approve_after_review.mock` |
| 정책 거절 | `reject_due_to_policy.mock` |
| 수정안 적용 | `edit_suggestion_applied.mock` |

---

## 6. Audit / Notification

**Audit:** `content.safety.reviewed`, `content.safety.flagged`, `content.safety.approved_after_review`, `content.safety.blocked_mock`

**Notification:** `content.safety.high_risk`, `content.safety.review_required`, `content.safety.approved_after_review`

---

## 7. Self-Test suites

| Suite id | Topic |
|----------|--------|
| `contract.content-safety-schema` | schema · flags · thresholds |
| `mock.content-safety-engine` | hype · political · banned · block |
| `mock.content-safety-shorts-gate` | queue gate · operator path · no upload |

Channel/Trend factory는 정치·뉴스·금융 후보에 `출처: mock` caption을 주입한 뒤 동일 safety gate를 적용합니다. `block_mock`이면 Shorts approve 및 upload prep 불가.

See `docs/SHORTS_QUEUE.md`, `docs/CLIP_TIMELINE_EDITOR.md`, `docs/TREND_CONTENT_FACTORY.md`, `03-OneAI/docs/ONEAI_SHORTS_DRAFT.md`.
