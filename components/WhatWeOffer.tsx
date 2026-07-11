import Link from 'next/link'
import {
  DASHBOARD_TOOLS,
  PRODUCT_OFFERINGS,
  TOOL_CATEGORY_CATALOG,
  type ProductOffering,
} from '@/lib/plans'

type Props = {
  /** compact = homepage teaser; full = plans page with every tool */
  variant?: 'compact' | 'full'
}

function OfferingCard({ item }: { item: ProductOffering }) {
  const linkHref = item.landingHref ?? item.href
  const inner = (
    <>
      <div className="offerings-card__head">
        <span className="offerings-card__emoji" aria-hidden>
          {item.emoji}
        </span>
        <h3 className="offerings-card__title">{item.title}</h3>
      </div>
      <p className="offerings-card__desc">{item.description}</p>
      <div className="offerings-card__tiers">
        <p>
          <span className="offerings-card__tier-label">Free</span>
          {item.freeLabel}
        </p>
        <p>
          <span className="offerings-card__tier-label offerings-card__tier-label--pro">Pro</span>
          {item.proLabel}
        </p>
      </div>
    </>
  )

  if (linkHref) {
    return (
      <Link href={linkHref} className="offerings-card offerings-card--link">
        {inner}
      </Link>
    )
  }

  return <article className="offerings-card">{inner}</article>
}

const COMPACT_TITLES = new Set([
  'CV Roast',
  'ATS Resume Builder',
  'LinkedIn Roast',
  'Mock Interview',
  'Voice Interview',
])

export function WhatWeOffer({ variant = 'full' }: Props) {
  const careerToolsCard = PRODUCT_OFFERINGS.find((o) => o.title.includes('Career AI Tools'))
  const displayOfferings =
    variant === 'compact'
      ? [
          ...PRODUCT_OFFERINGS.filter((o) => COMPACT_TITLES.has(o.title)),
          ...(careerToolsCard ? [careerToolsCard] : []),
        ]
      : PRODUCT_OFFERINGS

  return (
    <section className="offerings-section" aria-label="What we offer">
      <h2 className="offerings-section__title">WHAT WE OFFER</h2>
      <p className="offerings-section__sub">
        CV roast, resume builder, LinkedIn roast, mock interview with AI voice, and{' '}
        {DASHBOARD_TOOLS.length}+ career tools — free to start, Pro for unlimited everything.
      </p>

      <div className="offerings-grid">
        {displayOfferings.map((item) => (
          <OfferingCard key={item.title} item={item} />
        ))}
      </div>

      {variant === 'compact' && (
        <p className="offerings-section__more text-center mt-6">
          <Link
            href="/career-tools"
            className="text-orange hover:text-brand-orange font-body text-sm uppercase tracking-wider transition-colors"
          >
            Browse all {DASHBOARD_TOOLS.length} tool pages →
          </Link>
        </p>
      )}

      {variant === 'full' && (
        <div className="tools-catalog mt-12">
          <h3 className="tools-catalog__title">All dashboard career tools</h3>
          <p className="tools-catalog__sub">
            Sign in free to use these from your dashboard. Free limits apply per tool; Pro unlocks
            unlimited use on every tool.
          </p>
          <div className="tools-catalog__groups">
            {TOOL_CATEGORY_CATALOG.map((group) => (
              <div key={group.id} className="tools-catalog__group">
                <h4 className="tools-catalog__group-title">
                  <span aria-hidden>{group.emoji}</span> {group.title}
                </h4>
                <ul className="tools-catalog__list">
                  {group.tools.map((tool) => (
                    <li key={tool.slug} className="tools-catalog__row">
                      <Link href={`/career-tools/${tool.slug}`} className="tools-catalog__name">
                        <span aria-hidden>{tool.icon}</span> {tool.label}
                      </Link>
                      <Link
                        href={`/login?next=${encodeURIComponent(tool.href)}`}
                        className="tools-catalog__use text-orange text-xs hover:text-brand-orange"
                      >
                        Use →
                      </Link>
                      <span className="tools-catalog__free">{tool.freeLabel}</span>
                      <span className="tools-catalog__pro">{tool.proLabel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="tools-catalog__foot font-body text-xs text-muted mt-6 text-center">
            Also on the public site:{' '}
            <Link href="/" className="text-orange hover:text-brand-orange">
              CV Roast
            </Link>
            {' · '}
            <Link href="/resume-builder" className="text-orange hover:text-brand-orange">
              Resume Builder
            </Link>
            {' · '}
            <Link href="/linkedin-roast" className="text-orange hover:text-brand-orange">
              LinkedIn Roast
            </Link>
            {' · '}
            <Link href="/blog" className="text-orange hover:text-brand-orange">
              Career blog
            </Link>
          </p>
        </div>
      )}
    </section>
  )
}
