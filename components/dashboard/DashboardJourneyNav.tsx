'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { DashboardLink } from '@/components/dashboard/DashboardLink'
import { DASHBOARD_JOURNEY, journeyForPath, journeyTools } from '@/lib/dashboard/journey'
import { dashboardPathMatches } from '@/lib/dashboard/paths'
import { useDashboardPathname } from '@/hooks/useDashboardPathname'

type Props = {
  onNavigate?: () => void
  compact?: boolean
}

export function DashboardJourneyNav({ onNavigate, compact }: Props) {
  const pathname = useDashboardPathname()
  const activePhase = journeyForPath(pathname)
  const [openId, setOpenId] = useState<string | null>(activePhase?.id ?? 'fix-cv')

  useEffect(() => {
    if (activePhase) setOpenId(activePhase.id)
  }, [activePhase?.id])

  return (
    <div className={compact ? 'dash-journey-nav dash-journey-nav--compact' : 'dash-journey-nav'}>
      {DASHBOARD_JOURNEY.map((phase) => {
        const tools = journeyTools(phase).filter((t) => t.href !== phase.primaryHref)
        const isOpen = openId === phase.id
        const phaseActive = tools.some((t) => dashboardPathMatches(pathname, t.href))

        return (
          <div key={phase.id} className="dash-journey-nav__group">
            <button
              type="button"
              className={`dash-journey-nav__phase ${phaseActive ? 'dash-journey-nav__phase--active' : ''}`}
              onClick={() => setOpenId(isOpen ? null : phase.id)}
              aria-expanded={isOpen}
            >
              <span className="dash-journey-nav__step">{phase.step}</span>
              <span className="min-w-0 flex-1 text-left">
                <span className="dash-journey-nav__title">{phase.title}</span>
                {!compact && <span className="dash-journey-nav__tag">{phase.tagline}</span>}
              </span>
              <ChevronDown
                className={`dash-journey-nav__caret size-4 shrink-0 ${isOpen ? 'dash-journey-nav__caret--open' : ''}`}
                aria-hidden
              />
            </button>
            <div className={`dash-journey-nav__tools ${isOpen ? 'dash-journey-nav__tools--open' : ''}`}>
              <nav className="flex flex-col gap-0.5 pt-0.5">
                {phase.primaryHref && phase.primaryLabel && (
                  <DashboardLink
                    href={phase.primaryHref}
                    onClick={onNavigate}
                    className={`dash-nav-link dash-nav-link--sub dash-journey-nav__primary ${
                      dashboardPathMatches(pathname, phase.primaryHref) ? 'dash-nav-link--active' : ''
                    }`}
                  >
                    <span className="truncate">{phase.primaryLabel}</span>
                  </DashboardLink>
                )}
                {tools.map(({ label, href, access }) => (
                  <DashboardLink
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={`dash-nav-link dash-nav-link--sub ${
                      dashboardPathMatches(pathname, href) ? 'dash-nav-link--active' : ''
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    {access.proOnly && <span className="dash-pro-badge">Pro</span>}
                  </DashboardLink>
                ))}
              </nav>
            </div>
          </div>
        )
      })}
      <DashboardLink href="/dashboard/tools" onClick={onNavigate} className="dash-journey-nav__all">
        Browse all tools →
      </DashboardLink>
    </div>
  )
}
