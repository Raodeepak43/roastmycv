import type { Metadata } from 'next'
import { getAllPosts, formatBlogDate, isToolPost } from '@/lib/blog'
import { getIndexingBoostPosts } from '@/lib/blog/indexing-boost'
import { BLOG_FEATURED_SLUGS, blogCategoryForSlug } from '@/lib/blog/post-cta'
import { itemListJsonLd } from '@/lib/schema'
import { siteUrl } from '@/lib/seo'
import { BlogFooter, BlogHeader } from '@/components/BlogChrome'
import { BlogFeaturedBanner } from '@/components/BlogFeaturedBanner'
import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'

export const metadata: Metadata = pageMetadata({
  title: 'MyCVRoast Blog — Resume Tips, Comparisons & Career Guides',
  description:
    'SEO guides for Indian job seekers — AI resume review comparisons, ATS tips, fresher formats, mock interview prep, and honest career advice from MyCVRoast.',
  path: '/blog',
  keywords:
    'ai resume review tools compared, resume roast india, ats resume checker free, hinglish resume roast, campus placement resume',
})

const GUIDE_CATEGORY_ORDER = [
  'Resume & CV',
  'Interview',
  'LinkedIn',
  'Job Search',
  'Emails & Apply',
  'Career & Offers',
  'Career Guides',
  'MyCVRoast Tools',
] as const

function typeLabel(type?: string) {
  if (type === 'comparison') return 'Comparison'
  if (type === 'tool') return 'Product Guide'
  return 'Guide'
}

function PostCard({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  const category = blogCategoryForSlug(post.slug)
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="blog-post-card card-ui block overflow-hidden group"
    >
      <BlogFeaturedBanner
        title={post.title}
        slug={post.slug}
        compact
        showTitle
        label={typeLabel(post.type)}
        className="rounded-none border-0"
      />
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-body text-[10px] uppercase tracking-wider text-text-dark/80 bg-bg-beige border border-border rounded-full px-2.5 py-0.5">
            {category}
          </span>
          <time className="font-body text-[11px] text-muted uppercase tracking-wider">
            {formatBlogDate(post.date)}
          </time>
          {post.readingMinutes && (
            <span className="font-body text-[11px] text-muted">{post.readingMinutes} min read</span>
          )}
        </div>
        {/* Visually hidden for a11y — title is shown in the cover banner */}
        <h2 className="sr-only">{post.title}</h2>
        <p className="font-body text-[13px] text-muted leading-relaxed line-clamp-2">{post.description}</p>
        <span className="font-body text-[12px] font-medium text-orange mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          Read article →
        </span>
      </div>
    </Link>
  )
}

export default function BlogIndexPage() {
  const posts = getAllPosts()
  const indexingBoost = getIndexingBoostPosts()
  const featuredSet = new Set<string>(BLOG_FEATURED_SLUGS)
  const featured = BLOG_FEATURED_SLUGS.map((slug) => posts.find((p) => p.slug === slug)).filter(Boolean) as typeof posts

  const seoGuides = posts.filter((p) => !featuredSet.has(p.slug) && !isToolPost(p.slug))
  const toolGuides = posts.filter((p) => !featuredSet.has(p.slug) && isToolPost(p.slug))

  const guidesByCategory = new Map<string, typeof posts>()
  for (const post of seoGuides) {
    const cat = blogCategoryForSlug(post.slug)
    const list = guidesByCategory.get(cat) ?? []
    list.push(post)
    guidesByCategory.set(cat, list)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-beige">
      <BlogHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListJsonLd(
              posts.map((p) => ({
                name: p.title,
                url: siteUrl(`/blog/${p.slug}`),
              })),
            ),
          ),
        }}
      />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-10 w-full">
        <h1 className="font-display text-3xl md:text-4xl text-text-dark mb-2">
          Resume &amp; Career Guides for India
        </h1>
        <p className="font-body text-sm text-muted mb-8 leading-relaxed">
          Keyword-focused comparisons, ATS guides, and fresher advice — plus product docs for every MyCVRoast tool.
          Start with a comparison if you are choosing an AI resume checker.
        </p>

        <div
          className="elevate-cta-panel rounded-[2rem] border-2 border-orange p-6 md:p-8 mb-10"
        >
          <p className="font-body text-[10px] uppercase tracking-widest text-orange mb-2">Most searched</p>
          <p className="font-display text-xl md:text-2xl text-text-dark mb-2">
            AI Resume Review Tools Compared — India 2026
          </p>
          <p className="font-body text-sm text-muted mb-5 leading-relaxed">
            MyCVRoast vs Jobscan vs Resume Worded — free tiers, Hinglish support, and which tool for each job-hunt stage.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog/ai-resume-review-tools-compared-india"
              className="btn-roast inline-block px-8 py-3 text-base"
            >
              Read comparison →
            </Link>
            <Link href="/" className="font-body text-sm text-orange hover:text-brand-orange border border-orange/40 rounded-full px-6 py-3 transition-colors">
              Free roast now
            </Link>
          </div>
        </div>

        {indexingBoost.length > 0 && (
          <section className="mb-12" aria-label="Popular career guides">
            <h2 className="font-display text-xl text-text-dark mb-1">Popular career guides</h2>
            <p className="font-body text-sm text-muted mb-4">
              Fresher formats, ATS tips, role guides, and job-search advice for India — updated for 2026.
            </p>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {indexingBoost.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-body text-sm text-orange hover:text-brand-orange transition-colors"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {featured.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-xl text-text-dark mb-1">Featured guides</h2>
            <p className="font-body text-sm text-muted mb-4">Comparisons and pillar posts — built for Google &amp; AI search.</p>
            <div className="space-y-4">
              {featured.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {GUIDE_CATEGORY_ORDER.map((category) => {
          const categoryPosts = guidesByCategory.get(category)
          if (!categoryPosts?.length) return null
          return (
            <section key={category} className="mb-12">
              <h2 className="font-display text-xl text-text-dark mb-4">{category}</h2>
              <div className="space-y-4">
                {categoryPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )
        })}

        {toolGuides.length > 0 && (
          <section className="mb-12 pt-4 border-t border-border">
            <h2 className="font-display text-xl text-text-dark mb-1">MyCVRoast product guides</h2>
            <p className="font-body text-sm text-muted mb-4">
              How to use each dashboard tool — JD match, mock interview, cover letters, and more.{' '}
              <Link href="/blog/mycvroast-ai-tools-guide" className="text-orange hover:underline">
                Full tools hub →
              </Link>
            </p>
            <div className="space-y-4">
              {toolGuides.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            <p className="font-body text-sm text-muted mt-4">
              Browse every page on the site in our{' '}
              <Link href="/guides" className="text-orange hover:underline">
                complete site map
              </Link>
              .
            </p>
          </section>
        )}

        <div className="mt-8 text-center rounded-[2rem] p-6 border border-border bg-white shadow-sm">
          <p className="font-display text-lg text-text-dark mb-2">Ready to fix your CV?</p>
          <p className="font-body text-sm text-muted mb-4">Free roast — no signup. Hinglish feedback in 30 seconds.</p>
          <Link href="/" className="btn-roast inline-block px-8 py-3">
            Free AI Resume Review →
          </Link>
        </div>
      </main>
      <BlogFooter />
    </div>
  )
}
