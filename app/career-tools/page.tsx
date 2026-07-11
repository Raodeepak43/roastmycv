import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import {
  CAREER_TOOL_CATEGORIES,
  CAREER_TOOL_MARKETING,
  getCareerToolsByCategory,
} from '@/lib/tools/marketing/config'
import { siteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: '29 Career AI Tools — Interview, CV, Apply & More | MyCVRoast',
  description:
    'Explore every MyCVRoast dashboard tool: mock interview, JD match, cover letters, salary scripts, and more. Built for Indian job seekers.',
  alternates: { canonical: siteUrl('/career-tools') },
}

export default function CareerToolsHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      <SiteHeader variant="default" activePath="career-tools" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <nav className="mb-6 font-body text-xs text-muted">
          <Link href="/" className="hover:text-orange transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-dim">Career Tools</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl text-text-dark leading-tight mb-3">
          {CAREER_TOOL_MARKETING.length} Career AI Tools
        </h1>
        <p className="font-body text-[15px] text-muted leading-relaxed mb-6 max-w-2xl">
          Every tool explains exactly what it does before you sign in. Roast your CV, apply smarter, practice
          interviews, and negotiate offers — all from one dashboard.
        </p>

        <Link href="/career-tools/jobs" className="career-hub__card mb-10 block max-w-xl">
          <h2 className="!text-lg">🔎 Job Search Portal</h2>
          <p>Search live listings via Careerjet — then roast or match your CV before you apply.</p>
        </Link>

        {CAREER_TOOL_CATEGORIES.map((cat) => {
          const tools = getCareerToolsByCategory(cat.id)
          if (!tools.length) return null
          return (
            <section key={cat.id}>
              <h2 className="career-hub__cat-title">
                {cat.emoji} {cat.title}
              </h2>
              <div className="career-hub__grid">
                {tools.map((tool) => (
                  <Link key={tool.slug} href={`/career-tools/${tool.slug}`} className="career-hub__card">
                    <h3>{tool.headline}</h3>
                    <p>{tool.tagline}</p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <SiteFooter />
    </div>
  )
}
