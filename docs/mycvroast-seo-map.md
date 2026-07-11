# MyCVRoast SEO Map

**Site:** https://www.mycvroast.in  
**Last updated:** July 2026

---

## How Google shows your site (user search → snippet)

```
User types query → Google crawls (robots.txt + sitemap) → Indexes page + JSON-LD
→ Ranks pages → Shows SERP snippet
```

| SERP part | Where it comes from in code | Example |
|-----------|----------------------------|---------|
| **Title** (blue link) | `metadata.title` / `<title>` | Free Resume Builder India — ATS CV Maker… |
| **URL** | `canonical` in `lib/seo.ts` → `siteUrl()` | `mycvroast.in › blog › help-making-a-resume…` |
| **Description** | `metadata.description` | Need help making a resume for free? India-focused… |
| **FAQ dropdown** | `FAQPage` JSON-LD (`lib/schema.ts`) | Is Zety resume builder free in India? |
| **Star rating** (sometimes) | `SoftwareApplication` + `aggregateRating` | 4.8 — if Google trusts it |

**Blocked from Google:** `/dashboard`, `/login`, `/api`, `/admin` (see `app/robots.ts`)

---

## Sitemap structure

Submit **only** this in Google Search Console:

`https://www.mycvroast.in/sitemap.xml`

| Child sitemap | Contents |
|---------------|----------|
| `sitemap-core.xml` | Homepage, builder, blog hub, plans, privacy, etc. |
| `sitemap-blog.xml` | **126** blog posts |
| `sitemap-seo.xml` | **61** SEO landings + **100** role checkers |
| `sitemap-tools.xml` | **12** `/tools/*` pages |
| `sitemap-career-tools.xml` | Career tools hub + pages |

---

## P0 — Request indexing in GSC this week

| URL | Target keywords | Schema |
|-----|-----------------|--------|
| `/indian-resume-builder` | indian resume builder (5K/mo) | FAQPage + Breadcrumb |
| `/blog/help-making-a-resume-for-free-india` | help making a resume for free (50K) | Article + FAQ |
| `/blog/free-downloadable-resume-builder` | free downloadable resume builder (50K) | Article + FAQ |
| `/blog/indian-resume-builder-online-free` | indian resume maker | Article + FAQ |
| `/blog/zety-resume-builder-vs-mycvroast-india` | zety, zety resume builder (50K) | Article + FAQ |
| `/blog/biodata-maker-for-job-india` | biodata maker for job | Article + FAQ |
| `/resume-builder` | free resume builder india, cv maker free | WebPage |
| `/plans` | mycvroast pricing | WebPage |

**GSC:** URL Inspection → paste URL → **Request indexing**

---

## P0 — Core product pages

| URL | Title | Schema | Keywords |
|-----|-------|--------|----------|
| `/` | Roast My Resume Free — AI CV Review India | Organization + WebSite + SoftwareApplication + Review + FAQ | roast my resume, resume roast india, hinglish |
| `/resume-builder` | Free Resume Builder India — ATS CV Maker Online | WebPage + site graph | free resume builder india, cv maker free |
| `/linkedin-roast` | LinkedIn Roast — Free AI Profile Review | WebPage | linkedin roast, linkedin profile review |
| `/plans` | Plans & Pricing \| MyCVRoast | WebPage + Offer in schema | mycvroast pricing, pro |
| `/blog` | Blog — Resume Tips & Career Guides | ItemList (50 posts) | resume guides india |
| `/guides` | Complete site map (HTML) | ItemList | crawl discovery |

---

## P0 — SEO landing pages (roast embed + FAQ)

| URL | Primary keyword |
|-----|---------------|
| `/indian-resume-builder` | indian resume builder |
| `/best-resume-checker-india` | free resume checker india |
| `/ai-resume-checker` | ai resume checker |
| `/ats-friendly-resume-checker` | ats friendly resume checker |
| `/ai-resume-review-free` | ai resume review free |
| *+ 56 more* | See `/sitemap-seo.xml` |

---

## P1 — Pillar blogs (authority + GEO)

| URL | Keywords |
|-----|----------|
| `/blog/free-resume-builder-india` | free resume builder |
| `/blog/resume-maker-for-freshers-india` | resume builder for freshers (50K) |
| `/blog/best-resume-builder-comparison` | best resume builder |
| `/blog/ai-resume-review-tools-compared-india` | ai resume review compared |
| `/blog/ats-resume-builder-free` | free ats resume builder |
| `/blog/fresher-resume-format` | fresher resume format |
| `/blog/simple-resume-format` | simple resume maker (50K) |
| `/blog/mycvroast-vs-jobscan-vs-resume-worded` | jobscan alternative |
| *+ 118 more* | `/sitemap-blog.xml` |

---

## Schema types by page (code location)

| Page type | JSON-LD | File |
|-----------|---------|------|
| All pages | Organization, WebSite, SoftwareApplication | `lib/schema.ts` → `app/layout.tsx` |
| Blog post | Article + Breadcrumb + FAQ | `app/blog/[slug]/page.tsx` |
| SEO landing | FAQPage + Breadcrumb | `app/[slug]/page.tsx` |
| Role checker | FAQPage + Breadcrumb + keywords | `app/resume-checker/[role]/page.tsx` |
| Homepage FAQ | FAQPage (hinglish) | `lib/schema.ts` → `homeFaqPageJsonLd` |

---

## GEO — AI search prompts to win

Optimize blog + FAQ for these (ChatGPT, Perplexity, Google AI Overviews):

- Best free AI resume review India 2026
- Free resume builder India no paywall
- Zety alternative India free PDF
- Help making a resume for free
- Indian resume builder for freshers
- ATS resume checker free India
- Hinglish resume roast tool

---

## Other search engines

| Engine | India share | Action |
|--------|-------------|--------|
| **Google** | ~95% | GSC + sitemap + schema (primary) |
| **Bing / Copilot** | Edge users | Same sitemap works |
| **Google AI Overviews** | Growing | FAQ + comparison posts |
| **ChatGPT / Perplexity** | Research | Pillar blogs + clear answers |
| **DuckDuckGo** | Small | Uses Bing index |

---

## GSC status notes (Jul 2026)

- **Discovered – not indexed:** ~30 URLs (mostly newer blog posts + `/plans`, `/privacy`) — normal for new bulk content; request indexing for P0 URLs above
- **Indexed:** Homepage and older posts gradually appearing
- **Fix applied:** Sitemap index at `/sitemap.xml` pointing to all child sitemaps

---

## Quick links

- Search Console: https://search.google.com/search-console
- Live sitemap: https://www.mycvroast.in/sitemap.xml
- Robots: https://www.mycvroast.in/robots.txt
