'use client'

import { DashboardLink } from '@/components/dashboard/DashboardLink'
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  Crown,
  FileText,
  Flame,
  Mic,
  PenLine,
  Sparkles,
} from 'lucide-react'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import { useDashboardData } from '@/components/dashboard/DashboardDataProvider'
import { DashboardWelcomeBanner } from '@/components/dashboard/DashboardWelcomeBanner'
import { DASHBOARD_JOURNEY, journeyTools } from '@/lib/dashboard/journey'
import { dashboardRoastLimitHint } from '@/lib/dashboard/roast-limit'

const CORE_ACTIONS = [
  {
    id: 'roast',
    icon: Flame,
    title: 'CV Roast',
    pitch: 'Honest AI feedback on your bullets — English or Hinglish.',
    href: '/dashboard/roast',
    cta: 'Start roast',
    tone: 'accent',
  },
  {
    id: 'builder',
    icon: FileText,
    title: 'Resume Builder',
    pitch: 'ATS score, guided sections, one-click PDF export.',
    href: '/dashboard/resume-builder',
    cta: 'Open builder',
    tone: 'green',
  },
  {
    id: 'interview',
    icon: Mic,
    title: 'Mock Interview',
    pitch: 'AI reads your CV and runs a realistic practice session.',
    href: '/dashboard/tools/mock-interview',
    cta: 'Practice now',
    tone: 'violet',
  },
] as const

function scoreTier(score: number): 'lo' | 'mid' | 'hi' {
  if (score <= 3) return 'lo'
  if (score <= 6) return 'mid'
  return 'hi'
}

export function UserDashboardOverview() {
  const { name } = useDashboardUser()
  const { loading, usage, recentRoasts } = useDashboardData()

  const { plan, roastsUsed, roastsLimit, roastsLeft } = usage
  const isPro = plan === 'pro'
  const overLimit = !isPro && roastsUsed > roastsLimit
  const usedPct =
    isPro || roastsLimit <= 0 ? 100 : Math.min(100, Math.round((roastsUsed / roastsLimit) * 100))
  const firstName = name?.split(' ')[0]

  return (
    <div className="dash-overview">
      <DashboardWelcomeBanner />

      <section className="dash-hero-pro">
        <div className="dash-hero-pro__copy">
          <p className="dash-hero-pro__eyebrow">
            <Sparkles className="size-3.5" aria-hidden />
            Job hunt workspace
          </p>
          <h2>{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}</h2>
          <p>
            Roast your CV, fix it with the builder, apply with tailored tools, and practice interviews —
            one professional workflow built for India.
          </p>
        </div>
        <div className="dash-hero-pro__metrics">
          <div className="dash-metric">
            <span className="dash-metric__label">Roasts used</span>
            <strong>{loading ? '—' : isPro ? roastsUsed : `${roastsUsed} / ${roastsLimit}`}</strong>
          </div>
          <div className="dash-metric">
            <span className="dash-metric__label">Remaining</span>
            <strong>{loading ? '—' : isPro ? 'Unlimited' : roastsLeft}</strong>
          </div>
          <div className="dash-metric">
            <span className="dash-metric__label">Plan</span>
            <strong className="capitalize">{plan}</strong>
          </div>
        </div>
      </section>

      <section className="dash-core-grid" aria-label="Primary actions">
        {CORE_ACTIONS.map(({ id, icon: Icon, title, pitch, href, cta, tone }) => (
          <DashboardLink key={id} href={href} className={`dash-core-card dash-core-card--${tone}`}>
            <span className="dash-core-card__icon">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="dash-core-card__body">
              <h3>{title}</h3>
              <p>{pitch}</p>
            </div>
            <span className="dash-core-card__link">
              {cta}
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </DashboardLink>
        ))}
      </section>

      <div className="dash-overview-grid">
        <div className="dash-overview-main">
          <div className="dash-section-head">
            <h3>Your job hunt flow</h3>
            <DashboardLink href="/dashboard/tools">View all tools</DashboardLink>
          </div>

          <div className="dash-flow-list">
            {DASHBOARD_JOURNEY.map((phase) => {
              const tools = journeyTools(phase).slice(0, 3)
              return (
                <article key={phase.id} className="dash-flow-item">
                  <div className="dash-flow-item__step">{phase.step}</div>
                  <div className="dash-flow-item__content">
                    <div className="dash-flow-item__head">
                      <h4>{phase.title}</h4>
                      <p>{phase.tagline}</p>
                    </div>
                    <div className="dash-flow-item__tools">
                      {tools.map((tool) => (
                        <DashboardLink key={tool.href} href={tool.href} className="dash-flow-tool">
                          {tool.label}
                        </DashboardLink>
                      ))}
                      {phase.primaryHref && (
                        <DashboardLink href={phase.primaryHref} className="dash-flow-tool dash-flow-tool--primary">
                          {phase.primaryLabel}
                        </DashboardLink>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="dash-overview-aside">
          <div className="dash-card dash-roasts-card">
            <div className="dash-roasts-head">
              <h3>Recent roasts</h3>
              <DashboardLink href="/dashboard/history">View all</DashboardLink>
            </div>
            {loading ? (
              <p className="dash-empty">Loading…</p>
            ) : recentRoasts.length === 0 ? (
              <p className="dash-empty">
                No roasts yet.{' '}
                <DashboardLink href="/dashboard/roast">Upload your CV</DashboardLink>
              </p>
            ) : (
              recentRoasts.slice(0, 5).map((r) => {
                const tier = scoreTier(r.score)
                return (
                  <DashboardLink key={r.id} href={`/dashboard/roast/${r.id}`} className="dash-roast-row">
                    <span className={`dash-score-chip dash-score-chip--${tier}`}>
                      {r.score}
                      <small>/10</small>
                    </span>
                    <div className="dash-roast-info">
                      <b>{r.title || 'Roast'}</b>
                      <span>
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <ArrowUpRight className="size-4 text-[var(--dash-muted)]" aria-hidden />
                  </DashboardLink>
                )
              })
            )}
          </div>

          <DashboardLink href="/dashboard/tracker" className="dash-card dash-side-link">
            <ClipboardList className="size-5 text-[var(--dash-muted)]" aria-hidden />
            <div>
              <b>Application tracker</b>
              <span>Log companies, stages, and follow-ups</span>
            </div>
            <ArrowUpRight className="size-4 ml-auto" aria-hidden />
          </DashboardLink>

          {!isPro && (
            <div className="dash-card dash-side-pro">
              <Crown className="size-5 text-[var(--dash-accent)]" aria-hidden />
              <div>
                <b>Go Pro — ₹149 one-time</b>
                <span>Unlimited roasts, PDFs, and all career tools</span>
              </div>
              <DashboardLink href="/dashboard/plans">Upgrade</DashboardLink>
            </div>
          )}
        </aside>
      </div>

      {!isPro && (
        <footer className="dash-usage-bar">
          <div className={`dash-meter dash-meter--inline ${overLimit ? 'dash-meter--over' : ''}`}>
            <i style={{ width: `${usedPct}%` }} />
          </div>
          <span className="dash-usage-bar__text">
            {overLimit && <AlertTriangle className="size-3.5 text-[var(--dash-red)]" aria-hidden />}
            {dashboardRoastLimitHint(plan, roastsLimit)}
          </span>
          <DashboardLink href="/dashboard/resume-builder" className="dash-usage-bar__btn">
            <PenLine className="size-4" aria-hidden />
            Builder
          </DashboardLink>
          <DashboardLink href="/dashboard/roast" className="dash-roast-cta dash-usage-bar__btn dash-usage-bar__btn--primary">
            <Flame className="size-4" aria-hidden />
            Roast CV
          </DashboardLink>
        </footer>
      )}
    </div>
  )
}
