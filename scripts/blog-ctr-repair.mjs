/**
 * Repair broken SERP titles from blog-ctr-optimize.mjs first pass.
 * Run: node scripts/blog-ctr-repair.mjs [--dry-run]
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const DRY_RUN = process.argv.includes('--dry-run')

const INCOMPLETE_SINGLE_WORD_ENDINGS =
  /\b(The|A|An|For|To|And|Or|In|On|From|Your|Off|Service|Build a Job|A Step|\(Step)\s*$/i

function hasIncompleteSerpEnding(title) {
  const t = String(title).trim()
  if (!t) return true
  if (/-(?:by-step|up|ready|campus|based|page|powered|friendly|sized|listing)\s*$/i.test(t)) return false
  if (/\b(?:Step-by-Step|Follow-Up|Job-Ready|Off-Campus|One-Page|Service-Based|Any Job|With AI|With Examples|Online Tool)\s*$/i.test(t)) return false
  if (/\bStep\s*$/i.test(t) && !/step-by-step\s*$/i.test(t)) return true
  if (/\bFollow\s*$/i.test(t) && !/follow-up\s*$/i.test(t)) return true
  if (/\bJob\s*$/i.test(t) && !/\b(?:Any|Every|New|Remote|Dream|Target|First|Side|Day|Full|Part)\s+Job\s*$/i.test(t)) return true
  if (/\bWith\s*$/i.test(t)) return true
  return INCOMPLETE_SINGLE_WORD_ENDINGS.test(t)
}

/** Protected — do not change */
const PROTECTED = {
  '12th-pass-resume-kaise-banaye': {
    metaTitle: '12th Pass Resume Kaise Banaye? Free Format & Example 2026',
    h1: '12th Pass Resume Kaise Banaye? Complete Guide for Freshers',
    description:
      '12th pass ke baad job ke liye resume kaise banaye? Step-by-step format, fresher example aur common mistakes. Apna resume free check karein.',
  },
}

/** Curated SERP titles — complete phrases, intent-specific */
const SERP_OVERRIDES = {
  ...PROTECTED,
  'off-campus-placement-resume-tips': {
    metaTitle: 'Off-Campus Placement Resume Tips for Freshers',
  },
  'how-to-write-a-cv': {
    metaTitle: 'How to Write a CV: Step-by-Step Guide 2026',
  },
  'how-to-write-cover-letter': {
    metaTitle: 'How to Write a Cover Letter in 2026: Step-by-Step Guide',
  },
  'how-to-find-a-job-india': {
    metaTitle: 'How to Find a Job in India: Step-by-Step Plan 2026',
  },
  'job-application-follow-up-email': {
    metaTitle: 'Job Application Follow-Up Email: Examples & Timing',
  },
  'free-cv-maker-online': {
    metaTitle: 'Free CV Maker Online — Build a Job-Ready CV',
  },
  'service-based-company-resume-india': {
    metaTitle: 'Service-Based Company Resume Guide for Freshers',
  },
  'rejection-email-reply-tool': {
    metaTitle: 'How to Reply to a Rejection Email (Stay on Their Radar)',
  },
  'ai-mock-interview-tool': {
    metaTitle: 'AI Mock Interview Free — Practice Job Interviews Online',
  },
  'voice-mock-interview-tool': {
    metaTitle: 'Voice Mock Interview — Practice Answers With AI',
  },
  'career-gap-explainer-tool': {
    metaTitle: 'Career Gap Explainer — Explain Resume Gaps With AI',
  },
  'jd-match-ats-score-tool': {
    metaTitle: 'JD Match Tool — Check Resume Match With Any Job',
  },
  'linkedin-profile-audit-tool': {
    metaTitle: 'LinkedIn Profile Audit — Free AI Profile Review',
  },
  'one-page-resume-compressor-tool': {
    metaTitle: '1-Page Resume Compressor — Shorten Your CV With AI',
  },
  'skills-gap-analyser-tool': {
    metaTitle: 'Skills Gap Analyser — Find Missing Skills for Your Role',
  },
  'cold-email-recruiter-tool': {
    metaTitle: 'Cold Email to Recruiters — AI Outreach Templates',
  },
  'company-research-interview-tool': {
    metaTitle: 'Company Research Brief — Pre-Interview Prep With AI',
  },
  'interview-debrief-tool': {
    metaTitle: 'Interview Debrief — Analyse What Went Wrong With AI',
  },
  'job-offer-comparator-tool': {
    metaTitle: 'Offer Comparator — Compare Job Offers Side by Side',
  },
  'job-application-tracker-tool': {
    metaTitle: 'Job Application Tracker — Track Applications in One Place',
  },
  'freelancer-profile-builder-tool': {
    metaTitle: 'Freelancer Profile Writer — Upwork & Fiverr Bios',
  },
  'rejection-analyser-tool': {
    metaTitle: 'Rejection Analyser — Find Patterns in Failed Applications',
  },
  'referral-request-email-tool': {
    metaTitle: 'Referral Request Email — Ask Connections With AI',
  },
  'resume-bias-checker-tool': {
    metaTitle: 'Resume Bias Checker — Spot HR Bias Triggers in Your CV',
  },
  'first-90-days-plan-tool': {
    metaTitle: 'First 90 Days Plan — Onboarding Plan From Your CV',
  },
  'ai-cover-letter-generator': {
    metaTitle: 'AI Cover Letter Generator — Tailored Letters From CV + JD',
  },
  'ai-linkedin-about-writer': {
    metaTitle: 'LinkedIn About Writer — 3 Profile Versions From Your CV',
  },
  'elevator-pitch-generator': {
    metaTitle: 'Elevator Pitch Generator — 30-Second Intro From Your CV',
  },
  'resume-bullet-rewriter-ai': {
    metaTitle: 'Bullet Rewriter — Turn Weak CV Bullets Into Strong Lines',
  },
  'salary-negotiation-script-ai': {
    metaTitle: 'Salary Negotiation Script — What to Say When HR Names a Number',
  },
  'ai-career-path-planner': {
    metaTitle: 'AI Career Path Planner — Routes From Your Current Role',
  },
}

function isBroken(metaTitle, title) {
  const mt = String(metaTitle || '').trim()
  const t = String(title || '').trim()
  if (!mt) return true
  if (mt.length < 12) return true
  if (/…/.test(mt)) return true
  if (hasIncompleteSerpEnding(mt)) return true
  if (mt.includes('(Step') && !/step-by-step/i.test(mt)) return true
  if (/Free Tool Guide$/i.test(mt)) return true
  if (t.length > 40 && mt.length < t.length * 0.35) return true
  return false
}

function repairFromTitle(title) {
  return String(title)
    .replace(/\s*\(\d{4}\)\s*$/, '')
    .trim()
}

function repairDescription(desc, title, slug) {
  if (PROTECTED[slug]?.description) return PROTECTED[slug].description
  let d = String(desc || '').trim()
  if (!d) return d
  // Broken topic prefix from stripSubtitle bug
  if (/^(Off|Service|1|Job Application Follow|How to Write a CV: Step)\s*[—–-]/i.test(d)) {
    return d // will fix by regenerating from title below
  }
  if (/^(Off|Service|1|Job Application Follow)\s*[—–-]/i.test(d)) {
    const topic = repairFromTitle(title)
    return d.replace(/^[^—–-]+[—–-]\s*/, `${topic} — `)
  }
  if (d.length > 165) {
    // shorten at sentence boundary, not mid-word
    const cut = d.slice(0, 160)
    const lastSpace = cut.lastIndexOf(' ')
    return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trim() + '…'
  }
  if (d.endsWith('…') && d.length < 80) return d.replace(/…$/, '').trim()
  return d
}

const fixes = []

for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))) {
  const slug = file.replace(/\.md$/, '')
  const filePath = path.join(BLOG_DIR, file)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  const title = String(data.title ?? '')
  const oldMeta = data.metaTitle ? String(data.metaTitle) : ''
  const oldDesc = data.description ? String(data.description) : ''

  let metaTitle = oldMeta
  let description = oldDesc

  if (PROTECTED[slug]) {
    metaTitle = PROTECTED[slug].metaTitle
    if (PROTECTED[slug].description) description = PROTECTED[slug].description
  } else if (SERP_OVERRIDES[slug]?.metaTitle) {
    metaTitle = SERP_OVERRIDES[slug].metaTitle
  } else if (isBroken(oldMeta, title)) {
    metaTitle = repairFromTitle(title)
  }

  // Ellipsis truncation in metaTitle — use full title
  if (/…/.test(metaTitle)) {
    metaTitle = repairFromTitle(title)
  }

  description = repairDescription(description, title, slug)
  if (isBroken(description.split('—')[0]?.trim() || '', title) && description.includes('—')) {
    const topic = repairFromTitle(title)
    description = description.replace(/^[^—]+—/, `${topic} —`)
  }

  const metaChanged = metaTitle !== oldMeta
  const descChanged = description !== oldDesc

  if (metaChanged || descChanged) {
    fixes.push({
      url: `/blog/${slug}`,
      brokenTitle: oldMeta,
      fixedTitle: metaTitle,
      problem: isBroken(oldMeta, title) ? 'semantic truncation / hyphen split' : 'ellipsis or generic',
      validation: isBroken(metaTitle, title) ? 'STILL BROKEN' : 'OK',
    })

    if (!DRY_RUN) {
      const next = { ...data, metaTitle, description }
      fs.writeFileSync(filePath, matter.stringify(content, next), 'utf-8')
    }
  }
}

const reportPath = path.join(process.cwd(), 'docs/blog-seo-title-repair.json')
fs.writeFileSync(reportPath, JSON.stringify(fixes, null, 2))

const stillBroken = fixes.filter((f) => f.validation === 'STILL BROKEN')
console.log(`Repaired ${fixes.length} posts. Still broken: ${stillBroken.length}. ${DRY_RUN ? '(dry run)' : ''}`)
if (stillBroken.length) {
  console.error(stillBroken)
  process.exit(1)
}
