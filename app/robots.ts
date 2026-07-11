import { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

/** Paths blocked from crawling. Do NOT list ADMIN_LOGIN_PATH here — robots.txt is public. */
const DISALLOW = [
  '/admin',
  '/dashboard',
  '/login',
  '/auth',
  '/api',
  '/roast',
]

/** Major AI crawlers — explicitly allowed on public pages (same disallow list as default). */
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'PerplexityBot',
  'CCBot',
  'Amazonbot',
  'Applebot',
  'Bytespider',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'cohere-ai',
  'YouBot',
  'Diffbot',
] as const

function crawlerRules(userAgent: string) {
  return { userAgent, allow: '/', disallow: DISALLOW }
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      crawlerRules('*'),
      crawlerRules('Googlebot'),
      crawlerRules('Bingbot'),
      ...AI_CRAWLERS.map((ua) => crawlerRules(ua)),
    ],
    sitemap: siteUrl('/sitemap.xml'),
    host: siteUrl('/'),
  }
}
