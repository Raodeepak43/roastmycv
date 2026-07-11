import { getAllPosts, getPostLastModified } from '@/lib/blog'
import { GSC_INDEXING_PRIORITY_SLUGS } from '@/lib/blog/gsc-indexing'
import { getAllSeoSitemapEntries } from '@/lib/seo-pages/registry'
import { getAllCareerToolSlugs } from '@/lib/tools/marketing/config'
import { getAllToolSlugs } from '@/lib/tools'
import { BRAND_ICON_URL, DEFAULT_OG_IMAGE, siteUrl } from '@/lib/seo'
import type { ImageSitemapEntry, VideoSitemapEntry } from '@/lib/sitemap/xml'
import type { SitemapEntry } from '@/lib/sitemap/xml'

const HIGH_PRIORITY_BLOG = new Set([
  'fresher-resume-format',
  'why-resume-rejected',
  'ats-friendly-resume',
  'free-resume-checker-india',
  'what-is-resume-roast',
  'cv-for-students-guide',
  'best-free-ai-resume-review-india-2026',
  'mycvroast-vs-jobscan-vs-resume-worded',
  'ai-resume-review-tools-compared-india',
  'best-mock-interview-ai-india-2026',
  'what-is-resume-roast',
  'cv-kaise-banaye',
  'achha-resume-kaise-banaye',
  'ats-resume-builder-free',
  'ats-free-resume-checker-india',
  'zety-resume-builder-vs-mycvroast-india',
  'biodata-maker-for-job-india',
  'help-making-a-resume-for-free-india',
  'indian-resume-builder-online-free',
  'free-downloadable-resume-builder',
  'free-resume-builder-india',
  'resume-maker-for-freshers-india',
  'simple-resume-format',
])

function blogLastModified(slug: string, fallbackDate: string): Date {
  return getPostLastModified(slug, fallbackDate)
}

export function getCoreSitemapEntries(): SitemapEntry[] {
  const now = new Date()
  return [
    { url: siteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: siteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: siteUrl('/how-it-works'), lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: siteUrl('/methodology'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: siteUrl('/faq'), lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: siteUrl('/why-trust-us'), lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: siteUrl('/support'), lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: siteUrl('/linkedin-roast'), lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: siteUrl('/resume-builder'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: siteUrl('/blog'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: siteUrl('/guides'), lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: siteUrl('/plans'), lastModified: now, changeFrequency: 'weekly', priority: 0.92 },
    { url: siteUrl('/career-tools'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: siteUrl('/career-tools/jobs'), lastModified: now, changeFrequency: 'daily', priority: 0.88 },
    { url: siteUrl('/contact'), lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: siteUrl('/privacy'), lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: siteUrl('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: siteUrl('/llms.txt'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: siteUrl('/llms-full.txt'), lastModified: now, changeFrequency: 'weekly', priority: 0.65 },
    { url: siteUrl('/blog/rss.xml'), lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: siteUrl('/tools/resume-roast-in-hinglish'), lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: siteUrl('/tools/free-resume-roast-india'), lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
  ]
}

export function getBlogSitemapEntries(): SitemapEntry[] {
  return getAllPosts().map((post) => ({
    url: siteUrl(`/blog/${post.slug}`),
    lastModified: blogLastModified(post.slug, post.date),
    changeFrequency: 'monthly' as const,
    priority: HIGH_PRIORITY_BLOG.has(post.slug) || GSC_INDEXING_PRIORITY_SLUGS.has(post.slug) ? 0.9 : 0.7,
  }))
}

export function getToolsSitemapEntries(): SitemapEntry[] {
  const now = new Date()
  return getAllToolSlugs().map((slug) => ({
    url: siteUrl(`/tools/${slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))
}

export function getCareerToolsSitemapEntries(): SitemapEntry[] {
  const now = new Date()
  const hub: SitemapEntry = {
    url: siteUrl('/career-tools'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }
  const tools = getAllCareerToolSlugs().map((slug) => ({
    url: siteUrl(`/career-tools/${slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  return [hub, ...tools]
}

export function getSeoLandingSitemapEntries(): SitemapEntry[] {
  return getAllSeoSitemapEntries().map((entry) => ({
    url: siteUrl(entry.url),
    lastModified: entry.lastModified,
    changeFrequency: 'monthly' as const,
    priority: entry.priority,
  }))
}

/** Sitemap index — submit only /sitemap.xml in Search Console. */
export function getSitemapIndexEntries(): { loc: string; lastmod: Date }[] {
  const now = new Date()
  const blogPosts = getAllPosts()
  const blogLast =
    blogPosts.length > 0
      ? blogPosts.reduce((latest, post) => {
          const m = blogLastModified(post.slug, post.date)
          return m > latest ? m : latest
        }, new Date(0))
      : now

  return [
    { loc: siteUrl('/sitemap-core.xml'), lastmod: now },
    { loc: siteUrl('/sitemap-blog.xml'), lastmod: blogLast },
    { loc: siteUrl('/sitemap-tools.xml'), lastmod: now },
    { loc: siteUrl('/sitemap-seo.xml'), lastmod: now },
    { loc: siteUrl('/sitemap-career-tools.xml'), lastmod: now },
    { loc: siteUrl('/sitemap-images.xml'), lastmod: now },
    { loc: siteUrl('/sitemap-videos.xml'), lastmod: now },
  ]
}

/** Image sitemap — brand assets + OG image on key landing pages */
export function getImageSitemapEntries(): ImageSitemapEntry[] {
  const now = new Date()
  const brandImages = [
    { loc: DEFAULT_OG_IMAGE.url, title: 'MyCVRoast OG image', caption: DEFAULT_OG_IMAGE.alt },
    { loc: BRAND_ICON_URL, title: 'MyCVRoast logo', caption: 'MyCVRoast brand icon 512px' },
  ]
  const keyPages = ['/', '/about', '/resume-builder', '/linkedin-roast', '/plans', '/blog']
  return keyPages.map((path) => ({
    pageUrl: siteUrl(path),
    images: brandImages,
    lastModified: now,
  }))
}

/** Video sitemap — empty until hosted product videos exist */
export function getVideoSitemapEntries(): VideoSitemapEntry[] {
  return []
}
