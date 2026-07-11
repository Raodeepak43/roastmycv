# Google Search Console CTR Tracking

Baseline captured before CTR optimization deploy.

## Baseline — 12 July 2026

| Metric | Value |
|--------|-------|
| Date range | Last 24 hours (GSC export) |
| Total impressions | 70 |
| Total clicks | 0 |
| CTR | 0% |
| India impressions | 57 |
| Mobile impressions | 49 |
| Mobile avg. position | ~8.45 |
| Translated Results impressions | 40 |
| Translated Results avg. position | ~7.15 |

### Priority URL baseline

**URL:** https://www.mycvroast.in/blog/12th-pass-resume-kaise-banaye

| Metric | Value |
|--------|-------|
| Impressions | 42 (~60% of site) |
| Clicks | 0 |
| Avg. position | ~7.90 |

### Queries observed (24h sample)

- bio data maker for job
- ai resume review
- check if resume is ats friendly
- zety resume maker
- 12th pass fresher 12th pass resume
- layout cv
- resume review
- resignation letter generator

---

## Implementation deployed

**Date:** 12 July 2026  
**Commit:** (after deploy)  
**Changes:** SERP titles (`metaTitle`), meta descriptions, H1 alignment, priority intro rewrite, 132-blog CTR pass, blog metadata pipeline update.

**New SERP title (priority page):**  
`12th Pass Resume Kaise Banaye? Free Format & Example 2026`

**New meta description (priority page):**  
`12th pass ke baad job ke liye resume kaise banaye? Step-by-step format, fresher example aur common mistakes. Apna resume free check karein.`

---

## Tracking template

Fill from GSC → Performance after each interval. Compare to baseline above.

### 7 days after deploy

| Metric | Value | Δ vs baseline |
|--------|-------|---------------|
| Date range | | |
| Total impressions | | |
| Total clicks | | |
| CTR | | |
| India impressions | | |
| Mobile impressions | | |
| Mobile avg. position | | |
| Translated Results impressions | | |
| Translated Results avg. position | | |

**Priority URL `/blog/12th-pass-resume-kaise-banaye`**

| Impressions | Clicks | CTR | Avg. position |
|-------------|--------|-----|---------------|
| | | | |

**Top 5 queries (clicks):**

1.
2.
3.
4.
5.

**Top 5 pages (clicks):**

1.
2.
3.
4.
5.

**Notes:**

---

### 14 days after deploy

| Metric | Value | Δ vs baseline |
|--------|-------|---------------|
| Date range | | |
| Total impressions | | |
| Total clicks | | |
| CTR | | |
| Mobile CTR | | |
| Translated Results CTR | | |

**Priority URL**

| Impressions | Clicks | CTR | Avg. position |
|-------------|--------|-----|---------------|

**Notes:**

---

### 28 days after deploy

| Metric | Value | Δ vs baseline |
|--------|-------|---------------|
| Date range | | |
| Total impressions | | |
| Total clicks | | |
| CTR | | |
| Mobile CTR | | |
| Translated Results CTR | | |

**Priority URL**

| Impressions | Clicks | CTR | Avg. position |
|-------------|--------|-----|---------------|

**Cannibalization check:** Compare clicks for biodata, ATS, Zety, and resume review clusters — ensure primary page wins.

**Notes:**

---

## What to check in GSC (weekly)

1. **Performance → Pages** — filter `/blog/` — CTR change on priority URL
2. **Performance → Queries** — which queries gained clicks
3. **Search appearance → Translated results** — Hinglish snippet performance
4. **Page indexing** — no new “Crawled – not indexed” spikes after title changes
5. **URL Inspection** — request re-index for priority URL + top 10 blog URLs once after deploy

## Success criteria (28 days)

- Site CTR > 0% with stable or improved impressions
- Priority page CTR ≥ 2–5% at position 5–10 (typical for informational queries)
- At least 1–3 queries from GSC sample receiving clicks
- No ranking drop > 3 positions on priority URL (monitor before celebrating)

**Do not claim SEO success until GSC shows click data after recrawl.**
