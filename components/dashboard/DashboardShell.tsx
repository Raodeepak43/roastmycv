'use client'

import { useState } from 'react'
import {
  Flame,
  LayoutGrid,
  PenLine,
  LogOut,
  Menu,
  X,
  ChevronDown,
  History,
  User,
  Settings,
  CreditCard,
  ClipboardList,
  Search,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import { useDashboardData } from '@/components/dashboard/DashboardDataProvider'
import { DashboardUserAvatar } from '@/components/dashboard/DashboardUserAvatar'
import { DashboardJourneyNav } from '@/components/dashboard/DashboardJourneyNav'
import { DashboardBreadcrumb } from '@/components/dashboard/DashboardBreadcrumb'
import { DashboardLink } from '@/components/dashboard/DashboardLink'
import { Logo } from '@/components/Logo'
import { DASHBOARD_TOOLS } from '@/lib/tools/dashboard/config'
import { dashboardBreadcrumbs } from '@/lib/dashboard/breadcrumbs'
import { dashboardHref, dashboardPathMatches } from '@/lib/dashboard/paths'
import { useDashboardPathname } from '@/hooks/useDashboardPathname'

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutGrid, exact: true },
  { label: 'Roast my CV', href: '/dashboard/roast', icon: Flame },
  { label: 'History', href: '/dashboard/history', icon: History },
  { label: 'Resume Builder', href: '/dashboard/resume-builder', icon: PenLine },
  { label: 'Tracker', href: '/dashboard/tracker', icon: ClipboardList },
  { label: 'Plans', href: '/dashboard/plans', icon: CreditCard },
]

const PAGE_META: Record<string, { title: string; desc: string }> = {
  '/dashboard': { title: 'Overview', desc: 'Roast → apply → interview → offer' },
  '/dashboard/roast': { title: 'Roast my CV', desc: 'Upload & get AI feedback' },
  '/dashboard/history': { title: 'History', desc: 'Roasts and AI tool runs' },
  '/dashboard/resume-builder': { title: 'Resume Builder', desc: 'ATS-ready resume editor' },
  '/dashboard/plans': { title: 'Plans', desc: 'Free & Pro tiers' },
  '/dashboard/profile': { title: 'Profile', desc: 'Your account details' },
  '/dashboard/settings': { title: 'Settings', desc: 'Preferences & security' },
  '/dashboard/tracker': { title: 'Application Tracker', desc: 'Track every job application' },
  '/dashboard/tools': { title: 'Career tools', desc: 'Grouped by your job hunt stage' },
}

function toolsPageMeta(pathname: string) {
  const tool = DASHBOARD_TOOLS.find((t) => pathname.startsWith(t.href))
  if (tool) return { title: tool.label, desc: 'AI career tool' }
  if (pathname === '/dashboard/tools') return PAGE_META['/dashboard/tools']
  return null
}

interface DashboardShellProps {
  email: string
  onSignOut: () => void
  children: React.ReactNode
}

function pageMeta(pathname: string) {
  const toolMeta = toolsPageMeta(pathname)
  if (toolMeta) return toolMeta
  if (pathname.match(/^\/dashboard\/roast\/[^/]+$/)) {
    return { title: 'Roast result', desc: 'Your saved roast' }
  }
  if (pathname.startsWith('/dashboard/resume-builder')) return PAGE_META['/dashboard/resume-builder']
  if (pathname.startsWith('/dashboard/history')) return PAGE_META['/dashboard/history']
  if (pathname.startsWith('/dashboard/plans')) return PAGE_META['/dashboard/plans']
  if (pathname.startsWith('/dashboard/profile')) return PAGE_META['/dashboard/profile']
  if (pathname.startsWith('/dashboard/settings')) return PAGE_META['/dashboard/settings']
  if (pathname.startsWith('/dashboard/roast')) return PAGE_META['/dashboard/roast']
  if (pathname.startsWith('/dashboard/tracker')) return PAGE_META['/dashboard/tracker']
  return PAGE_META['/dashboard']
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
  badge,
  sub,
}: {
  href: string
  label: string
  icon?: LucideIcon
  active: boolean
  onNavigate: () => void
  badge?: React.ReactNode
  sub?: boolean
}) {
  return (
    <DashboardLink
      href={href}
      onClick={onNavigate}
      className={`dash-nav-link ${sub ? 'dash-nav-link--sub' : ''} ${active ? 'dash-nav-link--active' : ''}`}
    >
      {Icon && (
        <span className="dash-nav-icon">
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <span className="truncate">{label}</span>
      {badge}
    </DashboardLink>
  )
}

export function DashboardShell({ email, onSignOut, children }: DashboardShellProps) {
  const { name, avatarUrl } = useDashboardUser()
  const { usage } = useDashboardData()
  const pathname = useDashboardPathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const plan = usage.plan
  const isPro = plan === 'pro'
  const meta = pageMeta(pathname)
  const crumbs = dashboardBreadcrumbs(pathname)
  const isOverview = pathname === '/dashboard'
  const isResumeBuilder = pathname.startsWith('/dashboard/resume-builder')

  const closeSidebar = () => setSidebarOpen(false)

  const searchHref =
    searchQuery.trim() &&
    DASHBOARD_TOOLS.find((t) => t.label.toLowerCase().includes(searchQuery.trim().toLowerCase()))?.href

  const searchTarget = searchHref ? dashboardHref(searchHref) : null

  const subtitle =
    isOverview && name
      ? `${meta.desc} · Welcome back, ${name}`
      : meta.desc

  const showUpgradeCard = !isPro
  const upgradeTitle = usage.roastsLeft <= 0 ? 'Roast limit reached' : 'Upgrade to Pro'
  const upgradeBody =
    usage.roastsLeft <= 0
      ? 'You have used all free roasts. Unlock unlimited access.'
      : 'Unlimited roasts, PDF exports, and every career tool.'

  return (
    <div className="dash-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="dash-sidebar-overlay min-[861px]:hidden"
          aria-label="Close sidebar"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`dash-sidebar ${
          sidebarOpen ? 'dash-sidebar--mobile max-[860px]:flex' : 'max-[860px]:hidden'
        } min-[861px]:flex`}
      >
        <div className="dash-sidebar__brand">
          <DashboardLink href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2.5" onClick={closeSidebar}>
            <Logo variant="light" href={false} imageClassName="h-6 w-auto max-w-[108px]" />
            <span className={`dash-plan-pill dash-plan-pill--${plan}`}>{plan}</span>
          </DashboardLink>
          <button
            type="button"
            className="dash-mobile-menu min-[861px]:hidden"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="dash-sidebar__scroll">
          <p className="dash-nav-label">Workspace</p>
          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ label, href, icon, exact }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={exact ? pathname === href : dashboardPathMatches(pathname, href)}
                onNavigate={closeSidebar}
              />
            ))}
          </nav>

          <p className="dash-nav-label">Tools</p>
          <DashboardJourneyNav onNavigate={closeSidebar} compact />
        </div>

        <div className="dash-sidebar__bottom">
          {showUpgradeCard && (
            <div className="dash-upgrade-card">
              <h4>{upgradeTitle}</h4>
              <p>{upgradeBody}</p>
              <DashboardLink href="/dashboard/plans" onClick={closeSidebar}>
                Upgrade to Pro
              </DashboardLink>
            </div>
          )}

          <div className="dash-user-strip">
            <DashboardUserAvatar name={name} email={email} avatarUrl={avatarUrl} size="md" />
            <div className="dash-user-strip__info">
              <b>{name}</b>
              <span>{email}</span>
            </div>
            <button
              type="button"
              className="dash-user-strip__chevron"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {menuOpen && (
              <div className="dash-user-menu">
                <DashboardLink href="/dashboard/profile" onClick={() => setMenuOpen(false)}>
                  <User className="size-4" aria-hidden />
                  Profile
                </DashboardLink>
                <DashboardLink href="/dashboard/settings" onClick={() => setMenuOpen(false)}>
                  <Settings className="size-4" aria-hidden />
                  Settings
                </DashboardLink>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onSignOut()
                  }}
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={`dash-main-wrap${isResumeBuilder ? ' dash-main-wrap--rb-wizard' : ''}`}>
        {!isResumeBuilder && (
        <header className="dash-topbar">
          <div className="dash-topbar__main min-w-0">
            <button
              type="button"
              className="dash-mobile-menu mr-2 align-middle min-[861px]:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <DashboardBreadcrumb crumbs={crumbs} />
            <h1>{meta.title}</h1>
            <p className="truncate">{subtitle}</p>
          </div>
          <div className="dash-topbar__right">
            <form
              className="dash-search"
              onSubmit={(e) => {
                e.preventDefault()
                if (searchTarget) window.location.href = searchTarget
              }}
            >
              <Search className="size-4 shrink-0" aria-hidden />
              <input
                type="search"
                placeholder="Search tools…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search dashboard tools"
                list="dash-tool-search"
              />
              <datalist id="dash-tool-search">
                {DASHBOARD_TOOLS.map((t) => (
                  <option key={t.href} value={t.label} />
                ))}
              </datalist>
            </form>
            {!isPro && (
              <DashboardLink href="/dashboard/plans" className="dash-topbar-cta">
                Upgrade
              </DashboardLink>
            )}
          </div>
        </header>
        )}

        <main className={`dash-main${isResumeBuilder ? ' dash-main--rb-wizard' : ''}`}>
          <div className={`dash-page-inner${isResumeBuilder ? ' dash-page-inner--rb-wizard' : ''}`}>{children}</div>
        </main>
      </div>
    </div>
  )
}
