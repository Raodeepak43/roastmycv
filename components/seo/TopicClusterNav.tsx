import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/** Semantic internal links for AI retrieval topic clusters */
const TOPIC_CLUSTERS = [
  { label: 'Resume Roast', href: '/', description: 'Free AI CV roast' },
  { label: 'ATS Score', href: '/ats-friendly-resume-checker', description: 'ATS-friendly resume check' },
  { label: 'Resume Review', href: '/blog/ai-resume-review-india', description: 'AI resume review India' },
  { label: 'Resume Checker', href: '/best-resume-checker-india', description: 'Free resume checker' },
  { label: 'Resume Analysis', href: '/blog/what-is-resume-roast', description: 'What is a resume roast' },
  { label: 'Career Tips', href: '/blog', description: 'Blog & guides' },
  { label: 'Interview Prep', href: '/career-tools/mock-interview', description: 'Mock interview AI' },
  { label: 'Resume Templates', href: '/resume-builder', description: 'ATS resume builder' },
  { label: 'Cover Letter', href: '/career-tools/cover-letter', description: 'Cover letter writer' },
  { label: 'LinkedIn Review', href: '/linkedin-roast', description: 'LinkedIn profile roast' },
  { label: 'Job Search', href: '/blog/best-job-search-sites-india', description: 'Job sites guide (blog)' },
  { label: 'Career Growth', href: '/career-tools', description: '29+ career tools' },
] as const

export function TopicClusterNav({ className = '' }: { className?: string }) {
  return (
    <nav aria-label="Related resume and career topics" className={`home-topic-nav ${className}`.trim()}>
      <p className="section-label mb-3">Quick links</p>
      <h2 className="home-topic-nav__title">Related topics</h2>
      <ul className="home-topic-nav__grid">
        {TOPIC_CLUSTERS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="home-topic-nav__card">
              <span className="home-topic-nav__label">{item.label}</span>
              <span className="home-topic-nav__desc">{item.description}</span>
              <ArrowRight className="size-3.5 home-topic-nav__arrow" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { TOPIC_CLUSTERS }
