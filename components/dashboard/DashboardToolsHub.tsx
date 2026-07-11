'use client'

import Link from 'next/link'
import { useDashboardData } from '@/components/dashboard/DashboardDataProvider'
import { DASHBOARD_JOURNEY, journeyTools } from '@/lib/dashboard/journey'

export function DashboardToolsHub() {
  const { usage } = useDashboardData()
  const isPro = usage.plan === 'pro'

  return (
    <div className="dash-tools-hub dash-page-section">
      <p className="dash-page-section__lead">
        Tools grouped by stage — roast and fix your CV first, then apply, interview, and negotiate.
      </p>

      <div className="dash-journey-sections">
        {DASHBOARD_JOURNEY.map((phase) => {
          const tools = journeyTools(phase)
          return (
            <section key={phase.id} className="dash-journey-block">
              <div className="dash-journey-block__head">
                <span className="dash-journey-block__step">{phase.step}</span>
                <div>
                  <h3>
                    {phase.emoji} {phase.title}
                  </h3>
                  <p>{phase.outcome}</p>
                </div>
                {phase.primaryHref && (
                  <Link href={phase.primaryHref} className="dash-journey-block__cta">
                    {phase.primaryLabel} →
                  </Link>
                )}
              </div>
              <div className="dash-tool-grid">
                {tools.map((tool) => (
                  <Link key={tool.href} href={tool.href} className="dash-tool-chip">
                    <span className="dash-tool-chip__icon">{tool.icon}</span>
                    <span className="dash-tool-chip__label">{tool.label}</span>
                    {tool.access.proOnly && !isPro && <span className="dash-pro-badge">Pro</span>}
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
