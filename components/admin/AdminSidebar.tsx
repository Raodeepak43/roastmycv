'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Mail,
  Users,
  Gauge,
  Flame,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/signups', label: 'Ticker Signups', icon: Users },
  { href: '/admin/emails', label: 'Email List', icon: Mail },
  { href: '/admin/usage', label: 'Usage Limits', icon: Gauge },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo">
          <Flame size={16} aria-hidden />
        </div>
        {!collapsed && (
          <div className="admin-sidebar-brand-text">
            <strong>MyCVRoast</strong>
            <span>Admin</span>
          </div>
        )}
      </div>

      <nav className="admin-nav">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`admin-nav-link${active ? ' active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon aria-hidden />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <a
          href="https://mycvroast.in"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-sidebar-btn"
        >
          <ExternalLink aria-hidden />
          {!collapsed && <span>View site</span>}
        </a>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="admin-sidebar-btn"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
