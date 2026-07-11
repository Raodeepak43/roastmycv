'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { ExternalLink, Search } from 'lucide-react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import type { CareerjetJob, CareerjetSearchResult } from '@/lib/jobs/careerjet'
import {
  JOB_COUNTRIES,
  JOB_EMPLOYMENT_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_POSTED_OPTIONS,
} from '@/lib/jobs/careerjet'

type SearchForm = {
  keywords: string
  location: string
  country: string
  posted: string
  employment: string
  experience: string
  remoteOnly: boolean
}

const DEFAULT_FORM: SearchForm = {
  keywords: 'software developer',
  location: 'Bangalore',
  country: 'en_IN',
  posted: 'any',
  employment: 'any',
  experience: 'any',
  remoteOnly: false,
}

function formatJobDate(raw: string): string {
  if (!raw) return ''
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function JobSearchPortal() {
  const [form, setForm] = useState<SearchForm>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CareerjetSearchResult | null>(null)
  const [page, setPage] = useState(1)

  const runSearch = useCallback(
    async (nextPage = 1) => {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        keywords: form.keywords,
        location: form.location,
        country: form.country,
        posted: form.posted,
        employment: form.employment,
        experience: form.experience,
        page: String(nextPage),
      })
      if (form.remoteOnly) params.set('remote', '1')

      try {
        const res = await fetch(`/api/jobs/search?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Job search failed')
        }
        setResult(data as CareerjetSearchResult)
        setPage(nextPage)
      } catch (err) {
        setResult(null)
        setError(err instanceof Error ? err.message : 'Failed to reach Careerjet API')
      } finally {
        setLoading(false)
      }
    },
    [form],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void runSearch(1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <SiteHeader variant="default" activePath="career-tools" breadcrumb="Job Search" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <nav className="mb-6 font-body text-xs text-muted">
          <Link href="/career-tools" className="hover:text-orange transition-colors">
            ← Career Tools
          </Link>
        </nav>

        <div className="job-portal__hero mb-8">
          <p className="job-portal__badge">
            <span className="job-portal__badge-dot" aria-hidden />
            Job search portal
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-text-dark leading-tight mt-3 mb-3">
            Find roles. <span className="text-muted">Then roast your CV to match.</span>
          </h1>
          <p className="font-body text-[15px] text-muted leading-relaxed max-w-2xl">
            Search live listings powered by Careerjet — then tailor your resume before you apply.
          </p>
        </div>

        <form className="job-portal__form" onSubmit={onSubmit}>
          <div className="job-portal__field job-portal__field--wide">
            <label htmlFor="job-keywords">Job title or keywords</label>
            <input
              id="job-keywords"
              value={form.keywords}
              onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
              placeholder="software developer"
              required
              minLength={2}
            />
          </div>

          <div className="job-portal__field">
            <label htmlFor="job-location">Location</label>
            <input
              id="job-location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Bangalore"
            />
          </div>

          <div className="job-portal__field">
            <label htmlFor="job-country">Country</label>
            <select
              id="job-country"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            >
              {JOB_COUNTRIES.map((c) => (
                <option key={c.localeCode} value={c.localeCode}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="job-portal__field">
            <label htmlFor="job-posted">Posted</label>
            <select
              id="job-posted"
              value={form.posted}
              onChange={(e) => setForm((f) => ({ ...f, posted: e.target.value }))}
            >
              {JOB_POSTED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="job-portal__field">
            <label htmlFor="job-employment">Employment</label>
            <select
              id="job-employment"
              value={form.employment}
              onChange={(e) => setForm((f) => ({ ...f, employment: e.target.value }))}
            >
              {JOB_EMPLOYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="job-portal__field">
            <label htmlFor="job-experience">Experience</label>
            <select
              id="job-experience"
              value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
            >
              {JOB_EXPERIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="job-portal__actions">
            <label className="job-portal__remote">
              <input
                type="checkbox"
                checked={form.remoteOnly}
                onChange={(e) => setForm((f) => ({ ...f, remoteOnly: e.target.checked }))}
              />
              Remote only
            </label>
            <button type="submit" className="job-portal__submit" disabled={loading}>
              <Search className="size-4" aria-hidden />
              {loading ? 'Searching…' : 'Search jobs'}
            </button>
          </div>
        </form>

        <section className="job-portal__results" aria-live="polite">
          {error ? (
            <p className="job-portal__error" role="alert">
              {error}
            </p>
          ) : null}

          {!error && !result && !loading ? (
            <p className="job-portal__hint">Enter keywords and hit Search jobs to see live listings.</p>
          ) : null}

          {result ? (
            <>
              <p className="job-portal__meta">
                <strong>{result.total.toLocaleString('en-IN')}</strong> jobs found
                {result.pages > 1 ? (
                  <>
                    {' '}
                    · page {result.page} of {result.pages}
                  </>
                ) : null}
              </p>

              <ul className="job-portal__list">
                {result.jobs.map((job) => (
                  <JobCard key={`${job.url}-${job.title}`} job={job} />
                ))}
              </ul>

              {result.pages > 1 ? (
                <div className="job-portal__pager">
                  <button
                    type="button"
                    className="job-portal__pager-btn"
                    disabled={loading || page <= 1}
                    onClick={() => void runSearch(page - 1)}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    className="job-portal__pager-btn"
                    disabled={loading || page >= result.pages}
                    onClick={() => void runSearch(page + 1)}
                  >
                    Next →
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>

        <div className="job-portal__cta mt-10">
          <p className="font-body text-sm text-muted mb-3">Found a role you like?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="career-landing__cta">
              Roast your CV
            </Link>
            <Link href="/login?next=/dashboard/tools/jd-match" className="career-landing__cta-secondary">
              Match CV to job →
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function JobCard({ job }: { job: CareerjetJob }) {
  return (
    <li className="job-portal__card">
      <div className="job-portal__card-head">
        <div>
          <h2 className="job-portal__card-title">{job.title}</h2>
          <p className="job-portal__card-company">
            {job.company}
            {job.locations ? ` · ${job.locations}` : ''}
          </p>
        </div>
        {job.date ? <time className="job-portal__card-date">{formatJobDate(job.date)}</time> : null}
      </div>

      {job.salary ? <p className="job-portal__card-salary">{job.salary}</p> : null}
      {job.description ? <p className="job-portal__card-desc">{job.description}</p> : null}

      <div className="job-portal__card-actions">
        {job.url ? (
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="job-portal__apply">
            Apply on {job.site || 'source'}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : null}
        <Link href="/login?next=/dashboard/tools/jd-match" className="job-portal__match">
          Match my CV
        </Link>
      </div>
    </li>
  )
}
