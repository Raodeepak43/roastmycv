export {
  DASHBOARD_TOOLS,
  FREE_TOOL_COUNT,
  PRO_TOOL_COUNT,
} from '@/lib/tools/dashboard/config'
import {
  DASHBOARD_TOOLS,
  FREE_TOOL_COUNT,
  PRO_TOOL_COUNT,
  TOOL_CATEGORIES,
  toolAccessFreeLabel,
  toolAccessProLabel,
  type ToolSlug,
} from '@/lib/tools/dashboard/config'
import {
  USER_FREE_RESUME_AI,
  USER_FREE_RESUME_PDF,
  USER_FREE_ROASTS,
} from '@/lib/dashboard/constants'
import { FREE_LIMIT } from '@/lib/usage'

export const PRO_PRICE_INR = 149
/** Approximate USD equivalent for international visitors */
export const PRO_PRICE_USD = 1.8

export function formatProPrice(inr = PRO_PRICE_INR): string {
  return `₹${inr}`
}

/** USD hint for international visitors — avoid "~" (reads like a minus in Syne) */
export function formatProUsdNote(usd = PRO_PRICE_USD): string {
  return `approx. $${usd.toFixed(2)} USD`
}

export const GUEST_FREE_ROASTS = FREE_LIMIT
export const GUEST_FREE_RESUME_PDF = 1

export type PlanTier = {
  id: 'guest' | 'free' | 'pro'
  name: string
  emoji: string
  price: string
  priceNote: string
  badge?: string
  features: string[]
  cta: { label: string; href: string }
  highlighted?: boolean
  disabled?: boolean
  disabledNote?: string
}

const PRO_TOOL_HIGHLIGHTS = [
  'Mock Interview (voice + text, ElevenLabs)',
  'Voice Interview (speak your answers)',
  'Interview Prep & Debrief',
  'LinkedIn Audit & post writer',
  'Salary negotiation script',
  'Cold email & referral ask',
  'CV Localiser & 1-page compressor',
  'Company research & offer compare',
  'Career path planner & first 90 days',
  'Rejection analyser',
] as const

export const PUBLIC_PLANS: PlanTier[] = [
  {
    id: 'guest',
    name: 'Free',
    emoji: '⚡',
    price: '₹0',
    priceNote: 'forever',
    badge: 'Start here',
    highlighted: true,
    features: [
      `${GUEST_FREE_ROASTS} CV roasts per device — no signup`,
      `${GUEST_FREE_RESUME_PDF} free resume PDF on builder (guest)`,
      'LinkedIn Roast on homepage — try before signup',
      '15 roast languages & 3 intensity levels',
      'Instant AI feedback — nothing stored until you sign in',
      `Free account → ${USER_FREE_ROASTS} roasts, saved history, dashboard`,
      `${FREE_TOOL_COUNT}+ career tools with free limits (see below)`,
      `${USER_FREE_RESUME_PDF} PDF exports & ${USER_FREE_RESUME_AI} AI bullet fixes (account)`,
    ],
    cta: { label: '🔥 Roast Free', href: '/' },
  },
  {
    id: 'pro',
    name: 'Pro',
    emoji: '👑',
    price: formatProPrice(),
    priceNote: `one-time · ${formatProUsdNote()}`,
    features: [
      'Unlimited CV roasts & roast history',
      'Unlimited resume PDF downloads',
      'Unlimited AI bullet improvements',
      `All ${DASHBOARD_TOOLS.length} dashboard career tools — unlimited`,
      ...PRO_TOOL_HIGHLIGHTS.slice(0, 6),
      `+ ${PRO_TOOL_COUNT} Pro-only tools unlocked`,
      'Job application tracker on dashboard',
      'Priority support',
    ],
    cta: { label: 'Get Pro', href: '/login?next=/dashboard/plans' },
    disabled: false,
  },
]

export const DASHBOARD_FREE_FEATURES = [
  `${USER_FREE_ROASTS} CV roasts per account`,
  `${USER_FREE_RESUME_PDF} resume PDF exports`,
  `${USER_FREE_RESUME_AI} AI bullet improvements`,
  'Roast history saved to your account',
  `${FREE_TOOL_COUNT} tools with free limits (unlimited on many)`,
  '15 roast languages',
]

export const DASHBOARD_PRO_FEATURES = PUBLIC_PLANS.find((p) => p.id === 'pro')!.features

export type ProductOffering = {
  emoji: string
  title: string
  description: string
  freeLabel: string
  proLabel: string
  href?: string
  landingHref?: string
}

/** Core platform products — homepage & plans */
export const PRODUCT_OFFERINGS: ProductOffering[] = [
  {
    emoji: '🔥',
    title: 'CV Roast',
    description:
      'Upload PDF/TXT and get brutally honest AI feedback. Pick language (Hinglish, English + 13 more) and roast intensity.',
    freeLabel: `${GUEST_FREE_ROASTS}/device guest · ${USER_FREE_ROASTS}/account`,
    proLabel: 'Unlimited roasts',
    href: '/',
  },
  {
    emoji: '📄',
    title: 'ATS Resume Builder',
    description:
      'Guided editor with live ATS score, sections for freshers & pros, and one-click PDF export.',
    freeLabel: `${GUEST_FREE_RESUME_PDF} PDF guest · ${USER_FREE_RESUME_PDF} with account`,
    proLabel: 'Unlimited PDF exports',
    href: '/resume-builder',
  },
  {
    emoji: '💼',
    title: 'LinkedIn Roast',
    description:
      'Paste your LinkedIn About / headline — get the same savage roast treatment as your CV.',
    freeLabel: 'Free on site (usage limits apply)',
    proLabel: 'Unlimited',
    href: '/linkedin-roast',
  },
  {
    emoji: '✨',
    title: 'AI Bullet Fixes',
    description:
      'Turn weak bullets into quantified, recruiter-ready lines inside the resume builder.',
    freeLabel: `${USER_FREE_RESUME_AI} with free account`,
    proLabel: 'Unlimited AI improvements',
    href: '/resume-builder',
  },
  {
    emoji: '🎙️',
    title: 'Mock Interview',
    description:
      'AI interviewer reads your CV, asks real questions, speaks with ElevenLabs voice. Type or speak your answers.',
    freeLabel: 'Pro only',
    proLabel: 'Unlimited mock interviews',
    href: '/login?next=/dashboard/tools/mock-interview',
    landingHref: '/career-tools/mock-interview',
  },
  {
    emoji: '🗣️',
    title: 'Voice Interview',
    description:
      'Speak your answers out loud — live transcription, filler detection, and delivery feedback after each question.',
    freeLabel: 'Pro only',
    proLabel: 'Unlimited voice sessions',
    href: '/login?next=/dashboard/tools/voice-interview',
    landingHref: '/career-tools/voice-interview',
  },
  {
    emoji: '📚',
    title: 'Roast History & Tracker',
    description:
      'Signed-in users save roasts and track job applications from the dashboard.',
    freeLabel: 'Saved history with free account',
    proLabel: 'Unlimited history + full tracker',
    href: '/login?next=/dashboard',
  },
  {
    emoji: '🛠️',
    title: `${DASHBOARD_TOOLS.length} Career AI Tools`,
    description:
      'Cover letters, JD match, LinkedIn writer, salary script, cold email, skills gap, scam detector, and more — in your dashboard.',
    freeLabel: `${FREE_TOOL_COUNT} tools free (limits) · ${PRO_TOOL_COUNT} Pro-only`,
    proLabel: 'Every tool, unlimited',
    href: '/login?next=/dashboard',
    landingHref: '/career-tools',
  },
  {
    emoji: '🌐',
    title: '15 Roast Languages',
    description: 'Roast in English, Hinglish, and 13 more — same honest feedback everywhere.',
    freeLabel: 'All languages',
    proLabel: 'All languages',
  },
  {
    emoji: '📤',
    title: 'Share Results',
    description: 'Copy roast text or share a link — post your pain on social.',
    freeLabel: 'Included',
    proLabel: 'Included',
  },
]

export type CatalogTool = {
  slug: ToolSlug
  label: string
  href: string
  icon: string
  freeLabel: string
  proLabel: string
}

export type ToolCategoryCatalog = {
  id: string
  title: string
  emoji: string
  tools: CatalogTool[]
}

/** Full dashboard tool list grouped — for plans & homepage */
export function buildToolCategoryCatalog(): ToolCategoryCatalog[] {
  return TOOL_CATEGORIES.map((cat) => ({
    id: cat.id,
    title: cat.title,
    emoji: cat.emoji,
    tools: cat.slugs.map((slug) => {
      const t = DASHBOARD_TOOLS.find((d) => d.slug === slug)!
      return {
        slug,
        label: t.label,
        href: t.href,
        icon: t.icon,
        freeLabel: toolAccessFreeLabel(t.access),
        proLabel: toolAccessProLabel(),
      }
    }),
  }))
}

export const TOOL_CATEGORY_CATALOG = buildToolCategoryCatalog()
