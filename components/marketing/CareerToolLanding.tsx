import type { CareerToolMarketing } from '@/lib/tools/marketing/config'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { formatProPrice } from '@/lib/plans'
import { DASHBOARD_TOOLS } from '@/lib/tools/dashboard/config'

type Props = {
  tool: CareerToolMarketing
}

function loginHref(dashboardPath: string) {
  return `/login?next=${encodeURIComponent(dashboardPath)}`
}

export function CareerToolLanding({ tool }: Props) {
  const isProOnly = tool.freeVsPro.startsWith('Pro only')
  const related = tool.relatedSlugs
    .map((s) => DASHBOARD_TOOLS.find((t) => t.slug === s))
    .filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col bg-page career-landing">
      <SiteHeader variant="default" activePath="career-tools" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <nav className="mb-6 font-body text-xs text-muted">
          <Link href="/" className="hover:text-orange transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/career-tools" className="hover:text-orange transition-colors">
            Career Tools
          </Link>
          <span className="mx-2">/</span>
          <span className="text-dim">{tool.headline}</span>
        </nav>

        <div className="career-landing__hero grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12">
          <div>
            {isProOnly && <span className="career-landing__badge career-landing__badge--pro">Pro tool</span>}
            {!isProOnly && <span className="career-landing__badge">Free tier available</span>}
            <h1 className="font-display text-3xl md:text-4xl text-text-dark leading-tight mt-3 mb-3">{tool.headline}</h1>
            <p className="font-body text-lg text-orange mb-4">{tool.tagline}</p>
            <p className="font-body text-[15px] text-muted leading-relaxed mb-6">{tool.whatItDoes}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={loginHref(tool.dashboardHref)} className="career-landing__cta">
                Open in dashboard
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/plans" className="career-landing__cta-secondary">
                {isProOnly ? `Get Pro — ${formatProPrice()}` : 'See pricing'}
              </Link>
            </div>
            <p className="font-body text-xs text-muted mt-4">{tool.freeVsPro}</p>
          </div>
          <div className="career-landing__card career-landing__card--features" aria-hidden>
            <h3 className="career-landing__h3">What you get</h3>
            <p className="text-muted text-sm leading-relaxed">{tool.outputLabel}</p>
            <ul className="mt-4 space-y-2">
              {tool.howItWorks.slice(0, 3).map((step) => (
                <li key={step} className="flex gap-2 text-sm text-dim">
                  <CheckCircle2 className="size-4 shrink-0 text-orange" aria-hidden />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="career-landing__section">
          <h2 className="career-landing__h2">How it works</h2>
          <ol className="career-landing__steps">
            {tool.howItWorks.map((step, i) => (
              <li key={i}>
                <span className="career-landing__step-num">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <section className="career-landing__card">
            <h3 className="career-landing__h3">What you provide</h3>
            <p className="text-muted text-sm">{tool.inputLabel}</p>
          </section>
          <section className="career-landing__card">
            <h3 className="career-landing__h3">What you get</h3>
            <p className="text-muted text-sm">{tool.outputLabel}</p>
          </section>
        </div>

        <section className="career-landing__section career-landing__example">
          <h2 className="career-landing__h2">Example output</h2>
          <p className="font-body text-sm text-muted leading-relaxed italic border-l-2 border-orange pl-4">
            {tool.exampleOutput}
          </p>
        </section>

        <section className="career-landing__section">
          <h2 className="career-landing__h2">Who it&apos;s for</h2>
          <p className="font-body text-[15px] text-muted leading-relaxed flex gap-2">
            <CheckCircle2 className="size-5 text-orange shrink-0 mt-0.5" aria-hidden />
            {tool.whoItsFor}
          </p>
        </section>

        {related.length > 0 && (
          <section className="career-landing__section border-t border-border pt-8">
            <h2 className="career-landing__h2">Related tools</h2>
            <ul className="grid sm:grid-cols-2 gap-3 mt-4">
              {related.map((t) => (
                <li key={t!.slug}>
                  <Link href={`/career-tools/${t!.slug}`} className="career-landing__related">
                    {t!.label}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="career-landing__cta-block mt-12">
          <h2 className="font-display text-2xl text-text-dark mb-2">Ready to try {tool.headline.split('—')[0].trim()}?</h2>
          <p className="text-muted text-sm mb-5">Sign in free — your CV stays in your dashboard for every tool.</p>
          <Link href={loginHref(tool.dashboardHref)} className="career-landing__cta">
            Start now
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
