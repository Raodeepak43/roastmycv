import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/UiChrome'
import { CAREER_TOOL_MARKETING } from '@/lib/tools/marketing/config'
import { DASHBOARD_TOOLS } from '@/lib/tools/dashboard/config'

const FEATURED_SLUGS = [
  'mock-interview',
  'voice-interview',
  'interview-prep',
  'jd-match',
  'cover-letter',
  'skills-gap',
] as const

function dashIcon(slug: string) {
  return DASHBOARD_TOOLS.find((t) => t.slug === slug)?.icon ?? '✨'
}

export function CareerToolsSection() {
  const featured = FEATURED_SLUGS.map((slug) => CAREER_TOOL_MARKETING.find((t) => t.slug === slug)).filter(
    Boolean,
  )

  return (
    <section className="home-career-tools" aria-labelledby="career-tools-heading">
      <div className="home-career-tools__head">
        <SectionHeading title="Career AI tools" />
        <p className="home-career-tools__sub">
          Each tool has its own page with a live demo, example outputs, and FAQs — know exactly what you get before
          sign-in.
        </p>
        <Link href="/career-tools" className="home-career-tools__all">
          All {CAREER_TOOL_MARKETING.length} tools
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="career-saas-hub-grid">
        {featured.map((tool) => (
          <Link key={tool!.slug} href={`/career-tools/${tool!.slug}`} className="career-saas-hub-card">
            <div className="career-saas-hub-card__head">
              <span className="career-saas-hub-card__icon" aria-hidden>
                {dashIcon(tool!.slug)}
              </span>
              <div className="career-saas-hub-card__titles">
                <h3>{tool!.headline}</h3>
              </div>
            </div>
            <p className="career-saas-hub-card__tagline">{tool!.tagline}</p>
            <span className="career-saas-hub-card__link">
              View live demo
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
