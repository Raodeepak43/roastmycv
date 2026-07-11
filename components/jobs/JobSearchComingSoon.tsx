import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export function JobSearchComingSoon() {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      <SiteHeader variant="default" activePath="career-tools" breadcrumb="Job Search" />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-8 py-10 md:py-16 text-center">
        <nav className="mb-8 font-body text-xs text-muted text-left">
          <Link href="/career-tools" className="hover:text-orange transition-colors">
            ← Career Tools
          </Link>
        </nav>

        <p className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-3 py-1 font-body text-[11px] uppercase tracking-wider text-orange mb-5">
          Coming soon
        </p>

        <h1 className="font-display text-3xl md:text-4xl text-text-dark leading-tight mb-4">
          Job Search Portal
        </h1>

        <p className="font-body text-[15px] text-muted leading-relaxed mb-8">
          Live job listings inside MyCVRoast are on the way. For now, roast your CV, match it to a JD, and use our
          29+ career tools — then apply on your favourite job sites.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-orange px-5 py-3 font-body text-sm text-white hover:opacity-90 transition-opacity"
          >
            Roast my CV free
          </Link>
          <Link
            href="/blog/best-job-search-sites-india"
            className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 font-body text-sm text-text-dark hover:border-orange/40 transition-colors"
          >
            Best job sites in India →
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
