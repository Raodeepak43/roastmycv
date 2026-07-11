import Link from 'next/link'
import { getToolLandingBySlug, getRoleCheckerBySlug } from '@/lib/seo-pages/registry'

type RelatedPagesProps = {
  slugs: string[]
  variant: 'tool-landing' | 'role-checker'
  currentSlug: string
}

export function RelatedPages({ slugs, variant, currentSlug }: RelatedPagesProps) {
  const links = slugs
    .filter((s) => s !== currentSlug)
    .map((slug) => {
      if (variant === 'tool-landing') {
        const page = getToolLandingBySlug(slug)
        return page ? { href: `/${slug}`, label: page.h1 } : null
      }
      const page = getRoleCheckerBySlug(slug)
      return page ? { href: `/resume-checker/${slug}`, label: page.h1 } : null
    })
    .filter(Boolean) as { href: string; label: string }[]

  if (!links.length) return null

  return (
    <section className="mt-10 border-t border-[#1A1A1A] pt-8" aria-labelledby="related-pages-heading">
      <h2 id="related-pages-heading" className="font-body text-xs uppercase tracking-wider text-muted mb-4">
        Related pages
      </h2>
      <ul className="space-y-2 font-body text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-orange hover:text-white transition-colors">
              {link.label} →
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-body text-xs text-muted">
        <Link href="/blog/ai-resume-review-tools-compared-india" className="text-orange hover:underline">
          Compare all AI resume tools (India)
        </Link>
        {' · '}
        <Link href="/" className="text-orange hover:underline">
          Free homepage roast
        </Link>
      </p>
    </section>
  )
}
