/** Canonical public site URL — always use www (matches Vercel production alias). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.mycvroast.in'
).replace(/\/$/, '')

export const HOME_DESCRIPTION =
  'Free resume roast & ATS checker for India — upload PDF, get instant AI score in Hinglish. 2 free roasts, no signup. Freshers, campus placement & job seekers.'

export const HOME_TITLE =
  'Free Resume Roast India — AI CV Checker (Instant Score)'

/** Google SERP title — keep under ~60 characters */
export function serpTitle(title: string, brand = 'MyCVRoast'): string {
  const suffix = ` | ${brand}`
  if (title.length + suffix.length <= 60) return `${title}${suffix}`
  const max = 60 - suffix.length - 1
  return `${title.slice(0, max).trim()}…${suffix}`
}

export function blogSerpTitle(post: { metaTitle?: string; title: string }): string {
  return serpTitle(post.metaTitle ?? post.title, 'MyCVRoast')
}

export const HOME_KEYWORDS =
  'roast my resume, resume roast, resume roast india, free resume checker, ai resume review free, is my resume ats friendly, hinglish resume roast, ats free resume, free resume maker india, ats resume builder, fresher resume format, cv for students, campus placement resume, mycvroast'

export const TWITTER_SITE = '@mycvroast'

export function siteUrl(path = ''): string {
  if (!path || path === '/') return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const NOINDEX_ROBOTS = { index: false, follow: false } as const

export const BRAND_ICON_URL = siteUrl('/brand/icon-512.png')

export const DEFAULT_OG_IMAGE = {
  url: siteUrl('/og-image.png'),
  width: 1200,
  height: 630,
  alt: 'MyCVRoast — AI Resume Roaster',
} as const

export const SITE_THEME_COLOR = '#eee9e3'
export const SITE_APPLICATION_NAME = 'MyCVRoast'
export const SITE_CATEGORY = 'BusinessApplication'
export const SITE_PUBLISHER = 'MyCVRoast'
export const SITE_AUTHORS = [{ name: 'MyCVRoast', url: SITE_URL }] as const

/** AI / LLM discoverability — linked from root layout */
export const LLMS_TXT_URL = siteUrl('/llms.txt')
export const LLMS_FULL_TXT_URL = siteUrl('/llms-full.txt')

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  type = 'website',
}: {
  title: string
  description: string
  path: string
  keywords?: string
  type?: 'website' | 'article'
}) {
  const url = siteUrl(path)
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    authors: [...SITE_AUTHORS],
    creator: TWITTER_SITE,
    publisher: SITE_PUBLISHER,
    category: SITE_CATEGORY,
    applicationName: SITE_APPLICATION_NAME,
    openGraph: {
      title,
      description,
      url,
      siteName: 'MyCVRoast',
      locale: 'en_IN',
      type,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image' as const,
      site: TWITTER_SITE,
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    other: {
      'ai-content-declaration': 'human-authored, ai-assisted-analysis',
      'llms-txt': LLMS_TXT_URL,
    },
  }
}
