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
  IndianRupee,
} from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/Logo'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: IndianRupee },
  { href: '/admin/signups', label: 'Ticker Signups', icon: Flame },
  { href: '/admin/emails', label: 'Email List', icon: Mail },
  { href: '/admin/usage', label: 'Guest Usage', icon: Gauge },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo">
          <Logo variant="mark" href="/admin" imageClassName="h-8 w-8" />
        </div>
        {!collapsed && (
          <div className="admin-sidebar-brand-text">
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
