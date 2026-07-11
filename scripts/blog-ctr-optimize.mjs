/**
 * Batch CTR-focused SEO updates for content/blog/*.md
 * Run: node scripts/blog-ctr-optimize.mjs [--dry-run]
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const DRY_RUN = process.argv.includes('--dry-run')

/** Manual overrides — GSC priority + high-impression intents */
const MANUAL = {
  '12th-pass-resume-kaise-banaye': {
    metaTitle: '12th Pass Resume Kaise Banaye? Free Format & Example 2026',
    h1: '12th Pass Resume Kaise Banaye? Complete Guide for Freshers',
    title: '12th Pass Resume Kaise Banaye? Complete Guide for Freshers',
    description:
      '12th pass ke baad job ke liye resume kaise banaye? Step-by-step format, fresher example aur common mistakes. Apna resume free check karein.',
    intro:
      '12th pass ke baad job ke liye resume banana confusing ho sakta hai — graduation nahi hai to bhi retail, BPO, data entry aur apprenticeship roles me CV maanga jata hai. Yeh guide step-by-step batati hai **12th pass resume kaise banaye**, kya information include karni hai, aur freshers kin galtiyon se bachna chahiye.',
  },
  '10th-pass-resume-kaise-banaye': {
    metaTitle: '10th Pass Resume Kaise Banaye? Simple Job Format 2026',
    h1: '10th Pass Resume Kaise Banaye — Job ke Liye Format',
    description:
      '10th pass ke baad BPO, retail ya data entry ke liye resume kaise banaye? Simple one-page format, skills aur free check.',
  },
  '12th-pass-bpo-resume-format': {
    metaTitle: '12th Pass BPO Resume Format — Call Centre Jobs 2026',
    h1: '12th Pass BPO Resume Format for Call Centre Jobs',
    description:
      '12th pass BPO resume format — voice/non-voice call centre ke liye objective, skills, typing speed aur sample lines. Free AI check.',
  },
  'biodata-maker-for-job-india': {
    metaTitle: 'Bio Data Maker for Job — Free Biodata Format India',
    h1: 'Bio Data Maker for Job — Free Format & Guide (India)',
    description:
      'Bio data maker for job applications in India — free format, biodata vs resume, PDF tips for freshers. No signup required.',
  },
  'bio-data-format-for-job-pdf-free': {
    metaTitle: 'Bio Data Format for Job PDF Free — India Sample',
    h1: 'Bio Data Format for Job PDF Free Download (India)',
    description:
      'Free bio data format for job PDF — copy-paste structure, declaration block, and when to use biodata vs resume in India.',
  },
  'ats-friendly-resume': {
    metaTitle: 'Check If Resume Is ATS Friendly — Free Test India',
    h1: 'Is My Resume ATS Friendly? Free Check Guide',
    description:
      'Check if your resume is ATS friendly before you apply. Learn what ATS checks, common formatting mistakes, and free instant test for India.',
  },
  'free-resume-review-online-india-2026': {
    metaTitle: 'Free Resume Review Online India — AI Score in 30 Sec',
    h1: 'Free Resume Review Online India (2026)',
    description:
      'Free resume review online for India — upload CV, get AI score and specific fixes in 30 seconds. No signup on first check.',
  },
  'ai-resume-review-india': {
    metaTitle: 'AI Resume Review India — Free Honest CV Feedback',
    h1: 'AI Resume Review India: Free Honest Feedback',
    description:
      'Best free AI resume review for Indian job seekers — instant CV feedback, ATS flags, and fixes without paying a career coach.',
  },
  'cv-layout-examples': {
    metaTitle: 'CV Layout Examples — Best Resume Layout for Freshers',
    h1: 'CV Layout Examples: Best Structures for Freshers',
    description:
      'Layout CV the right way — single-column examples that pass ATS, section order for freshers, and mistakes that get CVs rejected.',
  },
  'zety-resume-maker-free-alternative-india': {
    metaTitle: 'Zety Resume Maker Free Alternative India (2026)',
    h1: 'Zety Resume Maker Free Alternative for India',
    description:
      'Zety resume maker free alternative — honest comparison of download limits, ATS safety, and free PDF export for Indian freshers.',
  },
  'zety-resume-builder-vs-mycvroast-india': {
    metaTitle: 'Zety vs MyCVRoast — Free Resume Builder India',
    h1: 'Zety Resume Builder vs MyCVRoast: India Comparison',
    description:
      'Zety resume builder vs MyCVRoast for India — free PDF export, ATS templates, Hinglish roast, and which tool freshers should pick.',
  },
  'resignation-letter-generator': {
    metaTitle: 'Resignation Letter Generator Free — India Format',
    h1: 'Resignation Letter Generator: Professional Exit Guide',
    description:
      'Free resignation letter generator for India — 2 weeks notice format, formal & warm samples, handover checklist. Generate in minutes.',
  },
  'achha-resume-kaise-banaye': {
    metaTitle: 'Achha Resume Kaise Banaye? Fresher Guide (Hindi)',
    h1: 'Achha Resume Kaise Banaye — Indian Fresher Guide',
    description:
      'Achha resume kaise banaye — summary, skills, projects aur format Hinglish me step-by-step. Examples ke saath free check.',
  },
  'cv-kaise-banaye': {
    metaTitle: 'CV Kaise Banaye? Fresher Format & Example 2026',
    h1: 'CV Kaise Banaye — Complete Fresher Guide',
    description:
      'CV kaise banaye India me — fresher ke liye section order, sample lines aur common mistakes. Free AI CV check.',
  },
  'bina-experience-ke-resume-kaise-banaye': {
    metaTitle: 'Bina Experience ke Resume Kaise Banaye?',
    h1: 'Bina Experience ke Resume Kaise Banaye',
    description:
      'Experience nahi hai to resume kaise banaye? Projects, skills aur education ko sahi format me likhna seekhein. Free check.',
  },
  'hinglish-resume-kaise-banaye': {
    metaTitle: 'Hinglish Resume Kaise Banaye? Format & Tips',
    h1: 'Hinglish Resume Kaise Banaye — India Guide',
    description:
      'Hinglish resume kaise banaye — kab English, kab Hindi mix, aur recruiter-friendly format for Indian job applications.',
  },
  'chatgpt-se-resume-kaise-banaye': {
    metaTitle: 'ChatGPT se Resume Kaise Banaye? Free AI Tips',
    h1: 'ChatGPT se Resume Kaise Banaye',
    description:
      'ChatGPT se resume kaise banaye — prompts jo kaam karte hain, galtiyan jo ATS fail karti hain, aur free roast se verify kaise karein.',
  },
  'free-resume-checker-india': {
    metaTitle: 'Free Resume Checker India — Instant AI Score',
    h1: 'Free Resume Checker India',
    description:
      'Free resume checker for India — upload PDF, get score and fixes in 30 seconds. Built for freshers and campus placement.',
  },
  'ats-free-resume-checker-india': {
    metaTitle: 'ATS Free Resume Checker India — Test Your CV',
    h1: 'ATS Free Resume Checker India',
    description:
      'ATS free resume checker for India — see if bots can read your CV, fix formatting, and improve shortlist rate before applying.',
  },
  'resume-roast-ai-free-india': {
    metaTitle: 'Resume Roast AI Free India — Honest CV Feedback',
    h1: 'Resume Roast AI Free India',
    description:
      'Free AI resume roast for India — brutally honest feedback in Hinglish or English. Score, weak bullets, and fix list in 30 sec.',
  },
  'what-is-resume-roast': {
    metaTitle: 'What Is a Resume Roast? Free AI CV Review Explained',
    h1: 'What Is a Resume Roast?',
    description:
      'What is a resume roast — how AI reads your CV, what score means, and why Indian freshers use roast before campus placement.',
  },
}

const FILLER_RE =
  /^(In today'?s (fast-paced|competitive) (world|job market)[^.]*\.[\s]*)+/i

function isHinglish(slug, body) {
  return (
    /kaise-banaye|kaise-|kya-|bina-|achha-|hinglish|cv-kaise|resume-kaise|mat-likho|ke-liye|nahi-hai|likhna|seekhein|chahiye/i.test(
      slug,
    ) || /kaise|kya likh|mat likho|chahiye|seekhein|nahi hai/i.test(body.slice(0, 800))
  )
}

function inferType(slug, explicit) {
  if (explicit) return explicit
  if (slug.endsWith('-tool') || slug.includes('-analyser')) return 'tool'
  if (slug.includes('-vs-') || slug.startsWith('best-') || slug.includes('compared')) return 'comparison'
  return 'guide'
}

function stripSubtitle(title) {
  let t = String(title).trim()
  t = t.replace(/\s*\(\d{4}\)\s*$/, '').trim()
  if (/\s[—–]\s/.test(t)) return t.split(/\s[—–]\s/)[0].trim()
  if (/\s-\s/.test(t)) return t.split(/\s-\s/)[0].trim()
  return t
}

function genMetaTitle(slug, title) {
  if (MANUAL[slug]?.metaTitle) return MANUAL[slug].metaTitle
  return String(title).replace(/\s*\(\d{4}\)\s*$/, '').trim()
}

function polishDescription(slug, title, desc, hinglish, type) {
  if (MANUAL[slug]?.description) return MANUAL[slug].description

  let d = desc.trim()
  if (d.length >= 90 && d.length <= 165 && !d.startsWith('What is')) return d

  const topic = stripSubtitle(title)
  if (hinglish) {
    return `${topic} — step-by-step format, practical examples aur common mistakes. Resume banane ke baad free AI check karein.`
  }
  if (type === 'tool') {
    return `How ${topic.toLowerCase()} works on MyCVRoast — what it checks, who it's for, and how to get better results before you apply in India.`
  }
  if (type === 'comparison') {
    return `${topic} — side-by-side for Indian freshers: free tiers, ATS safety, and which option fits your job search in 2026.`
  }
  return `${topic} — practical format tips, examples, and mistakes to avoid for Indian freshers. Free AI resume check linked.`
}

function genH1(slug, title, metaTitle) {
  if (MANUAL[slug]?.h1) return MANUAL[slug].h1
  if (MANUAL[slug]?.title) return MANUAL[slug].title
  // Keep visible H1 slightly more descriptive than SERP when metaTitle is question form
  if (metaTitle.includes('?') && !title.includes('?')) {
    return title.includes('—') ? title : `${stripSubtitle(title)} — Complete Guide`
  }
  return title
}

function replaceIntro(body, intro) {
  if (!intro) return body
  const lines = body.split('\n')
  let i = 0
  while (i < lines.length && !lines[i].trim()) i++
  if (i >= lines.length) return body
  // Replace first non-empty paragraph block (until blank line or heading)
  let end = i + 1
  while (end < lines.length && lines[end].trim() && !lines[end].startsWith('#')) end++
  const rest = lines.slice(end).join('\n')
  return `${intro}\n\n${rest}`.replace(/\n{3,}/g, '\n\n')
}

function removeFiller(body) {
  const trimmed = body.trimStart()
  if (FILLER_RE.test(trimmed)) {
    return trimmed.replace(FILLER_RE, '').trimStart()
  }
  return body
}

const audit = []

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
for (const file of files) {
  const slug = file.replace(/\.md$/, '')
  const filePath = path.join(BLOG_DIR, file)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const oldTitle = String(data.title ?? '')
  const oldDesc = String(data.description ?? '')
  const oldMeta = data.metaTitle ? String(data.metaTitle) : ''
  const oldH1 = data.h1 ? String(data.h1) : ''
  const type = inferType(slug, data.type)
  const hinglish = isHinglish(slug, content)

  const metaTitle = genMetaTitle(slug, oldTitle)
  const description = polishDescription(slug, oldTitle, oldDesc, hinglish, type)
  const h1 = genH1(slug, oldTitle, metaTitle)
  const title = MANUAL[slug]?.title ?? (h1 !== oldTitle && data.h1 === undefined ? h1 : oldTitle)

  let newContent = content
  if (MANUAL[slug]?.intro) {
    newContent = replaceIntro(newContent, MANUAL[slug].intro)
  }
  newContent = removeFiller(newContent)

  const changed =
    metaTitle !== oldMeta ||
    description !== oldDesc ||
    h1 !== oldH1 ||
    (MANUAL[slug]?.title && title !== oldTitle) ||
    newContent !== content

  audit.push({
    url: `/blog/${slug}`,
    oldTitle,
    newTitle: metaTitle,
    oldDesc: oldDesc.slice(0, 80),
    newDesc: description.slice(0, 80),
    h1,
    language: hinglish ? 'Hinglish' : 'English',
    intent: type,
    changed,
  })

  if (!changed || DRY_RUN) continue

  const next = {
    ...data,
    title,
    metaTitle,
    h1: h1 !== title ? h1 : h1,
    description,
  }
  if (next.h1 === title) {
    // keep h1 in frontmatter for explicit SERP/H1 split when they differ
    if (h1 !== title || MANUAL[slug]?.h1) next.h1 = h1
    else delete next.h1
  }

  const out = matter.stringify(newContent, next)
  fs.writeFileSync(filePath, out, 'utf-8')
}

const reportPath = path.join(process.cwd(), 'docs/blog-seo-ctr-audit-data.json')
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(audit, null, 2))

const changedCount = audit.filter((a) => a.changed).length
console.log(`Audited ${audit.length} posts. Updated ${changedCount}. ${DRY_RUN ? '(dry run)' : ''}`)
console.log(`Data: ${reportPath}`)
