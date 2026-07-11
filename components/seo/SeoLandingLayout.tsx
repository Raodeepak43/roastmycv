import Link from 'next/link'
import { ToolRoastEmbed } from '@/components/tools/ToolRoastEmbed'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { RelatedPages } from '@/components/seo/RelatedPages'
import { SeoProse } from '@/components/seo/SeoProse'
import type { RoleCheckerConfig, ToolLandingConfig } from '@/lib/seo-pages/types'

type Props = {
  page: ToolLandingConfig | RoleCheckerConfig
  variant: 'tool-landing' | 'role-checker'
  breadcrumbParent?: { label: string; href: string }
}

export function SeoLandingLayout({ page, variant, breadcrumbParent }: Props) {
  const path =
    variant === 'tool-landing' ? `/${page.slug}` : `/resume-checker/${(page as RoleCheckerConfig).slug}`

  return (
    <div className="min-h-screen flex flex-col bg-bg-beige">
      <SiteHeader variant="default" activePath="home" />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <nav className="mb-6 font-body text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-orange transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          {breadcrumbParent ? (
            <>
              <Link href={breadcrumbParent.href} className="hover:text-orange transition-colors">
                {breadcrumbParent.label}
              </Link>
              <span className="mx-2">/</span>
            </>
          ) : null}
          <span className="text-dim">{page.h1}</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl text-text-dark leading-tight mb-4">{page.h1}</h1>

        <div className="space-y-4 mb-8">
          {page.intro.map((p) => (
            <SeoProse key={p.slice(0, 48)} text={p} />
          ))}
        </div>

        <ToolRoastEmbed
          defaultLanguage={page.defaultLanguage}
          defaultIntensity={
            'defaultIntensity' in page ? (page.defaultIntensity ?? 'gaali_light') : 'gaali_light'
          }
        />

        <p className="mt-4 text-center font-body text-xs text-muted">
          <Link href="/" className="text-orange hover:text-brand-orange">
            Roast on homepage
          </Link>
          {' · '}
          <Link href="/resume-builder" className="text-orange hover:text-brand-orange">
            Resume builder
          </Link>
          {' · '}
          <Link href="/plans" className="text-orange hover:text-brand-orange">
            Plans
          </Link>
        </p>

        {variant === 'role-checker' && 'atsKeywords' in page && page.atsKeywords.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="font-body text-xs uppercase tracking-wider text-orange mb-2">Top ATS keywords</p>
            <div className="flex flex-wrap gap-2">
              {page.atsKeywords.map((kw) => (
                <span
                  key={kw}
                  className="font-body text-xs text-dim border border-border rounded-full px-3 py-1 bg-bg-beige/50"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 space-y-10">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl text-text-dark mb-3">{section.title}</h2>
              <div className="space-y-3">
                {section.paragraphs.map((p) => (
                  <SeoProse key={p.slice(0, 40)} text={p} />
                ))}
              </div>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-4 space-y-2 font-body text-sm text-dim list-disc pl-5">
                  {section.bullets.map((b) => (
                    <li key={b.slice(0, 50)}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {page.faq.length > 0 && (
          <section className="mt-10" id="faq">
            <h2 className="font-body text-xs uppercase tracking-wider text-muted mb-4">FAQ</h2>
            <div className="space-y-4">
              {page.faq.map((item) => (
                <div key={item.question} className="border-b border-border pb-4 last:border-0">
                  <h3 className="font-display text-base text-text-dark mb-1">{item.question}</h3>
                  <p className="font-body text-sm text-dim leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <RelatedPages
          slugs={page.relatedSlugs}
          variant={variant}
          currentSlug={page.slug}
        />

        <div className="mt-10 text-center">
          <Link href="/" className="btn-roast inline-block px-8 py-3 text-base">
            🔥 Roast my CV free
          </Link>
        </div>
      </main>

      <SiteFooter tagline="Free AI resume roast · India-first · 15 languages" />
    </div>
  )
}

export function seoPagePath(page: ToolLandingConfig | RoleCheckerConfig, variant: 'tool-landing' | 'role-checker') {
  return variant === 'tool-landing' ? `/${page.slug}` : `/resume-checker/${(page as RoleCheckerConfig).slug}`
}
