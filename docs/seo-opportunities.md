# SEO Tool-Intent Opportunities

Audit date: 12 July 2026  
Source: Google Search Console queries (24h sample) + existing site map.

**Rule applied:** Do not create duplicate pages where an equivalent already exists. Optimize existing URLs first.

---

## 1. Bio Data Maker for Job

| Field | Value |
|-------|-------|
| Target query | bio data maker for job, biodata maker for job |
| Search intent | Tool / template — user wants to create biodata |
| **Existing primary URL** | `/blog/biodata-maker-for-job-india` |
| **Existing secondary** | `/blog/bio-data-format-for-job-pdf-free` |
| Recommended new URL | `/biodata-maker-for-job` (optional landing alias — **not built in this task**) |
| Recommended SEO title | Bio Data Maker for Job – Create Free Job Biodata Online |
| Recommended meta description | Free bio data maker for job in India — format, PDF tips, biodata vs resume. Build one-page biodata without download paywall. |
| Recommended H1 | Bio Data Maker for Job (India) |
| Page type | **Blog (live)** — consider thin landing later only if blog CTR stays 0% at pos 10–15 |
| Cannibalization risk | Medium — two blog posts; primary = `biodata-maker-for-job-india`, secondary = PDF format post |
| Internal links | Link from 12th/10th pass posts, homepage SEO intro, `/resume-builder` |

**Action taken:** Updated blog metaTitle, H1, description, “bio data” spelling section.

---

## 2. AI Resume Review

| Field | Value |
|-------|-------|
| Target query | ai resume review, resume review, free resume review |
| Search intent | Tool — instant CV feedback |
| **Existing tool URL** | `/ai-resume-review-free` |
| **Existing guide URLs** | `/blog/free-resume-review-online-india-2026`, `/blog/ai-resume-review-india` |
| Recommended SEO title (tool) | Free AI Resume Review – Check Your Resume in Seconds |
| Recommended meta description | Upload CV — get AI score and fixes in 30 seconds. Free for India. No signup on first check. |
| Page type | **Tool landing (live)** + supporting blogs |
| Cannibalization risk | Medium — tool page vs guides; tool owns transactional intent |
| Internal links | Homepage roast embed, all resume guides → `/ai-resume-review-free` or `/` |

**Action taken:** Updated `/ai-resume-review-free` title, H1, metaDescription in `data/seo/tool-landings.json`. Blog cluster meta updated.

---

## 3. ATS Resume Checker

| Field | Value |
|-------|-------|
| Target query | check if resume is ats friendly, ats resume checker free |
| Search intent | Tool — test ATS parsing |
| **Existing tool URLs** | `/ats-friendly-resume-checker`, `/ats-resume-checker-free`, `/ats-resume-checker` |
| **Existing guide** | `/blog/ats-friendly-resume` |
| Recommended SEO title (tool) | ATS Resume Checker Free – Is Your Resume ATS Friendly? |
| Recommended meta description | Check if your resume is ATS friendly — free test for India. Upload PDF, get parsing score and fixes in 30 seconds. |
| Page type | **Tool landing (live)** + guide |
| Cannibalization risk | Low if tool = test, blog = educational checklist |
| Internal links | Blog `ats-friendly-resume` → tool; JD match posts → tool |

**Action taken:** Blog metaTitle set to “Check If Resume Is ATS Friendly — Free Test India”. Tool landing titles still use legacy slug-based copy — **next pass:** update `ats-resume-checker-free` h1/title in tool-landings.json.

---

## 4. Resignation Letter Generator

| Field | Value |
|-------|-------|
| Target query | resignation letter generator |
| Search intent | Tool — generate letter |
| **Existing tool URL** | `/career-tools/resignation` |
| **Existing blog** | `/blog/resignation-letter-generator` |
| Recommended SEO title (tool) | Free Resignation Letter Generator – Create a Letter in Seconds |
| Recommended meta description | Free resignation letter generator for India — notice period, formal & warm tone, handover notes. |
| Page type | **Career tool landing + blog** |
| Cannibalization risk | Low — blog educates, tool converts |
| Internal links | Blog CTA → `/career-tools/resignation` and dashboard tool |

**Action taken:** Updated `lib/tools/marketing/config.ts` seoTitle/seoDescription; blog meta optimized.

---

## 5. Zety Resume Maker

| Field | Value |
|-------|-------|
| Target query | zety resume maker, zety resume builder |
| Search intent | Comparison / alternative |
| **Existing URLs** | `/blog/zety-resume-maker-free-alternative-india`, `/blog/zety-resume-builder-vs-mycvroast-india` |
| Recommended new URL | `/zety-alternative-india` — **not built**; blogs sufficient for now |
| Cannibalization risk | Managed — alternative post = “maker” intent, vs post = brand comparison |
| Internal links | Free builder posts, Canva comparison |

**Action taken:** New alternative post + comparison post meta CTR pass.

---

## 6. Layout CV

| Field | Value |
|-------|-------|
| Target query | layout cv, cv layout |
| Search intent | Informational — structure examples |
| **Existing URL** | `/blog/cv-layout-examples` |
| Page type | Blog |
| Cannibalization risk | Low |
| **Action taken:** metaTitle “CV Layout Examples — Best Resume Layout for Freshers” |

---

## Recommended next URLs (future — not in this deploy)

| URL | Query | Type | Overlap |
|-----|-------|------|---------|
| `/biodata-maker-for-job` | bio data maker for job | Thin landing → blog + builder | Blog exists |
| `/zety-alternative-india` | zety resume maker | Comparison landing | Blogs exist |

---

## Indexing actions after deploy

1. URL Inspection → Request indexing: `/blog/12th-pass-resume-kaise-banaye`
2. Request indexing: `/ai-resume-review-free`, `/blog/biodata-maker-for-job-india`, `/blog/ats-friendly-resume`
3. Submit updated sitemap in GSC (auto via `/sitemap.xml`)
4. Re-export GSC **28-day** report on 19 July, 26 July, 9 August 2026
