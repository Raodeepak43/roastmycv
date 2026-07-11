import { getAllPosts } from '@/lib/blog'
import {
  GSC_CRAWLED_NOT_INDEXED_BLOG_SLUGS,
  GSC_DISCOVERED_BLOG_SLUGS,
} from '@/lib/blog/gsc-indexing'

/** Posts Google knows about but has not indexed — surface on /blog for crawl paths. */
export function getIndexingBoostPosts() {
  const slugs = new Set<string>([
    ...GSC_DISCOVERED_BLOG_SLUGS,
    ...GSC_CRAWLED_NOT_INDEXED_BLOG_SLUGS,
  ])
  const bySlug = new Map(getAllPosts().map((p) => [p.slug, p]))
  return Array.from(slugs)
    .map((slug) => bySlug.get(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
}
