import Link from 'next/link'

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
    <nav aria-label="Related resume and career topics" className={className}>
      <h2 className="font-display text-base md:text-lg text-text-dark mb-3">Related topics</h2>
      <ul className="grid sm:grid-cols-2 gap-2">
        {TOPIC_CLUSTERS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-border px-3 py-2.5 hover:border-orange/40 hover:bg-bg-beige/40 transition-colors"
            >
              <span className="font-body text-sm font-medium text-brand-orange">{item.label}</span>
              <span className="block font-body text-[11px] text-dim mt-0.5">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { TOPIC_CLUSTERS }
