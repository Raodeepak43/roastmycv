import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MotionFadeUp } from '@/components/Motion'
import { GUEST_FREE_ROASTS, formatProPrice } from '@/lib/plans'
import { DASHBOARD_TOOLS } from '@/lib/tools/dashboard/config'

const CLUSTERS = [
  {
    title: 'Resume roast & review',
    items: [
      { href: '/', label: 'Free resume roast', desc: `${GUEST_FREE_ROASTS} roasts · no signup` },
      { href: '/tools/resume-roast-in-hinglish', label: 'Hinglish resume roast', desc: 'Natural Hindi-English feedback' },
      { href: '/best-resume-checker-india', label: 'Resume checker India', desc: 'Free ATS-style check' },
      { href: '/ats-friendly-resume-checker', label: 'ATS friendly check', desc: 'Keyword & format scan' },
      { href: '/blog/ai-resume-review-india', label: 'AI resume review guide', desc: 'How roasts beat generic tips' },
    ],
  },
  {
    title: 'Build & apply',
    items: [
      { href: '/resume-builder', label: 'ATS resume builder', desc: '1 free PDF · no account' },
      { href: '/indian-resume-builder', label: 'Indian resume builder', desc: 'Fresher & campus formats' },
      { href: '/career-tools/cover-letter', label: 'Cover letter writer', desc: 'JD + CV tailored letter' },
      { href: '/career-tools/jd-match', label: 'JD match score', desc: 'CV vs job description' },
      { href: '/career-tools/skills-gap', label: 'Skills gap analysis', desc: 'What to add before you apply' },
    ],
  },
  {
    title: 'Interview & offers',
    items: [
      { href: '/career-tools/mock-interview', label: 'AI mock interview', desc: 'CV-based questions · Pro' },
      { href: '/career-tools/interview-prep', label: 'Interview question coach', desc: 'Questions from your CV' },
      { href: '/career-tools/salary', label: 'Salary negotiation', desc: 'Scripts for Indian offers' },
      { href: '/career-tools/debrief', label: 'Interview debrief', desc: 'Fix weak answers post-round' },
      { href: '/plans', label: `Pro — ${formatProPrice()}`, desc: `${DASHBOARD_TOOLS.length} tools · unlimited` },
    ],
  },
  {
    title: 'LinkedIn & career',
    items: [
      { href: '/linkedin-roast', label: 'LinkedIn roast', desc: 'Headline & About feedback' },
      { href: '/career-tools/linkedin', label: 'LinkedIn post writer', desc: 'About + open-to-work posts' },
      { href: '/career-tools', label: 'All career tools', desc: `${DASHBOARD_TOOLS.length} tools with live demos` },
      { href: '/blog', label: 'Blog & guides', desc: 'Fresher, ATS, campus placement' },
      { href: '/guides', label: 'Site map', desc: 'Every page in one place' },
    ],
  },
] as const

export function HomeLongTailSection() {
  return (
    <section aria-label="Resume and career resources" className="home-longtail">
      <div className="home-longtail__intro elevate-light-panel">
        <p className="section-label">Resources</p>
        <h2 className="home-longtail__title">Everything for your India job search</h2>
        <p className="home-longtail__lead">
          Free resume roast to start — then resume builder, LinkedIn roast, mock interview, and{' '}
          {DASHBOARD_TOOLS.length} career tools from one dashboard. Pick a path below.
        </p>
        <div className="home-longtail__intro-ctas">
          <Link href="#roast" className="btn-roast home-longtail__cta">
            Start free roast
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/career-tools" className="home-longtail__cta-secondary">
            Browse {DASHBOARD_TOOLS.length} tools
          </Link>
        </div>
      </div>

      <div className="home-longtail__grid">
        {CLUSTERS.map((cluster) => (
          <MotionFadeUp key={cluster.title} className="home-longtail__cluster">
            <h3 className="home-longtail__cluster-title">{cluster.title}</h3>
            <ul className="home-longtail__list">
              {cluster.items.map((item) => (
                <li key={item.href + item.label}>
                  <Link href={item.href} className="home-longtail__item">
                    <span className="home-longtail__item-label">{item.label}</span>
                    <span className="home-longtail__item-desc">{item.desc}</span>
                    <ArrowRight className="size-3.5 home-longtail__item-arrow" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </MotionFadeUp>
        ))}
      </div>
    </section>
  )
}
