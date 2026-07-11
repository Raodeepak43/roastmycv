#!/usr/bin/env node
/**
 * Generates P0 SEO page configs from data/keywords.json
 * Run: node scripts/generate-p0-seo-data.mjs
 */
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const KEYWORDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/keywords.json'), 'utf-8'))
const OUT_DIR = path.join(ROOT, 'data/seo')

const RESERVED = new Set([
  'admin', 'ads.txt', 'api', 'auth', 'blog', 'contact', 'dashboard', 'favicon.ico',
  'icon', 'linkedin-roast', 'login', 'og', 'plans', 'privacy', 'resume-builder',
  'resume-checker', 'roast', 'robots.txt', 'sitemap.xml', 'terms',
])

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function titleCase(slug) {
  return slug.split('-').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function hashPick(seed, items) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return items[h % items.length]
}

function truncateTitle(t, max = 58) {
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const sp = cut.lastIndexOf(' ')
  return (sp > 35 ? cut.slice(0, sp) : cut).trim() + '…'
}

function truncateDesc(d, max = 155) {
  if (d.length <= max) return d
  const cut = d.slice(0, max - 1)
  const sp = cut.lastIndexOf(' ')
  const trimmed = (sp > 80 ? cut.slice(0, sp) : cut).trim()
  // Prefer ending on punctuation — avoid mid-word ellipsis in SERP snippets
  if (/[.!?]$/.test(trimmed)) return trimmed
  return `${trimmed}.`
}

function getBlogSlugs() {
  const dir = path.join(ROOT, 'content/blog')
  if (!fs.existsSync(dir)) return new Set()
  return new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')))
}

function getToolSlugs() {
  const cfg = fs.readFileSync(path.join(ROOT, 'lib/tools/config.ts'), 'utf-8')
  return [...cfg.matchAll(/slug: '([^']+)'/g)].map((m) => m[1])
}

const blogSlugs = getBlogSlugs()
const toolSlugs = getToolSlugs()
const skipped = []

function checkCollision(slug, keyword) {
  if (RESERVED.has(slug)) {
    skipped.push({ keyword, slug, reason: 'reserved', existingPath: `/${slug}` })
    return true
  }
  if (blogSlugs.has(slug)) {
    skipped.push({ keyword, slug, reason: 'blog-path', existingPath: `/blog/${slug}` })
    return true
  }
  if (toolSlugs.includes(slug)) {
    skipped.push({ keyword, slug, reason: 'tools-path', existingPath: `/tools/${slug}` })
    return true
  }
  return false
}

const INTRO_POOLS = [
  (kw) => [
    `Indian job seekers search **${kw}** when campus drives, Naukri applications, or LinkedIn Easy Apply stops working — same CV, zero callbacks. Generic advice won't fix a PDF that ATS and recruiters reject in seconds.`,
    `MyCVRoast embeds a free **${kw}** on this page: upload your resume, get an instant score, brutally honest feedback, and specific fixes. Built for freshers — CGPA, projects, and Hinglish roast mode included.`,
  ],
  (kw) => [
    `**${kw}** is one of the highest-intent searches in India's 2026 job market. You don't need another template — you need to know what's wrong with *your* bullets before TCS, Infosys, or a startup shortlists someone else.`,
    `Use the tool below for a free **${kw}** run (2 per device, no signup). Then fix format in our [resume builder](/resume-builder) or deep-dive with [JD Match](/login?next=/dashboard/tools/jd-match) on the dashboard.`,
  ],
  (kw) => [
    `Recruiters in India skim CVs in 6–10 seconds. **${kw}** helps you see your resume through their eyes — before you waste another week on applications that never convert.`,
    `This page explains how **${kw}** works for Indian freshers, what ATS systems flag, and how MyCVRoast gives actionable feedback in 30 seconds. Upload below to start.`,
  ],
]

const MISTAKE_BULLETS = [
  'Photo, age, or marital status on CV — triggers bias filters at MNCs',
  'Skills section listing "MS Office, Team Player, Hard Working"',
  'Vague bullets: "Worked on various projects" with no metrics',
  'Two-column Canva templates that ATS cannot parse',
  'Objective line copied from 2010: "Seeking challenging opportunities…"',
  'CGPA missing or hidden when company asks for it on Naukri',
  'Project descriptions without tech stack or your specific contribution',
  'Same generic CV sent to 50 different JDs without keyword tailoring',
]

const ROLE_SKILLS = {
  'software-engineer': ['Data Structures', 'Java/Python', 'SQL', 'Git', 'REST APIs', 'System Design basics'],
  'data-analyst': ['SQL', 'Excel', 'Python', 'Tableau/Power BI', 'Statistics', 'A/B Testing'],
  'business-analyst': ['SQL', 'JIRA', 'BRD/FRD', 'Stakeholder Management', 'Process Mapping', 'Excel'],
  'digital-marketing': ['Google Ads', 'Meta Ads', 'SEO', 'Analytics', 'Content Strategy', 'Canva'],
  'backend-developer': ['Node.js/Java', 'PostgreSQL', 'Redis', 'REST', 'Docker basics', 'API Design'],
  'frontend-developer': ['React', 'JavaScript', 'CSS', 'Responsive UI', 'Git', 'Performance'],
  'android-developer': ['Kotlin/Java', 'Android SDK', 'REST APIs', 'Firebase', 'Material Design', 'Git'],
  'hr-executive': ['Recruitment', 'HRIS', 'Onboarding', 'Excel', 'Labour Laws basics', 'Communication'],
  'accountant': ['Tally', 'GST', 'Excel', 'Financial Statements', 'Reconciliation', 'TDS'],
}

function genericRoleSkills(role) {
  return [
    `${role} fundamentals`,
    'Communication',
    'Problem solving',
    'MS Excel / Google Sheets',
    'Documentation',
    'Team collaboration',
  ]
}

function buildLanding(keyword, cluster) {
  const slug = slugify(keyword)
  const h1 = keyword.split(' ').map((w, i) => (i === 0 || !['ai', 'ats', 'cv'].includes(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase())).join(' ')
  const introFn = hashPick(slug, INTRO_POOLS)
  const mistakes = MISTAKE_BULLETS.slice()
    .sort((a, b) => hashPick(slug + a, [-1, 1]) - hashPick(slug + b, [-1, 1]))
    .slice(0, 6)

  const sections = [
    {
      title: `What is ${keyword}?`,
      paragraphs: [
        `**${keyword}** means using AI or automated scoring to evaluate how well your resume will perform with Applicant Tracking Systems (ATS) and human recruiters. In India, lakhs of freshers apply to the same campus pool — a weak CV never reaches the interview stage even when skills are fine.`,
        `Unlike a generic template site, MyCVRoast reads *your* PDF or text, scores clarity and impact, and returns specific rewrites. For "${keyword}" searches, candidates usually want: instant feedback, free access, and India-specific context (CGPA, internships, TPO deadlines).`,
      ],
    },
    {
      title: `How to use this ${keyword} page`,
      paragraphs: [
        `Upload your resume in the embed above (PDF or TXT). Pick Hinglish if you want feedback in natural Hindi-English mix. Within ~30 seconds you get a score out of 10, roast lines quoting weak bullets, and a fix list.`,
        `Run it twice: once before editing (baseline) and once after you apply fixes. Pair with our [free resume builder](/resume-builder) if formatting or ATS structure is the main issue.`,
      ],
      bullets: [
        'Export PDF from Word/Google Docs — avoid scanned images',
        'Include CGPA, project tech stack, and internship outcomes',
        'Keep one column; remove photos for IT/MNC applications',
        'Tailor keywords from the JD before mass applying on Naukri',
      ],
    },
    {
      title: 'Why Indian freshers need honest feedback first',
      paragraphs: [
        `Campus placement and off-campus hunts in 2026 are volume games — 30 to 100 applications per offer is normal. **${keyword}** catches issues friends and TPOs won't say out loud: cringe objective lines, empty skills sections, and projects nobody can explain in interviews.`,
        `Roast-style feedback changes behaviour; a polite "looks good" does not. MyCVRoast is built in India, priced at ₹149 Pro one-time, and supports 15 languages including Hinglish.`,
      ],
    },
    {
      title: 'Common mistakes this checker catches',
      paragraphs: [
        `Based on thousands of Indian fresher CVs, these patterns fail **${keyword}** checks most often:`,
      ],
      bullets: mistakes,
    },
    {
      title: 'After your score — next steps',
      paragraphs: [
        `Score under 6? Fix the top 3 roast items first — usually summary, skills, and project bullets. Score 6–7? Run [JD Match](/login?next=/dashboard/tools/jd-match) against your dream company JD. Heading to interviews? Try [Interview Prep](/login?next=/dashboard/tools/interview-prep) on the free dashboard.`,
        `Read our comparison guide: [AI resume review tools for India](/blog/ai-resume-review-tools-compared-india).`,
      ],
    },
  ]

  const faq = [
    {
      question: `Is ${keyword} free on MyCVRoast?`,
      answer: `Yes — 2 free roasts per device, no signup. Upload above on this page. Pro (₹149 one-time) unlocks unlimited roasts and 29 dashboard career tools.`,
    },
    {
      question: `Does ${keyword} work for fresher resumes in India?`,
      answer: 'Yes. MyCVRoast understands Indian formats — CGPA, 10th/12th, internships, and campus projects. Feedback is tuned for TCS, Infosys, startups, and Naukri applications.',
    },
    {
      question: 'Will ATS read my PDF correctly?',
      answer: 'Use text-based PDFs (not Canva image exports). Single-column layouts score best. The roast flags parsing issues when sections are missing or unreadable.',
    },
    {
      question: 'Roast vs review — what is the difference?',
      answer: 'Review gives generic scores. Roast quotes your actual bullets and tells you what recruiters silently judge — faster behaviour change for Indian freshers.',
    },
  ]

  const title = truncateTitle(`${h1} — Free | MyCVRoast`)
  const metaDescription = truncateDesc(
    `Free ${keyword} for India — upload CV, instant AI score & fixes. No signup. Hinglish for freshers.`,
  )

  return {
    slug,
    keyword,
    h1,
    title,
    metaDescription,
    keywordMeta: keyword,
    cluster,
    priority: 'P0',
    intro: introFn(keyword),
    sections,
    faq,
    relatedSlugs: [],
    defaultLanguage: cluster.includes('Hinglish') || cluster.includes('Hindi') ? 'hinglish' : 'hinglish',
    defaultIntensity: 'gaali_light',
  }
}

function buildRoleChecker(keyword) {
  const slug = extractRoleSlug(keyword)
  const role = titleCase(slug)
  const h1 = `${role} Resume Checker — Free AI Score`
  const skills = ROLE_SKILLS[slug] || genericRoleSkills(role)
  const mistakes = [
    `Listing ${role} as a skill without project or internship proof`,
    'One generic CV sent to all companies — no role keywords in bullets',
    'Missing quantified outcomes (%, time saved, users impacted)',
    'Skills section copied from Naukri template without tools you actually used',
    'Two-page fresher CV with school achievements from 2015 still listed',
    'No link to GitHub, portfolio, or case study for technical roles',
  ]

  const sections = [
    {
      title: `ATS keywords recruiters expect for ${role}`,
      paragraphs: [
        `Applicant Tracking Systems at Indian IT firms, product companies, and agencies scan for role-specific terms. For **${role}** profiles, ensure these appear naturally in projects and experience — not stuffed in a keyword block:`,
      ],
      bullets: skills,
    },
    {
      title: `How to structure a ${role} fresher CV`,
      paragraphs: [
        `Lead with a crisp summary naming **${role}** and your strongest stack. Projects beat coursework — each bullet should say what you built, tools used, and outcome. Internships count as experience when described with ownership.`,
        `Keep one page for 0–2 years experience. Use the checker below, fix the top 3 roast items, then tailor keywords from each job description before applying.`,
      ],
      bullets: [
        'Summary: role + stack + one metric or project highlight',
        'Projects: 2–3 with GitHub or demo links where possible',
        'Skills: split into Core / Tools / Soft — avoid filler',
        'Education: CGPA if above company cutoff; else projects lead',
      ],
    },
    {
      title: `Common ${role} resume mistakes in India`,
      paragraphs: ['These fail most **' + keyword + '** reviews we see from Indian candidates:'],
      bullets: mistakes,
    },
    {
      title: 'Improve your score in one session',
      paragraphs: [
        `Upload below for a free **${keyword}** run. Score under 7? Rewrite project bullets with action verbs and numbers. Re-check until clarity improves.`,
        `Next: [JD Match](/login?next=/dashboard/tools/jd-match) for your target company, [Interview Prep](/login?next=/dashboard/tools/interview-prep) for ${role} questions, and [Cover Letter](/login?next=/dashboard/tools/cover-letter) if the posting asks for one.`,
      ],
    },
  ]

  const faq = [
    {
      question: `Is this ${keyword} free?`,
      answer: 'Yes — 2 free checks per device on MyCVRoast. No email required for your first roasts.',
    },
    {
      question: `What should a ${role} fresher highlight?`,
      answer: `Projects, internships, and tools from the ${role} stack (${skills.slice(0, 3).join(', ')}). Avoid empty "team player" skills without evidence.`,
    },
    {
      question: 'Can I use the same CV for every company?',
      answer: 'Base CV yes — but tailor keywords from each JD. Use JD Match on the dashboard for a 0–100 ATS match score.',
    },
    {
      question: 'How long should a fresher resume be?',
      answer: 'One page for campus and 0–2 years experience. The checker flags fluff that pushes CV to two pages without adding value.',
    },
  ]

  return {
    slug,
    role,
    keyword,
    h1,
    title: truncateTitle(`${h1} | MyCVRoast`),
    metaDescription: truncateDesc(
      `Free ${keyword} for Indian freshers. AI scores your ${role} CV, flags weak bullets & missing keywords. Instant feedback — no signup.`,
    ),
    keywordMeta: keyword,
    intro: [
      `Applying as a **${role}** in India means competing with hundreds of similar profiles on Naukri and LinkedIn. Recruiters shortlist on keywords, project depth, and clarity — not just degree name.`,
      `This **${keyword}** page lets you upload your CV and get AI feedback tuned to ${role} expectations: skills match, bullet impact, and red flags before HR sees your application.`,
    ],
    sections,
    atsKeywords: skills,
    commonMistakes: mistakes,
    faq,
    relatedSlugs: [],
    defaultLanguage: 'hinglish',
  }
}

function extractDegreeSlug(keyword) {
  const k = keyword.toLowerCase().trim()
  const suffixes = [' fresher resume', ' resume for freshers', ' fresher cv']
  for (const s of suffixes) {
    if (k.endsWith(s)) return slugify(k.slice(0, -s.length))
  }
  return slugify(keyword)
}

function extractRoleSlug(keyword) {
  const k = keyword.toLowerCase().trim()
  if (k.endsWith(' resume checker')) return slugify(k.slice(0, -' resume checker'.length))
  return slugify(keyword)
}

function assignRelated(items, keyFn) {
  const byKey = items.map((item) => keyFn(item))
  items.forEach((item, i) => {
    const related = []
    for (let d = 1; d <= 4 && related.length < 4; d++) {
      const j = (i + d) % items.length
      if (j !== i) related.push(items[j].slug)
    }
    item.relatedSlugs = related.slice(0, 4)
  })
}

// ── Tool landings P0 ──
const landingKeywords = KEYWORDS.all.filter(
  (k) => k.pageType === 'Tool Landing Page' && k.priority === 'P0',
)
const toolLandings = []
for (const row of landingKeywords) {
  const slug = slugify(row.keyword)
  if (checkCollision(slug, row.keyword)) continue
  toolLandings.push(buildLanding(row.keyword, row.cluster))
}
assignRelated(toolLandings, (x) => x.slug)

// ── Role checkers P0 ──
const roleKeywords = KEYWORDS.all.filter(
  (k) => k.pageType === 'Programmatic Tool Page' && k.priority === 'P0',
)
const roleCheckers = []
const seenRoles = new Set()
for (const row of roleKeywords) {
  const slug = extractRoleSlug(row.keyword)
  if (seenRoles.has(slug)) continue
  seenRoles.add(slug)
  roleCheckers.push(buildRoleChecker(row.keyword))
}
assignRelated(roleCheckers, (x) => x.slug)

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(path.join(OUT_DIR, 'tool-landings.json'), JSON.stringify(toolLandings, null, 2))
fs.writeFileSync(path.join(OUT_DIR, 'role-checkers.json'), JSON.stringify(roleCheckers, null, 2))
fs.writeFileSync(path.join(OUT_DIR, 'collisions-skipped.json'), JSON.stringify(skipped, null, 2))

// blog queue
const blogQueue = []
const programmaticDegreeQueue = []
for (const row of KEYWORDS.all) {
  if (row.cluster === 'City') {
    blogQueue.push({ ...row, status: 'p2-deferred-city', route: null })
    continue
  }
  if (row.cluster === 'Fresher x Degree') {
    programmaticDegreeQueue.push({
      slug: extractDegreeSlug(row.keyword),
      keyword: row.keyword,
      cluster: row.cluster,
      priority: row.priority,
      status: 'pending-p1',
      route: `/fresher-resume/${extractDegreeSlug(row.keyword)}`,
      pageType: 'Programmatic Page (override)',
    })
    continue
  }
  if (row.pageType === 'Blog Post') {
    blogQueue.push({
      slug: slugify(row.keyword),
      title: row.keyword.charAt(0).toUpperCase() + row.keyword.slice(1),
      targetKeyword: row.keyword,
      cluster: row.cluster,
      priority: row.priority,
      status: blogSlugs.has(slugify(row.keyword)) ? 'published' : 'pending',
      notes: row.notes || '',
    })
  }
}

fs.writeFileSync(path.join(ROOT, 'content/blog-queue.json'), JSON.stringify(blogQueue, null, 2))
fs.writeFileSync(path.join(OUT_DIR, 'degree-pages-queue.json'), JSON.stringify(programmaticDegreeQueue, null, 2))

const urls = [
  ...toolLandings.map((p) => `https://www.mycvroast.in/${p.slug}`),
  ...roleCheckers.map((p) => `https://www.mycvroast.in/resume-checker/${p.slug}`),
]
fs.writeFileSync(path.join(ROOT, 'generated-urls.txt'), urls.join('\n') + '\n')

console.log('Tool landings:', toolLandings.length)
console.log('Role checkers:', roleCheckers.length)
console.log('Skipped collisions:', skipped.length)
skipped.forEach((s) => console.log('  SKIP', s.slug, '→', s.existingPath, `(${s.reason})`))
console.log('Blog queue items:', blogQueue.length)
console.log('Degree queue (P1):', programmaticDegreeQueue.length)
console.log('Net-new URLs:', urls.length)
console.log('Wrote generated-urls.txt')
