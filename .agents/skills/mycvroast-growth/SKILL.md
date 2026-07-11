---
name: mycvroast-growth
description: >-
  MyCVRoast marketing & SEO optimization using UnifAPI agents. Use when auditing
  mycvroast.in SEO, AI visibility (GEO), keyword research, competitor tracking,
  Reddit content ideas, or planning blog/social growth for the Indian resume/CV
  job-search niche.
---

# MyCVRoast Growth (UnifAPI-optimized)

This skill maps [unifapi-agent/agents](https://github.com/unifapi-agent/agents) to **MyCVRoast** specifically. Requires UnifAPI MCP (`https://mcp.unifapi.com`) connected via OAuth in Cursor.

## Product context

| Field | Value |
|-------|--------|
| **Site** | https://www.mycvroast.in |
| **Product** | Free AI resume roast + 29 dashboard career tools + resume builder |
| **Audience** | Indian job seekers, freshers, campus placement, Hinglish users |
| **Blog** | 98 posts in `content/blog/` — tool guides + SEO articles |
| **Competitors** | Jobscan, Resume Worded, Zety, Novoresume, Rezi, Kickresume, Canva resume |

## Which UnifAPI skills to use (priority order)

### 1. SEO Agent — fix Google rankings

| Skill | When to use |
|-------|-------------|
| `seo-audit` | Monthly audit of www.mycvroast.in — crawl, on-page, SERP evidence |
| `keyword-research` | Seed: `resume roast india`, `ai cv review`, `ats resume builder`, `hinglish resume`, `free resume checker india` |
| `seo-fix-plan` | Turn audit into prioritized fixes with owners |
| `schema` | FAQ/HowTo JSON-LD for blog posts and homepage |

**Target pages:** `/`, `/blog/mycvroast-ai-tools-guide`, `/resume-builder`, `/linkedin-roast`, top blog slugs.

### 2. AI Visibility Agent — win ChatGPT / Perplexity / Google AI answers

| Skill | When to use |
|-------|-------------|
| `ai-visibility-audit` | Check if "best free resume roast India" cites mycvroast.in |
| `ai-answer-gap` | Find prompts competitors own (Jobscan, Resume Worded) |
| `llm-mention-tracking` | Track brand mentions vs competitors monthly |
| `ai-visibility-fix-plan` | Structure + authority fixes for GEO |

**Target prompts:**
- "best free AI resume review India"
- "resume roast tool hinglish"
- "ATS resume builder free India"
- "how to fix resume for campus placement"

### 3. Content Strategy Agent — blog & landing page ideas

| Skill | When to use |
|-------|-------------|
| `content-opportunity-brief` | Find Reddit/YouTube questions we have not blogged yet |
| `content-strategy` | Quarterly content calendar from live demand data |
| `customer-research` | Mine r/developersIndia, r/IndianWorkplace, r/resumes for language |

**Output →** new posts in `content/blog/` matching existing frontmatter format in `lib/blog.ts`.

### 4. Competitive Intelligence Agent — watch rivals

| Skill | When to use |
|-------|-------------|
| `competitor-profiling` | Profile Jobscan, Resume Worded, Rezi positioning |
| `competitor-launch-monitor` | Alert when competitors ship new features |

### 5. Social Listening — Reddit + X

| Skill | When to use |
|-------|-------------|
| `reddit-community-research` | Map subreddits where resume help threads appear |
| `reddit-thread-fit-check` | Before any founder reply — check thread fit & rules |
| `social-listening-brief` | Weekly mention brief for "resume roast" / "cv feedback" |

**Do NOT spam.** Read-only research; link only when genuinely helpful.

## Skills to SKIP (not relevant)

- Local SEO (dental, med spa, restaurant, real estate, law firm, home services)
- Influencer / KOL pricing (unless running creator campaigns later)
- Lead & Company Research (B2B sales, not consumer product)

## Example prompts (copy into Cursor Agent)

### Monthly SEO audit
```
Using UnifAPI seo-audit + seo-fix-plan for https://www.mycvroast.in targeting:
"resume roast india", "ai resume review free", "ats resume builder india",
"hinglish resume roast", "free cv checker". Cite live SERP evidence. Output
fixes I can implement in Next.js (meta tags, sitemap, internal links, schema).
```

### AI visibility (GEO)
```
Run ai-visibility-audit and ai-answer-gap for mycvroast.in vs jobscan.co and
resumeworded.com on prompts Indian freshers use for resume feedback. List gaps
where we should add blog content or FAQ schema.
```

### Next blog topics
```
Use content-opportunity-brief + customer-research for Indian job seekers /
resume / ATS / campus placement. Cross-check against content/blog/ slugs we
already have. Suggest 10 new post titles with primary keywords.
```

### Competitor watch
```
competitor-profiling for Jobscan, Resume Worded, and Rezi — positioning, free
tier limits, and content strategy. What should MyCVRoast emphasize (brutal
honest roast, Hinglish, ₹149 Pro, 29 tools)?
```

## Implementation checklist (after each audit)

- [ ] Update `title` / `description` in affected `app/**/page.tsx` metadata
- [ ] Add internal links between blog posts and tool pages
- [ ] Add FAQ schema to posts missing `faq:` frontmatter
- [ ] Update `app/sitemap.ts` if new routes added
- [ ] Deploy: `npm run build && npx vercel --prod --yes`

## Setup (one-time)

1. **MCP** — `.cursor/mcp.json` includes `unifapi` → `https://mcp.unifapi.com`
2. **OAuth** — Cursor Settings → MCP → unifapi → sign in when prompted (free trial credits)
3. **Skills** — run in project root:
   ```bash
   npx skills add unifapi-agent/agents -y
   ```
4. **Reload Cursor** after MCP + skills install

## Cost note

UnifAPI enhanced skills consume API credits on live public data pulls. Start with `seo-audit` + `keyword-research` before running all 47 skills.
