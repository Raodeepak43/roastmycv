import { DASHBOARD_TOOLS } from '@/lib/tools/dashboard/config'
import { normalizeDashboardPathname } from '@/lib/dashboard/paths'

export type DashCrumb = { label: string; href?: string }

const PAGE_LABELS: Record<string, string> = {
  '/dashboard/roast': 'Roast CV',
  '/dashboard/history': 'History',
  '/dashboard/resume-builder': 'Resume Builder',
  '/dashboard/plans': 'Plans',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
  '/dashboard/tracker': 'Application Tracker',
  '/dashboard/tools': 'Career Tools',
}

export function dashboardBreadcrumbs(pathname: string): DashCrumb[] {
  const path = normalizeDashboardPathname(pathname)
  const crumbs: DashCrumb[] = [{ label: 'Dashboard', href: '/dashboard' }]
  if (path === '/dashboard') return crumbs

  if (path.match(/^\/dashboard\/roast\/[^/]+$/)) {
    crumbs.push({ label: 'History', href: '/dashboard/history' })
    crumbs.push({ label: 'Roast result' })
    return crumbs
  }

  if (path.startsWith('/dashboard/billing')) {
    crumbs.push({ label: 'Plans', href: '/dashboard/plans' })
    crumbs.push({ label: 'Receipt' })
    return crumbs
  }

  const tool = DASHBOARD_TOOLS.find((t) => path.startsWith(t.href))
  if (tool) {
    crumbs.push({ label: 'Career Tools', href: '/dashboard/tools' })
    crumbs.push({ label: tool.label })
    return crumbs
  }

  const label = PAGE_LABELS[path]
  if (label) {
    crumbs.push({ label })
    return crumbs
  }

  crumbs.push({ label: 'Dashboard' })
  return crumbs
}
