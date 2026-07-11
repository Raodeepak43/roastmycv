import { getAllPosts } from '@/lib/blog'
import { GSC_INDEXING_PRIORITY_SLUGS } from '@/lib/blog/gsc-indexing'
import { blogCategoryForSlug } from '@/lib/blog/post-cta'
import type { PostMeta } from '@/lib/blog'

const FALLBACK_LINKS = [
  { label: 'Fresher resume format (India)', href: '/blog/fresher-resume-format' },
  { label: 'Is my resume ATS friendly?', href: '/blog/ats-friendly-resume' },
  { label: 'Free resume checker', href: '/best-resume-checker-india' },
  { label: 'Roast my resume — what is it?', href: '/blog/what-is-resume-roast' },
  { label: 'Why recruiters reject your CV', href: '/blog/why-resume-rejected' },
  { label: 'CV for students guide', href: '/blog/cv-for-students-guide' },
  { label: 'ATS resume builder guide', href: '/blog/ats-resume-builder-free' },
  { label: 'Free downloadable resume', href: '/blog/free-downloadable-resume-builder' },
  { label: 'Free resume help India', href: '/blog/help-making-a-resume-for-free-india' },
  { label: 'Indian resume builder guide', href: '/blog/indian-resume-builder-online-free' },
]

function rotateBySlug<T>(items: T[], slug: string): T[] {
  if (items.length < 2) return items
  let offset = 0
  for (let i = 0; i < slug.length; i++) offset = (offset + slug.charCodeAt(i) * (i + 1)) % items.length
  return [...items.slice(offset), ...items.slice(0, offset)]
}

export function getRelatedPosts(slug: string, limit = 4): { label: string; href: string }[] {
  const category = blogCategoryForSlug(slug)
  const posts = getAllPosts().filter((p) => p.slug !== slug)

  const sameCategory = posts.filter((p) => blogCategoryForSlug(p.slug) === category)
  const otherCategory = posts.filter((p) => blogCategoryForSlug(p.slug) !== category)
  const pool: PostMeta[] = rotateBySlug(
    sameCategory.length >= limit ? sameCategory : [...sameCategory, ...otherCategory],
    slug,
  )

  const picked = pool.slice(0, limit).map((p) => ({
    label: p.title,
    href: `/blog/${p.slug}`,
  }))

  const seen = new Set([slug, ...picked.map((p) => p.href)])

  // Surface GSC unindexed guides from indexed pages — helps crawl discovery.
  const indexingBoost = posts
    .filter((p) => GSC_INDEXING_PRIORITY_SLUGS.has(p.slug) && p.slug !== slug)
    .slice(0, 2)
    .map((p) => ({ label: p.title, href: `/blog/${p.slug}` }))
  for (const link of rotateBySlug(indexingBoost, slug)) {
    if (picked.length >= limit) break
    if (seen.has(link.href)) continue
    picked.push(link)
    seen.add(link.href)
  }

  if (picked.length >= limit) return picked

  for (const link of FALLBACK_LINKS) {
    if (picked.length >= limit) break
    if (seen.has(link.href)) continue
    picked.push(link)
    seen.add(link.href)
  }

  return picked
}
