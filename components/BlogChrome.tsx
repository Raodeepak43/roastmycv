import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getUi } from '@/app/i18n'
import { getPostCta, type BlogCtaConfig } from '@/lib/blog/post-cta'

export function BlogHeader() {
  return <SiteHeader activePath="blog" />
}

export function BlogFooter() {
  const { footer } = getUi('english')
  return <SiteFooter tagline={footer} />
}

export function BlogBreadcrumb({ title }: { title: string }) {
  return (
    <nav className="font-body text-[12px] mb-6 flex items-center flex-wrap gap-y-1" aria-label="Breadcrumb">
      <Link href="/" className="text-orange hover:underline">Home</Link>
      <span className="text-muted mx-2">&gt;</span>
      <Link href="/blog" className="text-orange hover:underline">Blog</Link>
      <span className="text-muted mx-2">&gt;</span>
      <span className="text-dim truncate max-w-[200px] sm:max-w-none">{title}</span>
    </nav>
  )
}

export function BlogCta({ slug }: { slug?: string }) {
  const cta: BlogCtaConfig = slug ? getPostCta(slug) : getPostCta('')
  return (
    <div
      className="mt-10 text-center rounded-[2rem] p-8 border-2 border-orange blog-cta-card"
    >
      <p className="text-5xl mb-3">{cta.emoji}</p>
      <p className="font-display text-xl md:text-2xl text-text-dark mb-2">{cta.headline}</p>
      {cta.sub && (
        <p className="font-body text-sm text-muted mb-6 max-w-md mx-auto">{cta.sub}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={cta.primary.href} className="btn-roast inline-block px-8 py-3 text-base">
          {cta.primary.label}
        </Link>
        {cta.secondary && (
          <Link
            href={cta.secondary.href}
            className="font-body text-sm text-orange hover:text-brand-orange border border-orange/40 rounded-full px-6 py-3 transition-colors"
          >
            {cta.secondary.label}
          </Link>
        )}
      </div>
    </div>
  )
}
