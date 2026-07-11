import { blogCategoryForSlug, getPostCta } from '@/lib/blog/post-cta'
import type { PostMeta } from '@/lib/blog'
import { formatBlogDate } from '@/lib/blog'
import Link from 'next/link'

const TYPE_LABELS: Record<NonNullable<PostMeta['type']>, string> = {
  guide: 'Career Guide',
  comparison: 'Comparison',
  tool: 'Product Guide',
}

export function BlogArticleMeta({ post }: { post: PostMeta }) {
  const type = post.type ?? 'guide'
  const category = blogCategoryForSlug(post.slug)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
      <span className="font-body text-[10px] uppercase tracking-wider text-orange border border-orange/40 rounded-full px-2.5 py-1">
        {TYPE_LABELS[type]}
      </span>
      <span className="font-body text-[10px] uppercase tracking-wider text-muted border border-border rounded-full px-2.5 py-1">
        {category}
      </span>
      <span className="font-body text-[11px] text-muted">
        By {post.author ?? 'MyCVRoast Team'}
      </span>
      <span className="font-body text-[11px] text-muted" aria-hidden>
        ·
      </span>
      <time className="font-body text-[11px] text-muted" dateTime={post.date}>
        {formatBlogDate(post.date)}
      </time>
      {post.readingMinutes && (
        <>
          <span className="font-body text-[11px] text-muted" aria-hidden>
            ·
          </span>
          <span className="font-body text-[11px] text-muted">{post.readingMinutes} min read</span>
        </>
      )}
    </div>
  )
}

export function BlogFaqSection({ faq }: { faq: { q: string; a: string }[] }) {
  if (!faq.length) return null
  return (
    <section className="mt-12 pt-8 border-t border-border" aria-labelledby="blog-faq-heading">
      <h2 id="blog-faq-heading" className="font-display text-xl text-text-dark mb-5">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {faq.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-white overflow-hidden"
          >
            <summary className="font-body text-[15px] text-text-dark cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 hover:bg-bg-beige/60 transition-colors">
              <span>{item.q}</span>
              <span className="text-orange text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="font-body text-[14px] text-dim leading-relaxed px-5 pb-4 pt-0 border-t border-border">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function BlogRelatedStrip({ links }: { links: { label: string; href: string }[] }) {
  if (!links.length) return null

  return (
    <aside className="mt-10 p-5 rounded-2xl border border-border bg-white">
      <p className="font-display text-sm text-text-dark mb-3">Keep reading</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="font-body text-sm text-orange hover:text-brand-orange transition-colors">
              {link.label} →
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export function BlogInlineCta({ slug }: { slug: string }) {
  const cta = getPostCta(slug)
  return (
    <div className="my-8 rounded-2xl border border-orange/30 bg-white p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
      <div>
        <p className="font-display text-base text-text-dark mb-1">{cta.headline}</p>
        {cta.sub && <p className="font-body text-sm text-muted">{cta.sub}</p>}
      </div>
      <Link href={cta.primary.href} className="btn-roast inline-block text-center px-6 py-2.5 text-sm shrink-0">
        {cta.primary.label}
      </Link>
    </div>
  )
}
