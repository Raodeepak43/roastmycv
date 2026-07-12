import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { SectionHeading } from '@/components/UiChrome'
import {
  CAREER_TOOL_CATEGORIES,
  CAREER_TOOL_MARKETING,
  getCareerToolsByCategory,
} from '@/lib/tools/marketing/config'
import { CAREER_HUB_FAQ } from '@/lib/tools/marketing/landing-extras'
import { DASHBOARD_TOOLS } from '@/lib/tools/dashboard/config'
import { faqPageJsonLd, itemListJsonLd } from '@/lib/schema'
import { pageMetadata, siteUrl } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: '29 Career AI Tools — Interview, CV, Apply & More | MyCVRoast',
  description:
    'Explore every MyCVRoast dashboard tool: mock interview, JD match, cover letters, salary scripts, and more. Built for Indian job seekers.',
  path: '/career-tools',
  keywords:
    'career ai tools india, mock interview, cover letter generator, jd match, salary negotiation, resume tools',
})

function tierBadge(slug: string) {
  const tool = DASHBOARD_TOOLS.find((t) => t.slug === slug)
  if (!tool) return null
  if (tool.access.proOnly) {
    return <span className="career-saas-pill career-saas-pill--pro">Pro</span>
  }
  return <span className="career-saas-pill career-saas-pill--free">Free tier</span>
}

function dashIcon(slug: string) {
  return DASHBOARD_TOOLS.find((t) => t.slug === slug)?.icon ?? '✨'
}

export default function CareerToolsHubPage() {
  const itemList = CAREER_TOOL_MARKETING.map((tool) => ({
    name: tool.headline,
    url: siteUrl(`/career-tools/${tool.slug}`),
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(itemList)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(CAREER_HUB_FAQ)) }}
      />

      <div className="min-h-screen flex flex-col bg-bg-beige career-saas-page">
        <SiteHeader variant="default" activePath="career-tools" />

        <main className="flex-1 w-full max-w-[90rem] mx-auto px-4 md:px-8 py-8 md:py-12">
          <nav className="career-saas__crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Career Tools</span>
          </nav>

          <section className="career-saas-hub-hero elevate-light-panel">
            <div className="career-saas-hub-hero__copy">
              <p className="section-label">Career AI Tools</p>
              <h1 className="career-saas-hero__title">{CAREER_TOOL_MARKETING.length} tools. One dashboard.</h1>
              <p className="career-saas-hero__desc">
                Every tool has its own page with a live demo, example outputs, and FAQs — so you know exactly what you
                get before signing in. Roast your CV, apply smarter, practice interviews, and negotiate offers.
              </p>
              <div className="career-saas-hub-hero__stats">
                <span className="career-saas-pill career-saas-pill--free">15 free-tier tools</span>
                <span className="career-saas-pill career-saas-pill--pro">14 Pro tools</span>
                <span className="career-saas-pill">1 CV powers all tools</span>
              </div>
              <div className="career-saas-hero__actions">
                <Link href="/login?next=%2Fdashboard" className="btn-roast career-saas-hero__cta">
                  Open dashboard
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="/plans" className="career-saas-hero__cta-secondary">
                  View pricing
                </Link>
              </div>
            </div>
            <div className="career-saas-hub-hero__aside">
              <p className="career-saas-hub-hero__aside-label">How it works</p>
              <ol className="career-saas-hub-hero__steps">
                <li>
                  <span>1</span>
                  <p>Pick a tool — each page shows a live product demo.</p>
                </li>
                <li>
                  <span>2</span>
                  <p>Try one free demo run, then sign in with your CV.</p>
                </li>
                <li>
                  <span>3</span>
                  <p>Get personalised outputs in the same dashboard UI.</p>
                </li>
              </ol>
            </div>
          </section>

          <section className="career-saas-section">
            <Link href="/career-tools/jobs" className="career-saas-hub-feature">
              <div className="career-saas-hub-feature__icon" aria-hidden>
                🔎
              </div>
              <div className="career-saas-hub-feature__copy">
                <div className="career-saas-hub-feature__top">
                  <h2>Job Search Portal</h2>
                  <span className="career-saas-pill">Coming soon</span>
                </div>
                <p>Search live listings matched to your CV — launching soon on MyCVRoast.</p>
              </div>
              <ArrowRight className="career-saas-hub-feature__arrow size-4" aria-hidden />
            </Link>
          </section>

          {CAREER_TOOL_CATEGORIES.map((cat) => {
            const tools = getCareerToolsByCategory(cat.id)
            if (!tools.length) return null
            return (
              <section key={cat.id} className="career-saas-section">
                <SectionHeading title={`${cat.emoji} ${cat.title}`} />
                <div className="career-saas-hub-grid">
                  {tools.map((tool) => (
                    <Link key={tool.slug} href={`/career-tools/${tool.slug}`} className="career-saas-hub-card">
                      <div className="career-saas-hub-card__head">
                        <span className="career-saas-hub-card__icon" aria-hidden>
                          {dashIcon(tool.slug)}
                        </span>
                        <div className="career-saas-hub-card__titles">
                          <h3>{tool.headline}</h3>
                          {tierBadge(tool.slug)}
                        </div>
                      </div>
                      <p className="career-saas-hub-card__tagline">{tool.tagline}</p>
                      <span className="career-saas-hub-card__link">
                        View tool page
                        <ArrowRight className="size-3.5" aria-hidden />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}

          <section className="career-saas-section" id="faq">
            <SectionHeading title="FAQ" />
            <div className="career-saas-faq">
              {CAREER_HUB_FAQ.map((item) => (
                <details key={item.question} className="career-saas-faq__item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="career-saas-cta elevate-cta-panel">
            <h2>One CV. {CAREER_TOOL_MARKETING.length} career tools.</h2>
            <p>Sign in free — paste your CV once and unlock the full dashboard.</p>
            <Link href="/login?next=%2Fdashboard" className="btn-roast career-saas-hero__cta">
              Get started
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
