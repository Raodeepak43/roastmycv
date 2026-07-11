# MyCVRoast AI Search Optimization Report

**Date:** 2026-06-30  
**Site:** https://www.mycvroast.in  
**Scope:** LLM/GEO optimization, structured data, sitemaps, robots, E-E-A-T pages

---

## Implemented improvements

### 1. LLM discovery files

| File | URL | Description |
|------|-----|-------------|
| `llms.txt` | `/llms.txt` | Production llmstxt.org-style summary: capabilities, pricing, FAQs, important URLs |
| `llms-full.txt` | `/llms-full.txt` | Extended markdown knowledge base: glossary, methodology, entity map, topic clusters |

- Source: `lib/llms/content.ts`, `lib/llms/generate.ts`
- Linked from root `<head>` via `<link rel="alternate" type="text/plain">`
- Listed on `/guides` core pages

### 2. robots.txt — AI crawlers

Explicit allow rules added for:

`GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `Claude-Web`, `anthropic-ai`, `Google-Extended`, `PerplexityBot`, `CCBot`, `Amazonbot`, `Applebot`, `Bytespider`, `Meta-ExternalAgent`, `Meta-ExternalFetcher`, `cohere-ai`, `YouBot`, `Diffbot`

Same disallow list preserved: `/admin`, `/dashboard`, `/login`, `/auth`, `/api`, `/roast`

### 3. Sitemaps

| Sitemap | Status |
|---------|--------|
| `sitemap.xml` (index) | Updated — includes images + videos child sitemaps |
| `sitemap-core.xml` | 6 new URLs: about, how-it-works, methodology, faq, why-trust-us, support |
| `sitemap-images.xml` | **New** — OG image + brand icon on key pages |
| `sitemap-videos.xml` | **New** — valid empty urlset (no hosted product videos yet) |

### 4. JSON-LD structured data

| Schema | Location |
|--------|----------|
| Organization | `lib/schema.ts` → root layout |
| WebSite + **SearchAction** | `lib/schema.ts` → `/guides?q={search_term_string}` |
| SoftwareApplication | Root layout |
| **Product** (Pro) + Offer | Root layout |
| Review + AggregateRating | Root layout |
| FAQPage | Homepage, `/faq`, `/methodology` |
| BreadcrumbList | Blog, tools, new WebPage helper |
| WebPage + ImageObject | New `webPageJsonLd()` on info pages |
| ItemList | `/guides` |

### 5. Metadata (AI discoverability)

- `lib/seo.ts`: `themeColor`, `applicationName`, `authors`, `publisher`, `category`
- `other['llms-txt']` and `other['ai-content-declaration']` on all `pageMetadata()` pages
- Root layout: `dns-prefetch` for Vercel insights, llms.txt alternate links
- Enhanced `googleBot` robots directives (`max-image-preview: large`, unlimited snippets)

### 6. New crawlable pages (E-E-A-T)

| Page | Purpose |
|------|---------|
| `/about` | Company overview, audience, key takeaways |
| `/how-it-works` | Step-by-step roast process |
| `/methodology` | ATS process, glossary, AI limitations |
| `/faq` | Standalone FAQ (reuses `HOME_FAQ` + extensions) |
| `/why-trust-us` | E-E-A-T: experience, expertise, authority, trust |
| `/support` | Billing, refunds, troubleshooting |

All use semantic `<article>`, `<section>`, heading hierarchy, summary blocks, FAQs, and `TopicClusterNav`.

### 7. Internal linking & topic clusters

- `components/seo/TopicClusterNav.tsx` — 12 semantic topic links
- Added to homepage, all new info pages
- Footer updated: `/how-it-works`, `/faq`, `/about`, `/methodology`, `/why-trust-us`, `/support`
- `SeoIntroSection` links to about, methodology, FAQ

### 8. Guides search (SearchAction target)

- `/guides?q=` filters core pages, blog posts, SEO landings, role checkers
- Powers WebSite `SearchAction` schema

---

## Technical SEO audit (summary)

| Check | Status | Notes |
|-------|--------|-------|
| Canonical URLs | ✅ | `pageMetadata()` on public pages |
| robots.txt | ✅ | AI crawlers allowed |
| Sitemap index | ✅ | 7 child sitemaps |
| JSON-LD on key pages | ✅ | Expanded |
| Missing About/FAQ URLs | ✅ Fixed | Dedicated routes added |
| llms.txt | ✅ | New |
| Duplicate titles | ⚠️ | Audit blog/landing pages periodically |
| Image alt text | ⚠️ | Review decorative vs content images in components |
| Core Web Vitals | ✅ | Vercel Speed Insights enabled; fonts `display: swap` |
| Lazy loading | ✅ | Next.js Image defaults on most assets |
| `/roast/[id]` noindex | ✅ | Disallowed in robots (share pages) |

---

## Remaining recommendations

### P0 — After deploy

1. **Submit updated sitemap** in Google Search Console (`https://www.mycvroast.in/sitemap.xml`)
2. **Request indexing** for new URLs: `/about`, `/how-it-works`, `/methodology`, `/faq`, `/why-trust-us`, `/support`, `/llms.txt`
3. **Ping AI indexers** where available (e.g. submit `llms.txt` URL to Perplexity/OpenAI publisher tools when offered)

### P1 — Content

1. Add **author bylines** on blog posts (Person schema) for stronger E-E-A-T
2. Create **hosted product demo video** → populate `sitemap-videos.xml`
3. Expand **per-landing FAQ blocks** on top SEO URLs still “Discovered – not indexed” in GSC
4. Add **`/search` redirect** to `/guides?q=` if external tools expect `/search`

### P2 — Technical

1. Run **Rich Results Test** on production URLs after deploy
2. Add **per-blog `dateModified`** in Article schema (partially done via file mtime)
3. Consider **`/.well-known/llms.txt`** redirect alias if crawlers expect that path
4. **hreflang** expansion if Hindi landing pages are added
5. Periodic **duplicate title** scan across 126+ blog posts

### P3 — GEO monitoring

1. Track citations in ChatGPT, Perplexity, Gemini for branded queries (“MyCVRoast”, “resume roast India”)
2. Refresh `llms-full.txt` when pricing or features change
3. A/B test factual citation paragraphs on top 10 landing pages

---

## File reference

```
app/llms.txt/route.ts
app/llms-full.txt/route.ts
app/about/page.tsx
app/how-it-works/page.tsx
app/methodology/page.tsx
app/faq/page.tsx
app/why-trust-us/page.tsx
app/support/page.tsx
app/sitemap-images.xml/route.ts
app/sitemap-videos.xml/route.ts
app/robots.ts
lib/llms/content.ts
lib/llms/generate.ts
lib/schema.ts
lib/seo.ts
lib/sitemap/entries.ts
lib/sitemap/xml.ts
components/seo/InfoPageShell.tsx
components/seo/TopicClusterNav.tsx
```

---

## Deploy checklist

```bash
npm run build
# Deploy to Vercel production
# Verify:
curl -s https://www.mycvroast.in/llms.txt | head
curl -s https://www.mycvroast.in/robots.txt | grep GPTBot
curl -s https://www.mycvroast.in/sitemap.xml | grep images
```
