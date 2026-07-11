import type { ToolNavItem, ToolSlug } from '@/lib/tools/dashboard/config'
import { DASHBOARD_TOOLS } from '@/lib/tools/dashboard/config'
import { normalizeDashboardPathname } from '@/lib/dashboard/paths'

export type JourneyPhase = {
  id: string
  step: number
  title: string
  tagline: string
  emoji: string
  /** What the user is trying to accomplish */
  outcome: string
  primaryHref?: string
  primaryLabel?: string
  toolSlugs: ToolSlug[]
}

/** Job-hunt journey — maps what we sell to grouped tools (not a flat tool dump). */
export const DASHBOARD_JOURNEY: JourneyPhase[] = [
  {
    id: 'fix-cv',
    step: 1,
    title: 'Fix your CV',
    tagline: 'Roast → rewrite → ATS-ready',
    emoji: '🔥',
    outcome: 'Get honest feedback, fix bullets, export a resume recruiters actually read.',
    primaryHref: '/dashboard/roast',
    primaryLabel: 'Roast my CV',
    toolSlugs: ['cv-rewriter', 'skills-gap', 'gap-explainer', 'compress', 'bias-check'],
  },
  {
    id: 'apply',
    step: 2,
    title: 'Apply smarter',
    tagline: 'Match roles & reach people',
    emoji: '🎯',
    outcome: 'Tailor every application — JD match, cover letters, LinkedIn, cold outreach.',
    primaryHref: '/dashboard/tools/jd-match',
    primaryLabel: 'Match a job',
    toolSlugs: [
      'jd-match',
      'cover-letter',
      'cold-email',
      'referral',
      'linkedin',
      'linkedin-audit',
      'freelancer-profile',
    ],
  },
  {
    id: 'interview',
    step: 3,
    title: 'Interview ready',
    tagline: 'Practice before the real call',
    emoji: '🎙️',
    outcome: 'Mock interviews with voice, prep questions from your CV, debrief after.',
    primaryHref: '/dashboard/tools/mock-interview',
    primaryLabel: 'Mock interview',
    toolSlugs: ['interview-prep', 'mock-interview', 'voice-interview', 'debrief', 'elevator-pitch'],
  },
  {
    id: 'land',
    step: 4,
    title: 'Land the offer',
    tagline: 'Negotiate & decide',
    emoji: '🚀',
    outcome: 'Salary scripts, offer compare, company research, and your first 90 days.',
    primaryHref: '/dashboard/tools/salary',
    primaryLabel: 'Salary script',
    toolSlugs: [
      'salary',
      'offer-compare',
      'company-research',
      'career-path',
      'ninety-days',
      'rejection-analyser',
    ],
  },
  {
    id: 'follow-up',
    step: 5,
    title: 'Stay in the loop',
    tagline: 'Emails & safety checks',
    emoji: '✉️',
    outcome: 'Thank-you notes, follow-ups, rejection replies, and scam detection.',
    primaryHref: '/dashboard/tools/thank-you',
    primaryLabel: 'Thank-you email',
    toolSlugs: ['thank-you', 'follow-up', 'rejection', 'resignation', 'scam-detector'],
  },
]

export const CORE_PRODUCTS = [
  {
    id: 'roast',
    emoji: '🔥',
    title: 'CV Roast',
    pitch: 'Brutally honest AI feedback on your actual bullets — English or Hinglish.',
    href: '/dashboard/roast',
    cta: 'Roast now',
    accent: 'var(--dash-accent)',
  },
  {
    id: 'builder',
    emoji: '📄',
    title: 'ATS Resume Builder',
    pitch: 'Live ATS score, guided sections, PDF export — fix what the roast flagged.',
    href: '/dashboard/resume-builder',
    cta: 'Open builder',
    accent: 'var(--dash-green)',
  },
  {
    id: 'interview',
    emoji: '🎙️',
    title: 'Mock Interview',
    pitch: 'AI reads your CV, asks real questions — type or speak your answers.',
    href: '/dashboard/tools/mock-interview',
    cta: 'Start practice',
    accent: '#7c5cff',
  },
] as const

export function journeyTools(phase: JourneyPhase): ToolNavItem[] {
  return phase.toolSlugs
    .map((slug) => DASHBOARD_TOOLS.find((t) => t.slug === slug))
    .filter((t): t is ToolNavItem => Boolean(t))
}

export function journeyForPath(pathname: string): JourneyPhase | undefined {
  const path = normalizeDashboardPathname(pathname)
  return DASHBOARD_JOURNEY.find((phase) =>
    journeyTools(phase).some((t) => path.startsWith(t.href)),
  )
}

export function allJourneyToolHrefs(): string[] {
  return DASHBOARD_JOURNEY.flatMap((p) => journeyTools(p).map((t) => t.href))
}
