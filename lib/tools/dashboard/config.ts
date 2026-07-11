export type ToolSlug =
  | 'jd-match'
  | 'linkedin'
  | 'cover-letter'
  | 'interview-prep'
  | 'cold-email'
  | 'skills-gap'
  | 'gap-explainer'
  | 'salary'
  | 'mock-interview'
  | 'cv-rewriter'
  | 'cv-localise'
  | 'thank-you'
  | 'follow-up'
  | 'rejection'
  | 'elevator-pitch'
  | 'referral'
  | 'career-path'
  | 'linkedin-audit'
  | 'rejection-analyser'
  | 'compress'
  | 'voice-interview'
  | 'debrief'
  | 'bias-check'
  | 'company-research'
  | 'offer-compare'
  | 'ninety-days'
  | 'scam-detector'
  | 'resignation'
  | 'freelancer-profile'

export type ToolAccess = {
  proOnly: boolean
  freeLimit: number
  daily: boolean
  /** Free users have no usage cap */
  unlimited?: boolean
}

export type ToolNavItem = {
  slug: ToolSlug
  label: string
  href: string
  icon: string
  access: ToolAccess
}

export const TOOL_ACCESS: Record<ToolSlug, ToolAccess> = {
  'jd-match': { proOnly: false, freeLimit: 2, daily: false },
  linkedin: { proOnly: false, freeLimit: 2, daily: true },
  'cover-letter': { proOnly: false, freeLimit: 1, daily: false },
  'interview-prep': { proOnly: true, freeLimit: 0, daily: false },
  'cold-email': { proOnly: true, freeLimit: 0, daily: false },
  'skills-gap': { proOnly: false, freeLimit: 3, daily: true },
  'gap-explainer': { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  salary: { proOnly: true, freeLimit: 0, daily: false },
  'mock-interview': { proOnly: true, freeLimit: 0, daily: false },
  'cv-rewriter': { proOnly: false, freeLimit: 5, daily: true },
  'cv-localise': { proOnly: true, freeLimit: 0, daily: false },
  'thank-you': { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  'follow-up': { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  rejection: { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  'elevator-pitch': { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  referral: { proOnly: true, freeLimit: 0, daily: false },
  'career-path': { proOnly: true, freeLimit: 0, daily: false },
  'linkedin-audit': { proOnly: true, freeLimit: 0, daily: false },
  'rejection-analyser': { proOnly: true, freeLimit: 0, daily: false },
  compress: { proOnly: true, freeLimit: 0, daily: false },
  'voice-interview': { proOnly: true, freeLimit: 0, daily: false },
  debrief: { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  'bias-check': { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  'company-research': { proOnly: true, freeLimit: 0, daily: false },
  'offer-compare': { proOnly: true, freeLimit: 0, daily: false },
  'ninety-days': { proOnly: true, freeLimit: 0, daily: false },
  'scam-detector': { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  resignation: { proOnly: false, freeLimit: 999, daily: false, unlimited: true },
  'freelancer-profile': { proOnly: false, freeLimit: 2, daily: true },
}

export const DASHBOARD_TOOLS: ToolNavItem[] = [
  { slug: 'skills-gap', label: 'Skills Gap', href: '/dashboard/tools/skills-gap', icon: '🔍', access: TOOL_ACCESS['skills-gap'] },
  { slug: 'gap-explainer', label: 'Gap Explainer', href: '/dashboard/tools/gap-explainer', icon: '⏸️', access: TOOL_ACCESS['gap-explainer'] },
  { slug: 'linkedin', label: 'LinkedIn Writer', href: '/dashboard/tools/linkedin', icon: '💼', access: TOOL_ACCESS.linkedin },
  { slug: 'jd-match', label: 'Job Match', href: '/dashboard/tools/jd-match', icon: '🎯', access: TOOL_ACCESS['jd-match'] },
  { slug: 'cv-rewriter', label: 'Bullet Rewriter', href: '/dashboard/tools/cv-rewriter', icon: '✨', access: TOOL_ACCESS['cv-rewriter'] },
  { slug: 'cover-letter', label: 'Cover Letter', href: '/dashboard/tools/cover-letter', icon: '📝', access: TOOL_ACCESS['cover-letter'] },
  { slug: 'cold-email', label: 'Cold Email', href: '/dashboard/tools/cold-email', icon: '📧', access: TOOL_ACCESS['cold-email'] },
  { slug: 'salary', label: 'Salary Script', href: '/dashboard/tools/salary', icon: '💰', access: TOOL_ACCESS.salary },
  { slug: 'interview-prep', label: 'Interview Prep', href: '/dashboard/tools/interview-prep', icon: '🎤', access: TOOL_ACCESS['interview-prep'] },
  { slug: 'mock-interview', label: 'Mock Interview', href: '/dashboard/tools/mock-interview', icon: '🎙️', access: TOOL_ACCESS['mock-interview'] },
  { slug: 'thank-you', label: 'Thank You Email', href: '/dashboard/tools/thank-you', icon: '✉️', access: TOOL_ACCESS['thank-you'] },
  { slug: 'follow-up', label: 'Follow-Up', href: '/dashboard/tools/follow-up', icon: '📬', access: TOOL_ACCESS['follow-up'] },
  { slug: 'rejection', label: 'Rejection Reply', href: '/dashboard/tools/rejection', icon: '💌', access: TOOL_ACCESS.rejection },
  { slug: 'elevator-pitch', label: 'Elevator Pitch', href: '/dashboard/tools/elevator-pitch', icon: '🎤', access: TOOL_ACCESS['elevator-pitch'] },
  { slug: 'referral', label: 'Referral Ask', href: '/dashboard/tools/referral', icon: '🤝', access: TOOL_ACCESS.referral },
  { slug: 'career-path', label: 'Career Paths', href: '/dashboard/tools/career-path', icon: '🗺️', access: TOOL_ACCESS['career-path'] },
  { slug: 'linkedin-audit', label: 'LinkedIn Audit', href: '/dashboard/tools/linkedin-audit', icon: '🔍', access: TOOL_ACCESS['linkedin-audit'] },
  { slug: 'cv-localise', label: 'CV Localiser', href: '/dashboard/tools/cv-localise', icon: '🌍', access: TOOL_ACCESS['cv-localise'] },
  { slug: 'compress', label: '1-Page Compressor', href: '/dashboard/tools/compress', icon: '✂️', access: TOOL_ACCESS.compress },
  { slug: 'bias-check', label: 'Bias Detector', href: '/dashboard/tools/bias-check', icon: '🕵️', access: TOOL_ACCESS['bias-check'] },
  { slug: 'rejection-analyser', label: 'Rejection Analyser', href: '/dashboard/tools/rejection-analyser', icon: '🔎', access: TOOL_ACCESS['rejection-analyser'] },
  { slug: 'scam-detector', label: 'Job Scam Detector', href: '/dashboard/tools/scam-detector', icon: '🚨', access: TOOL_ACCESS['scam-detector'] },
  { slug: 'voice-interview', label: 'Voice Interview', href: '/dashboard/tools/voice-interview', icon: '🎙️', access: TOOL_ACCESS['voice-interview'] },
  { slug: 'debrief', label: 'Interview Debrief', href: '/dashboard/tools/debrief', icon: '🎭', access: TOOL_ACCESS.debrief },
  { slug: 'company-research', label: 'Company Research', href: '/dashboard/tools/company-research', icon: '🔍', access: TOOL_ACCESS['company-research'] },
  { slug: 'offer-compare', label: 'Offer Comparator', href: '/dashboard/tools/offer-compare', icon: '⚖️', access: TOOL_ACCESS['offer-compare'] },
  { slug: 'ninety-days', label: 'First 90 Days', href: '/dashboard/tools/ninety-days', icon: '🚀', access: TOOL_ACCESS['ninety-days'] },
  { slug: 'resignation', label: 'Resignation Letter', href: '/dashboard/tools/resignation', icon: '✍️', access: TOOL_ACCESS.resignation },
  { slug: 'freelancer-profile', label: 'Freelancer Profile', href: '/dashboard/tools/freelancer-profile', icon: '💼', access: TOOL_ACCESS['freelancer-profile'] },
]

export const HAIKU_MODEL = 'claude-haiku-4-5-20251001'
export const SONNET_MODEL = process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-6'

export function toolMeta(slug: ToolSlug) {
  return DASHBOARD_TOOLS.find((t) => t.slug === slug)!
}

/** Short label for marketing — Free tier vs Pro. */
export function toolAccessFreeLabel(access: ToolAccess): string {
  if (access.proOnly) return 'Pro only'
  if (access.unlimited) return 'Free — unlimited'
  const unit = access.daily ? ' per day' : ' total'
  return `${access.freeLimit} free${unit}`
}

export function toolAccessProLabel(): string {
  return 'Unlimited'
}

export type ToolCategory = {
  id: string
  title: string
  emoji: string
  slugs: ToolSlug[]
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'linkedin',
    title: 'LinkedIn',
    emoji: '💼',
    slugs: ['linkedin', 'linkedin-audit'],
  },
  {
    id: 'apply',
    title: 'Apply & match',
    emoji: '🎯',
    slugs: ['jd-match', 'cover-letter', 'cold-email', 'referral'],
  },
  {
    id: 'interview',
    title: 'Interview',
    emoji: '🎙️',
    slugs: ['interview-prep', 'mock-interview', 'voice-interview', 'debrief'],
  },
  {
    id: 'cv',
    title: 'CV & bullets',
    emoji: '✨',
    slugs: ['cv-rewriter', 'cv-localise', 'compress', 'skills-gap', 'gap-explainer'],
  },
  {
    id: 'career',
    title: 'Career & offers',
    emoji: '🗺️',
    slugs: ['career-path', 'salary', 'offer-compare', 'ninety-days', 'company-research'],
  },
  {
    id: 'emails',
    title: 'Emails & replies',
    emoji: '✉️',
    slugs: ['thank-you', 'follow-up', 'rejection', 'rejection-analyser', 'resignation'],
  },
  {
    id: 'extras',
    title: 'More tools',
    emoji: '🛡️',
    slugs: ['elevator-pitch', 'bias-check', 'scam-detector', 'freelancer-profile'],
  },
]

export const PRO_TOOL_COUNT = DASHBOARD_TOOLS.filter((t) => t.access.proOnly).length
export const FREE_TOOL_COUNT = DASHBOARD_TOOLS.filter((t) => !t.access.proOnly).length
