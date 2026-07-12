import type { CareerToolMarketing } from '@/lib/tools/marketing/config'
import { getCareerToolDemoSamples, getCareerToolFaq } from '@/lib/tools/marketing/landing-extras'
import { getCareerToolPreview } from '@/lib/tools/marketing/demo-previews'
import { getToolPageContent } from '@/lib/tools/marketing/tool-page-content'
import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { SectionHeading } from '@/components/UiChrome'
import { CareerToolLiveDemo } from '@/components/marketing/CareerToolLiveDemo'
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
  const dashTool = DASHBOARD_TOOLS.find((t) => t.slug === tool.slug)
  const page = getToolPageContent(tool)
  const related = tool.relatedSlugs
    .map((s) => DASHBOARD_TOOLS.find((t) => t.slug === s))
    .filter(Boolean)

  const faq = getCareerToolFaq(tool.slug, tool.headline, tool.whatItDoes, tool.freeVsPro)
  const preview = getCareerToolPreview(tool.slug)
  const demoSamples = getCareerToolDemoSamples(tool.slug, tool.exampleOutput)

  const blogPosts = getAllPosts()
  const relatedBlogs = tool.relatedBlogSlugs
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col bg-bg-beige career-saas-page">
      <SiteHeader variant="default" activePath="career-tools" />

      <main className="flex-1 w-full max-w-[90rem] mx-auto px-4 md:px-8 py-8 md:py-12">
        <nav className="career-saas__crumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/career-tools">Career Tools</Link>
          <span>/</span>
          <span>{tool.headline}</span>
        </nav>

        <section className="career-saas-hero elevate-light-panel">
          <div className="career-saas-hero__copy">
            <p className="section-label">{page.eyebrow}</p>
            <div className="career-saas-hero__badges">
              {dashTool && <span className="career-saas-hero__icon" aria-hidden>{dashTool.icon}</span>}
              {isProOnly ? (
                <span className="career-saas-pill career-saas-pill--pro">Pro</span>
              ) : (
                <span className="career-saas-pill career-saas-pill--free">Free tier</span>
              )}
              <span className="career-saas-pill">Uses your saved CV</span>
            </div>

            <h1 className="career-saas-hero__title">{tool.headline}</h1>
            <p className="career-saas-hero__tagline">{tool.tagline}</p>
            <p className="career-saas-hero__desc">{tool.whatItDoes}</p>

            <div className="career-saas-hero__actions">
              <Link href={loginHref(tool.dashboardHref)} className="btn-roast career-saas-hero__cta">
                Open in dashboard
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/plans" className="career-saas-hero__cta-secondary">
                {isProOnly ? `Get Pro — ${formatProPrice()}` : 'View pricing'}
              </Link>
            </div>
            <p className="career-saas-hero__limits">{tool.freeVsPro}</p>
          </div>

          <div className="career-saas-hero__demo">
            <div className="career-saas-demo-card">
              <div className="career-saas-demo-card__head">
                <div>
                  <p className="career-saas-demo-card__label">Live product demo</p>
                  <h2 className="career-saas-demo-card__title">{page.demoTitle}</h2>
                  <p className="career-saas-demo-card__sub">{page.demoSubtitle}</p>
                </div>
                <span className="career-saas-demo-card__live">Live</span>
              </div>
              <CareerToolLiveDemo
                slug={tool.slug}
                preview={preview}
                headline={tool.headline}
                dashboardHref={tool.dashboardHref}
                isProOnly={isProOnly}
              />
            </div>
          </div>
        </section>

        <section className="career-saas-section">
          <SectionHeading title="What we provide" />
          <p className="career-saas-section__lead">{page.outcome}</p>
          <ul className="career-saas-provides">
            {page.provides.map((item) => (
              <li key={item}>
                <CheckCircle2 className="size-4 shrink-0 text-brand-orange" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="career-saas-section elevate-white career-saas-io">
          <div className="career-saas-io__card">
            <p className="career-saas-io__label">You provide</p>
            <h3>{tool.inputLabel}</h3>
            <p>Paste your CV once in the dashboard — every tool reuses it.</p>
          </div>
          <div className="career-saas-io__card career-saas-io__card--out">
            <p className="career-saas-io__label">You get</p>
            <h3>{tool.outputLabel}</h3>
            <p>Copy, edit, or save results for your job search.</p>
          </div>
        </section>

        <section className="career-saas-section">
          <SectionHeading title="How it works" />
          <ol className="career-saas-steps">
            {tool.howItWorks.map((step, i) => (
              <li key={i}>
                <span className="career-saas-steps__num">{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="career-saas-section">
          <SectionHeading title="Example outputs" />
          <p className="career-saas-section__lead">
            Sample results from the dashboard — yours are personalised from your CV and job details.
          </p>
          <div className="career-saas-examples">
            {demoSamples.map((sample) => (
              <article key={sample.label} className="career-saas-example">
                <p className="career-saas-example__label">{sample.label}</p>
                <p className="career-saas-example__body">{sample.content}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="career-saas-section career-saas-audience elevate-light-panel">
          <h2 className="career-saas-audience__title">Built for</h2>
          <p>{tool.whoItsFor}</p>
        </section>

        {relatedBlogs.length > 0 && (
          <section className="career-saas-section">
            <p className="section-label mb-3">Guides</p>
            <h2 className="career-saas-block-title flex items-center gap-2">
              <BookOpen className="size-5 text-brand-orange" aria-hidden />
              Related reading
            </h2>
            <ul className="career-saas-guides">
              {relatedBlogs.map((post) => (
                <li key={post!.slug}>
                  <Link href={`/blog/${post!.slug}`}>
                    <span>{post!.title}</span>
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="career-saas-section">
            <SectionHeading title="Related tools" />
            <ul className="career-saas-related">
              {related.map((t) => (
                <li key={t!.slug}>
                  <Link href={`/career-tools/${t!.slug}`}>
                    <span aria-hidden>{t!.icon}</span>
                    <span>{t!.label}</span>
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="career-saas-section" id="faq">
          <SectionHeading title="FAQ" />
          <div className="career-saas-faq">
            {faq.map((item) => (
              <details key={item.question} className="career-saas-faq__item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="career-saas-cta elevate-cta-panel">
          <h2>Start {tool.headline.split('—')[0].trim()} with your CV</h2>
          <p>Sign in free — one dashboard for all 29 career tools.</p>
          <Link href={loginHref(tool.dashboardHref)} className="btn-roast career-saas-hero__cta">
            Open in dashboard
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
