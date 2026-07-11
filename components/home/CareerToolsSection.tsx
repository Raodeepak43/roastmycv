import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CAREER_TOOL_MARKETING } from '@/lib/tools/marketing/config'

const FEATURED_SLUGS = [
  'mock-interview',
  'voice-interview',
  'interview-prep',
  'jd-match',
  'cover-letter',
  'skills-gap',
] as const

export function CareerToolsSection() {
  const featured = FEATURED_SLUGS.map((slug) => CAREER_TOOL_MARKETING.find((t) => t.slug === slug)).filter(
    Boolean,
  )

  return (
    <section className="w-full max-w-5xl mx-auto py-12 md:py-16" aria-labelledby="career-tools-heading">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-body text-xs uppercase tracking-wider text-muted mb-2">Career AI Tools</p>
          <h2 id="career-tools-heading" className="font-display text-2xl md:text-3xl text-text-dark">
            Know every tool before you sign in
          </h2>
          <p className="font-body text-sm text-muted mt-2 max-w-xl">
            Mock interviews, JD match, cover letters, salary scripts — each with its own page explaining exactly what
            you get.
          </p>
        </div>
        <Link
          href="/career-tools"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange hover:text-brand-orange transition-colors shrink-0"
        >
          All 29 tools
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="career-hub__grid">
        {featured.map((tool) => (
          <Link key={tool!.slug} href={`/career-tools/${tool!.slug}`} className="career-hub__card">
            <h3>{tool!.headline}</h3>
            <p>{tool!.tagline}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
