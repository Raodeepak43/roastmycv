'use client'

import { ChevronRight } from 'lucide-react'
import { DashboardLink } from '@/components/dashboard/DashboardLink'
import type { DashCrumb } from '@/lib/dashboard/breadcrumbs'

export function DashboardBreadcrumb({ crumbs }: { crumbs: DashCrumb[] }) {
  if (crumbs.length <= 1) return null

  return (
    <nav className="dash-breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const last = i === crumbs.length - 1
        return (
          <span key={`${crumb.label}-${i}`} className="dash-breadcrumb__item">
            {i > 0 && <ChevronRight className="dash-breadcrumb__sep size-3.5" aria-hidden />}
            {crumb.href && !last ? (
              <DashboardLink href={crumb.href}>{crumb.label}</DashboardLink>
            ) : (
              <span className={last ? 'dash-breadcrumb__current' : undefined}>{crumb.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
