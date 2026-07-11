import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { blogCategoryForSlug } from '@/lib/blog/post-cta'
import { itemListJsonLd } from '@/lib/schema'
import { pageMetadata, siteUrl } from '@/lib/seo'
import { ROLE_CHECKERS, TOOL_LANDINGS } from '@/lib/seo-pages/registry'
import { BlogFooter, BlogHeader } from '@/components/BlogChrome'

export const metadata: Metadata = pageMetadata({
  title: 'Site Map — All Guides, Tools & Resume Checkers | MyCVRoast',
  description:
    'Complete HTML sitemap for MyCVRoast — every blog guide, free resume tool landing, role-specific resume checker, and core pages for crawlers and users.',
  path: '/guides',
  keywords: 'mycvroast sitemap, resume guides india, free resume checker, career tools',
})

const CORE_PAGES = [
  { href: '/', label: 'Free AI Resume Roast' },
  { href: '/about', label: 'About MyCVRoast' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/faq', label: 'FAQ' },
  { href: '/why-trust-us', label: 'Why trust us' },
  { href: '/support', label: 'Support' },
  { href: '/llms.txt', label: 'LLMs.txt (AI crawlers)' },
  { href: '/blog', label: 'Blog & career guides' },
  { href: '/resume-builder', label: 'ATS resume builder' },
  { href: '/linkedin-roast', label: 'LinkedIn profile roast' },
  { href: '/plans', label: 'Plans & pricing' },
  { href: '/career-tools/jobs', label: 'Job search portal' },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of service' },
  { href: '/contact', label: 'Contact' },
  { href: '/tools/resume-roast-in-hinglish', label: 'Hinglish resume roast' },
  { href: '/tools/free-resume-roast-india', label: 'Free resume roast India' },
]

function LinkGrid({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="font-body text-sm text-orange hover:text-text-dark transition-colors">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function matchesQuery(label: string, q: string): boolean {
  return label.toLowerCase().includes(q.toLowerCase())
}

export default function GuidesSitemapPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const query = searchParams?.q?.trim() ?? ''
  const posts = getAllPosts()
  const filteredCore = query ? CORE_PAGES.filter((p) => matchesQuery(p.label, query)) : CORE_PAGES
  const filteredPosts = query
    ? posts.filter((p) => matchesQuery(p.title, query) || matchesQuery(p.slug, query))
    : posts
  const filteredLandings = query
    ? TOOL_LANDINGS.filter((p) => matchesQuery(p.h1, query) || matchesQuery(p.slug, query))
    : TOOL_LANDINGS
  const filteredCheckers = query
    ? ROLE_CHECKERS.filter((p) => matchesQuery(p.h1, query) || matchesQuery(p.slug, query))
    : ROLE_CHECKERS

  const postsByCategory = new Map<string, typeof filteredPosts>()
  for (const post of filteredPosts) {
    const cat = blogCategoryForSlug(post.slug)
    const list = postsByCategory.get(cat) ?? []
    list.push(post)
    postsByCategory.set(cat, list)
  }

  const categories = Array.from(postsByCategory.keys()).sort()

  const itemListItems = [
    ...CORE_PAGES.map((p) => ({ name: p.label, url: siteUrl(p.href) })),
    ...posts.map((p) => ({ name: p.title, url: siteUrl(`/blog/${p.slug}`) })),
    ...TOOL_LANDINGS.map((p) => ({ name: p.title, url: siteUrl(`/${p.slug}`) })),
    ...ROLE_CHECKERS.map((p) => ({ name: p.title, url: siteUrl(`/resume-checker/${p.slug}`) })),
  ]

  return (
    <div className="min-h-screen flex flex-col bg-bg-beige">
      <BlogHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(itemListItems)) }}
      />
      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-10 w-full">
        <nav className="font-body text-[12px] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="text-orange hover:underline">
            Home
          </Link>
          <span className="text-muted mx-2">&gt;</span>
          <span className="text-dim">Site map</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl text-text-dark mb-2">Complete site map</h1>
        <p className="font-body text-sm text-muted mb-4 leading-relaxed">
          Every public page on MyCVRoast — blog guides, free tool landings, role resume checkers, and core product
          pages.
        </p>
        <form method="get" action="/guides" className="mb-8 flex gap-2 max-w-md" role="search">
          <label htmlFor="guides-q" className="sr-only">
            Search site map
          </label>
          <input
            id="guides-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search pages, guides, tools…"
            className="flex-1 bg-bg-beige border border-border rounded-xl px-4 py-2.5 font-body text-sm text-text-dark placeholder:text-muted focus:border-orange outline-none"
          />
          <button
            type="submit"
            className="font-body text-sm px-4 py-2.5 rounded-xl border border-border text-text-dark hover:border-orange transition-colors"
          >
            Search
          </button>
        </form>
        {query ? (
          <p className="font-body text-xs text-muted mb-6">
            Results for &ldquo;{query}&rdquo; —{' '}
            <Link href="/guides" className="text-orange hover:underline">
              clear
            </Link>
          </p>
        ) : null}
        <p className="font-body text-xs text-muted mb-8 leading-relaxed">
          XML sitemaps:{' '}
          <Link href="/sitemap.xml" className="text-orange hover:underline">
            index
          </Link>
          ,{' '}
          <Link href="/sitemap-core.xml" className="text-orange hover:underline">
            core
          </Link>
          ,{' '}
          <Link href="/sitemap-blog.xml" className="text-orange hover:underline">
            blog
          </Link>
          ,{' '}
          <Link href="/sitemap-images.xml" className="text-orange hover:underline">
            images
          </Link>
          ,{' '}
          <Link href="/llms.txt" className="text-orange hover:underline">
            llms.txt
          </Link>
          .
        </p>

        <section className="mb-10">
          <h2 className="font-display text-xl text-text-dark mb-4">Core pages</h2>
          <LinkGrid links={filteredCore} />
        </section>

        {categories.map((category) => {
          const categoryPosts = postsByCategory.get(category)
          if (!categoryPosts?.length) return null
          return (
            <section key={category} className="mb-10">
              <h2 className="font-display text-xl text-text-dark mb-4">Blog — {category}</h2>
              <LinkGrid
                links={categoryPosts.map((p) => ({
                  href: `/blog/${p.slug}`,
                  label: p.title,
                }))}
              />
            </section>
          )
        })}

        <section className="mb-10">
          <h2 className="font-display text-xl text-text-dark mb-4">Free resume tool landings</h2>
          <LinkGrid links={filteredLandings.map((p) => ({ href: `/${p.slug}`, label: p.h1 }))} />
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl text-text-dark mb-4">Role resume checkers</h2>
          <LinkGrid
            links={filteredCheckers.map((p) => ({
              href: `/resume-checker/${p.slug}`,
              label: p.h1,
            }))}
          />
        </section>
      </main>
      <BlogFooter />
    </div>
  )
}
