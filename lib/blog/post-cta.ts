export type BlogCtaConfig = {
  emoji: string
  headline: string
  sub?: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}

const DEFAULT: BlogCtaConfig = {
  emoji: '🔥',
  headline: 'Apna resume roast karwao — free mein',
  sub: 'Instant AI score, Hinglish feedback, and fixes in 30 seconds.',
  primary: { label: 'Roast Karo →', href: '/' },
  secondary: { label: 'All tools & plans', href: '/plans' },
}

export const BLOG_FEATURED_SLUGS = [
  'fresher-resume-format',
  'why-resume-rejected',
  'ats-friendly-resume',
  'ai-resume-review-tools-compared-india',
  'best-free-ai-resume-review-india-2026',
  'best-mock-interview-ai-india-2026',
  'what-is-resume-roast',
  'mycvroast-vs-jobscan-vs-resume-worded',
  'zety-resume-builder-vs-mycvroast-india',
  'ats-free-resume-checker-india',
  'free-resume-checker-india',
] as const

const BY_SLUG: Record<string, BlogCtaConfig> = {
  'gemini-resume-roast-prompt-india': {
    emoji: '🔥',
    headline: 'Skip prompts — free PDF roast in 30 sec',
    sub: 'Upload CV, get score + Hinglish fixes. Better than copy-paste Gemini.',
    primary: { label: 'Free Resume Roast →', href: '/' },
    secondary: { label: 'ATS checker', href: '/ats-friendly-resume-checker' },
  },
  'work-experience-resume-section': {
    emoji: '🔥',
    headline: 'Roast your experience bullets — free',
    sub: 'AI quotes weak lines from YOUR resume and rewrites them.',
    primary: { label: 'Check My CV Free →', href: '/' },
    secondary: { label: 'Resume builder', href: '/resume-builder' },
  },
  'cv-for-students-guide': {
    emoji: '📄',
    headline: 'Build + roast your student CV free',
    sub: 'ATS template + instant AI score — no signup for first roast.',
    primary: { label: 'Free CV Roast →', href: '/' },
    secondary: { label: 'Student resume builder', href: '/resume-builder' },
  },
  'student-resume-guide': {
    emoji: '🔥',
    headline: 'Get your student resume scored free',
    sub: 'Upload PDF — see what recruiters hate in 30 seconds.',
    primary: { label: 'Roast My Resume →', href: '/' },
    secondary: { label: 'CV for students guide', href: '/blog/cv-for-students-guide' },
  },
  'ats-friendly-resume': {
    emoji: '✅',
    headline: 'Is your resume ATS friendly? Check free',
    sub: 'Instant parsing score + fixes — 2 free checks, no email.',
    primary: { label: 'ATS Check Free →', href: '/ats-friendly-resume-checker' },
    secondary: { label: 'Full CV roast', href: '/' },
  },
  'internship-resume-guide': {
    emoji: '🔥',
    headline: 'Roast your internship resume free',
    sub: 'Built for students with no experience — Hinglish optional.',
    primary: { label: 'Free Roast →', href: '/' },
    secondary: { label: 'Resume builder', href: '/resume-builder' },
  },
  'fresher-resume-format': {
    emoji: '🔥',
    headline: 'Fresher CV roast — instant score',
    sub: 'See if your format passes campus ATS before you apply.',
    primary: { label: 'Roast Karo →', href: '/' },
    secondary: { label: 'Fresher template', href: '/resume-builder' },
  },
  'resume-roast-vs-resume-review': {
    emoji: '⚡',
    headline: 'Try a real roast — not a generic review',
    sub: 'Upload PDF: AI quotes YOUR weak bullets + Hinglish fixes in 30 sec.',
    primary: { label: 'Free Resume Roast →', href: '/' },
    secondary: { label: 'What is a roast?', href: '/blog/what-is-resume-roast' },
  },
  'free-cv-maker-online': {
    emoji: '📄',
    headline: 'Build + roast your CV free',
    sub: 'ATS resume builder + instant AI score — free PDF, no paywall.',
    primary: { label: 'Free Resume Builder →', href: '/resume-builder' },
    secondary: { label: 'Roast my CV', href: '/' },
  },
}

const BY_PREFIX: { match: (slug: string) => boolean; cta: BlogCtaConfig }[] = [
  {
    match: (s) => s.includes('compared') || s.includes('-vs-') || s.startsWith('best-'),
    cta: {
      emoji: '🔥',
      headline: 'Try the #1 pick for India — free resume roast',
      sub: 'Honest AI feedback, Hinglish optional, no signup on first roast.',
      primary: { label: 'Free AI Resume Review →', href: '/' },
      secondary: { label: 'Compare all tools', href: '/blog/ai-resume-review-tools-compared-india' },
    },
  },
  {
    match: (s) => s.includes('mock-interview') || s.includes('voice-mock') || s.includes('voice-interview') || s.includes('interview-ai'),
    cta: {
      emoji: '🎙️',
      headline: 'Practice mock interviews with AI voice',
      sub: 'Pro — speak or type answers. ElevenLabs interviewer reads your CV.',
      primary: { label: 'Try Mock Interview →', href: '/login?next=/dashboard/tools/mock-interview' },
      secondary: { label: 'View Pro plans', href: '/plans' },
    },
  },
  {
    match: (s) => s.includes('linkedin'),
    cta: {
      emoji: '💼',
      headline: 'Roast your LinkedIn profile free',
      sub: 'Same brutal honesty as CV roast — headline, About, experience.',
      primary: { label: 'LinkedIn Roast →', href: '/linkedin-roast' },
      secondary: { label: 'LinkedIn Writer tool', href: '/login?next=/dashboard/tools/linkedin' },
    },
  },
  {
    match: (s) => s.includes('resume-builder') || s.includes('ats-resume-builder'),
    cta: {
      emoji: '📄',
      headline: 'Build an ATS-friendly resume free',
      sub: 'Live score, guided sections, PDF export.',
      primary: { label: 'Open Resume Builder →', href: '/resume-builder' },
      secondary: { label: 'Roast your CV', href: '/' },
    },
  },
  {
    match: (s) => s.includes('mycvroast-ai-tools') || s.includes('tools-guide'),
    cta: {
      emoji: '🛠️',
      headline: 'Explore 29+ free career AI tools',
      sub: 'Sign in free — JD match, cover letters, interview prep, and more.',
      primary: { label: 'Create free account →', href: '/login' },
      secondary: { label: 'Compare plans', href: '/plans' },
    },
  },
  {
    match: (s) => s.endsWith('-tool') || s.includes('-analyser') || s.includes('detector'),
    cta: {
      emoji: '✨',
      headline: 'Use this tool on MyCVRoast',
      sub: 'Free account — paste your CV once, use every dashboard tool.',
      primary: { label: 'Sign in free →', href: '/login?next=/dashboard' },
      secondary: { label: 'Full tools guide', href: '/blog/mycvroast-ai-tools-guide' },
    },
  },
]

export function getPostCta(slug: string): BlogCtaConfig {
  if (BY_SLUG[slug]) return BY_SLUG[slug]
  for (const row of BY_PREFIX) {
    if (row.match(slug)) return row.cta
  }
  return DEFAULT
}

export function blogCategoryForSlug(slug: string): string {
  if (slug.includes('linkedin')) return 'LinkedIn'
  if (slug.includes('interview') || slug.includes('mock') || slug.includes('debrief')) return 'Interview'
  if (slug.includes('resume') || slug.includes('cv') || slug.includes('ats') || slug.includes('bullet')) return 'Resume & CV'
  if (slug.includes('cover-letter') || slug.includes('email') || slug.includes('follow-up') || slug.includes('referral') || slug.includes('cold-email')) return 'Emails & Apply'
  if (slug.includes('salary') || slug.includes('offer') || slug.includes('career-path') || slug.includes('90-days')) return 'Career & Offers'
  if (slug.includes('scam') || slug.includes('job') || slug.includes('remote') || slug.includes('freelance')) return 'Job Search'
  if (slug.endsWith('-tool') || slug.includes('mycvroast')) return 'MyCVRoast Tools'
  return 'Career Guides'
}
